import { g8 } from './client';
import * as reader from './reader';
import { isActionAllowed } from '../security/execution-mode';
import { logAudit } from '../security/audit';
import { generateIdempotencyKey } from '../security/validation';

interface WriteContext {
  pursuitId: string;
  actor: 'system' | 'human' | 'agent';
}

const GRAPH8_DEFAULT_PIPELINE_ID = 'cd0a991e-dc35-4a83-bcb2-6e06189a15fa';

const STAGE_NAME_TO_UUID: Record<string, string> = {
  'proposal': '02214fcc-9845-4661-a16d-4d166da8c123', // Proposal Sent
  'proposal_sent': '02214fcc-9845-4661-a16d-4d166da8c123',
  'solution_fit': 'f758e173-6502-48fa-8f8b-654994997860',
  'new_meeting': '55239042-cb88-4930-85b4-148c4fef3d0e',
  'qualification': '55239042-cb88-4930-85b4-148c4fef3d0e',
  'discovery_held': '12b9bf10-1d90-46f6-9d62-4760350c6357',
  'verbal_commit': '55089bb2-6099-420b-8687-b09236662d15',
  'closed_won': 'f321f16e-a20b-4c86-8d5a-dddf6c6de413',
  'closed_lost': '264c3d8f-88ab-404b-aca2-4b83231f9d3c',
  'nurture': '59f8c5c0-0366-49a3-ae2b-bc5cf6b32f78'
};

export const createOrUpdateDeal = async (
  ctx: WriteContext,
  data: { companyId: string; name: string; amount?: number; stage?: string; dealId?: string }
): Promise<any> => {
  const actionType = 'deal_create';
  
  if (!isActionAllowed(actionType)) {
    throw new Error(`Action ${actionType} is not allowed in current execution mode`);
  }

  const idempotencyKey = generateIdempotencyKey(ctx.pursuitId, 'deal');

  try {
    if (String(data.companyId).startsWith('mock-')) {
      console.log('[writer] Bypassing Graph8 deal creation for mock company');
      return { id: 'mock-deal-' + Date.now() };
    }

    // Resolve stage UUID
    const rawStage = (data.stage || 'proposal').toLowerCase();
    const stageId = STAGE_NAME_TO_UUID[rawStage] || STAGE_NAME_TO_UUID['proposal'];

    // If existing dealId is passed, try updating it first
    if (data.dealId && !data.dealId.startsWith('mock-')) {
      try {
        console.log(`[writer] Updating existing deal ${data.dealId}...`);
        const updatePayload: any = {
          name: data.name,
          stage_id: stageId,
        };
        if (stageId === STAGE_NAME_TO_UUID['closed_lost'] || stageId === STAGE_NAME_TO_UUID['closed_won']) {
          updatePayload.close_date = new Date().toISOString();
        }
        const updated = await g8.deals.update(data.dealId, updatePayload);
        await logAudit({
          pursuitId: ctx.pursuitId,
          actionType: 'deal_update',
          actor: ctx.actor,
          description: `Updated existing deal: ${data.name} (${data.dealId})`,
          metadata: { idempotencyKey, resultId: data.dealId }
        });
        return { ...updated, id: data.dealId };
      } catch (updateErr: any) {
        console.warn(`[writer] Could not update deal ${data.dealId}, attempting create with allow_duplicate=true:`, updateErr?.message || updateErr);
      }
    }

    // Resolve contact IDs
    let contactIds: number[] = [];
    try {
      const contacts = await reader.getCompanyContacts(data.companyId);
      contactIds = contacts.map(c => Number(c.id)).filter(id => !isNaN(id) && id > 0);
    } catch (_) {}

    if (contactIds.length === 0) {
      // Fallback to David Miller (id: 5) or first contact in CRM
      contactIds = [5];
    }

    const payload: any = {
      name: data.name,
      owner_id: "abdullah.sajjad665@gmail.com",
      pipeline_id: GRAPH8_DEFAULT_PIPELINE_ID,
      stage_id: stageId,
      contact_ids: contactIds,
      amount: data.amount || 0,
      allow_duplicate: true, // Allow multiple deals for the same company in MVP
    };

    if (data.companyId && !isNaN(Number(data.companyId))) {
      payload.company_id = Number(data.companyId);
    }

    if (stageId === STAGE_NAME_TO_UUID['closed_lost'] || stageId === STAGE_NAME_TO_UUID['closed_won']) {
      payload.close_date = new Date().toISOString();
    }

    let result: any;
    try {
      result = await g8.deals.create(payload);
    } catch (createErr: any) {
      // Fallback if 409 conflict still triggered: find company's existing deal and update it
      if (createErr?.status === 409 || createErr?.code === '409' || createErr?.message?.includes('already exists')) {
        console.log('[writer] 409 conflict handled: fetching existing deals for company...');
        const existingDeals = await g8.deals.list({ company_id: Number(data.companyId) } as any);
        if (existingDeals?.data && existingDeals.data.length > 0) {
          const existing = existingDeals.data[0];
          console.log(`[writer] Linking to existing deal ${existing.id}...`);
          try {
            if (existing.id) {
              await g8.deals.update(String(existing.id), {
                name: data.name,
                stage_id: stageId,
                ...(stageId === STAGE_NAME_TO_UUID['closed_lost'] || stageId === STAGE_NAME_TO_UUID['closed_won'] ? { close_date: new Date().toISOString() } : {})
              });
            }
          } catch (_) {}
          result = existing;
        } else {
          throw createErr;
        }
      } else {
        throw createErr;
      }
    }

    await logAudit({
      pursuitId: ctx.pursuitId,
      actionType,
      actor: ctx.actor,
      description: `Created or updated deal: ${data.name}`,
      metadata: { idempotencyKey, resultId: result.id }
    });

    return result;
  } catch (error: any) {
    console.error('Failed to create/update deal', error);
    throw error;
  }
};

export const setDealFields = async (
  ctx: WriteContext,
  dealId: string,
  fields: Record<string, any>
): Promise<any> => {
  const actionType = 'fields_update';
  
  if (!isActionAllowed(actionType)) {
    throw new Error(`Action ${actionType} is not allowed in current execution mode`);
  }

  const idempotencyKey = generateIdempotencyKey(ctx.pursuitId, 'fields');

  try {
    if (String(dealId).startsWith('mock-')) {
      console.log('[writer] Bypassing Graph8 deal update for mock deal');
      return { id: dealId };
    }

    const summaryDesc = Object.entries(fields)
      .map(([k, v]) => `${k.replace(/_/g, ' ').toUpperCase()}: ${v || 'None'}`)
      .join('\n');

    const result = await g8.deals.update(dealId as any, {
      description: `[PursuitOS Council Decision Metadata]\n${summaryDesc}`,
    } as any);

    await logAudit({
      pursuitId: ctx.pursuitId,
      actionType,
      actor: ctx.actor,
      description: `Updated fields for deal ${dealId}`,
      metadata: { idempotencyKey, fields }
    });

    return result;
  } catch (error: any) {
    console.warn('Non-fatal: Failed to set deal fields, continuing:', error?.message || error);
    return { id: dealId };
  }
};

export const createNote = async (
  ctx: WriteContext,
  data: { entityType: 'deal' | 'company' | 'contact'; entityId: string; content: string }
): Promise<any> => {
  const actionType = 'note_create';
  
  if (!isActionAllowed(actionType)) {
    throw new Error(`Action ${actionType} is not allowed in current execution mode`);
  }

  const idempotencyKey = generateIdempotencyKey(ctx.pursuitId, 'note');

  try {
    let result;
    if (String(data.entityId).startsWith('mock-')) {
      console.log(`[writer] Bypassing Graph8 note creation for mock entity ${data.entityId}`);
      result = { id: 'mock-note-' + Date.now() };
    } else if (data.entityType === 'company') {
      result = await g8.notes.createForCompany(Number(data.entityId), data.content);
    } else if (data.entityType === 'contact') {
      result = await g8.notes.create(Number(data.entityId), data.content);
    } else {
      result = await g8.notes.createForDeal(data.entityId as any, data.content);
    }

    await logAudit({
      pursuitId: ctx.pursuitId,
      actionType,
      actor: ctx.actor,
      description: `Created note on ${data.entityType} ${data.entityId}`,
      metadata: { idempotencyKey, resultId: result.id }
    });

    return result;
  } catch (error: any) {
    console.error('Failed to create note', error);
    throw error;
  }
};

export const createTask = async (
  ctx: WriteContext,
  data: { dealId: string; contactId?: number; ownerId?: string; title: string; description?: string; dueDate?: string },
  taskIdentifier: string
): Promise<any> => {
  const actionType = 'task_create';
  
  if (!isActionAllowed(actionType)) {
    throw new Error(`Action ${actionType} is not allowed in current execution mode`);
  }

  const idempotencyKey = generateIdempotencyKey(ctx.pursuitId, 'task', taskIdentifier);

  try {
    if (String(data.dealId).startsWith('mock-')) {
      console.log(`[writer] Bypassing Graph8 task creation for mock deal ${data.dealId}`);
      return { id: 'mock-task-' + Date.now() };
    }

    const contactId = data.contactId || 5; // Default to contact ID 5 (David Miller)

    const result = await g8.tasks.create(contactId, {
      title: data.title,
      description: data.description || '',
      due_date: data.dueDate,
    } as any);

    await logAudit({
      pursuitId: ctx.pursuitId,
      actionType,
      actor: ctx.actor,
      description: `Created task: ${data.title}`,
      metadata: { idempotencyKey, resultId: result.id }
    });

    return result;
  } catch (error: any) {
    console.warn('Non-fatal: Failed to create task, continuing:', error?.message || error);
    return { id: 'fallback-task-' + Date.now() };
  }
};

// Removed associateContacts since G8 Deals addContacts isn't directly exposed exactly like we thought.
// Usually associations happen during creation or updating custom properties.
