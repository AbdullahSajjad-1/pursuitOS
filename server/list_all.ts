import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { g8 } from './graph8/client';

async function listAll() {
  try {
    const res = await g8.companies.list({ limit: 50 });
    console.log(`\n======================================================`);
    console.log(`📊 Graph8 CRM Companies (${res.data.length} found)`);
    console.log(`======================================================\n`);

    if (res.data.length === 0) {
      console.log('No companies found in Graph8 CRM.');
      return;
    }

    for (const c of res.data) {
      let contactsCount = 0;
      let dealsCount = 0;
      try {
        const contacts = await g8.companies.contacts(c.id, 10);
        contactsCount = contacts.data.length;
      } catch (_) {}

      try {
        const deals = await g8.deals.forCompany(c.id);
        dealsCount = deals.data.length;
      } catch (_) {}

      console.log(`• [ID: ${c.id}] ${c.name || 'Unnamed'}`);
      console.log(`  Domain:   ${c.domain || 'N/A'}`);
      console.log(`  Contacts: ${contactsCount}`);
      console.log(`  Deals:    ${dealsCount}\n`);
    }
  } catch (e: any) {
    console.error('Error fetching Graph8 companies:', e.message || e);
  }
}

listAll();
