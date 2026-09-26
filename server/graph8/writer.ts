import { g8 } from './client';
import { isActionAllowed } from '../security/execution-mode';
import { logAudit } from '../security/audit';
import { generateIdempotencyKey } from '../security/validation';

interface WriteContext {
  pursuitId: string;
  actor: 'system' | 'human' | 'agent';
}

export const createOrUpdateDeal = async (
  ctx: WriteContext,
  data: { companyId: string; name: string; amount?: number; stage?: string }
): Promise<any> => {
  const actionType = 'deal_create';
  
  if (!isActionAllowed(actionType)) {
    throw new Error(`Action ${actionType} is not allowed in current execution mode`);
  }

  const idempotencyKey = generateIdempotencyKey(ctx.pursuitId, 'deal');

  try {
    const result = await g8.deals.create({
      company_id: Number(data.companyId),
      contact_ids: [1], // Mock contact ID for MVP requirement
      name: data.name,
      owner_id: '1',
      stage_id: data.stage
    } as any);

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
    const result = await g8.deals.update(dealId, {
      custom_fields: fields,
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
    console.error('Failed to set deal fields', error);
    throw error;
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
    if (data.entityType === 'company') {
      result = await g8.notes.createForCompany(Number(data.entityId), data.content);
    } else if (data.entityType === 'contact') {
      result = await g8.notes.create(Number(data.entityId), data.content);
    } else {
      result = await g8.notes.createForDeal(data.entityId, data.content);
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
    const result = await g8.tasks.create(data.contactId || 1, {
      title: data.title,
      description: data.description,
      due_date: data.dueDate,
      assignee_id: data.ownerId
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
    console.error('Failed to create task', error);
    throw error;
  }
};

// Removed associateContacts since G8 Deals addContacts isn't directly exposed exactly like we thought.
// Usually associations happen during creation or updating custom properties.
