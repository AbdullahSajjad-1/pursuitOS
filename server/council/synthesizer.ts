/**
 * Council Synthesizer — takes the five independent reviews, applies hard gates,
 * then asks Gemini to produce the final weighted decision.
 *
 * Flow:
 *   1. Evaluate deterministic hard gates (no LLM needed)
 *   2. If not blocked → run LLM synthesis with weighted prompt
 *   3. Persist decision to council_runs and update pursuit status
 */

import { db } from '../db/client';
import { councilRuns, pursuits } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getAI, getModelForRole, withRetry } from '../ai/router';
import { SynthesisSchema } from '../ai/schemas';
import { evaluateHardGates, getSynthesisPrompt, type CouncilReview } from '../ai/synthesis';

export interface SynthesisResult {
  decision: string;
  confidence: string;
  rationale: string;
  key_strengths: string[];
  key_risks: string[];
  conditions: string[];
  recommended_actions: Array<{
    title: string;
    owner_role: string;
    priority: string;
    description: string;
  }>;
  weighted_score: number;
  hard_gate_blocked: boolean;
  hard_gate_reason: string | null;
}

export async function synthesize(
  pursuitId: string,
  runId: string,
  reviews: CouncilReview[],
  requirements: Array<{ category: string; priority: string; text: string }>,
): Promise<SynthesisResult> {
  // 1. Check hard gates (deterministic — no LLM)
  const gate = evaluateHardGates(requirements, reviews);

  if (gate.blocked) {
    console.log(`[synthesizer] Hard gate triggered: ${gate.reason}`);

    const result: SynthesisResult = {
      decision: 'no_bid',
      confidence: 'high',
      rationale: `Decision blocked by deterministic gate: ${gate.reason}`,
      key_strengths: [],
      key_risks: [gate.reason!],
      conditions: [],
      recommended_actions: [],
      weighted_score: 0,
      hard_gate_blocked: true,
      hard_gate_reason: gate.reason,
    };

    await persistDecision(pursuitId, runId, result);
    return result;
  }

  // 2. Fetch pursuit metadata for the prompt
  const [pursuit] = await db.select().from(pursuits).where(eq(pursuits.id, pursuitId));

  // 3. Run LLM synthesis
  console.log('[synthesizer] Running Gemini synthesis...');
  const ai = getAI();
  const model = getModelForRole('synthesis');
  const { system, user } = getSynthesisPrompt(reviews, pursuit?.name || 'Unknown', pursuit?.companyDomain || 'Unknown');

  const response = await withRetry(
    () => ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: user }] }],
      config: {
        systemInstruction: system,
        responseMimeType: 'application/json',
        responseSchema: SynthesisSchema,
        temperature: 0.2,
      },
    }),
    'synthesis',
  );

  const raw = JSON.parse(response.text || '{}');

  const result: SynthesisResult = {
    decision: raw.decision && ['bid', 'no_bid', 'conditional_bid'].includes(raw.decision) ? raw.decision : 'no_bid',
    confidence: raw.confidence || 'medium',
    rationale: raw.rationale || '',
    key_strengths: raw.key_strengths || [],
    key_risks: raw.key_risks || [],
    conditions: raw.conditions || [],
    recommended_actions: raw.recommended_actions || [],
    weighted_score: raw.weighted_score || 0,
    hard_gate_blocked: false,
    hard_gate_reason: null,
  };

  // 4. Persist
  await persistDecision(pursuitId, runId, result);

  return result;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

async function persistDecision(pursuitId: string, runId: string, result: SynthesisResult) {
  // Update council run with decision
  await db.update(councilRuns).set({
    decision: result.decision,
    confidence: result.confidence,
    synthesisRationale: result.rationale,
    recommendedAction: result.recommended_actions.length > 0
      ? result.recommended_actions[0].title
      : null,
    status: 'COMPLETED',
  }).where(eq(councilRuns.id, runId));

  // Update pursuit status
  const statusMap: Record<string, string> = {
    bid: 'BID',
    no_bid: 'NO_BID',
    conditional_bid: 'CONDITIONAL_BID',
  };

  await db.update(pursuits).set({
    status: statusMap[result.decision] || 'READY_FOR_REVIEW',
    bidConfidence: result.confidence,
    updatedAt: new Date(),
  }).where(eq(pursuits.id, pursuitId));

  console.log(`[synthesizer] Decision: ${result.decision.toUpperCase()} | Confidence: ${result.confidence} | Score: ${result.weighted_score}/100`);
}
