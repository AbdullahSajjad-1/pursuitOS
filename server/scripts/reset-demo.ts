import * as dotenv from 'dotenv';
dotenv.config();

import { db } from '../db/client';
import { 
  pursuits, 
  opportunityRequirements, 
  evidenceEvents, 
  historicalMatches, 
  councilRuns, 
  councilReviews, 
  pursuitActions, 
  auditEvents,
  evidence,
  documents 
} from '../db/schema';

/**
 * CAUTION: This script wipes all application data to prepare for a clean hackathon demo.
 * It does NOT delete data from Graph8 (CRM).
 */
async function resetDemo() {
  console.log('🚨 RESETTING PURSUITOS DEMO STATE 🚨');
  console.log('Ensuring clean database for hackathon demonstration...');

  try {
    // Delete in reverse dependency order
    await db.delete(auditEvents);
    console.log('✓ Cleared Audit Events');
    
    await db.delete(pursuitActions);
    console.log('✓ Cleared Actions');

    await db.delete(councilReviews);
    console.log('✓ Cleared Council Reviews');

    await db.delete(councilRuns);
    console.log('✓ Cleared Council Runs');

    await db.delete(historicalMatches);
    console.log('✓ Cleared Historical Matches');

    await db.delete(evidenceEvents);
    console.log('✓ Cleared Evidence Events');

    await db.delete(evidence);
    console.log('✓ Cleared Evidence Bundle');

    await db.delete(opportunityRequirements);
    console.log('✓ Cleared Extracted Requirements');

    await db.delete(documents);
    console.log('✓ Cleared Documents');

    await db.delete(pursuits);
    console.log('✓ Cleared Pursuits');

    console.log('\n✅ Demo Reset Complete! Ready for 4-minute demo flow.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to reset demo:', error);
    process.exit(1);
  }
}

resetDemo();
