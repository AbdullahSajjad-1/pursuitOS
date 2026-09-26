import { NextResponse } from 'next/server';
import { runPursuitPipeline } from '../../../../../../../../server/pursuits/pipeline';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // In a production app, we would dispatch this to a background worker queue
    // For this MVP/hackathon, we await it synchronously
    const result = await runPursuitPipeline(id);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error running pursuit pipeline:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
