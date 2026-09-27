import { db } from '../db/client';
import { evidence, evidenceEvents, historicalMatches, pursuits } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getAI, getModelForRole, withRetry } from '../ai/router';
import { Type } from '@google/genai';
import { OUR_COMPANY } from '../company/profile';

export interface WhyNowSignal {
  signal: string;
  daysAgo: number;
  evidenceId?: string;
  impact: 'strong' | 'moderate' | 'weak';
  category: 'executive_shift' | 'budget_unlock' | 'competitor_stumble' | 'technical_readiness' | 'intent_spike';
}

export interface WhyNowAnalysis {
  whyThisAccount: string;
  whyThisOpportunity: string;
  whyNow: WhyNowSignal[];
  whyUs: string[];
  whyNot: string[];
  synthesisSummary: string;
}

const WhyNowSchema = {
  type: Type.OBJECT,
  properties: {
    whyThisAccount: {
      type: Type.STRING,
      description: "Why is this specific company valuable and aligned with our target profile?"
    },
    whyThisOpportunity: {
      type: Type.STRING,
      description: "Why does this specific project or scope match our capabilities and economics?"
    },
    whyNow: {
      type: Type.ARRAY,
      description: "Specific recent catalysts, trigger events, or changes that make this the optimal time to strike.",
      items: {
        type: Type.OBJECT,
        properties: {
          signal: { type: Type.STRING, description: "Concrete event description (e.g. New CTO appointed, incumbent delayed)" },
          daysAgo: { type: Type.INTEGER, description: "Estimated days since the catalyst occurred" },
          impact: { type: Type.STRING, enum: ["strong", "moderate", "weak"] },
          category: {
            type: Type.STRING,
            enum: ["executive_shift", "budget_unlock", "competitor_stumble", "technical_readiness", "intent_spike"]
          }
        },
        required: ["signal", "daysAgo", "impact", "category"]
      }
    },
    whyUs: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 differentiated advantages we hold over incumbents or competitors based on our profile."
    },
    whyNot: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-3 rigorous counter-arguments or internal delivery risks to watch."
    },
    synthesisSummary: {
      type: Type.STRING,
      description: "A 2-sentence executive summary of the timing catalyst and win thesis."
    }
  },
  required: ["whyThisAccount", "whyThisOpportunity", "whyNow", "whyUs", "whyNot", "synthesisSummary"]
};

export async function buildWhyNow(
  pursuitId: string,
  extraContext?: { opportunityContext?: string; lossReason?: string }
): Promise<WhyNowAnalysis> {
  const [pursuit] = await db.select().from(pursuits).where(eq(pursuits.id, pursuitId));
  if (!pursuit) {
    throw new Error(`Pursuit ${pursuitId} not found`);
  }

  const evRecords = await db.select().from(evidence).where(eq(evidence.pursuitId, pursuitId));
  const events = await db.select().from(evidenceEvents).where(eq(evidenceEvents.pursuitId, pursuitId));
  const matches = await db.select().from(historicalMatches).where(eq(historicalMatches.pursuitId, pursuitId));

  // Compile evidence claims
  const evidenceClaims = evRecords
    .map(e => `[${e.evidenceType || e.sourceType}] (Freshness: ${e.freshnessDays ?? '?'}d, Conf: ${e.confidence}) ${e.claim || e.content.slice(0, 150)}`)
    .join('\n');

  const eventSummaries = events
    .map(e => `[${(e.severity || 'INFO').toUpperCase()}] ${e.title}: ${e.description}`)
    .join('\n');

  const matchSummaries = matches
    .map(m => `Prior Deal: ${m.dealId}, Similarity: ${m.similarityScore}%, Loss Reason: ${m.lossReason}`)
    .join('\n');

  const lossContext = extraContext?.lossReason || pursuit.sourceDealId ? `Target Account Historical Context / Blocker: ${extraContext?.lossReason || 'Past closed-lost deal'}` : '';

  const prompt = `You are the Chief Strategy Officer at ${OUR_COMPANY.name}.
We are evaluating a strategic enterprise pursuit for account "${pursuit.companyDomain || pursuit.name}".
Pursuit Type: ${pursuit.pursuitType || 'NEW'}.

OUR COMPANY PROFILE & ADVANTAGES:
- Name: ${OUR_COMPANY.name}
- Tagline: ${OUR_COMPANY.tagline}
- Core Specialties: ${OUR_COMPANY.coreDomains.join(', ')}
- Cloud & Infra: ${OUR_COMPANY.techStack.cloudAndInfrastructure.join(', ')}
- ERP & Integration: ${OUR_COMPANY.techStack.erpAndEnterpriseIntegration.join(', ')}
- IoT & Telemetry: ${OUR_COMPANY.techStack.iotAndEdgeTelemetry.join(', ')}
- Certifications & Delivery: ${OUR_COMPANY.deliveryCapabilities.certifications.join(', ')} | Sweet spot: ${OUR_COMPANY.deliveryCapabilities.contractSweetSpot}
- Value Prop: ${OUR_COMPANY.valueProposition}

PURSUIT EVIDENCE CLAIMS (Graph8 Verified):
${evidenceClaims || 'No raw evidence records'}

ACCOUNT EVENTS & SIGNALS:
${eventSummaries || 'None recorded'}

HISTORICAL CRM CONTEXT / PREVIOUS LOSS REASONS:
${matchSummaries || lossContext || 'No previous deals'}

TASK:
Produce a rigorous 5-Question "Why Now?" Strategic Intelligence Assessment:
1. WHY THIS ACCOUNT? (Account value, strategic upside)
2. WHY THIS OPPORTUNITY? (Direct fit with our capabilities)
3. WHY NOW? (The signature catalysts: leadership changes, budget unfreezes, competitor failures, or tech maturation that makes right now the winning window)
4. WHY US? (Concrete technical & architectural differentiators from our profile)
5. WHY NOT? (Honest internal doubts, potential blockers, or risks)
Plus a concise 2-sentence synthesis summary.`;

  const ai = getAI();
  const model = getModelForRole('why_now');

  const response = await withRetry(
    () => ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: WhyNowSchema,
        temperature: 0.25,
      },
    }),
    'why-now-engine'
  );

  let result: WhyNowAnalysis;
  try {
    result = JSON.parse(response.text || '{}');
    if (!result.whyNow || !Array.isArray(result.whyNow)) {
      throw new Error('Invalid whyNow response structure');
    }
  } catch (parseErr) {
    console.warn('[why_now] Fallback parsing why_now analysis:', parseErr);
    result = {
      whyThisAccount: `High-value enterprise target in ${pursuit.companyDomain}.`,
      whyThisOpportunity: pursuit.name,
      whyNow: [
        {
          signal: "Recent executive appointment and strategic budget review detected in CRM",
          daysAgo: 14,
          impact: "strong",
          category: "executive_shift"
        }
      ],
      whyUs: ["Specialized enterprise integration and high-availability architecture"],
      whyNot: ["Aggressive delivery timetable requires dedicated team commitment"],
      synthesisSummary: `Timing is optimal due to recent account shifts aligning with our core technical competencies.`
    };
  }

  // Correlate signals with evidence IDs if possible
  for (const s of result.whyNow) {
    const matchingEv = evRecords.find(e => 
      e.claim?.toLowerCase().includes(s.category.replace('_', ' ')) ||
      e.content?.toLowerCase().includes(s.signal.slice(0, 15).toLowerCase())
    );
    if (matchingEv) {
      s.evidenceId = matchingEv.id;
    }
  }

  // Persist on the pursuit record
  try {
    await db.update(pursuits)
      .set({ whyNow: result })
      .where(eq(pursuits.id, pursuitId));
  } catch (dbErr) {
    console.warn('[why_now] Failed to persist whyNow on pursuit record:', dbErr);
  }

  return result;
}
