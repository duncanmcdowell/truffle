export type Job = {
  id: number;
  source: string;
  vc_job_id: string;
  company_name: string;
  company_slug: string | null;
  title: string;
  posting_link_url: string;
  location: string | null;
  remote: number | null;
  posted_at: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  created_at: string;
  logo_url: string | null;
}; 