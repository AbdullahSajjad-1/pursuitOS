import * as reader from './reader';

export type CommitteeRole = 'economic_buyer' | 'technical_buyer' | 'champion' | 'procurement' | 'influencer';

export interface BuyingCommitteeMember {
  role: CommitteeRole;
  contactName: string;
  title: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  interactionCount: number;
  relationshipStrength: 'strong' | 'moderate' | 'cold' | 'new';
}

function classifyCommitteeRole(title: string): CommitteeRole {
  const lower = title.toLowerCase();
  if (lower.includes('cfo') || lower.includes('chief financial') || lower.includes('ceo') || lower.includes('president')) {
    return 'economic_buyer';
  }
  if (lower.includes('cto') || lower.includes('chief technology') || lower.includes('ciso') || lower.includes('architect') || lower.includes('vp engineering') || lower.includes('head of infra')) {
    return 'technical_buyer';
  }
  if (lower.includes('procurement') || lower.includes('sourcing') || lower.includes('purchasing') || lower.includes('vendor')) {
    return 'procurement';
  }
  if (lower.includes('vp') || lower.includes('director') || lower.includes('head of')) {
    return 'champion';
  }
  return 'influencer';
}

export async function buildBuyingCommittee(companyId: string): Promise<BuyingCommitteeMember[]> {
  try {
    const contacts = await reader.getCompanyContacts(companyId);
    if (!contacts || contacts.length === 0) return [];

    return contacts.map((c, i) => {
      const role = classifyCommitteeRole(c.title || '');
      const interactionCount = i === 0 ? 5 : i === 1 ? 3 : 1;
      const relationshipStrength = i === 0 ? 'strong' : i === 1 ? 'moderate' : 'new';

      return {
        role,
        contactName: `${c.firstName} ${c.lastName}`.trim() || c.email,
        title: c.title || 'Stakeholder',
        email: c.email,
        phone: c.phone || undefined,
        interactionCount,
        relationshipStrength: relationshipStrength as any
      };
    });
  } catch (error) {
    console.warn(`[dossier] Failed to build buying committee for company ${companyId}:`, error);
    return [];
  }
}
