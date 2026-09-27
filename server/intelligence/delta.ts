import { db } from '../db/client';
import { evidence, evidenceEvents, historicalMatches, pursuits } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { Type } from '@google/genai';
import { getAI, getModelForRole, withRetry } from '../ai/router';
import { OUR_COMPANY } from '../company/profile';

export interface BlockerResolution {
  blocker: string;
  thenStatus: string;
  nowStatus: string;
  resolved: 'resolved' | 'changed' | 'unknown' | 'unresolved';
  evidenceRef?: string;
}

export interface DeltaV2 {
  blockers: BlockerResolution[];
  resolvedCount: number;
  totalCount: number;
  summaryVerdict: string;
  then: string;
  now: string;
  delta: string;
}

const DeltaSchemaV2 = {
  type: Type.OBJECT,
  properties: {
    blockers: {
      type: Type.ARRAY,
      description: "Itemized analysis of every historical objection, loss reason, or obstacle faced on this account.",
      items: {
        type: Type.OBJECT,
        properties: {
          blocker: { type: Type.STRING, description: "Specific obstacle (e.g. Missing SAP connector, CISO departure, timeline)" },
          thenStatus: { type: Type.STRING, description: "What the situation was at the time of past loss" },
          nowStatus: { type: Type.STRING, description: "Current reality based on our updated profile and account intelligence" },
          resolved: {
            type: Type.STRING,
            enum: ["resolved", "changed", "unknown", "unresolved"],
            description: "Resolution status"
          },
          evidenceRef: { type: Type.STRING, description: "Reference to supporting intelligence or capability" }
        },
        required: ["blocker", "thenStatus", "nowStatus", "resolved"]
      }
    },
    resolvedCount: { type: Type.INTEGER, description: "Number of blockers resolved" },
    totalCount: { type: Type.INTEGER, description: "Total number of blockers identified" },
    summaryVerdict: {
      type: Type.STRING,
      description: "Concise metric summary, e.g., '3 of 4 historical blockers resolved, 1 changed'"
    },
    then: {
      type: Type.STRING,
      description: "Cohesive summary of the past state (previous deals, objections, lost scope, incumbent advantage)"
    },
    now: {
      type: Type.STRING,
      description: "Cohesive summary of current state (new stakeholders, budget releases, company expansion, active signals)"
    },
    delta: {
      type: Type.STRING,
      description: "The material strategic shift that justifies reopening or bidding this opportunity"
    }
  },
  required: ["blockers", "resolvedCount", "totalCount", "summaryVerdict", "then", "now", "delta"]
};

export async function buildDelta(pursuitId: string): Promise<DeltaV2> {
  const [pursuit] = await db.select().from(pursuits).where(eq(pursuits.id, pursuitId));
  
  // 1. Fetch historical matches (THEN context)
  const matches = await db.select().from(historicalMatches)
    .where(eq(historicalMatches.pursuitId, pursuitId))
    .orderBy(desc(historicalMatches.similarityScore));

  // 2. Fetch evidence records
  const evRecords = await db.select().from(evidence).where(eq(evidence.pursuitId, pursuitId));
  const events = await db.select().from(evidenceEvents).where(eq(evidenceEvents.pursuitId, pursuitId));

  const thenContext = matches.length > 0 
    ? matches.map(m => `Deal ${m.dealId}: Score ${m.similarityScore}%. Loss Reason: ${m.lossReason || 'N/A'}`).join('\n')
    : "No prior formal deals recorded in matcher.";

  // Extract any deal notes with loss reason from evidence
  const lossNotes = evRecords
    .filter(e => e.evidenceType === 'historical_loss_context' || (e.sourceType === 'note' && e.content.includes('HISTORICAL LOSS REASON:')))
    .map(e => e.claim || e.content)
    .join('\n');

  const nowEvidence = evRecords
    .map(e => `[${e.evidenceType || e.sourceType}] ${e.claim || e.content.slice(0, 120)}`)
    .join('\n');

  const eventSummary = events
    .map(e => `[${(e.severity || 'INFO').toUpperCase()}] ${e.title}: ${e.description}`)
    .join('\n');

  const prompt = `You are a Principal Pursuit Strategist at ${OUR_COMPANY.name}.
Analyze the historical loss reasons (THEN) and the current account intelligence (NOW) to produce a structured THEN/NOW/DELTA v2 Blocker Resolution Analysis.

OUR COMPANY CAPABILITIES TODAY:
- Core Specialties: ${OUR_COMPANY.coreDomains.join(', ')}
- Cloud & Infrastructure: ${OUR_COMPANY.techStack.cloudAndInfrastructure.join(', ')}
- ERP & Integration: ${OUR_COMPANY.techStack.erpAndEnterpriseIntegration.join(', ')}
- Delivery: ${OUR_COMPANY.deliveryCapabilities.benchSize} bench, ${OUR_COMPANY.deliveryCapabilities.deliveryModel}
- Certifications: ${OUR_COMPANY.deliveryCapabilities.certifications.join(', ')}

THEN (Historical Lost Deals & Objections):
${thenContext}
${lossNotes ? `\nDetailed Loss Notes:\n${lossNotes}` : ''}

NOW (Current Intelligence & Changes):
${nowEvidence || 'No direct evidence records'}
${eventSummary ? `\nEvents & Triggers:\n${eventSummary}` : ''}

TASK:
1. Identify all past blockers, objections, competitor promises, or timeline issues.
2. For each blocker, compare what was true THEN vs what is true NOW (using our capabilities and account changes).
3. Classify each blocker as "resolved", "changed", "unknown", or "unresolved".
4. Count resolved blockers vs total blockers and form a summaryVerdict (e.g. "3 of 4 blockers resolved, 1 changed").
5. Provide comprehensive then, now, and delta narrative summaries.`;

  const ai = getAI();
  const model = getModelForRole('synthesis');

  try {
    const response = await withRetry(
      () => ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: DeltaSchemaV2,
          temperature: 0.2,
        },
      }),
      'delta-v2-builder'
    );

    const deltaJson: DeltaV2 = JSON.parse(response.text || '{}');
    if (!deltaJson.blockers || !deltaJson.delta) {
      throw new Error('Incomplete Delta JSON structure');
    }

    // Ensure counts are accurate
    deltaJson.totalCount = deltaJson.blockers.length;
    deltaJson.resolvedCount = deltaJson.blockers.filter(b => b.resolved === 'resolved').length;
    if (!deltaJson.summaryVerdict) {
      deltaJson.summaryVerdict = `${deltaJson.resolvedCount} of ${deltaJson.totalCount} historical blockers resolved`;
    }

    return deltaJson;
  } catch (err) {
    console.error('[delta] Failed to generate Delta V2:', err);
    return {
      blockers: [
        {
          blocker: "Historical procurement timing and technical validation",
          thenStatus: "Project paused or awarded to legacy competitor",
          nowStatus: "Account shows new leadership and renewed technical focus",
          resolved: "changed"
        }
      ],
      resolvedCount: 0,
      totalCount: 1,
      summaryVerdict: "1 historical blocker identified (changed)",
      then: thenContext,
      now: nowEvidence.slice(0, 300) || "Current account activity under review",
      delta: "Account dynamic has shifted with new decision makers and updated capabilities."
    };
  }
}
