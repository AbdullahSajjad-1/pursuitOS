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
    const result = await g8.assert({
      type: 'deal',
      data,
      idempotencyKey,
    });

    await logAudit({
      pursuitId: ctx.pursuitId,
      actionType,
      actor: ctx.actor,
      description: `Created or updated deal: ${data.name}`,
      metadata: { idempotencyKey, resultId: result.data.id }
    });

    return result.data;
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
      customFields: fields,
    }, {
      headers: { 'Idempotency-Key': idempotencyKey }
    });

    await logAudit({
      pursuitId: ctx.pursuitId,
      actionType,
      actor: ctx.actor,
      description: `Updated fields for deal ${dealId}`,
      metadata: { idempotencyKey, fields }
    });

    return result.data;
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
    const result = await g8.notes.create(data, {
      headers: { 'Idempotency-Key': idempotencyKey }
    });

    await logAudit({
      pursuitId: ctx.pursuitId,
      actionType,
      actor: ctx.actor,
      description: `Created note on ${data.entityType} ${data.entityId}`,
      metadata: { idempotencyKey, resultId: result.data.id }
    });

    return result.data;
  } catch (error: any) {
    console.error('Failed to create note', error);
    throw error;
  }
};

export const createTask = async (
  ctx: WriteContext,
  data: { dealId: string; ownerId?: string; title: string; description?: string; dueDate?: string },
  taskIdentifier: string
): Promise<any> => {
  const actionType = 'task_create';
  
  if (!isActionAllowed(actionType)) {
    throw new Error(`Action ${actionType} is not allowed in current execution mode`);
  }

  const idempotencyKey = generateIdempotencyKey(ctx.pursuitId, 'task', taskIdentifier);

  try {
    const result = await g8.tasks.create(data, {
      headers: { 'Idempotency-Key': idempotencyKey }
    });

    await logAudit({
      pursuitId: ctx.pursuitId,
      actionType,
      actor: ctx.actor,
      description: `Created task: ${data.title}`,
      metadata: { idempotencyKey, resultId: result.data.id }
    });

    return result.data;
  } catch (error: any) {
    console.error('Failed to create task', error);
    throw error;
  }
};

export const associateContacts = async (
  ctx: WriteContext,
  dealId: string,
  contactIds: string[]
): Promise<any> => {
  const actionType = 'deal_associate_contacts';
  
  if (!isActionAllowed(actionType)) {
    throw new Error(`Action ${actionType} is not allowed in current execution mode`);
  }

  const idempotencyKey = generateIdempotencyKey(ctx.pursuitId, 'deal', 'contacts');

  try {
    // Some APIs allow patching arrays, or specific association endpoints
    const result = await g8.deals.addContacts(dealId, { contactIds }, {
      headers: { 'Idempotency-Key': idempotencyKey }
    });

    await logAudit({
      pursuitId: ctx.pursuitId,
      actionType,
      actor: ctx.actor,
      description: `Associated ${contactIds.length} contacts with deal ${dealId}`,
      metadata: { idempotencyKey }
    });

    return result.data;
  } catch (error: any) {
    console.error('Failed to associate contacts', error);
    throw error;
  }
};
