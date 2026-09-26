import { db } from '@pursuitos/server/db/client';
import { pursuits, opportunityRequirements, councilRuns, councilReviews, evidenceEvents } from '@pursuitos/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import PursuitScreenClient from '../../../components/PursuitScreen';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PursuitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch data directly from Drizzle
  const [pursuit] = await db.select().from(pursuits).where(eq(pursuits.id, id));
  if (!pursuit) {
    notFound();
  }

  const requirements = await db.select().from(opportunityRequirements).where(eq(opportunityRequirements.pursuitId, id));
  
  const runs = await db.select().from(councilRuns)
    .where(eq(councilRuns.pursuitId, id))
    .orderBy(desc(councilRuns.createdAt))
    .limit(1);
  
  let synthesis = null;
  let reviews: any[] = [];

  if (runs.length > 0) {
    const latestRun = runs[0];
    synthesis = {
      decision: latestRun.decision,
      confidence: latestRun.confidence,
      rationale: latestRun.synthesisRationale,
      recommendedAction: latestRun.recommendedAction,
      conditions: [] // We'd ideally parse conditions from a structured JSON if stored
    };

    reviews = await db.select().from(councilReviews).where(eq(councilReviews.runId, latestRun.id));
  }

  const events = await db.select().from(evidenceEvents)
    .where(eq(evidenceEvents.pursuitId, id))
    .orderBy(desc(evidenceEvents.createdAt));

  return (
    <div className="h-full">
      <PursuitScreenClient 
        pursuit={pursuit}
        requirements={requirements}
        synthesis={synthesis}
        reviews={reviews}
        events={events}
      />
    </div>
  );
}
