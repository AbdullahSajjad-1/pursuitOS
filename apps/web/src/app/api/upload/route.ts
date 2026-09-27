import { NextResponse } from 'next/server';
import { processRfpDocument } from '@pursuitos/server/documents/extractor';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pursuitId = formData.get('pursuitId') as string;

    if (!file || !pursuitId) {
      return NextResponse.json({ error: 'File and pursuitId are required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const result = await processRfpDocument(
      pursuitId,
      file.name,
      file.type,
      buffer
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
