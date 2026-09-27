/**
 * Commercial Pricing Engine
 * 
 * Calculates our target bid amount based on:
 * 1. Detected budget / contract value from RFP document
 * 2. Requirement complexity (technical, integration, security counts)
 * 3. Our company delivery sweet spot ($2,500,000 - $10,000,000 USD)
 * 4. Milestone-based phased delivery model (Phase 1 PoC, Phase 2 Core, Phase 3 Scale, Phase 4 SLA)
 */

export interface PricingResult {
  targetBidAmount: number;
  clientBudget: number | null;
  discountPercentage: number;
  pricingRationale: string;
  milestones: Array<{
    name: string;
    amount: number;
    description: string;
  }>;
}

export function extractBudgetFromText(text: string): number | null {
  const match = text.match(/(?:Estimated Contract Value|Contract Value|Estimated Budget|Budget Ceiling|Budget)(?:\s*(?:is|was|of|around|approximately|up to|exceeding|:|=)*\s*)*\$?([0-9,]+(?:\.[0-9]+)?)\s*(million|m|k|billion|b)?\s*(USD)?/i);
  if (match) {
    let val = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      const multiplier = match[2]?.toLowerCase();
      if (multiplier === 'million' || multiplier === 'm') val *= 1000000;
      else if (multiplier === 'k') val *= 1000;
      else if (multiplier === 'billion' || multiplier === 'b') val *= 1000000000;
      return Math.round(val);
    }
  }
  return null;
}

export function calculateBidPricing(params: {
  rfpText?: string;
  requirements?: Array<{ category: string; priority: string; text: string }>;
  decision?: string;
}): PricingResult {
  let clientBudget: number | null = null;

  // 1. Try to extract budget from raw text if provided
  if (params.rfpText) {
    clientBudget = extractBudgetFromText(params.rfpText);
  }

  // 2. If not found in raw text, scan requirements
  if (!clientBudget && params.requirements) {
    for (const req of params.requirements) {
      const budget = extractBudgetFromText(req.text);
      if (budget) {
        clientBudget = budget;
        break;
      }
    }
  }

  let targetBidAmount: number;
  let discountPercentage = 0;
  let pricingRationale = '';

  if (clientBudget && clientBudget > 0) {
    // Strategic win-rate pricing:
    // For standard bids, price at 94% of budget ceiling (giving 6% headroom)
    // For conditional bids (with partner requirements), price at 97% of budget
    const factor = params.decision === 'conditional_bid' ? 0.97 : 0.94;
    discountPercentage = Math.round((1 - factor) * 100);
    
    // Round cleanly to nearest $25,000
    targetBidAmount = Math.round((clientBudget * factor) / 25000) * 25000;

    // Enforce sweet spot bounds ($2.5M to $10M) where sensible
    if (targetBidAmount < 2500000 && clientBudget >= 2500000) {
      targetBidAmount = 2500000;
    }

    pricingRationale = `Priced at $${targetBidAmount.toLocaleString()} USD (${Math.round(factor * 100)}% of client's $${clientBudget.toLocaleString()} USD budget ceiling) across 4 milestone gates to maximize competitive win probability and healthy delivery margins.`;
  } else {
    // If no budget is provided in the RFP, estimate from requirement complexity
    const reqs = params.requirements || [];
    const techReqs = reqs.filter(r => r.category === 'technical').length;
    const intReqs = reqs.filter(r => r.category === 'integration').length;
    const secReqs = reqs.filter(r => r.category === 'security').length;

    // Base software platform within sweet spot
    let base = 2800000;
    // Add increments for complex technical integrations
    base += Math.min(techReqs * 150000, 900000);
    base += Math.min(intReqs * 200000, 800000);
    base += Math.min(secReqs * 100000, 500000);

    targetBidAmount = Math.round(base / 25000) * 25000;
    pricingRationale = `Calculated standard delivery bid of $${targetBidAmount.toLocaleString()} USD based on ${reqs.length} extracted requirements (${techReqs} technical, ${intReqs} integration) within our $2.5M-$10M sweet spot.`;
  }

  // 4-Phase milestone breakdown
  const phase1 = Math.round(targetBidAmount * 0.15);
  const phase2 = Math.round(targetBidAmount * 0.45);
  const phase3 = Math.round(targetBidAmount * 0.25);
  const phase4 = targetBidAmount - (phase1 + phase2 + phase3);

  const milestones = [
    {
      name: "Phase 1: Architecture Blueprint & PoC",
      amount: phase1,
      description: "Validation of API adapters, security compliance plan, and benchmark prototype."
    },
    {
      name: "Phase 2: Core Platform & Integration",
      amount: phase2,
      description: "Production cluster rollout, SAP/AS400/Kafka connectors, and data pipeline activation."
    },
    {
      name: "Phase 3: High-Availability Scale & Hardening",
      amount: phase3,
      description: "99.995% SLA verification, failover testing, and factory/edge sensor rollout."
    },
    {
      name: "Phase 4: Production Handover & Year-1 Support",
      amount: phase4,
      description: "24/7 dedicated SRE support, operational runbooks, and staff training."
    }
  ];

  return {
    targetBidAmount,
    clientBudget,
    discountPercentage,
    pricingRationale,
    milestones
  };
}
