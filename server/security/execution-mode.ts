export type ExecutionMode = 'demo' | 'sandbox' | 'live';

export const getExecutionMode = (): ExecutionMode => {
  const mode = process.env.PURSUIT_EXECUTION_MODE || 'demo';
  if (!['demo', 'sandbox', 'live'].includes(mode)) {
    return 'demo';
  }
  return mode as ExecutionMode;
};

export const isActionAllowed = (actionType: string): boolean => {
  const mode = getExecutionMode();
  
  if (mode === 'live' || mode === 'sandbox') {
    return true; // Sandbox hits Graph8 test env, Live hits prod
  }

  // Demo mode restrictions
  const blockedInDemo = [
    'email_send',
    'campaign_launch',
    'sequence_enrollment',
    'quote_send',
    'meeting_book',
  ];

  if (blockedInDemo.includes(actionType)) {
    return false;
  }

  return true; // Allowed in demo: deal CRUD, fields, tasks, notes
};
