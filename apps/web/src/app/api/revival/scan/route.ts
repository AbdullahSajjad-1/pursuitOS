import { NextResponse } from 'next/server';
import { scanClosedLostDeals } from '@pursuitos/server/graph8/scanner';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lostDeals = await scanClosedLostDeals();
    return NextResponse.json({
      success: true,
      deals: lostDeals,
      count: lostDeals.length
    });
  } catch (error: any) {
    console.error('[api/revival/scan] Error scanning closed-lost deals:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to scan closed-lost deals' },
      { status: 500 }
    );
  }
}
