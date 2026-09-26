import { Company, Contact, Deal, Activity, Note, Meeting, IntentSignal, RadarSignal, KnowledgeItem } from './types';
import { v4 as uuidv4 } from 'uuid';

// In-memory test double for Graph8

export const fakeData = {
  companies: new Map<string, Company>(),
  contacts: new Map<string, Contact>(),
  deals: new Map<string, Deal>(),
  activities: new Map<string, Activity[]>(),
  notes: new Map<string, Note[]>(),
  meetings: new Map<string, Meeting[]>(),
  intent: new Map<string, IntentSignal[]>(),
  radar: new Map<string, RadarSignal[]>(),
  knowledge: new Map<string, KnowledgeItem[]>(),
  pipelines: [] as any[],
  fields: [] as any[],
};

export const resetFakeData = () => {
  fakeData.companies.clear();
  fakeData.contacts.clear();
  fakeData.deals.clear();
  fakeData.activities.clear();
  fakeData.notes.clear();
  fakeData.meetings.clear();
  fakeData.intent.clear();
  fakeData.radar.clear();
  fakeData.knowledge.clear();
  fakeData.pipelines = [];
  fakeData.fields = [];
};

// Seed sample data for testing
export const seedFakeData = () => {
  resetFakeData();
  
  const companyId = 'comp_123';
  fakeData.companies.set(companyId, {
    id: companyId,
    name: 'Acme Corp',
    domain: 'acme.com',
    industry: 'Manufacturing',
    employeeCount: 500,
    annualRevenue: '100M',
  });

  const dealId = 'deal_456';
  fakeData.deals.set(dealId, {
    id: dealId,
    companyId,
    name: 'Acme ERP Transformation',
    amount: 850000,
    stage: 'Discovery',
    isWon: false,
    isClosed: false,
    createdAt: new Date().toISOString(),
  });
};

export const getCompanyByDomain = async (domain: string): Promise<Company | null> => {
  for (const company of fakeData.companies.values()) {
    if (company.domain === domain) return company;
  }
  return null;
};

export const getCompany = async (id: string): Promise<Company | null> => {
  return fakeData.companies.get(id) || null;
};

export const getCompanyContacts = async (companyId: string): Promise<Contact[]> => {
  return Array.from(fakeData.contacts.values()).filter(c => c.companyId === companyId);
};

export const getDeals = async (companyId: string): Promise<Deal[]> => {
  return Array.from(fakeData.deals.values()).filter(d => d.companyId === companyId);
};

export const getDealContacts = async (dealId: string): Promise<Contact[]> => {
  // Simplification for testing
  const deal = fakeData.deals.get(dealId);
  if (!deal) return [];
  return Array.from(fakeData.contacts.values()).filter(c => c.companyId === deal.companyId);
};

export const getActivities = async (companyId: string): Promise<Activity[]> => {
  return fakeData.activities.get(companyId) || [];
};

export const getNotes = async (entityType: string, entityId: string): Promise<Note[]> => {
  return fakeData.notes.get(entityId) || [];
};

export const getMeetings = async (companyId: string): Promise<Meeting[]> => {
  return fakeData.meetings.get(companyId) || [];
};

export const getIntentSignals = async (companyId: string): Promise<IntentSignal[]> => {
  return fakeData.intent.get(companyId) || [];
};

export const getRadar = async (companyId: string): Promise<RadarSignal[]> => {
  return fakeData.radar.get(companyId) || [];
};

export const getKnowledge = async (query: string): Promise<KnowledgeItem[]> => {
  return Array.from(fakeData.knowledge.values()).flat().filter(k => k.title.includes(query) || k.content.includes(query));
};

export const createOrUpdateDeal = async (ctx: any, data: any): Promise<any> => {
  const id = uuidv4();
  const newDeal = { id, ...data, isWon: false, isClosed: false, createdAt: new Date().toISOString() };
  fakeData.deals.set(id, newDeal);
  return newDeal;
};

export const setDealFields = async (ctx: any, dealId: string, fields: Record<string, any>): Promise<any> => {
  const deal = fakeData.deals.get(dealId);
  if (deal) {
    Object.assign(deal, fields);
  }
  return deal;
};

export const createNote = async (ctx: any, data: any): Promise<any> => {
  const id = uuidv4();
  const note = { id, ...data, createdAt: new Date().toISOString() };
  const list = fakeData.notes.get(data.entityId) || [];
  list.push(note);
  fakeData.notes.set(data.entityId, list);
  return note;
};

export const createTask = async (ctx: any, data: any, identifier: string): Promise<any> => {
  return { id: uuidv4(), ...data };
};

// Removed associateContacts
