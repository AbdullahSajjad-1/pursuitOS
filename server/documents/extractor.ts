import { GoogleGenAI, Type } from '@google/genai';
import { db } from '../db/client';
import { opportunityRequirements } from '../db/schema';
import { parseDocument } from './parser';
import { storeDocument } from './storage';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const RequirementSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: "One of: scope, technical, integration, security, delivery, commercial, procurement, timeline, stakeholders, evaluation, proof, open_questions",
      },
      text: {
        type: Type.STRING,
        description: "The detailed requirement extracted from the RFP",
      },
      priority: {
        type: Type.STRING,
        description: "One of: critical, important, nice_to_have",
      },
      sourceRef: {
        type: Type.STRING,
        description: "The section or context where this was found",
      }
    },
    required: ["category", "text", "priority"]
  }
};

export async function processRfpDocument(pursuitId: string, filename: string, mimeType: string, buffer: Buffer) {
  // 1. Parse text from document
  const rawText = await parseDocument(buffer, mimeType);

  // 2. Store original document and raw text
  const doc = await storeDocument(pursuitId, filename, buffer, rawText);

  // 3. Extract structured requirements via Gemini
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: [
      {
        role: 'user', parts: [{
          text: `Extract all key requirements from the following RFP text. 
      Format as a list of structured requirements with category and priority.\n\nText:\n${rawText}`
        }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: RequirementSchema,
      temperature: 0.2
    }
  });

  const rawJson = response.text;
  let requirements: Array<any> = [];
  try {
    requirements = JSON.parse(rawJson || "[]");
    if (!Array.isArray(requirements)) {
      throw new Error("Gemini response is not an array");
    }
  } catch (err) {
    console.error("Failed to parse requirements JSON:", err);
    throw new Error(`Extraction failed: invalid JSON response from Gemini`);
  }

  // 4. Ensure budget / contract value is captured as a commercial requirement
  const budgetMatch = rawText.match(/(?:Estimated Contract Value|Contract Value|Estimated Budget|Budget Ceiling|Budget)[\s:]+\$?([0-9,]+(?:\.[0-9]{2})?)\s*(USD)?/i);
  if (budgetMatch) {
    const budgetVal = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    const hasExistingBudget = requirements.some(r => r.category === 'commercial' && r.text.includes(budgetMatch[1]));
    if (!hasExistingBudget && !isNaN(budgetVal) && budgetVal > 0) {
      requirements.unshift({
        category: 'commercial',
        priority: 'critical',
        text: `Estimated Contract Value / Budget ceiling is $${budgetVal.toLocaleString()} USD as specified in the RFP.`,
        sourceRef: 'Cover Page / Contract Value Specification'
      });
    }
  }

  // 5. Insert into database
  if (requirements.length > 0) {
    const toInsert = requirements.map(req => ({
      pursuitId,
      category: req.category || 'scope',
      text: req.text,
      priority: req.priority || 'important',
      sourceRef: req.sourceRef
    }));
    await db.insert(opportunityRequirements).values(toInsert);
  }

  return { documentId: doc.id, requirementCount: requirements.length };
}
