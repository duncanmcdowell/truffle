import db, { getSearchTerms } from '../db';
import type { Job } from './definitions';

export function fetchJobs(): Job[] {
  const stmt = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC');
  const data = stmt.all();
  return data as Job[];
}

export function getSearchTermsData(): string[] {
  return (getSearchTerms() as Record<string, unknown>[]).map((row) => String(row.term));
} 