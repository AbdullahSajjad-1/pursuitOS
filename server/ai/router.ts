/**
 * Model Router — maps logical roles to concrete Gemini model identifiers.
 *
 * Design: a single abstraction point so we can swap models per-role without
 * touching business logic. Includes retry with exponential backoff on 429/503.
 */

import { GoogleGenAI } from '@google/genai';

// ---------------------------------------------------------------------------
// Role → model mapping
// ---------------------------------------------------------------------------

export type ModelRole = 'extraction' | 'council' | 'synthesis' | 'classification';

const MODEL_MAP: Record<ModelRole, string> = {
  extraction:     'gemini-3.5-flash-lite',   // fast, cheap — good for parsing
  council:        'gemini-3.5-flash-lite',   // reasoning — ideally a stronger model
  synthesis:      'gemini-3.5-flash-lite',   // strongest available for final decision
  classification: 'gemini-3.5-flash-lite',   // lightweight classification tasks
};

export function getModelForRole(role: ModelRole): string {
  return MODEL_MAP[role];
}

// ---------------------------------------------------------------------------
// Shared Gemini client
// ---------------------------------------------------------------------------

let _ai: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
  if (!_ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
}

// ---------------------------------------------------------------------------
// Retry wrapper with exponential backoff (429 / 503)
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2_000;

export async function withRetry<T>(fn: () => Promise<T>, label = 'API call'): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.status ?? err?.code;
      const retryable = status === 429 || status === 503;

      if (!retryable || attempt === MAX_RETRIES) {
        throw err;
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(`[router] ${label} got ${status}, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  // Unreachable, but satisfies TypeScript
  throw new Error(`${label} failed after ${MAX_RETRIES} retries`);
}
