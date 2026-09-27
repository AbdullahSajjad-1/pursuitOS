import { NextResponse } from 'next/server';
import { declinePursuit } from '@pursuitos/server/pursuits/execution';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: any = {};
    try {
      body = await request.json();
    } catch (_) {}

    const result = await declinePursuit(id, body?.reason);

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/pursuits');
      revalidatePath(`/pursuits/${id}`);
    } catch (_) {}

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error declining pursuit:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
