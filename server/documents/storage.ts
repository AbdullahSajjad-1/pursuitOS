import crypto from 'crypto';
import { db } from '../db/client';
import { documents } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function storeDocument(pursuitId: string, filename: string, buffer: Buffer, extractedText: string) {
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  
  const [doc] = await db.insert(documents).values({
    pursuitId,
    filename,
    fileHash: hash,
    content: extractedText,
    status: 'COMPLETED'
  }).returning();
  
  return doc;
}

export async function getDocument(documentId: string) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, documentId));
  return doc;
}
