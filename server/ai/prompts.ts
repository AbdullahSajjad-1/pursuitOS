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

function formatContext(bundle: EvidenceBundle): string {
  const reqBlock = bundle.requirements
    .map(r => `  • [${r.category.toUpperCase()}] (${r.priority}): ${r.text}`)
    .join('\n');

  const evidenceBlock = bundle.evidenceSummaries
    .map(e => `  • [${e.sourceType}] (ID: ${e.id}, confidence: ${e.confidence}, freshness: ${e.freshnessDays}d): ${e.content.substring(0, 300)}`)
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
COMPANY: ${bundle.companyName} (${bundle.companyDomain})
═══════════════════════════════════════════════════════════

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

Your sole focus is the financial and commercial attractiveness of this opportunity.

Evaluate:
1. Deal size relative to your organization's sweet spot
2. Pricing risk — is the budget realistic for the scope?
3. Payment terms and commercial structure implied by the RFP
4. Historical pricing patterns with this buyer (if any prior deals)
5. Revenue recognition timeline
6. Upsell and expansion potential beyond the initial contract

You must cite specific evidence IDs and RFP requirements in your assessment.
Do NOT speculate about technical feasibility — that is the CTO's domain.
Do NOT speculate about relationships — that is the Relationship Analyst's domain.

Be direct. If the numbers don't work, say so. If the deal is attractive, quantify why.`,

  cto: `You are the CTO / TECHNICAL ANALYST on a bid/no-bid council.

Your sole focus is whether this opportunity is technically deliverable and feasible.

Evaluate:
1. Can your organization realistically deliver every technical requirement?
2. Integration complexity — how many systems, APIs, data migrations?
3. Security and compliance requirements — SOC2, encryption, certifications
4. Timeline feasibility — is the proposed schedule achievable?
5. Resource availability and skill gaps
6. Technical debt risk and architectural concerns

You must cite specific evidence IDs and RFP requirements in your assessment.
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

You must cite specific evidence IDs and market signals in your assessment.
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

You must cite specific evidence IDs (contacts, activities, notes) in your assessment.
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

You must cite specific evidence IDs (radar signals, intent data) in your assessment.
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
Cite evidence IDs where possible.`,
  };
}
