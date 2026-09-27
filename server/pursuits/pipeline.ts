/**
 * Pursuit Pipeline Orchestrator
 *
 * This is the central brain of PursuitOS. It executes the synchronous pipeline
 * to take a pursuit from creation -> extraction -> evidence -> council -> synthesis -> ready.
 */

import { db } from '../db/client';
import { pursuits, opportunityRequirements, councilRuns } from '../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { collectEvidence } from '../intelligence/evidence';
import { matchHistoricalDeals } from '../intelligence/matcher';
import { runCouncil } from '../council/runner';
import { synthesize } from '../council/synthesizer';
import { runCommunicationStrategist } from '../council/strategist';
import { createTask } from '../graph8/writer';
import * as reader from '../graph8/reader';

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
    
    // Fallback if no requirements exist — ensure the pipeline does not stop and still reviews the opportunity
    if (reqs.length === 0) {
      console.log(`[pipeline] No document requirements found. Creating baseline opportunity scope...`);
      const defaultReq = {
        pursuitId,
        category: 'scope',
        text: `Evaluate prospective opportunity for ${pursuit.name} with ${pursuit.companyDomain || 'the account'}. Review technical feasibility, commercial terms, and historical relationship posture.`,
        priority: 'important'
      };
      await db.insert(opportunityRequirements).values(defaultReq);
      reqs = await db.select().from(opportunityRequirements).where(eq(opportunityRequirements.pursuitId, pursuitId));
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

    // Retrieve primary contact from Graph8
    let targetContact = undefined;
    if (pursuit.companyDomain) {
      try {
        const comp = await reader.getCompanyByDomain(pursuit.companyDomain);
        if (comp) {
          const contacts = await reader.getCompanyContacts(comp.id);
          if (contacts.length > 0) {
            targetContact = {
              name: `${contacts[0].firstName} ${contacts[0].lastName}`.trim(),
              title: contacts[0].title,
              email: contacts[0].email,
              phone: contacts[0].phone
            };
          }
        }
      } catch (_) {}
    }

    console.log(`[pipeline] Running Communication Strategist...`);
    const strategy = await runCommunicationStrategist(pursuit.name, pursuit.companyDomain || 'Unknown', result, targetContact);
    
    if (strategy.action !== 'WAIT') {
      console.log(`[pipeline] Creating Communication Task in Graph8: ${strategy.action}`);
      try {
        await createTask({ pursuitId, actor: 'agent' }, {
          dealId: pursuitId, // We use pursuitId as a proxy or we look up the real dealId if one exists.
          title: `[AI] ${strategy.action} to ${strategy.target_role}`,
          description: `Objective: ${strategy.objective}\n\nDraft/Script:\n${strategy.script_or_draft}\n\nKey Questions:\n- ${strategy.key_questions.join('\n- ')}`,
        }, 'comm_strategy');
      } catch (err) {
        console.error('[pipeline] Failed to create task in Graph8 (check demo safeguards)', err);
      }
    }

    // Save the strategy to the councilRun
    await db.update(councilRuns)
      .set({ communicationStrategy: strategy })
      .where(eq(councilRuns.id, runId));

    console.log(`[pipeline] Finished! Decision: ${result.decision}`);
    return { synthesis: result, strategy };

  } catch (error: any) {
    console.error(`[pipeline] Error running pipeline for ${pursuitId}:`, error);
    
    // Only set to ERROR if this wasn't a concurrency rejection
    if (error.message !== 'Pursuit not found or analysis already in progress') {
      await db.update(pursuits).set({ status: 'ERROR' }).where(eq(pursuits.id, pursuitId));
    }
    
    throw error;
  }
}
