import * as consider from '../job-boards/consider';
import * as getro from '../job-boards/getro';
import type { VC_FIRM } from '../helpers';
import type { ConsiderJobRequest } from '../job-boards/consider/types';
import type { GetroJobRequest } from '../job-boards/getro/types';

export type FirmHandler<Payload> = {
  fetchJobs: (apiUrl: string, payload: Payload) => Promise<unknown>;
  buildPayload: (firm: VC_FIRM, term: string) => Payload;
  insertJob: (job: Record<string, unknown>, company: Record<string, unknown>, source: string) => boolean;
  parser: (data: unknown) => unknown;
  transform: (data: unknown) => unknown[];
};

export const FIRM_HANDLERS: Record<string, FirmHandler<any>> = {
  consider: consider as FirmHandler<ConsiderJobRequest>,
  getro: getro as FirmHandler<GetroJobRequest>,
  // Add other platforms like 'greenhouse' or 'lever' here
}; 