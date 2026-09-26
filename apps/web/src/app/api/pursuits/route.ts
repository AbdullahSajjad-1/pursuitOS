import { NextResponse } from 'next/server';
import { db } from '../../../../../../server/db/client';
import { pursuits } from '../../../../../../server/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const list = await db.select().from(pursuits).orderBy(desc(pursuits.createdAt));
    return NextResponse.json({ pursuits: list });
  } catch (error) {
    console.error('Error fetching pursuits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, companyDomain } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [newPursuit] = await db.insert(pursuits).values({
      name,
      companyDomain,
      status: 'DRAFT',
    }).returning();

    return NextResponse.json({ pursuit: newPursuit }, { status: 201 });
  } catch (error) {
    console.error('Error creating pursuit:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
