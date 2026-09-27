export interface Company {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: string;
}

export interface Contact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  phone?: string;
}

export interface Deal {
  id: string;
  companyId: string;
  name: string;
  amount: number;
  stage: string;
  isWon: boolean;
  isClosed: boolean;
  createdAt: string;
  closeDate?: string;
  stageId?: string;
  stageName?: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface Note {
  id: string;
  entityType: 'deal' | 'company' | 'contact';
  entityId: string;
  content: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  attendees: string[];
}

export interface IntentSignal {
  id: string;
  companyId: string;
  topic: string;
  score: number; // 0-100
  observedAt: string;
}

export interface RadarSignal {
  id: string;
  companyId: string;
  competitorName: string;
  type: 'visit' | 'search' | 'mention';
  observedAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'case_study' | 'product_spec' | 'security_doc';
}
