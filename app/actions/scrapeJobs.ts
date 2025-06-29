"use server";

import { runScheduler } from "../../scheduler";
import { fetchJobs } from "../../lib/data";

export async function scrapeAndFetchJobs() {
  try {
    const { grandTotalInserted, grandTotalSkipped } = await runScheduler();
    const jobs = fetchJobs();
    return { jobs, grandTotalInserted, grandTotalSkipped };
  } catch (error) {
    console.error('Job search failed:', error);
    throw error;
  }
}

export async function getCurrentProgress() {
  // This function is no longer used in the new implementation
  throw new Error('getCurrentProgress is no longer supported');
}

export async function isJobSearchInProgress() {
  // This function is no longer used in the new implementation
  throw new Error('isJobSearchInProgress is no longer supported');
} 