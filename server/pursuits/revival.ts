import { db } from '../db/client';
import { pursuits, opportunityRequirements } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logAudit } from '../security/audit';
import { collectEvidence } from '../intelligence/evidence';
import { matchHistoricalDeals } from '../intelligence/matcher';
import { buildWhyNow } from '../intelligence/why_now';
import { runCouncil } from '../council/runner';
import { synthesize } from '../council/synthesizer';

export interface CreateRevivalPursuitParams {
  dealId: string;
  companyId: string;
  companyDomain: string;
  dealName: string;
  amount?: number;
  lossReason?: string;
  accountNotes?: string;
}

export async function createRevivalPursuit(params: CreateRevivalPursuitParams): Promise<{
  pursuitId: string;
  alreadyExists?: boolean;
  decision?: string;
}> {
  console.log(`[revival] Initializing Deal Revival for "${params.dealName}" (${params.companyDomain})...`);

  // 1. Check if pursuit already exists for this deal
  const existing = await db.select().from(pursuits).where(eq(pursuits.sourceDealId, params.dealId));
  if (existing.length > 0) {
    console.log(`[revival] Revival pursuit already exists for deal ${params.dealId} (ID: ${existing[0].id})`);
    return { pursuitId: existing[0].id, alreadyExists: true, decision: existing[0].status };
  }

  // 2. Create pursuit record
  const [pursuit] = await db.insert(pursuits).values({
    name: `Re-Pursuit: ${params.dealName}`,
    companyId: params.companyId,
    companyDomain: params.companyDomain,
    status: 'ANALYZING',
    pursuitType: 'REVIVAL',
    sourceDealId: params.dealId,
    dealId: params.dealId,
  }).returning();

  const pursuitId = pursuit.id;

  // 3. Log audit event
  await logAudit({
    pursuitId,
    actionType: 'revival_created',
    actor: 'human',
    description: `Initiated deal revival analysis for ${params.dealName} (${params.companyDomain})`,
    metadata: {
      sourceDealId: params.dealId,
      amount: params.amount,
      lossReason: params.lossReason
    }
  });

  // 4. Seed opportunity requirements tailored to the revival scope & blocker remediation
  const requirementsToInsert = [
    {
      pursuitId,
      category: 'scope',
      text: `Strategic re-engagement on ${params.dealName} ($${(params.amount || 3000000).toLocaleString()} historical value).`,
      priority: 'critical',
      sourceRef: 'Graph8 Closed-Lost Deal'
    },
    {
      pursuitId,
      category: 'blocker_resolution',
      text: `Overcome historical loss factors and objections: ${params.lossReason || 'Procurement timing / incumbent selection'}.`,
      priority: 'critical',
      sourceRef: 'Graph8 Loss Notes'
    },
    {
      pursuitId,
      category: 'technical',
      text: 'Validate technical capability readiness and architecture fit against current capabilities.',
      priority: 'important',
      sourceRef: 'Company Technical Capability'
    },
    {
      pursuitId,
      category: 'commercial',
      text: 'Structure commercial re-engagement with milestone delivery gates and target ACV.',
      priority: 'important',
      sourceRef: 'Commercial Strategy'
    }
  ];

  await db.insert(opportunityRequirements).values(requirementsToInsert);

  try {
    // 5. Collect evidence for company (also runs quality layer & fetches deal notes)
    console.log(`[revival] Step 1/4: Collecting Graph8 evidence for ${params.companyDomain}...`);
    await collectEvidence(pursuitId, params.companyDomain);

    // 6. Match historical deals
    console.log(`[revival] Step 2/4: Matching historical deals...`);
    await matchHistoricalDeals(pursuitId);

    // 7. Build Why Now analysis
    console.log(`[revival] Step 3/4: Building Why Now strategic assessment...`);
    await buildWhyNow(pursuitId, { lossReason: params.lossReason });

    // 8. Run 5-agent council in parallel with anti-anchoring
    console.log(`[revival] Step 4/4: Launching 5-Agent Council...`);
    const councilRun = await runCouncil(pursuitId);

    // 9. Synthesize decision
    const reqs = await db.select().from(opportunityRequirements).where(eq(opportunityRequirements.pursuitId, pursuitId));
    const synthesis = await synthesize(pursuitId, councilRun.runId, councilRun.reviews, reqs);

    console.log(`[revival] Revival analysis complete! Decision: ${synthesis.decision.toUpperCase()}`);
    return {
      pursuitId,
      alreadyExists: false,
      decision: synthesis.decision
    };
  } catch (err: any) {
    console.error(`[revival] Pipeline execution encountered error for pursuit ${pursuitId}:`, err);
    // Even if error occurs in synthesis, mark as READY_FOR_REVIEW so user can inspect
    await db.update(pursuits)
      .set({ status: 'READY_FOR_REVIEW' })
      .where(eq(pursuits.id, pursuitId));
    return { pursuitId, alreadyExists: false };
  }
}
