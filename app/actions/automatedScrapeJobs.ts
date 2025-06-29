"use server";

import { scrapeAndFetchJobs } from "./scrapeJobs";

// Server-side function for automated searches
export async function scrapeJobsAutomated() {
  try {
    const result = await scrapeAndFetchJobs();
    console.log(`[AUTOMATED] Job search completed successfully: ${result.grandTotalInserted} new jobs, ${result.grandTotalSkipped} duplicates`);
    
    // Send notification for scheduled job completion
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/scheduled-job-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inserted: result.grandTotalInserted,
          skipped: result.grandTotalSkipped,
        }),
      });
    } catch (notificationError) {
      console.error('Failed to send scheduled job notification:', notificationError);
    }
    
    return result;
  } catch (error) {
    console.error(`[AUTOMATED] Job search failed:`, error);
    throw error;
  }
} 