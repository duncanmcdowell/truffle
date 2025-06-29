import { NextResponse } from 'next/server';
import { getSeniorityFilters, setSeniorityFilters, createSeniorityFiltersTable, seedSeniorityFilters } from '@/db';
import { z } from 'zod';

// Ensure table exists and is seeded
createSeniorityFiltersTable();
seedSeniorityFilters();

export async function GET() {
  const values = getSeniorityFilters();
  return NextResponse.json({ values });
}

export async function POST(req: Request) {
  const body = await req.json();
  const schema = z.object({ values: z.array(z.string()) });
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid values' }, { status: 400 });
  }
  setSeniorityFilters(parse.data.values);
  return NextResponse.json({ success: true });
} 