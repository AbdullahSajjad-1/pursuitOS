import { db } from './db/client';
import { pursuits, evidence, evidenceEvents, historicalMatches, opportunityRequirements } from './db/schema';
import { collectEvidence } from './intelligence/evidence';
import { matchHistoricalDeals } from './intelligence/matcher';
import { buildDelta } from './intelligence/delta';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

async function testIntelligence() {
  console.log("=== Testing Phase 3: Intelligence Engine ===");
  const pursuitId = "11111111-1111-1111-1111-111111111111"; // Fake pursuit UUID

  try {
    // 0. Ensure pursuit exists
    try {
      await db.insert(pursuits).values({ id: pursuitId, name: "Intelligence Test Pursuit" }).onConflictDoNothing();
    } catch(e) {}

    // Mock some Requirements
    console.log("1. Injecting dummy opportunity requirements...");
    await db.delete(opportunityRequirements).where(eq(opportunityRequirements.pursuitId, pursuitId));
    await db.insert(opportunityRequirements).values([
      { pursuitId, category: 'scope', priority: 'critical', text: 'Needs 10,000 users migrated to cloud.' },
      { pursuitId, category: 'security', priority: 'important', text: 'Must have SOC2 Type 2.' }
    ]);

    // Mock some Evidence (since we don't know what data is in the live Graph8 sandbox)
    console.log("2. Injecting dummy historical deal evidence...");
    await db.delete(evidence).where(eq(evidence.pursuitId, pursuitId));
    await db.insert(evidence).values([
      {
        pursuitId,
        source: 'graph8',
        sourceType: 'deal',
        sourceId: 'deal_123',
        content: JSON.stringify({ id: 'deal_123', name: 'Cloud Migration 2024', stage: 'lost', isClosed: true, isWon: false }),
        confidence: 'high',
        freshnessDays: 300,
        observedAt: new Date()
      },
      {
        pursuitId,
        source: 'graph8',
        sourceType: 'deal',
        sourceId: 'deal_456',
        content: JSON.stringify({ id: 'deal_456', name: 'Security Audit', stage: 'won', isClosed: true, isWon: true }),
        confidence: 'high',
        freshnessDays: 100,
        observedAt: new Date()
      }
    ]);

    // Mock some Evidence Events
    console.log("3. Injecting dummy evidence events...");
    await db.delete(evidenceEvents).where(eq(evidenceEvents.pursuitId, pursuitId));
    await db.insert(evidenceEvents).values([
      { pursuitId, title: "Competitor Radar", description: "Competitor X is currently engaged.", impact: "negative", severity: "material" }
    ]);

    // Run Historical Matcher
    console.log("\n4. Running Historical Matcher (Gemini)...");
    await db.delete(historicalMatches).where(eq(historicalMatches.pursuitId, pursuitId));
    const matchCount = await matchHistoricalDeals(pursuitId);
    console.log(`Successfully matched ${matchCount} historical deals.`);

    const matches = await db.select().from(historicalMatches).where(eq(historicalMatches.pursuitId, pursuitId));
    matches.forEach(m => console.log(`  -> Deal ${m.dealId}: Score ${m.similarityScore}, Reason: ${m.lossReason}`));

    // Run Delta Builder
    console.log("\n5. Running Delta Builder (Gemini)...");
    const delta = await buildDelta(pursuitId);
    console.log(`THEN: ${delta.then}`);
    console.log(`NOW: ${delta.now}`);
    console.log(`DELTA: ${delta.delta}`);

    console.log("\n✅ Phase 3 Testing Complete!");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testIntelligence();
