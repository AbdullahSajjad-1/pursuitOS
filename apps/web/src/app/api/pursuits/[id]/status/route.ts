import { NextResponse } from 'next/server';
import { db } from '@pursuitos/server/db/client';
import { pursuits } from '@pursuitos/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Lightweight status-only endpoint for polling.
 * Single column, single query — should return in <50ms instead of the
 * 1500ms+ that the full GET /api/pursuits/[id] takes.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [row] = await db
    .select({ status: pursuits.status })
    .from(pursuits)
    .where(eq(pursuits.id, id));

  if (!row) {
    return NextResponse.json({ status: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ status: row.status });
}
