/**
 * Council Schemas — Gemini-compatible JSON schemas for structured output.
 *
 * These mirror the Zod shapes from the plan but are expressed as plain objects
 * because @google/genai's `responseSchema` expects the Type-enum format, not Zod.
 */

import { Type } from '@google/genai';

// ---------------------------------------------------------------------------
// Individual council agent review
// ---------------------------------------------------------------------------

export const CouncilReviewSchema = {
  type: Type.OBJECT,
  properties: {
    role: {
      type: Type.STRING,
      description: "The council role: commercial, cto, ceo, relationship, or competitive",
    },
    assessment: {
      type: Type.STRING,
      description: "A detailed 3-5 sentence professional assessment from this role's perspective",
    },
    evidence_ids: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "IDs of evidence records that support this assessment",
    },
    positive_factors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Concrete reasons to pursue this opportunity",
    },
    risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Specific risks or concerns identified",
    },
    missing_evidence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Information gaps that would strengthen or change the assessment",
    },
    required_actions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Concrete next steps this role recommends",
    },
    recommendation: {
      type: Type.STRING,
      description: "One of: bid, no_bid, conditional_bid, watch",
      enum: ["bid", "no_bid", "conditional_bid", "watch"]
    },
    confidence: {
      type: Type.STRING,
      description: "One of: low, medium, high",
      enum: ["low", "medium", "high"]
    },
    score: {
      type: Type.INTEGER,
      description: "0-100 numeric score for UI visualization only",
    },
  },
  required: [
    "role", "assessment", "evidence_ids", "positive_factors", "risks",
    "missing_evidence", "required_actions", "recommendation", "confidence", "score",
  ],
};

// ---------------------------------------------------------------------------
// Final synthesis output
// ---------------------------------------------------------------------------

export const SynthesisSchema = {
  type: Type.OBJECT,
  properties: {
    decision: {
      type: Type.STRING,
      description: "Final recommendation: bid, no_bid, conditional_bid, or watch",
      enum: ["bid", "no_bid", "conditional_bid", "watch"]
    },
    confidence: {
      type: Type.STRING,
      description: "Overall confidence: low, medium, or high",
      enum: ["low", "medium", "high"]
    },
    rationale: {
      type: Type.STRING,
      description: "A clear 4-6 sentence executive summary explaining the decision with specific evidence citations",
    },
    key_strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Top 3-5 reasons supporting this bid",
    },
    key_risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Top 3-5 risks or blockers",
    },
    conditions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Conditions that must be met before proceeding (for conditional_bid)",
    },
    recommended_actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          owner_role: { type: Type.STRING, description: "Who should own this: cto, sales, legal, executive" },
          priority: { type: Type.STRING, description: "critical, high, medium" },
          description: { type: Type.STRING },
        },
        required: ["title", "owner_role", "priority", "description"],
      },
      description: "5-8 concrete next actions with owners",
    },
    weighted_score: {
      type: Type.INTEGER,
      description: "Weighted composite score 0-100 for UI gauge",
    },
  },
  required: [
    "decision", "confidence", "rationale", "key_strengths", "key_risks",
    "conditions", "recommended_actions", "weighted_score",
  ],
};
