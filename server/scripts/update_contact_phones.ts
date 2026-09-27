import { g8 } from '../graph8/client';

const CONTACT_PHONES: Record<number, { phone: string; email: string }> = {
  1: { phone: '+1-415-555-0112', email: 'alice@vertex.com' },
  2: { phone: '+1-212-555-0198', email: 'bob@meridian.net' },
  3: { phone: '+1-415-555-0184', email: 'sarah.chen@vertex.com' },
  4: { phone: '+1-212-555-0133', email: 'marcus.vance@meridian.net' },
  5: { phone: '+1-312-555-0142', email: 'david.miller@acme.com' },
  6: { phone: '+1-650-555-0177', email: 'elena.rostova@nexustech.io' },
  7: { phone: '+1-703-555-0165', email: 'nathan.drake@omnicyber.com' },
  8: { phone: '+1-212-555-0151', email: 'priya.patel@fintechsystems.com' },
  9: { phone: '+1-617-555-0199', email: 'james.wilson@healthpulse.org' },
  10: { phone: '+1-214-555-0123', email: 'robert.taylor@vanguardlogistics.com' },
  11: { phone: '+1-303-555-0180', email: 'amanda.holloway@titanaerospace.com' },
  12: { phone: '+1-206-555-0144', email: 'liam.oconnor@beacondata.ai' },
};

async function updateAll() {
  console.log('Updating direct phone numbers on all Graph8 contacts...');
  for (const [idStr, info] of Object.entries(CONTACT_PHONES)) {
    const id = Number(idStr);
    try {
      await g8.contacts.update(id, {
        direct_phone: info.phone,
        work_email: info.email
      });
      console.log(`[OK] Contact ${id} updated with ${info.phone} (${info.email})`);
    } catch (e: any) {
      console.error(`[ERR] Contact ${id}:`, e.message || e);
    }
  }
  console.log('Finished updating contact phones in Graph8.');
}

updateAll();
