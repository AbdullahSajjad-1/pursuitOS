import { NextResponse } from 'next/server';
import { createRevivalPursuit } from '@pursuitos/server/pursuits/revival';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dealId, companyId, companyDomain, dealName, amount, lossReason, accountNotes } = body;

    if (!dealId || !companyDomain) {
      return NextResponse.json(
        { error: 'dealId and companyDomain are required to initiate revival' },
        { status: 400 }
      );
    }

    const result = await createRevivalPursuit({
      dealId,
      companyId: String(companyId || ''),
      companyDomain: companyDomain.trim().toLowerCase(),
      dealName: dealName || 'Historical Enterprise Deal',
      amount: Number(amount) || undefined,
      lossReason: lossReason || undefined,
      accountNotes: accountNotes || undefined
    });

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/pursuits');
      revalidatePath('/revivals');
    } catch (_) {}

    return NextResponse.json({
      success: true,
      pursuitId: result.pursuitId,
      alreadyExists: result.alreadyExists,
      decision: result.decision
    });
  } catch (error: any) {
    console.error('[api/revival/create] Error creating revival pursuit:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create revival pursuit' },
      { status: 500 }
    );
  }
}
