import { NextResponse } from 'next/server';
import { getSearchTerms, addSearchTerm, deleteSearchTerm, createSearchTermsTable, seedSearchTerms } from '@/db';
import { z } from 'zod';

// Ensure table exists and is seeded
createSearchTermsTable();
seedSearchTerms();

export async function GET() {
  const terms = getSearchTerms();
  return NextResponse.json({ terms });
}

export async function POST(req: Request) {
  const body = await req.json();
  const schema = z.object({ term: z.string().min(1).max(100) });
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid term' }, { status: 400 });
  }
  try {
    addSearchTerm(parse.data.term);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Term already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add term' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const schema = z.object({ id: z.number() });
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  try {
    deleteSearchTerm(parse.data.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete term' }, { status: 500 });
  }
} 