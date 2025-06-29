import type { GetroJobRequest } from './types';
import type { VC_FIRM } from '../../helpers';
import { getSeniorityFilters } from '../../db';

export function buildPayload(firm: VC_FIRM, term: string): GetroJobRequest {
  return {
    hitsPerPage: 20,
    page: 0,
    filters: {
      seniority: ['vice_president', 'cxo'],
      searchable_location_option: ['remote'],
      q: term,
    },
    query: term,
  };
}

export async function fetchJobs(apiUrl: string, payload: GetroJobRequest) {
  // Fetch selected seniority filters from the database
  const selectedSeniorities = getSeniorityFilters();
  const finalPayload = {
    ...payload,
    filters: {
      ...payload.filters,
      seniority: selectedSeniorities,
    },
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'https://jobs.accel.com',
    },
    body: JSON.stringify(finalPayload),
  });

  if (!response.ok) {
    throw new Error(`Getro API error: ${response.status} at ${apiUrl}`);
  }

  const json = await response.json();
  return json;
} 