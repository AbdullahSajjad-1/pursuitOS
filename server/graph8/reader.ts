import { g8 } from './client';
import { Company, Contact, Deal, Activity, Note, Meeting, IntentSignal, RadarSignal, KnowledgeItem } from './types';

// The SDK handles rate limiting/retries automatically
// These wrappers isolate our application from SDK changes

export const getCompanyByDomain = async (domain: string): Promise<Company | null> => {
  const result = await g8.companies.search({ domain });
  return result.data[0] || null;
};

export const getCompany = async (id: string): Promise<Company | null> => {
  const result = await g8.companies.get(id);
  return result.data || null;
};

export const getCompanyContacts = async (companyId: string): Promise<Contact[]> => {
  const result = await g8.contacts.list({ companyId, limit: 100 });
  return result.data;
};

export const getDeals = async (companyId: string): Promise<Deal[]> => {
  const result = await g8.deals.list({ companyId, limit: 50 });
  return result.data;
};

export const getDealContacts = async (dealId: string): Promise<Contact[]> => {
  const result = await g8.deals.getContacts(dealId);
  return result.data;
};

export const getActivities = async (companyId: string): Promise<Activity[]> => {
  const result = await g8.activities.list({ companyId, limit: 50 });
  return result.data;
};

export const getNotes = async (entityType: 'deal' | 'company' | 'contact', entityId: string): Promise<Note[]> => {
  const result = await g8.notes.list({ entityType, entityId, limit: 50 });
  return result.data;
};

export const getMeetings = async (companyId: string): Promise<Meeting[]> => {
  const result = await g8.meetings.list({ companyId, limit: 20 });
  return result.data;
};

export const getIntentSignals = async (companyId: string): Promise<IntentSignal[]> => {
  const result = await g8.intent.list({ companyId, limit: 20 });
  return result.data;
};

export const getRadar = async (companyId: string): Promise<RadarSignal[]> => {
  const result = await g8.radar.list({ companyId, limit: 20 });
  return result.data;
};

export const getKnowledge = async (query: string): Promise<KnowledgeItem[]> => {
  const result = await g8.knowledge.search({ query, limit: 10 });
  return result.data;
};

export const getPipelines = async (): Promise<any[]> => {
  const result = await g8.pipelines.list();
  return result.data;
};

export const getFields = async (entity: string): Promise<any[]> => {
  const result = await g8.fields.list({ entity });
  return result.data;
};
