import type { ConsiderApiResponse, ConsiderJob, ConsiderCompany } from './types';

export function transform(data: ConsiderApiResponse): (ConsiderJob & { company: ConsiderCompany })[] {
  const jobs: (ConsiderJob & { company: ConsiderCompany })[] = [];
  for (const group of data.jobs) {
    for (const job of group.jobs) {
      jobs.push({ ...job, company: group.company });
    }
  }
  return jobs;
} 