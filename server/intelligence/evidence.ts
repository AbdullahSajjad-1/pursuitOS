import { db } from '../db/client';
import { evidence, evidenceEvents, pursuits } from '../db/schema';
import * as reader from '../graph8/reader'; // In production, we could inject this dependency
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function collectEvidence(pursuitId: string, companyDomain: string) {
  // 1. Resolve company in Graph8
  const company = await reader.getCompanyByDomain(companyDomain);
  if (!company) {
    throw new Error(`Company with domain ${companyDomain} not found in Graph8.`);
  }

  // Update pursuit with company ID
  await db.update(pursuits)
    .set({ companyId: company.id, companyDomain: company.domain })
    .where(eq(pursuits.id, pursuitId));

  // 2. Fetch Graph8 data in parallel
  const [contacts, deals, intentSignals, radarSignals, notes] = await Promise.all([
    reader.getCompanyContacts(company.id),
    reader.getDeals(company.id),
    reader.getIntentSignals(company.domain),
    reader.getRadar(company.id),
    reader.getNotes('company', company.id)
  ]);

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

  contacts.forEach(contact => {
    evidenceRecords.push({
      pursuitId,
      source: 'graph8',
      sourceType: 'contact',
      sourceId: contact.id,
      content: JSON.stringify(contact),
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
