/**
 * End-to-end test for the 5-Agent Bid Council (Phase 4).
 *
 * Seeds realistic pursuit data into Supabase, then runs:
 *   1. Council Runner (5 parallel agents)
 *   2. Synthesizer (weighted decision with hard gates)
 *
 * Uses gemini-3.5-flash-lite to avoid 503 errors.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './db/client';
import {
  pursuits, opportunityRequirements, evidence, evidenceEvents,
  historicalMatches, councilRuns, councilReviews,
} from './db/schema';
import { eq } from 'drizzle-orm';
import { runCouncil } from './council/runner';
import { synthesize } from './council/synthesizer';

const PURSUIT_ID = '22222222-2222-2222-2222-222222222222';

async function seedTestData() {
  console.log('Seeding realistic test data...\n');

  // Cleanup previous run
  const pastRuns = await db.select().from(councilRuns).where(eq(councilRuns.pursuitId, PURSUIT_ID));
  for (const r of pastRuns) {
    await db.delete(councilReviews).where(eq(councilReviews.runId, r.id)).catch(() => {});
  }
  await db.delete(councilRuns).where(eq(councilRuns.pursuitId, PURSUIT_ID)).catch(() => {});
  await db.delete(historicalMatches).where(eq(historicalMatches.pursuitId, PURSUIT_ID)).catch(() => {});
  await db.delete(evidenceEvents).where(eq(evidenceEvents.pursuitId, PURSUIT_ID)).catch(() => {});
  await db.delete(evidence).where(eq(evidence.pursuitId, PURSUIT_ID)).catch(() => {});
  await db.delete(opportunityRequirements).where(eq(opportunityRequirements.pursuitId, PURSUIT_ID)).catch(() => {});
  await db.delete(pursuits).where(eq(pursuits.id, PURSUIT_ID)).catch(() => {});

  // Create pursuit
  await db.insert(pursuits).values({
    id: PURSUIT_ID,
    name: 'ACME Corp — $850K ERP Transformation',
    companyId: 'acme-123',
    companyDomain: 'acmecorp.com',
    status: 'ANALYZING',
  });

  // Requirements (realistic RFP extraction)
  await db.insert(opportunityRequirements).values([
    { pursuitId: PURSUIT_ID, category: 'scope', priority: 'critical', text: 'Migrate 10,000 existing user records to the new cloud-based ERP system with zero data loss.' },
    { pursuitId: PURSUIT_ID, category: 'integration', priority: 'critical', text: 'Integrate with existing Active Directory for SSO and role-based access control.' },
    { pursuitId: PURSUIT_ID, category: 'security', priority: 'critical', text: 'All data must be encrypted at rest using AES-256 and in transit using TLS 1.3.' },
    { pursuitId: PURSUIT_ID, category: 'security', priority: 'critical', text: 'Vendor must hold current SOC2 Type 2 certification.' },
    { pursuitId: PURSUIT_ID, category: 'timeline', priority: 'critical', text: 'Proposals due October 15, 2026. Implementation must begin by January 1, 2027.' },
    { pursuitId: PURSUIT_ID, category: 'commercial', priority: 'critical', text: 'Budget is fixed at $850,000 for the first year including licensing, implementation, and support.' },
    { pursuitId: PURSUIT_ID, category: 'technical', priority: 'important', text: '24/7 technical support with a 4-hour SLA for critical issues.' },
    { pursuitId: PURSUIT_ID, category: 'delivery', priority: 'important', text: 'Phased rollout: Phase 1 (core modules) by March 2027, Phase 2 (advanced analytics) by June 2027.' },
    { pursuitId: PURSUIT_ID, category: 'proof', priority: 'important', text: 'Provide at least 3 case studies of similar ERP migrations in the manufacturing sector.' },
    { pursuitId: PURSUIT_ID, category: 'stakeholders', priority: 'nice_to_have', text: 'Dedicated project manager and executive sponsor from the vendor side.' },
  ]);

  // Evidence (simulating Graph8 data)
  await db.insert(evidence).values([
    {
      pursuitId: PURSUIT_ID, source: 'graph8', sourceType: 'company', sourceId: 'acme-123',
      content: JSON.stringify({ id: 'acme-123', name: 'ACME Corp', domain: 'acmecorp.com', industry: 'Manufacturing', employees: 2500 }),
      confidence: 'high', freshnessDays: 1, observedAt: new Date(),
    },
    {
      pursuitId: PURSUIT_ID, source: 'graph8', sourceType: 'contact', sourceId: 'contact-1',
      content: JSON.stringify({ id: 'contact-1', firstName: 'Sarah', lastName: 'Chen', title: 'CTO', email: 'sarah.chen@acmecorp.com', companyId: 'acme-123' }),
      confidence: 'high', freshnessDays: 3, observedAt: new Date(),
    },
    {
      pursuitId: PURSUIT_ID, source: 'graph8', sourceType: 'contact', sourceId: 'contact-2',
      content: JSON.stringify({ id: 'contact-2', firstName: 'Marcus', lastName: 'Williams', title: 'VP of IT', email: 'marcus.w@acmecorp.com', companyId: 'acme-123' }),
      confidence: 'high', freshnessDays: 7, observedAt: new Date(),
    },
    {
      pursuitId: PURSUIT_ID, source: 'graph8', sourceType: 'contact', sourceId: 'contact-3',
      content: JSON.stringify({ id: 'contact-3', firstName: 'Priya', lastName: 'Patel', title: 'CFO', email: 'priya.p@acmecorp.com', companyId: 'acme-123' }),
      confidence: 'high', freshnessDays: 15, observedAt: new Date(),
    },
    {
      pursuitId: PURSUIT_ID, source: 'graph8', sourceType: 'deal', sourceId: 'deal-prev-1',
      content: JSON.stringify({ id: 'deal-prev-1', name: 'ACME ERP Modernization 2024', stage: 'lost', isClosed: true, isWon: false, amount: 620000 }),
      confidence: 'high', freshnessDays: 300, observedAt: new Date('2024-06-15'),
    },
    {
      pursuitId: PURSUIT_ID, source: 'graph8', sourceType: 'deal', sourceId: 'deal-prev-2',
      content: JSON.stringify({ id: 'deal-prev-2', name: 'ACME Security Audit', stage: 'won', isClosed: true, isWon: true, amount: 95000 }),
      confidence: 'high', freshnessDays: 180, observedAt: new Date('2025-03-01'),
    },
    {
      pursuitId: PURSUIT_ID, source: 'graph8', sourceType: 'note', sourceId: 'note-1',
      content: JSON.stringify({ id: 'note-1', entityType: 'deal', entityId: 'deal-prev-1', content: 'Lost to CompetitorX. Client feedback: pricing was 15% above budget, and our timeline was 2 months longer than competition. New CTO (Sarah Chen) joined after this deal closed.' }),
      confidence: 'high', freshnessDays: 300, observedAt: new Date('2024-06-20'),
    },
    {
      pursuitId: PURSUIT_ID, source: 'graph8', sourceType: 'signal', sourceId: 'signal-1',
      content: JSON.stringify({ id: 'signal-1', type: 'intent', topic: 'ERP cloud migration', strength: 'high', source: 'G2 research visits' }),
      confidence: 'medium', freshnessDays: 5, observedAt: new Date(),
    },
    {
      pursuitId: PURSUIT_ID, source: 'graph8', sourceType: 'signal', sourceId: 'signal-2',
      content: JSON.stringify({ id: 'signal-2', type: 'hiring', topic: 'Cloud Infrastructure Engineer', strength: 'medium', source: 'LinkedIn job posting' }),
      confidence: 'medium', freshnessDays: 10, observedAt: new Date(),
    },
    {
      pursuitId: PURSUIT_ID, source: 'graph8', sourceType: 'radar', sourceId: 'radar-1',
      content: JSON.stringify({ id: 'radar-1', competitor: 'CompetitorX', activity: 'Active engagement detected', lastSeen: '2026-09-10' }),
      confidence: 'medium', freshnessDays: 16, observedAt: new Date(),
    },
  ]);

  // Historical matches
  await db.insert(historicalMatches).values([
    { pursuitId: PURSUIT_ID, dealId: 'deal-prev-1', similarityScore: 88, lossReason: 'Pricing 15% over budget, timeline 2 months longer than competition' },
    { pursuitId: PURSUIT_ID, dealId: 'deal-prev-2', similarityScore: 35, lossReason: null },
  ]);

  // Evidence events
  await db.insert(evidenceEvents).values([
    {
      pursuitId: PURSUIT_ID, title: 'New CTO Appointed',
      description: 'Sarah Chen joined as CTO in Q1 2025, replacing the previous decision-maker who rejected our bid.',
      impact: 'positive', severity: 'material',
    },
    {
      pursuitId: PURSUIT_ID, title: 'Active ERP Research Intent',
      description: 'Graph8 detected high-strength intent signals for ERP cloud migration via G2 research visits.',
      impact: 'positive', severity: 'material',
    },
    {
      pursuitId: PURSUIT_ID, title: 'CompetitorX Re-engaged',
      description: 'Radar shows CompetitorX has active engagement with ACME Corp as of September 2026.',
      impact: 'negative', severity: 'watch',
    },
    {
      pursuitId: PURSUIT_ID, title: 'Cloud Infrastructure Hiring',
      description: 'ACME is hiring a Cloud Infrastructure Engineer, signaling internal investment in cloud readiness.',
      impact: 'positive', severity: 'observed',
    },
  ]);

  console.log('  ✓ Pursuit created');
  console.log('  ✓ 10 requirements seeded');
  console.log('  ✓ 10 evidence records seeded');
  console.log('  ✓ 2 historical matches seeded');
  console.log('  ✓ 4 evidence events seeded');
}

async function runTest() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PHASE 4 END-TO-END TEST: 5-Agent Bid Council');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    await seedTestData();

    // Step 1: Run the 5-agent council
    console.log('\n──────────────────────────────────────────────────────────');
    console.log('  STEP 1: Running 5-Agent Council (parallel)');
    console.log('──────────────────────────────────────────────────────────\n');

    const { runId, reviews } = await runCouncil(PURSUIT_ID);
    console.log(`\n  Council run ${runId} completed with ${reviews.length} reviews.\n`);

    // Print each agent's assessment
    for (const review of reviews) {
      console.log(`\n  ┌── ${review.role.toUpperCase()} ──────────────────────────────`);
      console.log(`  │ Recommendation: ${review.recommendation}`);
      console.log(`  │ Confidence: ${review.confidence} | Score: ${review.score}/100`);
      console.log(`  │ Assessment: ${review.assessment.substring(0, 200)}...`);
      console.log(`  │ Positives: ${review.positive_factors.join('; ')}`);
      console.log(`  │ Risks: ${review.risks.join('; ')}`);
      console.log(`  │ Actions: ${review.required_actions.join('; ')}`);
      console.log(`  └──────────────────────────────────────────────────────`);
    }

    // Step 2: Run the synthesizer
    console.log('\n──────────────────────────────────────────────────────────');
    console.log('  STEP 2: Running Synthesizer (weighted decision)');
    console.log('──────────────────────────────────────────────────────────\n');

    const reqs = await db.select().from(opportunityRequirements).where(eq(opportunityRequirements.pursuitId, PURSUIT_ID));
    const synthesis = await synthesize(
      PURSUIT_ID,
      runId,
      reviews,
      reqs.map(r => ({ category: r.category, priority: r.priority, text: r.text })),
    );

    console.log('\n══════════════════════════════════════════════════════════');
    console.log('  FINAL DECISION');
    console.log('══════════════════════════════════════════════════════════');
    console.log(`  Decision:    ${synthesis.decision.toUpperCase()}`);
    console.log(`  Confidence:  ${synthesis.confidence}`);
    console.log(`  Score:       ${synthesis.weighted_score}/100`);
    console.log(`  Hard Gate:   ${synthesis.hard_gate_blocked ? `BLOCKED — ${synthesis.hard_gate_reason}` : 'PASSED'}`);
    console.log(`\n  Rationale:\n  ${synthesis.rationale}\n`);
    console.log(`  Strengths:`);
    synthesis.key_strengths.forEach(s => console.log(`    ✓ ${s}`));
    console.log(`  Risks:`);
    synthesis.key_risks.forEach(r => console.log(`    ⚠ ${r}`));
    if (synthesis.conditions.length > 0) {
      console.log(`  Conditions:`);
      synthesis.conditions.forEach(c => console.log(`    ● ${c}`));
    }
    console.log(`  Recommended Actions:`);
    synthesis.recommended_actions.forEach(a => console.log(`    → [${a.priority}] ${a.title} (owner: ${a.owner_role}): ${a.description}`));

    console.log('\n✅ Phase 4 End-to-End Test Complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTest();
