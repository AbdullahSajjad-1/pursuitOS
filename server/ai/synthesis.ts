/**
 * Synthesis Prompt — the final decision-maker that weighs all five council
 * reviews and produces a unified BID / NO_BID / CONDITIONAL_BID decision.
 *
 * The synthesizer sees every agent's output but applies weighted scoring
 * and enforces hard deterministic gates before the LLM even runs.
 */

export interface CouncilReview {
  role: string;
  assessment: string;
  evidence_ids: string[];
  positive_factors: string[];
  risks: string[];
  missing_evidence: string[];
  required_actions: string[];
  recommendation: string;
  confidence: string;
  score: number;
}

// ---------------------------------------------------------------------------
// Hard gates — deterministic checks BEFORE the LLM synthesizer runs
// ---------------------------------------------------------------------------

export interface HardGateResult {
  blocked: boolean;
  reason: string | null;
}

export function evaluateHardGates(
  requirements: Array<{ category: string; priority: string; text: string }>,
  reviews: CouncilReview[],
): HardGateResult {
  // Gate 1: If the CTO flags an impossible deadline and scores < 20
  const ctoReview = reviews.find(r => r.role === 'cto');
  if (ctoReview && ctoReview.score < 20 && ctoReview.recommendation === 'no_bid') {
    return { blocked: true, reason: `CTO hard block: ${ctoReview.risks[0] || 'Technical infeasibility'}` };
  }

  // Gate 2: If ALL five agents recommend no_bid
  const allNoBid = reviews.length === 5 && reviews.every(r => r.recommendation === 'no_bid');
  if (allNoBid) {
    return { blocked: true, reason: 'Unanimous no-bid recommendation from all five council members' };
  }

  // Gate 3: Critical security/legal requirement that is explicitly flagged as impossible
  const criticalSecurity = requirements.filter(
    r => r.category === 'security' && r.priority === 'critical'
  );
  if (criticalSecurity.length > 0 && ctoReview) {
    const securityBlock = ctoReview.risks.some(
      risk => (risk.toLowerCase().includes('impossible') || risk.toLowerCase().includes('cannot meet')) 
              && (risk.toLowerCase().includes('security') || risk.toLowerCase().includes('compliance'))
    );
    if (securityBlock) {
      return { blocked: true, reason: `Critical security requirement cannot be met: ${criticalSecurity[0].text}` };
    }
  }

  return { blocked: false, reason: null };
}

// ---------------------------------------------------------------------------
// Synthesis prompt
// ---------------------------------------------------------------------------

export function getSynthesisPrompt(
  reviews: CouncilReview[],
  pursuitName: string,
  companyName: string,
): { system: string; user: string } {
  const reviewsBlock = reviews
    .map(r => {
      return `
── ${r.role.toUpperCase()} ANALYST ──
Recommendation: ${r.recommendation} | Confidence: ${r.confidence} | Score: ${r.score}/100
Assessment: ${r.assessment}
Positive Factors: ${r.positive_factors.join('; ')}
Risks: ${r.risks.join('; ')}
Missing Evidence: ${r.missing_evidence.join('; ')}
Required Actions: ${r.required_actions.join('; ')}
Evidence Cited: ${r.evidence_ids.join(', ')}`;
    })
    .join('\n');

  const system = `You are the CHIEF STRATEGY OFFICER synthesizing a bid/no-bid decision.

You have received independent assessments from five council analysts:
• Commercial Analyst (weight: 20%)
• CTO / Technical Analyst (weight: 25%)
• Relationship Analyst (weight: 20%)
• CEO / Strategic Analyst (weight: 15%)
• Competitive Analyst (weight: 10%)
• Evidence Quality (weight: 10% — assessed by you based on freshness and gaps)

RULES:
1. Your decision MUST be one of: bid, no_bid, or conditional_bid
2. If any single analyst flags a hard blocker (score < 20, recommendation = no_bid), explain why you agree or disagree
4. Every claim in your rationale must reference which analyst or evidence fact supports it (e.g. "CTO technical review", "VP of Global Procurement David Miller in Graph8"). NEVER output raw database UUIDs or internal IDs in the rationale.
5. Generate 5-8 concrete next actions with clear owners (cto, sales, legal, executive)
6. The weighted_score is: sum of (analyst_score × weight). Calculate it precisely.
7. Confidence reflects evidence completeness: high = strong Graph8 data, medium = some gaps, low = mostly speculation
8. Under no circumstances should you print raw UUID strings (e.g. 96d45630-...) in the user-facing rationale or descriptions. Always write clean, executive-ready prose.

Do NOT invent evidence. If the council members flagged missing data, reflect that in your confidence level.`;

  const user = `Synthesize the final bid decision for:

PURSUIT: ${pursuitName}
COMPANY: ${companyName}

COUNCIL REVIEWS:
${reviewsBlock}

Produce your final synthesis with decision, confidence, rationale, strengths, risks, conditions, recommended actions, and weighted score.`;

  return { system, user };
}
