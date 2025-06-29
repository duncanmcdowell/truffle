import Database from 'better-sqlite3';

const db = new Database('jobs.db');

export function createJobsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      vc_job_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      company_slug TEXT,
      title TEXT NOT NULL,
      posting_link_url TEXT NOT NULL,
      location TEXT,
      remote INTEGER,
      posted_at TEXT,
      salary_min INTEGER,
      salary_max INTEGER,
      currency TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      logo_url TEXT,
      UNIQUE(source, vc_job_id)
    );
  `);
}

// --- SEARCH TERMS TABLE ---
export function createSearchTermsTable() {
  db.prepare(`CREATE TABLE IF NOT EXISTS search_terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

const DEFAULT_TERMS = [
  'Software Engineer',
  'Machine Learning Engineer',
  'Product Manager',
  'Data Scientist',
  'Backend Engineer',
  'Frontend Engineer',
  'CTO',
  'VP Engineering',
  'Director of Engineering',
];

export function seedSearchTerms() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM search_terms').get() as { count: number };
  if (countRow.count === 0) {
    const stmt = db.prepare('INSERT INTO search_terms (term) VALUES (?)');
    for (const term of DEFAULT_TERMS) {
      try { stmt.run(term); } catch (e: unknown) {
        if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
          // Ignore unique constraint errors
        } else {
          throw e;
        }
      }
    }
  }
}

export function getSearchTerms() {
  return db.prepare('SELECT * FROM search_terms ORDER BY created_at ASC').all();
}

export function addSearchTerm(term: string) {
  return db.prepare('INSERT INTO search_terms (term) VALUES (?)').run(term);
}

export function deleteSearchTerm(id: number) {
  return db.prepare('DELETE FROM search_terms WHERE id = ?').run(id);
}

// --- SENIORITY FILTERS TABLE ---
export function createSeniorityFiltersTable() {
  db.prepare(`CREATE TABLE IF NOT EXISTS seniority_filters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value TEXT NOT NULL UNIQUE
  )`).run();
}

const ALL_SENIORITY_OPTIONS = [
  "cxo",
  "vice_president",
  "director",
  "senior",
  "mid_senior",
  "associate",
  "entry_level",
  "internship"
];

export function seedSeniorityFilters() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM seniority_filters').get() as { count: number };
  if (countRow.count === 0) {
    const stmt = db.prepare('INSERT INTO seniority_filters (value) VALUES (?)');
    for (const value of ALL_SENIORITY_OPTIONS) {
      try { stmt.run(value); } catch (e: unknown) {
        if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
          // Ignore unique constraint errors
        } else {
          throw e;
        }
      }
    }
  }
}

export function getSeniorityFilters(): string[] {
  return (db.prepare('SELECT value FROM seniority_filters').all() as Record<string, unknown>[]).map(row => String(row.value));
}

export function setSeniorityFilters(values: string[]) {
  db.prepare('DELETE FROM seniority_filters').run();
  const stmt = db.prepare('INSERT INTO seniority_filters (value) VALUES (?)');
  for (const value of values) {
    stmt.run(value);
  }
}

export function getScheduledJobSearch(): boolean {
  const row = db.prepare('SELECT scheduled FROM scheduled_job_search WHERE id = 1').get() as { scheduled: number } | undefined;
  return !!(row && row.scheduled);
}

export function setScheduledJobSearch(scheduled: boolean) {
  db.prepare('UPDATE scheduled_job_search SET scheduled = ? WHERE id = 1').run(scheduled ? 1 : 0);
}

export function createJobSearchSettingsTable() {
  db.prepare(`CREATE TABLE IF NOT EXISTS job_search_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    scheduled INTEGER NOT NULL,
    search_terms TEXT,
    seniority_levels TEXT
  )`).run();
  // Ensure a row always exists
  const row = db.prepare('SELECT * FROM job_search_settings WHERE id = 1').get();
  if (!row) {
    db.prepare('INSERT INTO job_search_settings (id, scheduled, search_terms, seniority_levels) VALUES (1, 0, ?, ?)' ).run(
      JSON.stringify([]),
      JSON.stringify([])
    );
  }
}

export type JobSearchSettings = {
  scheduled: boolean;
  search_terms: string[];
  seniority_levels: string[];
};

export function getJobSearchSettings(): JobSearchSettings {
  const row = db.prepare('SELECT scheduled, search_terms, seniority_levels FROM job_search_settings WHERE id = 1').get() as { scheduled: number, search_terms: string, seniority_levels: string };
  return {
    scheduled: !!row.scheduled,
    search_terms: row.search_terms ? JSON.parse(row.search_terms) : [],
    seniority_levels: row.seniority_levels ? JSON.parse(row.seniority_levels) : [],
  };
}

export function setJobSearchSettings(settings: Partial<JobSearchSettings>) {
  const current = getJobSearchSettings();
  const updated = {
    scheduled: settings.scheduled !== undefined ? settings.scheduled : current.scheduled,
    search_terms: settings.search_terms !== undefined ? settings.search_terms : current.search_terms,
    seniority_levels: settings.seniority_levels !== undefined ? settings.seniority_levels : current.seniority_levels,
  };
  db.prepare('UPDATE job_search_settings SET scheduled = ?, search_terms = ?, seniority_levels = ? WHERE id = 1').run(
    updated.scheduled ? 1 : 0,
    JSON.stringify(updated.search_terms),
    JSON.stringify(updated.seniority_levels)
  );
}

// --- SCHEDULED JOB NOTIFICATIONS TABLE ---
export function createNotificationsTable() {
  db.prepare(`CREATE TABLE IF NOT EXISTS scheduled_job_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    inserted INTEGER NOT NULL,
    skipped INTEGER NOT NULL,
    read INTEGER NOT NULL DEFAULT 0
  )`).run();
}

export function addScheduledJobNotification({ timestamp, inserted, skipped }: { timestamp: string, inserted: number, skipped: number }) {
  db.prepare('INSERT INTO scheduled_job_notifications (timestamp, inserted, skipped, read) VALUES (?, ?, ?, 0)').run(timestamp, inserted, skipped);
}

export function getUnreadScheduledJobNotifications() {
  return db.prepare('SELECT id, timestamp, inserted, skipped, read FROM scheduled_job_notifications WHERE read = 0 ORDER BY timestamp DESC').all();
}

export function markScheduledJobNotificationsRead(ids: number[]) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`UPDATE scheduled_job_notifications SET read = 1 WHERE id IN (${placeholders})`).run(...ids);
}

export default db; 