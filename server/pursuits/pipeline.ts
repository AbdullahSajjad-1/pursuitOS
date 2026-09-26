/**
 * Pursuit Pipeline Orchestrator
 *
 * This is the central brain of PursuitOS. It executes the synchronous pipeline
 * to take a pursuit from creation -> extraction -> evidence -> council -> synthesis -> ready.
 */

import { db } from '../db/client';
import { pursuits, opportunityRequirements } from '../db/schema';
import { eq, and, ne } from 'drizzle-orm';
// We might need an actual planner for Phase 6, but for now we generate actions during synthesis
import { collectEvidence } from '../intelligence/evidence';
import { matchHistoricalDeals } from '../intelligence/matcher';
import { runCouncil } from '../council/runner';
import { synthesize } from '../council/synthesizer';

export async function runPursuitPipeline(pursuitId: string) {
  try {
    // 1. Mark as analyzing atomically to prevent concurrent executions
    const updateResult = await db.update(pursuits)
      .set({ status: 'ANALYZING' })
      .where(and(eq(pursuits.id, pursuitId), ne(pursuits.status, 'ANALYZING')))
      .returning();
      
    if (updateResult.length === 0) {
      throw new Error('Pursuit not found or analysis already in progress');
    }
    const pursuit = updateResult[0];
    console.log(`[pipeline] Starting analysis for pursuit ${pursuitId}`);

    // 2. We assume the document has been parsed and is available as text in the DB.
    // In a real flow, if there's an uploaded document, we'd extract requirements here.
    // If the requirements are already populated (e.g. via test seed), we skip extraction.
    let reqs = await db.select().from(opportunityRequirements).where(eq(opportunityRequirements.pursuitId, pursuitId));
    
    // Fallback if no requirements exist
    if (reqs.length === 0) {
      console.log(`[pipeline] WARNING: No requirements found.`);
      // For this hackathon demo, we expect requirements to be seeded or processed beforehand.
      // If none, we continue with an empty list, but it will likely fail synthesis.
    }

    // 3. Collect Evidence (Account, Signals, Radar, Contacts, Deals)
    if (pursuit.companyDomain) {
      console.log(`[pipeline] Collecting evidence for domain ${pursuit.companyDomain}...`);
      await collectEvidence(pursuitId, pursuit.companyDomain);
    }

    // 4. Historical Matcher
    console.log(`[pipeline] Running historical matcher...`);
    await matchHistoricalDeals(pursuitId);

    // 5 & 6. Run Council & Synthesize
    // (THEN/NOW/DELTA is built implicitly inside runCouncil -> buildEvidenceBundle)
    console.log(`[pipeline] Launching 5-Agent Council...`);
    const { runId, reviews } = await runCouncil(pursuitId);

    console.log(`[pipeline] Synthesizing final decision...`);
    const formattedReqs = reqs.map(r => ({ category: r.category, priority: r.priority, text: r.text }));
    const result = await synthesize(pursuitId, runId, reviews, formattedReqs);

    console.log(`[pipeline] Finished! Decision: ${result.decision}`);
    return result;

  } catch (error: any) {
    console.error(`[pipeline] Error running pipeline for ${pursuitId}:`, error);
    
    // Only set to ERROR if this wasn't a concurrency rejection
    if (error.message !== 'Pursuit not found or analysis already in progress') {
      await db.update(pursuits).set({ status: 'ERROR' }).where(eq(pursuits.id, pursuitId));
    }
    
    throw error;
  }
}
