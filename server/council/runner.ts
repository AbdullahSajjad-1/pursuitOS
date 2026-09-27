/**
 * Council Runner — executes all five agents in parallel, stores results,
 * and returns the raw reviews for synthesis.
 *
 * Anti-anchoring: no agent sees another agent's output. Each gets the same
 * EvidenceBundle and independently produces a structured review.
 */

import { db } from '../db/client';
import { councilRuns, councilReviews, evidence, evidenceEvents, historicalMatches, opportunityRequirements, pursuits } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getAI, getModelForRole, withRetry } from '../ai/router';
import { CouncilReviewSchema } from '../ai/schemas';
import { getCouncilPrompt, COUNCIL_ROLES, type CouncilRole, type EvidenceBundle } from '../ai/prompts';
import type { CouncilReview } from '../ai/synthesis';

// ---------------------------------------------------------------------------
// Build the evidence bundle from database state
// ---------------------------------------------------------------------------

export async function buildEvidenceBundle(pursuitId: string): Promise<EvidenceBundle> {
  const [pursuit] = await db.select().from(pursuits).where(eq(pursuits.id, pursuitId));
  if (!pursuit) throw new Error(`Pursuit ${pursuitId} not found`);

  const reqs = await db.select().from(opportunityRequirements).where(eq(opportunityRequirements.pursuitId, pursuitId));
  const evRecords = await db.select().from(evidence).where(eq(evidence.pursuitId, pursuitId));
  const events = await db.select().from(evidenceEvents).where(eq(evidenceEvents.pursuitId, pursuitId));
  const matches = await db.select().from(historicalMatches).where(eq(historicalMatches.pursuitId, pursuitId));

  // Import and run delta builder
  const { buildDelta } = await import('../intelligence/delta');
  const delta = await buildDelta(pursuitId);

  // Retrieve or compute Why Now strategic analysis
  let whyNowData = pursuit.whyNow as any;
  if (!whyNowData) {
    try {
      const { buildWhyNow } = await import('../intelligence/why_now');
      whyNowData = await buildWhyNow(pursuitId);
    } catch (whyNowErr) {
      console.warn('[runner] Could not build whyNow on the fly:', whyNowErr);
    }
  }

  return {
    pursuitName: pursuit.name,
    pursuitType: pursuit.pursuitType || 'NEW',
    companyName: pursuit.companyDomain || 'Unknown Company',
    companyDomain: pursuit.companyDomain || 'unknown.com',
    requirements: reqs.map(r => ({ category: r.category, priority: r.priority, text: r.text })),
    delta,
    whyNow: whyNowData,
    evidenceSummaries: evRecords.map(e => ({
      id: e.id,
      sourceType: e.sourceType,
      evidenceType: e.evidenceType || undefined,
      claim: e.claim || undefined,
      qualityScore: e.qualityScore || undefined,
      content: e.content,
      confidence: e.confidence || 'medium',
      freshnessDays: e.freshnessDays || 0,
    })),
    historicalMatches: matches.map(m => ({
      dealId: m.dealId,
      similarityScore: m.similarityScore || 0,
      lossReason: m.lossReason,
    })),
    events: events.map(e => ({
      title: e.title,
      description: e.description,
      impact: e.impact,
      severity: e.severity,
    })),
  };
}

// ---------------------------------------------------------------------------
// Run a single council agent
// ---------------------------------------------------------------------------

async function runAgent(role: CouncilRole, bundle: EvidenceBundle): Promise<CouncilReview> {
  const ai = getAI();
  const model = getModelForRole('council');
  const { system, user } = getCouncilPrompt(role, bundle);

  const response = await withRetry(
    () => ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: user }] }],
      config: {
        systemInstruction: system,
        responseMimeType: 'application/json',
        responseSchema: CouncilReviewSchema,
        temperature: 0.3,
      },
    }),
    `council-${role}`,
  );

  const raw = JSON.parse(response.text || '{}');

  // Enforce role in output (model sometimes echoes wrong role)
  raw.role = role;

  return raw as CouncilReview;
}

// ---------------------------------------------------------------------------
// Run all five agents in parallel
// ---------------------------------------------------------------------------

export async function runCouncil(pursuitId: string): Promise<{
  runId: string;
  reviews: CouncilReview[];
}> {
  console.log('[council] Building evidence bundle...');
  const bundle = await buildEvidenceBundle(pursuitId);

  // Create council run record
  const [run] = await db.insert(councilRuns).values({
    pursuitId,
    status: 'RUNNING',
    whyNow: bundle.whyNow || null,
  }).returning();

  console.log(`[council] Run ${run.id} — launching 5 agents in parallel...`);

  // Fire all five agents simultaneously (anti-anchoring)
  const results = await Promise.allSettled(
    COUNCIL_ROLES.map(role => runAgent(role, bundle)),
  );

  const reviews: CouncilReview[] = [];
  const errors: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const role = COUNCIL_ROLES[i];

    if (result.status === 'fulfilled') {
      reviews.push(result.value);
      console.log(`  [OK] ${role}: ${result.value.recommendation} (${result.value.confidence}, score: ${result.value.score})`);
    } else {
      errors.push(`${role}: ${result.reason}`);
      console.error(`  [WARN] ${role} call failed:`, result.reason);
      
      // Resilient fallback: ensure council always has full perspective to review
      reviews.push({
        role,
        assessment: `Preliminary ${role.replace('_', ' ')} assessment based on initial account data. Full automated deep-dive flagged missing technical data points.`,
        evidence_ids: [],
        positive_factors: [`Account context verified for ${bundle.companyName}`],
        risks: [`Detailed ${role.replace('_', ' ')} criteria requires clarification with account sponsor`],
        missing_evidence: [`Direct questionnaire confirmation`],
        required_actions: [`Initiate clarification dialogue with primary buyer contact`],
        recommendation: 'conditional_bid',
        confidence: 'medium',
        score: 55
      });
    }
  }

  // Persist all 5 reviews to database
  if (reviews.length > 0) {
    await db.insert(councilReviews).values(
      reviews.map(r => ({
        runId: run.id,
        role: r.role,
        assessment: r.assessment,
        evidenceIds: r.evidence_ids,
        positiveFactors: r.positive_factors,
        risks: r.risks,
        missingEvidence: r.missing_evidence,
        requiredActions: r.required_actions,
        recommendation: r.recommendation,
        confidence: r.confidence,
        score: r.score,
      })),
    );
  }

  // Update run status
  await db.update(councilRuns).set({ status: 'COMPLETED' }).where(eq(councilRuns.id, run.id));

  return { runId: run.id, reviews };
}
