import { g8 } from './client';
import { Company, Contact, Deal, Activity, Note, Meeting, IntentSignal, RadarSignal, KnowledgeItem } from './types';

// The SDK handles rate limiting/retries automatically
// These wrappers isolate our application from SDK changes

export const getCompanyByDomain = async (domain: string): Promise<Company | null> => {
  const result = await g8.companies.list({ domain, limit: 1 });
  if (result.data.length > 0) {
    const c = result.data[0];
    return { id: c.id.toString(), name: c.name || '', domain: c.domain || '' };
  }
  return null;
};

export const getCompany = async (id: string): Promise<Company | null> => {
  const result = await g8.companies.get(Number(id));
  return { id: result.id.toString(), name: result.name || '', domain: result.domain || '' };
};

export const getCompanyContacts = async (companyId: string): Promise<Contact[]> => {
  const result = await g8.companies.contacts(Number(companyId), 100);
  return result.data.map(c => ({
    id: c.id.toString(),
    companyId,
    firstName: c.first_name || '',
    lastName: c.last_name || '',
    email: c.work_email || '',
    phone: (c as any).direct_phone || (c as any).mobile_phone || (c as any).phone || '',
    title: c.job_title || ''
  }));
};

export const getDeals = async (companyId: string): Promise<Deal[]> => {
  const result = await g8.deals.forCompany(Number(companyId));
  return result.data.map((d: any) => ({
    id: d.deal_id || '',
    companyId,
    name: d.name || '',
    amount: 0,
    stage: d.stage || '',
    isWon: d.stage === 'won',
    isClosed: d.stage === 'won' || d.stage === 'lost',
    createdAt: ''
  }));
};

// Removed getDealContacts since the SDK doesn't natively expose getContacts directly under deals

export const getActivities = async (companyId: string): Promise<Activity[]> => {
  // Mocking activities for now since G8 doesn't expose a root .activities object
  return [];
};

export const getNotes = async (entityType: 'deal' | 'company' | 'contact', entityId: string): Promise<Note[]> => {
  if (entityType === 'company') {
    const result = await g8.notes.listForCompany(Number(entityId));
    return result.data.map(n => ({ id: n.id, entityType, entityId, content: n.content, createdAt: '' }));
  } else if (entityType === 'contact') {
    const result = await g8.notes.list(Number(entityId));
    return result.data.map(n => ({ id: n.id, entityType, entityId, content: n.content, createdAt: '' }));
  } else if (entityType === 'deal') {
    const result = await g8.notes.listForDeal(entityId);
    return result.data.map(n => ({ id: n.id, entityType, entityId, content: n.content, createdAt: '' }));
  }
  return [];
};

export const getMeetings = async (companyId: string): Promise<Meeting[]> => {
  // Meetings API doesn't filter directly by companyId easily in this list without custom search, mock for now
  return [];
};

export const getIntentSignals = async (domain: string): Promise<IntentSignal[]> => {
  const result = await g8.signals.company(domain);
  return []; // Mock return depending on IntentSignals structure
};

export const getRadar = async (companyId: string): Promise<RadarSignal[]> => {
  // G8 SDK doesn't expose radar natively yet
  return [];
};

export const getKnowledge = async (query: string): Promise<KnowledgeItem[]> => {
  const result = await g8.studio.globalContext({ limit: 10, include_content: true });
  return result.data.map(d => ({ id: d.id, title: d.title || '', content: d.content || '', type: 'case_study' }));
};

export const getPipelines = async (): Promise<any[]> => {
  const result = await g8.pipelines.list();
  return result.data;
};

export const getFields = async (entity: 'company' | 'contact'): Promise<any[]> => {
  if (entity === 'company') {
    const result = await g8.fields.listCompanyFields();
    return result.data;
  }
  const result = await g8.fields.listContactFields();
  return result.data;
};

export const enrichCompany = async (domain: string): Promise<any> => {
  try {
    const res = await g8.enrich.company({ domain });
    return res;
  } catch (err: any) {
    console.warn(`[graph8] Company enrichment failed for ${domain}:`, err?.message || err);
    return null;
  }
};

export const enrichPerson = async (params: {
  email?: string;
  linkedin_url?: string;
  first_name?: string;
  last_name?: string;
  company_domain?: string;
}): Promise<any> => {
  try {
    const res = await g8.enrich.person(params);
    return res;
  } catch (err: any) {
    console.warn(`[graph8] Person enrichment failed:`, err?.message || err);
    return null;
  }
};
