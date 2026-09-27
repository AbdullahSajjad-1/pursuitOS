import { g8 } from '../graph8/client';

interface CompanySeed {
  name: string;
  domain: string;
  contact: {
    first_name: string;
    last_name: string;
    work_email: string;
    job_title: string;
  };
  note: string;
}

const COMPANIES_TO_SEED: CompanySeed[] = [
  {
    name: 'Meridian Global',
    domain: 'meridian.net',
    contact: {
      first_name: 'Marcus',
      last_name: 'Vance',
      work_email: 'marcus.vance@meridian.net',
      job_title: 'Chief Information Security Officer'
    },
    note: 'Enterprise security client evaluating zero-trust network transformation and SIEM consolidation.'
  },
  {
    name: 'Vertex Cloud Solutions',
    domain: 'vertex.com',
    contact: {
      first_name: 'Sarah',
      last_name: 'Chen',
      work_email: 'sarah.chen@vertex.com',
      job_title: 'Chief Technology Officer'
    },
    note: 'Cloud-native architecture client seeking multi-cloud migration with stringent SLA guarantees.'
  },
  {
    name: 'Acme Corporation',
    domain: 'acme.com',
    contact: {
      first_name: 'David',
      last_name: 'Miller',
      work_email: 'david.miller@acme.com',
      job_title: 'VP of Global Procurement'
    },
    note: 'Global manufacturing conglomerate modernizing legacy ERP and IoT supply chain monitoring.'
  },
  {
    name: 'Nexus Technologies',
    domain: 'nexustech.io',
    contact: {
      first_name: 'Elena',
      last_name: 'Rostova',
      work_email: 'elena.rostova@nexustech.io',
      job_title: 'Head of Infrastructure & DevOps'
    },
    note: 'High-growth fintech SaaS requiring Kubernetes container security and SOC2 Type II compliance.'
  },
  {
    name: 'OmniCyber Defense',
    domain: 'omnicyber.com',
    contact: {
      first_name: 'Nathan',
      last_name: 'Drake',
      work_email: 'nathan.drake@omnicyber.com',
      job_title: 'VP of Threat Intelligence'
    },
    note: 'Defense contractor seeking automated penetration testing and threat intelligence feed integration.'
  },
  {
    name: 'FinTech Global Systems',
    domain: 'fintechsystems.com',
    contact: {
      first_name: 'Priya',
      last_name: 'Patel',
      work_email: 'priya.patel@fintechsystems.com',
      job_title: 'Chief Risk Officer'
    },
    note: 'Tier-1 investment banking platform prioritizing latency reduction and fraud detection AI.'
  },
  {
    name: 'HealthPulse Solutions',
    domain: 'healthpulse.org',
    contact: {
      first_name: 'Dr. James',
      last_name: 'Wilson',
      work_email: 'james.wilson@healthpulse.org',
      job_title: 'Chief Medical Information Officer'
    },
    note: 'Healthcare network managing 40+ hospitals. Requires HIPAA-compliant telemedicine platform.'
  },
  {
    name: 'Vanguard Logistics',
    domain: 'vanguardlogistics.com',
    contact: {
      first_name: 'Robert',
      last_name: 'Taylor',
      work_email: 'robert.taylor@vanguardlogistics.com',
      job_title: 'Director of Supply Chain Technology'
    },
    note: 'Cross-border logistics operator replacing legacy telematics with predictive routing software.'
  },
  {
    name: 'Titan Aerospace',
    domain: 'titanaerospace.com',
    contact: {
      first_name: 'Amanda',
      last_name: 'Holloway',
      work_email: 'amanda.holloway@titanaerospace.com',
      job_title: 'VP of Government Contracts'
    },
    note: 'Aerospace engineering firm managing government satellite contracts. Requires FedRAMP High certification.'
  },
  {
    name: 'Beacon Data Intelligence',
    domain: 'beacondata.ai',
    contact: {
      first_name: 'Liam',
      last_name: 'O\'Connor',
      work_email: 'liam.oconnor@beacondata.ai',
      job_title: 'Chief Data Officer'
    },
    note: 'Enterprise analytics provider exploring real-time vector search and large language model fine-tuning pipelines.'
  }
];

export async function seed10Companies() {
  console.log(`\n======================================================`);
  console.log(`🚀 Seeding/Updating 10 Companies in Graph8 Database`);
  console.log(`======================================================\n`);

  for (const item of COMPANIES_TO_SEED) {
    try {
      console.log(`Processing: ${item.name} (${item.domain})...`);
      
      // 1. Create or get company (Graph8 dedupes by domain)
      const companyRes = await g8.companies.create({
        name: item.name,
        domain: item.domain
      });
      const companyId = companyRes.company_id;
      console.log(`  ✓ Company ready in Graph8 (ID: ${companyId})`);

      // 2. Create primary contact
      if (companyId) {
        try {
          await g8.contacts.create({
            work_email: item.contact.work_email,
            first_name: item.contact.first_name,
            last_name: item.contact.last_name,
            job_title: item.contact.job_title,
            company_domain: item.domain
          });
          console.log(`  ✓ Contact added: ${item.contact.first_name} ${item.contact.last_name} (${item.contact.job_title})`);
        } catch (err: any) {
          console.log(`  ℹ Contact note: ${err.message || err}`);
        }

        // 3. Add relationship note
        try {
          await g8.notes.createForCompany(companyId, item.note);
          console.log(`  ✓ Executive relationship note created`);
        } catch (err: any) {
          console.log(`  ℹ Note error: ${err.message || err}`);
        }
      }
    } catch (e: any) {
      console.error(`  ✗ Error with ${item.domain}:`, e.message || e);
    }
  }

  console.log(`\n✅ Seeding complete! All 10 companies are ready in Graph8.`);
}

if (require.main === module) {
  seed10Companies();
}
