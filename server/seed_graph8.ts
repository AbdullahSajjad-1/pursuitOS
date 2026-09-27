import * as dotenv from 'dotenv';
dotenv.config();
import { g8 } from './graph8/client';

async function seedGraph8() {
  try {
    console.log('Creating Vertex...');
    const vertex = await g8.companies.create({
      name: 'Vertex Cloud Solutions',
      domain: 'vertex.com'
    } as any);
    console.log('Vertex:', vertex);
    
    await g8.companies.contacts(vertex.id, {
      first_name: 'Alice',
      last_name: 'Johnson',
      work_email: 'alice@vertex.com',
      job_title: 'CTO'
    } as any);

    console.log('Creating Meridian...');
    const meridian = await g8.companies.create({
      name: 'Meridian Global',
      domain: 'meridian.net'
    } as any);
    console.log('Meridian:', meridian);

    await g8.companies.contacts(meridian.id, {
      first_name: 'Bob',
      last_name: 'Smith',
      work_email: 'bob@meridian.net',
      job_title: 'CISO'
    } as any);
    
  } catch (e: any) {
    console.error(e.message || e);
  }
}
seedGraph8();
