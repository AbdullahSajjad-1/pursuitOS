if (typeof global !== 'undefined') {
  if (!(global as any).DOMMatrix) (global as any).DOMMatrix = class DOMMatrix {};
  if (!(global as any).Path2D) (global as any).Path2D = class Path2D {};
  if (!(global as any).ImageData) (global as any).ImageData = class ImageData {};
}

const pdfParse = require('pdf-parse');

import mammoth from 'mammoth';

export async function parseDocument(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    try {
      const u8 = new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
      const data = await pdfParse(u8);
      if (data && data.text && data.text.trim().length > 0) {
        return data.text;
      }
      throw new Error('PDF contained no extractable text');
    } catch (e: any) {
      console.error('[parser] pdf-parse failed:', e.message);
      throw new Error(`Failed to parse PDF document: ${e.message}`);
    }
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
