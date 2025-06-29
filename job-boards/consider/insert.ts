import db from '../../db';
import type { ConsiderJob, ConsiderCompany } from './types';

export function insertJob(
  job: ConsiderJob,
  company: ConsiderCompany,
  source: string
): boolean {
  try {
    const stmt = db.prepare(`
      INSERT INTO jobs (
        source, vc_job_id, company_name, company_slug, title, posting_link_url, location, remote, posted_at, salary_min, salary_max, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      source,
      job.jobId,
      company.name,
      company.slug,
      job.title,
      job.applyUrl,
      job.locations?.[0] || null,
      job.remote ? 1 : 0,
      job.timeStamp || null,
      job.salary?.minValue ?? null,
      job.salary?.maxValue ?? null,
      job.salary?.currency?.value ?? null
    );
    return true;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      // This is expected when a job already exists, so we can ignore it.
      return false;
    }
    // For any other error, re-throw it.
    throw error;
  }
} 