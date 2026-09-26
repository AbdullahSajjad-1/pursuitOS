const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

export async function parseDocument(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  } else {
    throw new Error(`Unsupported document type: ${mimeType}`);
  }
}
