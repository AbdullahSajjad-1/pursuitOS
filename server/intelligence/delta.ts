import { db } from '../db/client';
import { evidence, evidenceEvents, historicalMatches } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DeltaSchema = {
  type: Type.OBJECT,
  properties: {
    then: { type: Type.STRING, description: "Summary of the past state (previous deals, objections, old stakeholders)" },
    now: { type: Type.STRING, description: "Summary of the current state (new stakeholders, intent signals, competitive radar)" },
    delta: { type: Type.STRING, description: "The material change that affects this opportunity" }
  },
  required: ["then", "now", "delta"]
};

export async function buildDelta(pursuitId: string) {
  // Fetch historical matches (THEN context)
  const matches = await db.select().from(historicalMatches)
    .where(eq(historicalMatches.pursuitId, pursuitId))
    .orderBy(desc(historicalMatches.similarityScore));

  const thenContext = matches.length > 0 
    ? matches.map(m => `Deal ${m.dealId}: Score ${m.similarityScore}. Loss Reason: ${m.lossReason || 'N/A'}`).join('\n')
    : "No highly similar historical deals found.";

  // Fetch signals and events (NOW context)
  const events = await db.select().from(evidenceEvents).where(eq(evidenceEvents.pursuitId, pursuitId));
  const nowContext = events.length > 0
    ? events.map(e => `[${(e.severity || 'UNKNOWN').toUpperCase()}] ${e.title}: ${e.description} (Impact: ${e.impact})`).join('\n')
    : "No recent material events or signals observed.";

  // Use Gemini to synthesize the DELTA narrative
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: [
      { role: 'user', parts: [{ text: `You are an enterprise sales strategist.
      Analyze the historical context (THEN) and the current signals (NOW), and synthesize the material DELTA (what changed and why it matters).
      
      THEN (Historical Deals & Context):
      ${thenContext}

      NOW (Current Signals & Events):
      ${nowContext}
      ` }] }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: DeltaSchema,
      temperature: 0.2
    }
  });

  try {
    const deltaJson = JSON.parse(response.text || "{}");
    if (!deltaJson.then || !deltaJson.now || !deltaJson.delta) {
      throw new Error("Missing required fields in parsed delta");
    }
    return deltaJson; // { then: string, now: string, delta: string }
  } catch (err) {
    console.error("Failed to parse Delta JSON:", err);
    return {
      then: thenContext,
      now: nowContext,
      delta: "Unable to automatically synthesize delta."
    };
  }
}
