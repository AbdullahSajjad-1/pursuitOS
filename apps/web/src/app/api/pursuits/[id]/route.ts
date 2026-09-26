import { NextResponse } from 'next/server';
import { db } from '../../../../../../../server/db/client';
import { pursuits, opportunityRequirements, councilRuns, councilReviews, evidenceEvents } from '../../../../../../../server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // In Next 15, params is a Promise
) {
  try {
    const { id } = await params;
    
    const [pursuit] = await db.select().from(pursuits).where(eq(pursuits.id, id));
    if (!pursuit) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const requirements = await db.select().from(opportunityRequirements).where(eq(opportunityRequirements.pursuitId, id));
    
    // Get latest council run
    const runs = await db.select().from(councilRuns)
      .where(eq(councilRuns.pursuitId, id))
      .orderBy(desc(councilRuns.createdAt))
      .limit(1);
    
    let synthesis = null;
    let reviews = [];

    if (runs.length > 0) {
      const latestRun = runs[0];
      synthesis = {
        decision: latestRun.decision,
        confidence: latestRun.confidence,
        rationale: latestRun.synthesisRationale,
        recommendedAction: latestRun.recommendedAction
      };

      reviews = await db.select().from(councilReviews).where(eq(councilReviews.runId, latestRun.id));
    }

    // Get events (for Timeline)
    const events = await db.select().from(evidenceEvents)
      .where(eq(evidenceEvents.pursuitId, id))
      .orderBy(desc(evidenceEvents.createdAt));

    return NextResponse.json({
      pursuit,
      requirements,
      synthesis,
      reviews,
      events
    });
  } catch (error) {
    console.error('Error fetching pursuit details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
