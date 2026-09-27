import * as dotenv from 'dotenv';
dotenv.config();
import { g8 } from './graph8/client';

async function seedContacts() {
  try {
    // According to Graph8 docs, creating a contact is typically g8.contacts.create
    // Let's try to find how contacts are added.
    const res = await g8.contacts.create({
      first_name: 'Alice',
      last_name: 'Johnson',
      work_email: 'alice@vertex.com',
      job_title: 'CTO'
    } as any);
    console.log('Alice:', res);
  } catch (e: any) {
    console.error('Failed to create Alice:', e.message || e);
  }

  try {
    const res = await g8.contacts.create({
      first_name: 'Bob',
      last_name: 'Smith',
      work_email: 'bob@meridian.net',
      job_title: 'CISO'
    } as any);
    console.log('Bob:', res);
  } catch (e: any) {
    console.error('Failed to create Bob:', e.message || e);
  }
}
seedContacts();
