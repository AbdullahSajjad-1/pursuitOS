import { db } from '@pursuitos/server/db/client';
import { pursuits, opportunityRequirements, councilRuns, councilReviews, evidenceEvents, evidence } from '@pursuitos/server/db/schema';
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
  let strategy = null;
  let reviews: any[] = [];

  if (runs.length > 0) {
    const latestRun = runs[0];
    synthesis = {
      decision: latestRun.decision,
      confidence: latestRun.confidence,
      rationale: latestRun.synthesisRationale,
      recommendedAction: latestRun.recommendedAction,
      conditions: []
    };
    strategy = latestRun.communicationStrategy;

    reviews = await db.select().from(councilReviews).where(eq(councilReviews.runId, latestRun.id));
  }

  const events = await db.select().from(evidenceEvents)
    .where(eq(evidenceEvents.pursuitId, id))
    .orderBy(desc(evidenceEvents.createdAt));

  const evidenceRecords = await db.select().from(evidence)
    .where(eq(evidence.pursuitId, id));

  // Fetch Delta v2
  const { buildDelta } = await import('@pursuitos/server/intelligence/delta');
  const delta = await buildDelta(id).catch(() => null);

  // Fetch Buying Committee
  const { buildBuyingCommittee } = await import('@pursuitos/server/graph8/dossier');
  const committee = pursuit.companyId ? await buildBuyingCommittee(pursuit.companyId).catch(() => []) : [];

  const whyNow = pursuit.whyNow || (runs[0]?.whyNow as any) || null;

  const { calculateBidPricing } = await import('@pursuitos/server/commercial/pricing');
  const pricing = calculateBidPricing({
    requirements: requirements.map(r => ({ category: r.category, priority: r.priority, text: r.text })),
    decision: synthesis?.decision || pursuit.status
  });

  return (
    <div className="h-full">
      <PursuitScreenClient 
        pursuit={pursuit}
        requirements={requirements}
        synthesis={synthesis}
        strategy={strategy}
        reviews={reviews}
        events={events}
        pricing={pricing}
        evidenceList={evidenceRecords}
        whyNow={whyNow}
        delta={delta}
        committee={committee}
      />
    </div>
  );
}
