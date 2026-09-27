import { db } from '../db/client';
import { evidence, evidenceEvents, pursuits } from '../db/schema';
import * as reader from '../graph8/reader'; // In production, we could inject this dependency
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function collectEvidence(pursuitId: string, companyDomain: string) {
  // 1. Resolve company in Graph8
  let company = await reader.getCompanyByDomain(companyDomain);
  if (!company) {
    console.warn(`[evidence] Company with domain ${companyDomain} not found in Graph8. Falling back to mock data for demo.`);
    company = {
      id: 'mock-' + Math.floor(Math.random() * 10000).toString(),
      name: companyDomain.split('.')[0].charAt(0).toUpperCase() + companyDomain.split('.')[0].slice(1) + ' Inc',
      domain: companyDomain
    };
  }

  // Update pursuit with company ID
  await db.update(pursuits)
    .set({ companyId: company.id, companyDomain: company.domain })
    .where(eq(pursuits.id, pursuitId));

  // 2. Fetch Graph8 data and live enrichment in parallel
  const [contacts, deals, intentSignals, radarSignals, notes, companyEnrichment] = await Promise.all([
    reader.getCompanyContacts(company.id).catch(() => []),
    reader.getDeals(company.id).catch(() => []),
    reader.getIntentSignals(company.domain).catch(() => []),
    reader.getRadar(company.id).catch(() => []),
    reader.getNotes('company', company.id).catch(() => []),
    reader.enrichCompany(company.domain).catch(() => null)
  ]);

  // 2b. Live contact enrichment for primary contact
  let primaryEnrichment: any = null;
  if (contacts.length > 0) {
    primaryEnrichment = await reader.enrichPerson({
      email: contacts[0].email,
      first_name: contacts[0].firstName,
      last_name: contacts[0].lastName,
      company_domain: company.domain
    }).catch(() => null);
  }

  // 3. Transform to evidence records
  const evidenceRecords: any[] = [];
  
  // Account evidence
  evidenceRecords.push({
    pursuitId,
    source: 'graph8',
    sourceType: 'company',
    sourceId: company.id,
    content: JSON.stringify(company),
    confidence: 'high',
    freshnessDays: 1,
    observedAt: new Date()
  });

  // Real-time Company LinkedIn & Firmographics from Graph8
  if (companyEnrichment && companyEnrichment.found && companyEnrichment.data) {
    const d = companyEnrichment.data;
    evidenceRecords.push({
      pursuitId,
      source: 'graph8_enrichment',
      sourceType: 'company_linkedin',
      sourceId: company.id,
      content: JSON.stringify({
        companyName: company.name,
        domain: company.domain,
        linkedinUrl: d.linkedin_url || '',
        industry: d.industry || '',
        revenueBracket: d.revenue || '',
        employeeCount: d.employee_count || '',
        description: d.description || '',
        crunchbaseUrl: d.crunchbase_url || '',
      }),
      confidence: 'high',
      freshnessDays: 0,
      observedAt: new Date()
    });
  }

  // Contacts evidence
  contacts.forEach((contact, idx) => {
    const isPrimary = idx === 0;
    const enrichedData = isPrimary && primaryEnrichment?.found ? primaryEnrichment.data : null;
    
    evidenceRecords.push({
      pursuitId,
      source: 'graph8',
      sourceType: 'contact',
      sourceId: contact.id,
      content: JSON.stringify({
        ...contact,
        linkedinUrl: enrichedData?.linkedin_url || '',
        linkedinHeadline: enrichedData?.linkedin_headline || '',
        phone: enrichedData?.mobile_phone || enrichedData?.direct_phone || contact.phone
      }),
      confidence: 'high',
      freshnessDays: 1,
      observedAt: new Date()
    });
  });

  // Historical Deals evidence
  deals.forEach(deal => {
    evidenceRecords.push({
      pursuitId,
      source: 'graph8',
      sourceType: 'deal',
      sourceId: deal.id,
      content: JSON.stringify(deal),
      confidence: 'high',
      freshnessDays: 30, // Mock freshness based on deal close date ideally
      observedAt: new Date() // Ideally deal.createdAt
    });
  });

  // Signals evidence
  intentSignals.forEach(signal => {
    evidenceRecords.push({
      pursuitId,
      source: 'graph8',
      sourceType: 'signal',
      sourceId: signal.id,
      content: JSON.stringify(signal),
      confidence: 'medium',
      freshnessDays: 2,
      observedAt: new Date()
    });
  });

  radarSignals.forEach(radar => {
    evidenceRecords.push({
      pursuitId,
      source: 'graph8',
      sourceType: 'radar',
      sourceId: radar.id,
      content: JSON.stringify(radar),
      confidence: 'medium',
      freshnessDays: 5,
      observedAt: new Date()
    });
  });

  // Relationship Notes evidence
  notes.forEach(note => {
    evidenceRecords.push({
      pursuitId,
      source: 'graph8',
      sourceType: 'note',
      sourceId: note.id.toString(),
      content: JSON.stringify(note),
      confidence: 'high',
      freshnessDays: 10,
      observedAt: new Date()
    });
  });

  // 4. Group into evidence events (Event Grouper)
  const events: any[] = [];
  if (intentSignals.length > 0) {
    events.push({
      pursuitId,
      title: "Active Buying Intent Detected",
      description: `Graph8 detected ${intentSignals.length} intent signals indicating active research.`,
      impact: "positive",
      severity: "material",
      evidenceIds: []
    });
  }

  if (radarSignals.length > 0) {
    events.push({
      pursuitId,
      title: "Competitive Radar Activity",
      description: `Graph8 Radar detected competitors in the account.`,
      impact: "negative",
      severity: "watch",
      evidenceIds: []
    });
  }

  // 5. Wrap everything in a transaction to make it idempotent
  await db.transaction(async (tx) => {
    // Clean up old evidence
    await tx.delete(evidence).where(eq(evidence.pursuitId, pursuitId));
    await tx.delete(evidenceEvents).where(eq(evidenceEvents.pursuitId, pursuitId));

    if (evidenceRecords.length > 0) {
      await tx.insert(evidence).values(evidenceRecords);
    }
    
    if (events.length > 0) {
      await tx.insert(evidenceEvents).values(events);
    }
  });

  return { evidenceCount: evidenceRecords.length, eventCount: events.length };
}
