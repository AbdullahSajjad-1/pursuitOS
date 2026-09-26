import * as dotenv from 'dotenv';
dotenv.config();

import { db } from '../db/client';
import { pursuits } from '../db/schema';

/**
 * Seeds the PursuitOS database with dummy historical data
 * so the initial workbench isn't completely empty during the demo.
 */
async function seedDemo() {
  console.log('🌱 SEEDING PURSUITOS DEMO STATE 🌱');

  try {
    await db.insert(pursuits).values([
      {
        name: 'Vertex / Cloud Migration',
        companyDomain: 'vertex.com',
        status: 'CONDITIONAL_BID',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        name: 'Meridian / Security RFP',
        companyDomain: 'meridian.net',
        status: 'NO_BID',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      }
    ]);

    console.log('✅ Seeded mock historical pursuits. Ready for demo!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed demo:', error);
    process.exit(1);
  }
}

seedDemo();
