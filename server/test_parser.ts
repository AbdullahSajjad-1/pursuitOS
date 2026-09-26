import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import fs from 'fs';
import path from 'path';

import { processRfpDocument } from './documents/extractor';
import { db } from './db/client';
import { documents, opportunityRequirements, pursuits } from './db/schema';
import { eq } from 'drizzle-orm';

async function test() {
  console.log("=== Testing Document Extraction ===");
  const pursuitId = "00000000-0000-0000-0000-000000000000"; // Fake pursuit UUID

  // Create a dummy RFP text
  const dummyRfpText = `
  ACME Corp Enterprise Resource Planning (ERP) Upgrade - Request for Proposal
  
  Timeline:
  - Proposals due by October 15, 2026.
  - Implementation must begin by January 1, 2027.
  
  Scope of Work:
  - The vendor must migrate 10,000 existing records to the new system.
  - The system must integrate with our existing Active Directory for SSO.
  
  Security Requirements:
  - Data must be encrypted at rest using AES-256.
  - Vendor must have SOC2 Type 2 certification.
  
  Commercials:
  - Budget is fixed at $850,000 for the first year.
  - We require 24/7 technical support included in the licensing cost.
  `;

  const buffer = Buffer.from(dummyRfpText, 'utf-8');

  try {
    // 0. Ensure pursuit exists to avoid foreign key violations
    try {
      await db.insert(pursuits).values({ id: pursuitId, name: "Test Pursuit" }).onConflictDoNothing();
    } catch(e) {}

    console.log("Running processRfpDocument...");
    const result = await processRfpDocument(pursuitId, "dummy_rfp.txt", "text/plain", buffer);
    
    console.log("Success! Returned:", result);

    // Fetch from database to verify
    const [doc] = await db.select().from(documents).where(eq(documents.id, result.documentId));
    console.log("Document saved to DB:", doc?.filename);

    const reqs = await db.select().from(opportunityRequirements).where(eq(opportunityRequirements.pursuitId, pursuitId));
    console.log(`\nExtracted ${reqs.length} requirements:`);
    reqs.forEach((r, i) => {
      console.log(`  ${i+1}. [${r.category}] (${r.priority}): ${r.text}`);
    });
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    process.exit(0);
  }
}

test();
