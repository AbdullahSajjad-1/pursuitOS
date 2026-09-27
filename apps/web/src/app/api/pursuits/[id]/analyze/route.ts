import { NextResponse } from 'next/server';
import { runPursuitPipeline } from '@pursuitos/server/pursuits/pipeline';
import { db } from '@pursuitos/server/db/client';
import { pursuits } from '@pursuitos/server/db/schema';
import { eq } from 'drizzle-orm';

// No hard maxDuration — we return immediately and run in background
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify pursuit exists before firing
    const [pursuit] = await db.select({ id: pursuits.id, status: pursuits.status })
      .from(pursuits)
      .where(eq(pursuits.id, id));

    if (!pursuit) {
      return NextResponse.json({ error: 'Pursuit not found' }, { status: 404 });
    }

    if (pursuit.status === 'ANALYZING') {
      return NextResponse.json({ success: true, status: 'ANALYZING', message: 'Analysis already in progress' });
    }

    if (pursuit.status === 'READY_FOR_REVIEW' || pursuit.status === 'EXECUTED') {
      return NextResponse.json({ success: true, status: pursuit.status, message: 'Analysis already complete' });
    }

    // Fire the pipeline in the background — do NOT await.
    // The client polls GET /api/pursuits/[id] for status changes.
    runPursuitPipeline(id).catch((err) => {
      console.error(`[analyze] Background pipeline failed for ${id}:`, err);
    });

    // Return 202 Accepted immediately
    return NextResponse.json(
      { success: true, status: 'ANALYZING', message: 'Analysis started — poll /api/pursuits/:id for status' },
      { status: 202 }
    );
  } catch (error: any) {
    console.error('Error starting pursuit analysis:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
