/**
 * Council Prompts — system instructions for each of the five council agents.
 *
 * Each prompt receives the same EvidenceBundle but is told to reason from a
 * distinct professional perspective. Agents never see each other's output
 * (anti-anchoring by design).
 */

export type CouncilRole = 'commercial' | 'cto' | 'ceo' | 'relationship' | 'competitive';

export const COUNCIL_ROLES: CouncilRole[] = ['commercial', 'cto', 'ceo', 'relationship', 'competitive'];

// ---------------------------------------------------------------------------
// Evidence Bundle — the structured context every agent receives
// ---------------------------------------------------------------------------

export interface EvidenceBundle {
  pursuitName: string;
  companyName: string;
  companyDomain: string;
  requirements: Array<{ category: string; priority: string; text: string }>;
  delta: { then: string; now: string; delta: string };
  evidenceSummaries: Array<{ id: string; sourceType: string; content: string; confidence: string; freshnessDays: number }>;
  historicalMatches: Array<{ dealId: string; similarityScore: number; lossReason: string | null }>;
  events: Array<{ title: string; description: string | null; impact: string | null; severity: string | null }>;
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

import { getFormattedCompanyProfile } from '../company/profile';

function formatContext(bundle: EvidenceBundle): string {
  const reqBlock = bundle.requirements
    .map(r => `  • [${r.category.toUpperCase()}] (${r.priority}): ${r.text}`)
    .join('\n');

  const evidenceBlock = bundle.evidenceSummaries
    .map(e => `  • [${e.sourceType.toUpperCase()}] (${e.confidence} confidence, ${e.freshnessDays}d freshness): ${e.content.substring(0, 300)}`)
    .join('\n');

  const historyBlock = bundle.historicalMatches.length > 0
    ? bundle.historicalMatches.map(m => `  • Deal ${m.dealId}: similarity ${m.similarityScore}/100. Loss reason: ${m.lossReason || 'N/A'}`).join('\n')
    : '  No highly similar historical deals found.';

  const eventsBlock = bundle.events.length > 0
    ? bundle.events.map(e => `  • [${(e.severity || 'UNKNOWN').toUpperCase()}] ${e.title}: ${e.description || ''} (Impact: ${e.impact || 'unknown'})`).join('\n')
    : '  No material events detected.';

  return `
═══════════════════════════════════════════════════════════
PURSUIT: ${bundle.pursuitName}
PROSPECT / BUYER: ${bundle.companyName} (${bundle.companyDomain})
═══════════════════════════════════════════════════════════

── OUR BIDDING ORGANIZATION (CORE CAPABILITIES & TECH STACK) ──
${getFormattedCompanyProfile()}

── RFP REQUIREMENTS ──
${reqBlock}

── HISTORICAL CONTEXT (THEN → NOW → DELTA) ──
THEN: ${bundle.delta.then}
NOW:  ${bundle.delta.now}
DELTA: ${bundle.delta.delta}

── GRAPH8 EVIDENCE ──
${evidenceBlock}

── HISTORICAL DEAL MATCHES ──
${historyBlock}

── MATERIAL EVENTS & SIGNALS ──
${eventsBlock}
`;
}

// ---------------------------------------------------------------------------
// Role-specific system prompts
// ---------------------------------------------------------------------------

const ROLE_PROMPTS: Record<CouncilRole, string> = {
  commercial: `You are the COMMERCIAL ANALYST on a bid/no-bid council.

Your sole focus is the financial and commercial attractiveness of this opportunity relative to our organization's sweet spot ($2.5M - $10M USD).

Evaluate:
1. Deal size vs our $2.5M - $10M sweet spot — is the budget realistic for the scope?
2. Pricing model risk: fixed-fee core platform vs milestone-based factory rollout.
3. Payment terms and commercial structure implied by the RFP.
4. Historical pricing patterns with this buyer (if any prior deals).
5. 18-month recurring revenue and expansion potential.

Reference the factual commercial evidence, pricing data, and our commercial parameters in your assessment.
NEVER output raw database UUIDs or internal IDs in human-facing text; always describe the real evidence context (e.g. "Graph8 company financials", "RFP Section 4 budget terms").
Do NOT speculate about technical feasibility — that is the CTO's domain.
Do NOT speculate about relationships — that is the Relationship Analyst's domain.

Be direct. If the numbers don't work, say so. If the deal is attractive, quantify why.`,

  cto: `You are the CTO / TECHNICAL ANALYST on a bid/no-bid council.

Your sole focus is whether this opportunity is technically deliverable against OUR COMPANY'S TECH STACK AND CORE CAPABILITIES.

Evaluate:
1. Direct stack alignment: Check RFP requirements against our specific competencies (Kubernetes, SAP S/4HANA bidirectional connectors, legacy AS/400 adapters, MQTT/OPC-UA edge stream processing, vector AI).
2. Out-of-scope boundaries: Flag any physical hardware fabrication (e.g. physical AGV robotics chassis manufacturing) or unsupported domains that require external partners or subcontracting.
3. Integration complexity: How many systems, APIs, protocol bridges (e.g. MQTT to SAP, AS/400 to cloud)?
4. Security & compliance: Can we fulfill SOC 2 Type II, ISO 27001, and high-availability SLA requirements (99.995%)?
5. Timeline & capacity: Is the schedule deliverable with our 85+ engineer bench?

Reference specific technical requirements and our company's native technologies in your assessment.
NEVER output raw database UUIDs or internal IDs in human-facing text; always describe the real requirement or system (e.g. "our native SAP S/4HANA connector", "MQTT edge stream buffer").
If a deadline is impossible given the scope, flag it as a hard blocker.
Do NOT evaluate commercial terms — that is the Commercial Analyst's domain.

Be precise. Engineers respect precision, not optimism.`,

  ceo: `You are the CEO / STRATEGIC ANALYST on a bid/no-bid council.

Your sole focus is the strategic value of this opportunity to the organization.

Evaluate:
1. Does this account align with our target market and ICP?
2. Is this a logo win, expansion, or renewal — and does that matter strategically?
3. What doors does winning this deal open (or close)?
4. Brand and reputation implications
5. Resource allocation — does pursuing this pull resources from higher-value work?
6. Market timing — is this the right moment for this type of engagement?

Reference strategic market signals and Graph8 account data in your assessment.
NEVER output raw database UUIDs or internal IDs in human-facing text; describe the strategic context directly.
Think at the portfolio level, not just this single deal.
Do NOT dive into technical specifics — that is the CTO's domain.

Be strategic. Think 18 months ahead, not just this quarter.`,

  relationship: `You are the RELATIONSHIP ANALYST on a bid/no-bid council.

Your sole focus is whether there is a viable path into this account.

Evaluate:
1. Existing contacts — do we know anyone at this company? What level?
2. Prior engagement history — meetings, calls, emails, activity volume
3. Champion identification — is there someone who would advocate for us?
4. Buying committee coverage — do we have access to the decision maker?
5. Relationship freshness — when was last meaningful contact?
6. Political landscape — any known internal politics or blockers?

Reference specific contacts by name, role, and Graph8 history in your assessment.
NEVER output raw database UUIDs or internal IDs in human-facing text (e.g. refer to "VP of Global Procurement David Miller" rather than a UUID).
If we have zero relationship, say so clearly — that is a material risk.
Do NOT evaluate the commercial terms — that is the Commercial Analyst's domain.

Be honest about relationship strength. Weak relationships lose deals.`,

  competitive: `You are the COMPETITIVE ANALYST on a bid/no-bid council.

Your sole focus is the competitive landscape and our positioning.

Evaluate:
1. Known competitors in this account (from radar and signals)
2. Competitor strengths relative to these specific RFP requirements
3. Our differentiation for this particular opportunity
4. Intent signals — is the buyer actively evaluating alternatives?
5. Incumbent advantage or disadvantage
6. Win probability given the competitive field

Reference specific competitor signals and radar data in your assessment.
NEVER output raw database UUIDs or internal IDs in human-facing text.
If we lack competitive intelligence, flag that as a gap.
Do NOT evaluate internal technical capability — that is the CTO's domain.

Be realistic. Ignoring strong competitors is how deals are lost.`,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getCouncilPrompt(role: CouncilRole, bundle: EvidenceBundle): { system: string; user: string } {
  const context = formatContext(bundle);

  return {
    system: ROLE_PROMPTS[role],
    user: `Analyze this pursuit opportunity and provide your independent ${role} assessment.

${context}

Respond with your structured review. Your recommendation must be one of: bid, no_bid, or conditional_bid.
Your confidence must be one of: low, medium, or high.
Your score must be 0-100.
Reference actual evidence facts and context. Do NOT include raw database UUIDs in human-facing text.`,
  };
}
