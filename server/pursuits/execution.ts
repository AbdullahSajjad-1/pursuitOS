import { db } from '../db/client';
import { pursuits, councilRuns, opportunityRequirements } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import * as writer from '../graph8/writer';

export async function executePursuitDecision(pursuitId: string, actor: string = 'human') {
  console.log(`[execution] Starting execution write-back for pursuit ${pursuitId}`);

  // 1. Fetch pursuit and latest decision
  const [pursuit] = await db.select().from(pursuits).where(eq(pursuits.id, pursuitId));
  if (!pursuit) throw new Error('Pursuit not found');

  const runs = await db.select().from(councilRuns)
    .where(eq(councilRuns.pursuitId, pursuitId))
    .orderBy(desc(councilRuns.createdAt))
    .limit(1);

  if (runs.length === 0) throw new Error('No council run found for this pursuit');
  const run = runs[0];

  if (run.status !== 'COMPLETED' || !run.decision) {
    throw new Error('Cannot execute: Council decision is not yet complete');
  }

  if (!pursuit.companyId) {
    throw new Error('Cannot execute: Pursuit is not linked to a Graph8 company');
  }

  const ctx = { pursuitId, actor: actor as 'human' | 'system' };

  // 2. Create or Update Deal
  let dealId = pursuit.id; // For MVP, we might assume the pursuit ID corresponds to the deal or we create one
  // In a real app, pursuit might link to an existing deal. Let's create a placeholder deal in Graph8
  // if this is a net-new RFP, or update if it's existing.
  console.log(`[execution] Creating/Updating deal in Graph8...`);
  const deal = await writer.createOrUpdateDeal(ctx, {
    companyId: pursuit.companyId,
    name: pursuit.name,
    stage: run.decision === 'no_bid' ? 'closed_lost' : 'proposal'
  });
  dealId = deal.id;

  // 3. Update Deal Custom Fields
  console.log(`[execution] Updating deal fields...`);
  await writer.setDealFields(ctx, dealId, {
    pursuit_status: run.decision,
    bid_confidence: run.confidence,
    primary_blocker: run.decision === 'no_bid' ? run.synthesisRationale : null,
    last_pursuit_scan_at: new Date().toISOString()
  });

  // 4. Create Note with Council Summary
  console.log(`[execution] Creating decision summary note...`);
  await writer.createNote(ctx, {
    entityType: 'deal',
    entityId: dealId,
    content: `[PursuitOS Council Decision: ${(run.decision || 'UNKNOWN').toUpperCase()}]\nConfidence: ${run.confidence || 'N/A'}\n\nRationale:\n${run.synthesisRationale}`
  });

  // 5. Create Tasks (from recommended actions)
  if (run.recommendedAction) {
    console.log(`[execution] Creating recommended tasks...`);
    // For MVP, we extract the primary recommended action string
    // If it was a JSON string array, we would parse it. Since it's a single string right now, we create 1 task.
    await writer.createTask(ctx, {
      dealId: dealId,
      title: run.recommendedAction.substring(0, 50),
      description: run.recommendedAction,
      dueDate: new Date(Date.now() + 86400000).toISOString() // Due tomorrow
    }, `primary_action_${run.id}`);
  }

  // 6. Optional Planner Actions
  // If we had the `planner.ts` output (an array of actions), we would loop over them here and create tasks for each.

  console.log(`[execution] Write-back complete for pursuit ${pursuitId}`);
  return { success: true, dealId };
}
