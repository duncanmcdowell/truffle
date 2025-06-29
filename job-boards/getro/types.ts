// Types for Getro job board API

export type GetroJobRequest = {
  hitsPerPage: number;
  page: number;
  filters: {
    seniority: string[];
    searchable_location_option: string[];
    q: string;
  };
  query: string;
};

export type GetroApiResponse = {
  results: {
    jobs: GetroJob[];
    count: number;
  };
  meta: {
    duration_in_ms: number;
    service: string;
  };
};

export type GetroJob = {
  featured: boolean;
  compensation_amount_max_cents?: number;
  searchable_locations: string[];
  created_at: number; // Unix timestamp
  weight: number;
  compensation_amount_min_cents?: number;
  source: string;
  title: string;
  work_mode: string;
  url: string;
  compensation_offers_equity?: boolean;
  compensation_currency?: string;
  compensation_period?: string;
  organization: GetroOrganization;
  locations: string[];
  has_description: boolean;
  slug: string;
  seniority: string;
  id: number;
};

export type GetroOrganization = {
  stage: string;
  logo_url: string;
  topics: string[];
  name: string;
  head_count: number | null;
  id: number;
  industry_tags: string[];
  slug: string;
}; 