import type { ConsiderJobRequest } from './types';
import type { VC_FIRM } from '../../helpers';

export function buildPayload(firm: VC_FIRM, term: string): ConsiderJobRequest {
  if (!firm.boardId) {
    throw new Error(`Missing boardId for firm: ${firm.name}`);
  }
  return {
    meta: { size: 500 },
    board: { id: firm.boardId, isParent: true },
    query: {
      remoteOnly: true,
      hybridOnly: false,
      hybridOrRemoteOnly: false,
      titlePrefix: term,
      promoteFeatured: true,
    },
    grouped: true,
  };
}

export async function fetchJobs(apiUrl: string, payload: ConsiderJobRequest) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Consider API error: ${response.status} at ${apiUrl}`);
  }

  return response.json();
} 