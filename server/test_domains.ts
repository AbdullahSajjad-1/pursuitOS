import * as dotenv from 'dotenv';
dotenv.config();
import { g8 } from './graph8/client';

async function test() {
  try {
    const res = await g8.companies.list({ limit: 10 });
    console.log(res.data.map((c: any) => c.domain));
  } catch (e) {
    console.error(e);
  }
}
test();
