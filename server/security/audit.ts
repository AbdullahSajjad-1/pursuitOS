import { db } from '../db/client';
import { auditEvents } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

interface AuditEventInput {
  pursuitId?: string;
  actionType: string;
  actor: 'system' | 'human' | 'agent';
  description: string;
  metadata?: Record<string, any>;
}

export const logAudit = async (input: AuditEventInput) => {
  try {
    await db.insert(auditEvents).values({
      id: uuidv4(),
      pursuitId: input.pursuitId,
      actionType: input.actionType,
      actor: input.actor,
      description: input.description,
      metadata: input.metadata || null,
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Do not throw, audit logging should not break the main flow in MVP
  }
};
