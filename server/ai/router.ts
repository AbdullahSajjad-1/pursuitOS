/**
 * Model Router — maps logical roles to concrete Gemini model identifiers.
 *
 * Design: a single abstraction point so we can swap models per-role without
 * touching business logic. Includes retry with exponential backoff on 429/503
 * AND network errors (ECONNRESET, fetch failed, etc.).
 */

import { GoogleGenAI } from '@google/genai';

// ---------------------------------------------------------------------------
// Role → model mapping
// ---------------------------------------------------------------------------

export type ModelRole = 'extraction' | 'council' | 'synthesis' | 'classification' | 'why_now';

const MODEL_MAP: Record<ModelRole, string> = {
  extraction:     'gemini-3.5-flash-lite',   // fast, cheap — good for parsing
  council:        'gemini-3.5-flash-lite',   // reasoning — ideally a stronger model
  synthesis:      'gemini-3.5-flash-lite',   // strongest available for final decision
  classification: 'gemini-3.5-flash-lite',   // lightweight classification tasks
  why_now:        'gemini-3.5-flash-lite',   // strategic timing catalyst engine
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
// Retry wrapper with exponential backoff
// Handles: HTTP 429/503 AND network errors (ECONNRESET, fetch failed, etc.)
// ---------------------------------------------------------------------------

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 3_000;

function isRetryableError(err: any): boolean {
  // HTTP status-based retryable errors
  const status = err?.status ?? err?.code;
  if (status === 429 || status === 503) return true;

  // Network-level errors (Gemini drops TCP when rate-limited on free tier)
  const message = String(err?.message || '').toLowerCase();
  const causeMessage = String(err?.cause?.message || err?.cause?.code || '').toLowerCase();

  if (
    message.includes('fetch failed') ||
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('etimedout') ||
    message.includes('socket hang up') ||
    message.includes('network') ||
    message.includes('overloaded') ||
    causeMessage.includes('econnreset') ||
    causeMessage.includes('etimedout') ||
    causeMessage.includes('econnrefused') ||
    err instanceof TypeError // fetch() throws TypeError on network failure
  ) {
    return true;
  }

  return false;
}

export async function withRetry<T>(fn: () => Promise<T>, label = 'API call'): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (!isRetryableError(err) || attempt === MAX_RETRIES) {
        throw err;
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      const reason = err?.status || err?.cause?.code || err?.message?.slice(0, 60) || 'unknown';
      console.warn(`[router] ${label} failed (${reason}), retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  // Unreachable, but satisfies TypeScript
  throw new Error(`${label} failed after ${MAX_RETRIES} retries`);
}

// ---------------------------------------------------------------------------
// Utility: staggered delay to avoid blasting rate limits
// ---------------------------------------------------------------------------

export function staggerDelay(indexInBatch: number, baseMs = 1500): Promise<void> {
  const delay = indexInBatch * baseMs;
  if (delay === 0) return Promise.resolve();
  return new Promise(r => setTimeout(r, delay));
}

