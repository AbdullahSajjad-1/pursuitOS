/**
 * Generates a deterministic idempotency key for Graph8 write operations
 */
export const generateIdempotencyKey = (
  pursuitId: string,
  entityType: 'deal' | 'fields' | 'note' | 'task' | 'quote',
  identifier?: string,
  version: number = 1
): string => {
  const parts = ['pursuit', pursuitId, entityType];
  if (identifier) {
    parts.push(identifier);
  }
  parts.push(`v${version}`);
  return parts.join(':');
};
