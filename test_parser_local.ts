import * as fs from 'fs';
import { parseDocument } from './server/documents/parser';

async function run() {
  try {
    const buffer = fs.readFileSync('vertex_cloud_rfp.pdf');
    const text = await parseDocument(buffer, 'application/pdf');
    console.log(text.substring(0, 150));
  } catch (e) {
    console.error(e);
  }
}
run();
