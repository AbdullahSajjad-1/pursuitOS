import { NextResponse } from 'next/server';
import { executePursuitDecision } from '@pursuitos/server/pursuits/execution';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const body = await request.json().catch(() => ({}));
    
    // In a real app we'd validate auth, read who clicked approve, etc.
    const result = await executePursuitDecision(id, 'human', body.overrideBidAmount);

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/pursuits');
      revalidatePath(`/pursuits/${id}`);
    } catch (_) {}

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error executing pursuit decision:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
