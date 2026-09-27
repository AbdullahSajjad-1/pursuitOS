import { db } from '../db/client';
import { pursuits, councilRuns, opportunityRequirements } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import * as writer from '../graph8/writer';
import * as reader from '../graph8/reader';
import { OUR_COMPANY } from '../company/profile';
import { getAI, getModelForRole, withRetry } from '../ai/router';
import { calculateBidPricing } from '../commercial/pricing';

export async function executePursuitDecision(pursuitId: string, actor: string = 'human') {
  try {
    console.log(`[execution] Starting execution write-back for pursuit ${pursuitId}`);

    // 1. Fetch pursuit and latest decision
  const [pursuit] = await db.select().from(pursuits).where(eq(pursuits.id, pursuitId));
  if (!pursuit) throw new Error('Pursuit not found');

  if (pursuit.status === 'EXECUTED' && pursuit.dealId) {
    console.log(`[execution] Pursuit ${pursuitId} is already EXECUTED with deal ${pursuit.dealId}. Returning existing execution.`);
    return { success: true, dealId: pursuit.dealId, alreadyExecuted: true };
  }

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

  // 1.5 Calculate target bid amount based on extracted budget or company complexity
  const reqs = await db.select().from(opportunityRequirements)
    .where(eq(opportunityRequirements.pursuitId, pursuitId));

  const pricing = calculateBidPricing({
    requirements: reqs.map(r => ({ category: r.category, priority: r.priority, text: r.text })),
    decision: run.decision || 'bid'
  });

  console.log(`[execution] Calculated Target Bid: $${pricing.targetBidAmount.toLocaleString()} USD (Client Budget: ${pricing.clientBudget ? '$' + pricing.clientBudget.toLocaleString() : 'Not Specified'})`);

  // 2. Create or Update Deal with calculated amount
  console.log(`[execution] Creating/Updating deal in Graph8...`);
  const deal = await writer.createOrUpdateDeal(ctx, {
    dealId: pursuit.dealId || undefined,
    companyId: pursuit.companyId,
    name: pursuit.name,
    amount: pricing.targetBidAmount,
    stage: run.decision === 'no_bid' ? 'closed_lost' : 'proposal'
  });
  const dealId = deal.id;

  // Persist dealId to the pursuit record
  await db.update(pursuits)
    .set({ dealId })
    .where(eq(pursuits.id, pursuitId));

  // 3. Update Deal Custom Fields
  console.log(`[execution] Updating deal fields...`);
  await writer.setDealFields(ctx, dealId, {
    pursuit_status: run.decision,
    bid_confidence: run.confidence,
    primary_blocker: run.decision === 'no_bid' ? run.synthesisRationale : null,
    target_bid_amount: pricing.targetBidAmount,
    client_budget: pricing.clientBudget,
    last_pursuit_scan_at: new Date().toISOString()
  });

  // 4. Create Note with Council Summary & Milestone Pricing
  console.log(`[execution] Creating decision summary note...`);
  const milestoneLines = pricing.milestones.map(m => `• ${m.name}: $${m.amount.toLocaleString()} USD`).join('\n');
  await writer.createNote(ctx, {
    entityType: 'deal',
    entityId: dealId,
    content: `[PursuitOS Council Decision: ${(run.decision || 'UNKNOWN').toUpperCase()}]\nTarget Bid Amount: $${pricing.targetBidAmount.toLocaleString()} USD\n${pricing.clientBudget ? `Client Budget Ceiling: $${pricing.clientBudget.toLocaleString()} USD\n` : ''}Commercial Structure: ${pricing.pricingRationale}\n\nMilestone Delivery Gates:\n${milestoneLines}\n\nConfidence: ${run.confidence || 'N/A'}\n\nRationale:\n${run.synthesisRationale}`
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

  // 6. Create Communication Strategy Task
  if (run.communicationStrategy) {
    console.log(`[execution] Creating communication strategy task...`);
    const strat = run.communicationStrategy as any;
    await writer.createTask(ctx, {
      dealId: dealId,
      title: `[AI] Comm Strategy: ${strat.action}`,
      description: `Target: ${strat.target_role}\nObjective: ${strat.objective}\n\nKey Questions:\n- ${strat.key_questions?.join('\n- ')}\n\nTone: ${strat.tone_guidance}`,
      dueDate: new Date(Date.now() + 86400000).toISOString()
    }, `comm_strategy_${run.id}`);
  }

    // Mark pursuit as EXECUTED in database
    await db.update(pursuits)
      .set({ status: 'EXECUTED' })
      .where(eq(pursuits.id, pursuitId));

    console.log(`[execution] Write-back complete for pursuit ${pursuitId}`);
    return { success: true, dealId };
  } catch (err: any) {
    console.error(`[execution] Execution error for pursuit ${pursuitId}:`, err);
    throw err;
  }
}

export async function declinePursuit(pursuitId: string, customReason?: string) {
  console.log(`[execution] Declining pursuit ${pursuitId} and generating polite capability pitch...`);

  const [pursuit] = await db.select().from(pursuits).where(eq(pursuits.id, pursuitId));
  if (!pursuit) throw new Error('Pursuit not found');

  // 1. Update pursuit status to DENIED in database
  await db.update(pursuits)
    .set({ status: 'DENIED' })
    .where(eq(pursuits.id, pursuitId));

  // 2. Retrieve contact and company context
  let contactName = 'Procurement Committee';
  let contactRole = 'Procurement Lead';
  let contactEmail = `procurement@${pursuit.companyDomain || 'company.com'}`;
  
  if (pursuit.companyDomain) {
    try {
      const comp = await reader.getCompanyByDomain(pursuit.companyDomain);
      if (comp) {
        const contacts = await reader.getCompanyContacts(comp.id);
        if (contacts.length > 0) {
          contactName = `${contacts[0].firstName} ${contacts[0].lastName}`.trim();
          contactRole = contacts[0].title;
          contactEmail = contacts[0].email;
        }
      }
    } catch (_) {}
  }

  // 3. Generate AI polite decline with capability pitch
  const ai = getAI();
  const model = getModelForRole('synthesis');

  const system = `You are an EXECUTIVE COMMUNICATIONS STRATEGIST for ${OUR_COMPANY.name}.
A prospective enterprise client (${pursuit.companyDomain}) issued an RFP (${pursuit.name}), but our Bid Council decided not to bid or our team is declining this specific cycle.
Never write a blunt, negative rejection. Instead, write a polished, professional "Decline with Capability Pitch & Future Collaboration" letter.

KEY RULES:
1. Express sincere gratitude for the invitation to participate in ${pursuit.name}.
2. Politely decline participation in this specific RFP submission cycle, attributing it professionally to current active project delivery commitments and fixed milestone bandwidth.
3. Highlight our company's core strengths and technical specialties:
   - Enterprise Cloud & Distributed Systems (Kubernetes, AWS/GCP, multi-region architectures)
   - SAP S/4HANA bidirectional connectors and legacy ERP modernization
   - Industrial IoT & Edge telemetry stream processing (MQTT, OPC-UA, 99.995% SLA)
   - Applied predictive AI and algorithmic optimization
4. Propose staying in touch for future initiatives or scheduling an exploratory technology exchange next quarter.
5. Address ${contactName} (${contactRole}) directly.
6. Professional, respectful, high-status executive tone. Never output raw database UUIDs.`;

  const user = `PURSUIT: ${pursuit.name}
PROSPECT: ${pursuit.companyDomain}
PRIMARY CONTACT: ${contactName} (${contactRole})
REASON / CONTEXT: ${customReason || 'Delivery timeline bandwidth and scope alignment'}

Generate the polite decline and capability pitch letter.`;

  let politeLetter = '';
  try {
    const res = await withRetry(
      () => ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: user }] }],
        config: { systemInstruction: system, temperature: 0.4 }
      }),
      'decline-draft'
    );
    politeLetter = res.text || '';
  } catch (err) {
    politeLetter = `Dear ${contactName},\n\nThank you for inviting ${OUR_COMPANY.name} to participate in the ${pursuit.name} RFP. We greatly appreciate the opportunity to review your organization's forward-looking requirements.\n\nAfter a thorough evaluation by our leadership council, we have made the difficult decision to decline formal submission for this specific RFP cycle. Our senior engineering bench is currently committed to active transformation milestones, and we maintain a strict policy of only committing to pursuits where our delivery bandwidth is immediately uncompromised.\n\nWhile we cannot submit for this round, our core engineering organization specializes extensively in enterprise cloud architecture, SAP S/4HANA bidirectional connectors, and industrial IoT edge stream processing. We believe our technical capabilities strongly align with your longer-term modernization roadmap.\n\nWe would welcome the opportunity to connect for an exploratory technical briefing next quarter as your timeline progresses.\n\nSincerely,\nExecutive Bid Council\n${OUR_COMPANY.name}`;
  }

  // 4. Record in Graph8 CRM (Safe Staging Note)
  const ctx = { pursuitId, actor: 'human' as const };
  if (pursuit.companyId && !String(pursuit.companyId).startsWith('mock-')) {
    try {
      await writer.createNote(ctx, {
        entityType: 'company',
        entityId: pursuit.companyId,
        content: `[PursuitOS Status: DECLINED / DENIED]\nPursuit: ${pursuit.name}\n\nPolite Decline & Capability Pitch Staged:\n\n${politeLetter}`
      });
    } catch (_) {}
  }

  return {
    status: 'DENIED',
    contactName,
    contactRole,
    contactEmail,
    politeLetter
  };
}
