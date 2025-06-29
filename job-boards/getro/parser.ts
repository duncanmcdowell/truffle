import { z } from 'zod';

export const GetroOrganizationSchema = z.object({
  stage: z.string().nullable(),
  logo_url: z.string().url(),
  topics: z.array(z.string()),
  name: z.string(),
  head_count: z.number().nullable(),
  id: z.number(),
  industry_tags: z.array(z.string()),
  slug: z.string(),
});

export const GetroJobSchema = z.object({
  featured: z.boolean(),
  compensation_amount_max_cents: z.number().nullable().optional(),
  searchable_locations: z.array(z.string()),
  created_at: z.number(),
  weight: z.number(),
  compensation_amount_min_cents: z.number().nullable().optional(),
  source: z.string(),
  title: z.string(),
  work_mode: z.string(),
  url: z.string().url(),
  compensation_offers_equity: z.boolean().nullable().optional(),
  compensation_currency: z.string().nullable().optional(),
  compensation_period: z.string().optional(),
  organization: GetroOrganizationSchema,
  locations: z.array(z.string()),
  has_description: z.boolean(),
  slug: z.string(),
  seniority: z.string(),
  id: z.number(),
});

export const GetroApiResponseSchema = z.object({
  results: z.object({
    jobs: z.array(GetroJobSchema),
    count: z.number(),
  }),
  meta: z.object({
    duration_in_ms: z.number(),
    service: z.string(),
  }),
});

export function parseGetroApiResponse(data: unknown) {
  return GetroApiResponseSchema.parse(data);
} 