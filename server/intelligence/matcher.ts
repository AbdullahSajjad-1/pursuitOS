import { db } from '../db/client';
import { opportunityRequirements, evidence, historicalMatches, pursuits } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MatcherSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      dealId: { type: Type.STRING },
      similarityScore: { type: Type.INTEGER, description: "0-100 score based on scope, size, and timeline match" },
      lossReason: { type: Type.STRING, description: "If the deal was lost, extract the core reason from notes/status" },
      explanation: { type: Type.STRING, description: "Why this deal is a strong match or mismatch" }
    },
    required: ["dealId", "similarityScore"]
  }
};

export async function matchHistoricalDeals(pursuitId: string) {
  // 1. Fetch current opportunity requirements and pursuit details
  const [pursuit] = await db.select().from(pursuits).where(eq(pursuits.id, pursuitId));
  const reqs = await db.select().from(opportunityRequirements).where(eq(opportunityRequirements.pursuitId, pursuitId));
  
  // 2. Fetch historical deals from evidence
  const dealEvidences = await db.select()
    .from(evidence)
    .where(and(eq(evidence.pursuitId, pursuitId), eq(evidence.sourceType, 'deal')));

  if (dealEvidences.length === 0) {
    await db.delete(historicalMatches).where(eq(historicalMatches.pursuitId, pursuitId));
    return 0;
  }

  // Fetch deal notes / loss reasons from evidence
  const noteEvidences = await db.select()
    .from(evidence)
    .where(and(eq(evidence.pursuitId, pursuitId), eq(evidence.sourceType, 'note')));

  const notesMap = new Map<string, string[]>();
  for (const n of noteEvidences) {
    try {
      const parsed = JSON.parse(n.content);
      const entityId = parsed.entityId || n.sourceId;
      const text = parsed.content || n.content;
      if (entityId) {
        if (!notesMap.has(entityId)) notesMap.set(entityId, []);
        notesMap.get(entityId)!.push(text);
      }
    } catch (_) {}
  }

  const reqsSummary = reqs.length > 0 
    ? reqs.map(r => `[${r.category}] ${r.priority}: ${r.text}`).join('\n')
    : `Scope: Strategic Re-Pursuit & Revival of engagement for ${pursuit?.name || 'Account'}. Evaluate historical blockers, loss reasons, and technical fit.`;

  const dealsJson = dealEvidences.map(d => {
    const dealData = JSON.parse(d.content);
    const relatedNotes = notesMap.get(dealData.id) || [];
    const notesStr = relatedNotes.length > 0 ? ` | Notes & Loss Reasons: ${relatedNotes.join('; ')}` : '';
    return `Deal ID: ${dealData.id} | Name: ${dealData.name} | Stage: ${dealData.stage} | Status: ${dealData.isClosed ? (dealData.isWon ? 'Won' : 'Lost') : 'Open'}${notesStr}`;
  }).join('\n');

  // 3. Ask Gemini to score them
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite', // Using lite model as requested/working
    contents: [
      { role: 'user', parts: [{ text: `Compare the current opportunity requirements against the historical deals.
      Score the similarity of each historical deal (0-100) and extract any loss reasons if the deal was lost.
      
      Current Opportunity Requirements:
      ${reqsSummary}

      Historical Deals:
      ${dealsJson}` }] }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: MatcherSchema,
      temperature: 0.1
    }
  });

  const rawJson = response.text;
  let matches: any[] = [];
  try {
    matches = JSON.parse(rawJson || "[]");
    if (!Array.isArray(matches)) {
      throw new Error("Matcher response is not an array");
    }
  } catch (err) {
    console.error("Failed to parse matcher JSON:", err);
    throw new Error(`Historical matching failed: invalid JSON response`);
  }

  // 4. Validate and Save to DB
  await db.transaction(async (tx) => {
    await tx.delete(historicalMatches).where(eq(historicalMatches.pursuitId, pursuitId));

    const validDealIds = new Set(dealEvidences.map(d => JSON.parse(d.content).id));
    const validMatches = matches.filter(m => validDealIds.has(m.dealId));

    if (validMatches.length > 0) {
      const toInsert = validMatches.map(m => ({
        pursuitId,
        dealId: m.dealId,
        similarityScore: m.similarityScore,
        lossReason: m.lossReason || null
      }));
      await tx.insert(historicalMatches).values(toInsert);
    }
  });

  const finalValidDealIds = new Set(dealEvidences.map(d => JSON.parse(d.content).id));
  return matches.filter(m => finalValidDealIds.has(m.dealId)).length;
}
