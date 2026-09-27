import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { g8 } from '../graph8/client';

const CLOSED_LOST_STAGE_ID = '264c3d8f-88ab-404b-aca2-4b83231f9d3c';
const GRAPH8_DEFAULT_PIPELINE_ID = 'cd0a991e-dc35-4a83-bcb2-6e06189a15fa';
const OWNER_EMAIL = 'abdullah.sajjad665@gmail.com';

export const LOST_DEALS = [
  {
    companyDomain: 'vertex.com',
    dealName: 'Vertex Multi-Cloud Migration Platform',
    amount: 4200000,
    lossReason: 'Lost to incumbent vendor. Client cited our lack of proven Azure AD federation at the time. Budget was frozen mid-cycle due to Q3 earnings miss.',
    closedDate: '2025-11-15T00:00:00.000Z',
    notes: 'Technical evaluation went well. CTO was supportive but CFO pulled budget. New CTO (Sarah Chen) appointed Feb 2026.'
  },
  {
    companyDomain: 'meridian.net',
    dealName: 'Meridian Zero-Trust Network Overhaul',
    amount: 3800000,
    lossReason: 'No executive sponsor after CISO departure. RFP was paused indefinitely. Security requirements exceeded our SOC 2 scope at the time (needed FedRAMP Moderate).',
    closedDate: '2025-08-22T00:00:00.000Z',
    notes: 'Strong relationship with engineering team. New CISO (Marcus Webb) hired Jan 2026. Company announced $12M cybersecurity budget increase in Q1 2026.'
  },
  {
    companyDomain: 'acme.com',
    dealName: 'Acme SAP S/4HANA Supply Chain Integration',
    amount: 6500000,
    lossReason: 'Timeline mismatch — client wanted 4-month delivery, we proposed 7 months. Lost to Deloitte on timeline promise (they later missed it). SAP connector was in beta.',
    closedDate: '2025-06-10T00:00:00.000Z',
    notes: 'Deloitte engagement reportedly over budget and delayed. Our SAP S/4HANA bidirectional connector is now GA. VP Supply Chain (Linda Torres) still in role.'
  },
  {
    companyDomain: 'nexustech.io',
    dealName: 'Nexus Kubernetes Platform Modernization',
    amount: 3100000,
    lossReason: 'Client chose to build in-house. Their internal platform team attempted a custom K8s setup but faced persistent reliability issues. No formal RFP was issued.',
    closedDate: '2026-01-20T00:00:00.000Z',
    notes: 'Engineering lead (Raj Patel) privately indicated the in-house effort is struggling. 3 senior SREs left in Q1 2026. Company posted 8 Kubernetes job listings in last 60 days.'
  },
  {
    companyDomain: 'omnicyber.com',
    dealName: 'OmniCyber Threat Intelligence SIEM Unification',
    amount: 2900000,
    lossReason: 'Budget allocated to incident response after breach. All discretionary security projects frozen. Our proposal scored highest technically but timing was impossible.',
    closedDate: '2025-09-30T00:00:00.000Z',
    notes: 'Post-breach remediation completed Q4 2025. New board mandate for proactive threat intelligence. CTO indicated willingness to revisit in 2026.'
  },
  {
    companyDomain: 'acme.com',
    dealName: 'Acme Global Payroll Cloud Migration',
    amount: 5400000,
    lossReason: 'Incumbent lock-in. Their existing provider offered a 40% discount on renewal to block us. Executive sponsor lacked political capital to force the switch.',
    closedDate: '2025-10-12T00:00:00.000Z',
    notes: 'Incumbent contract expires in 8 months. Their current system suffered a major outage last month affecting EU payroll. Opportunity to re-engage with a phased approach.'
  },
  {
    companyDomain: 'nexustech.io',
    dealName: 'NexusTech Distributed Database Scaling',
    amount: 1850000,
    lossReason: 'Missing SOC 2 Type II certification at the time. Deal was lost entirely in procurement/infosec review despite engineering team selecting us as vendor of choice.',
    closedDate: '2025-04-18T00:00:00.000Z',
    notes: 'We achieved SOC 2 Type II compliance in November 2025. Engineering director (Samir Davis) just reached out on LinkedIn asking for a roadmap update.'
  },
  {
    companyDomain: 'acme.com',
    dealName: 'Acme IoT Edge Analytics Deployment',
    amount: 4100000,
    lossReason: 'Product gap: lack of offline caching for intermittent connectivity. Client requires continuous data processing even when disconnected from central cloud.',
    closedDate: '2025-07-05T00:00:00.000Z',
    notes: 'Offline Edge Caching capability was released in v3.4 (Q1 2026). Competitor solution is reportedly too heavy for their hardware constraints.'
  },
  {
    companyDomain: 'meridian.net',
    dealName: 'Meridian Retail Banking CRM Consolidation',
    amount: 8200000,
    lossReason: 'Merger and Acquisition pause. Client acquired a regional bank mid-cycle and halted all enterprise software evaluations to assess combined IT architecture.',
    closedDate: '2025-12-01T00:00:00.000Z',
    notes: 'M&A integration is complete. They appointed a new Chief Digital Officer tasked with unifying customer data across both banks. Timing is perfect for a re-approach.'
  },
  {
    companyDomain: 'vertex.com',
    dealName: 'Vertex Omnichannel Inventory Sync',
    amount: 2750000,
    lossReason: 'Pricing was perceived as 30% above market average. We refused to discount heavily at the end of the quarter. They went with a cheaper, lower-tier competitor.',
    closedDate: '2025-03-22T00:00:00.000Z',
    notes: 'The cheaper competitor failed to deliver real-time sync during Black Friday. Client is highly frustrated. Our new modular pricing tiers make us competitive now.'
  }
];

async function seedLostDeals() {
  console.log('--- Starting Seed for Closed-Lost Deals in Graph8 ---');
  
  for (const dealDef of LOST_DEALS) {
    try {
      console.log(`\nResolving company for domain: ${dealDef.companyDomain}...`);
      const compRes = await g8.companies.list({ domain: dealDef.companyDomain, limit: 1 });
      if (!compRes.data || compRes.data.length === 0) {
        console.warn(`Company with domain ${dealDef.companyDomain} not found in Graph8! Skipping.`);
        continue;
      }

      const company = compRes.data[0];
      const companyId = Number(company.id);
      console.log(`Found company: ${company.name} (ID: ${companyId})`);

      // Resolve contact
      let contactIds: number[] = [];
      try {
        const contactsRes = await g8.companies.contacts(companyId, 5);
        if (contactsRes.data && contactsRes.data.length > 0) {
          contactIds = contactsRes.data.map(c => Number(c.id)).filter(id => !isNaN(id) && id > 0);
        }
      } catch (err: any) {
        console.warn(`Could not fetch contacts for ${company.name}:`, err?.message || err);
      }

      if (contactIds.length === 0) {
        contactIds = [5]; // fallback David Miller
      }

      // Check if deal with same name already exists in closed_lost
      let existingDealId: string | null = null;
      try {
        const existingDeals = await g8.deals.list({ stage_id: CLOSED_LOST_STAGE_ID, limit: 50 });
        const match = existingDeals.data?.find((d: any) => 
          (d.name === dealDef.dealName || d.name?.includes(dealDef.dealName)) && 
          (Number(d.company_id) === companyId || d.companyId === String(companyId))
        );
        if (match) {
          existingDealId = String(match.id);
          console.log(`Deal already exists: ${match.name} (${existingDealId}). Will ensure notes are attached.`);
        }
      } catch (err: any) {
        console.warn('Could not check existing deals:', err?.message || err);
      }

      let dealId = existingDealId;
      if (!dealId) {
        console.log(`Creating closed-lost deal: "${dealDef.dealName}" ($${dealDef.amount})...`);
        const payload: any = {
          name: dealDef.dealName,
          company_id: companyId,
          pipeline_id: GRAPH8_DEFAULT_PIPELINE_ID,
          stage_id: CLOSED_LOST_STAGE_ID,
          owner_id: OWNER_EMAIL,
          amount: dealDef.amount,
          close_date: dealDef.closedDate,
          contact_ids: contactIds,
          allow_duplicate: true
        };

        const createdDeal = await g8.deals.create(payload);
        dealId = String(createdDeal.id);
        console.log(`Created deal with ID: ${dealId}`);
      }

      // Check existing notes for deal to avoid duplicate notes
      let existingNotes: any[] = [];
      try {
        const notesRes = await g8.notes.listForDeal(dealId);
        existingNotes = notesRes.data || [];
      } catch (_) {}

      const noteContent = `HISTORICAL LOSS REASON:\n${dealDef.lossReason}\n\nACCOUNT NOTES:\n${dealDef.notes}`;
      const noteAlreadyExists = existingNotes.some(n => n.content?.includes('HISTORICAL LOSS REASON:'));

      if (!noteAlreadyExists) {
        console.log(`Attaching loss reason note to deal ${dealId}...`);
        await g8.notes.createForDeal(dealId, noteContent);
        console.log(`Note attached successfully to deal ${dealId}`);
      } else {
        console.log(`Loss reason note already exists on deal ${dealId}`);
      }

    } catch (err: any) {
      console.error(`Error processing deal "${dealDef.dealName}":`, err?.message || err);
    }
  }

  console.log('\n--- Seed Finished Successfully ---');
}

seedLostDeals().then(() => process.exit(0)).catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
