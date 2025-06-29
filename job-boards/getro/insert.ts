import db from '../../db';
import type { GetroJob, GetroOrganization } from './types';

export function insertJob(job: GetroJob, company: GetroOrganization, source: string): boolean {
  try {
    const stmt = db.prepare(`
      INSERT INTO jobs (
        source, vc_job_id, company_name, company_slug, title, posting_link_url, location, remote, posted_at, salary_min, salary_max, currency, logo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      source,
      job.id.toString(),
      company.name,
      company.slug,
      job.title,
      job.url,
      job.locations[0] || null,
      job.work_mode === 'remote' ? 1 : 0,
      new Date(job.created_at * 1000).toISOString(),
      job.compensation_amount_min_cents ? job.compensation_amount_min_cents / 100 : null,
      job.compensation_amount_max_cents ? job.compensation_amount_max_cents / 100 : null,
      job.compensation_currency || null,
      company.logo_url || null
    );
    return true;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return false;
    }
    throw error;
  }
} 