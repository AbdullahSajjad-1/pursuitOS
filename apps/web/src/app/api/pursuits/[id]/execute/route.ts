import { NextResponse } from 'next/server';
import { executePursuitDecision } from '@pursuitos/server/pursuits/execution';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // In a real app we'd validate auth, read who clicked approve, etc.
    const result = await executePursuitDecision(id, 'human');

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error executing pursuit decision:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
