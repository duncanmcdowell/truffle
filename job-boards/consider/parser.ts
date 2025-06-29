import { z } from 'zod';
import type { ConsiderApiResponse } from './types';

export const ConsiderLogoSchema = z.object({
  height: z.number(),
  width: z.number(),
  src: z.string(),
});

export const ConsiderLabelValueSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
});

export const ConsiderCompanySchema = z.object({
  // ...
});

export const ConsiderJobSchema = z.object({
  // ...
});

export const ConsiderJobGroupSchema = z.object({
  // ...
});

const ConsiderApiSchema = z.object({
  jobs: z.array(
    z.object({
      company: z.object({
        name: z.string(),
        slug: z.string(),
      }),
      jobs: z.array(
        z.object({
          title: z.string(),
          jobId: z.string(),
          applyUrl: z.string().url(),
          timeStamp: z.string(),
        }).passthrough()
      ),
    })
  ),
});

export function parser(data: unknown): ConsiderApiResponse {
  const parsed = ConsiderApiSchema.parse(data);
  // We are only validating the parts we use, but need the full structure.
  return parsed as ConsiderApiResponse;
} 