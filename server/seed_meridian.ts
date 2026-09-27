import * as dotenv from 'dotenv';
dotenv.config();
import { g8 } from './graph8/client';

async function seedMeridian() {
  try {
    const meridian = await g8.companies.create({
      name: 'Meridian Global',
      domain: 'meridian.net'
    } as any);
    console.log('Created Meridian:', meridian);
  } catch (e) {
    console.error('Error creating Meridian:', e.message);
  }
}
seedMeridian();
