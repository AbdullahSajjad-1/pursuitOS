import * as fs from 'fs';
const pdfModule = require('pdf-parse');
const buffer = fs.readFileSync('vertex_cloud_rfp.pdf');

async function test() {
  try {
    const pdf = new pdfModule.PDFParse();
    const result = await pdf.parse(buffer);
    console.log(result.text.substring(0, 100));
  } catch (e) {
    console.error('Error 1:', e.message);
    try {
      const result = await pdfModule.PDFParse(buffer);
      console.log(result.text.substring(0, 100));
    } catch (e2) {
      console.error('Error 2:', e2.message);
    }
  }
}
test();
