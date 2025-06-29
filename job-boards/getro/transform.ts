import type { GetroApiResponse, GetroJob } from './types';

export function transform(data: GetroApiResponse): GetroJob[] {
  return data.results.jobs;
} 