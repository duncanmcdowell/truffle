// Scheduler entry point
// Use node-cron to run scraping tasks hourly when scheduled search is enabled

import * as cron from 'node-cron';
import { VC_FIRMS } from '../helpers';
import { createJobsTable, getJobSearchSettings } from '../db';
import { FIRM_HANDLERS } from '../vc-firms/handlers';
import { getSearchTermsData } from '../lib/data';
import { scrapeJobsAutomated } from '../app/actions/automatedScrapeJobs';

export type ProgressCallback = (update: {
  type: 'searching' | 'found' | 'summary';
  firmName: string;
  inserted?: number;
  skipped?: number;
  grandTotalInserted?: number;
  grandTotalSkipped?: number;
}) => void;

// Function to update progress via API
async function updateProgress(progress: any) {
  try {
    await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    });
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
}

// Main scheduler function
export async function runScheduler(
  firmsToRun?: string[], 
  progressCallback?: ProgressCallback
) {
  createJobsTable();

  let grandTotalInserted = 0;
  let grandTotalSkipped = 0;

  const firms = firmsToRun
    ? VC_FIRMS.filter(f => firmsToRun.includes(f.name))
    : VC_FIRMS.filter(f => f.enabled);

  const SEARCH_TERMS = getSearchTermsData();

  // Set search start
  await updateProgress({ isSearching: true, currentProgress: null });

  for (const firm of firms) {
    const handler = FIRM_HANDLERS[firm.platform];
    if (!handler) {
      console.warn(`No handler found for platform ${firm.platform}, skipping ${firm.name}.`);
      continue;
    }

    // Notify that we're starting to search this firm
    const searchingUpdate = {
      type: 'searching' as const,
      firmName: firm.name
    };
    
    await updateProgress({ currentProgress: searchingUpdate });
    progressCallback?.(searchingUpdate);

    console.log(`Scraping jobs for ${firm.name}...`);
    let totalInserted = 0;
    let totalSkipped = 0;

    for (const term of SEARCH_TERMS) {
      const payload = handler.buildPayload(firm, term);
      const data = await handler.fetchJobs(firm.apiUrl!, payload);
      const parsed = handler.parser(data);
      const jobs = handler.transform(parsed);

      for (const job of jobs) {
        const typedJob = job as { company?: any; organization?: any };
        const company = typedJob.company || typedJob.organization;
        const wasInserted = handler.insertJob(typedJob, company, firm.name);
        if (wasInserted) {
          totalInserted++;
        } else {
          totalSkipped++;
        }
      }
    }
    grandTotalInserted += totalInserted;
    grandTotalSkipped += totalSkipped;
    
    // Notify that we've completed this firm
    const foundUpdate = {
      type: 'found' as const,
      firmName: firm.name,
      inserted: totalInserted,
      skipped: totalSkipped,
      grandTotalInserted,
      grandTotalSkipped
    };
    
    await updateProgress({ currentProgress: foundUpdate });
    progressCallback?.(foundUpdate);
    
    console.log(`Scraping complete for ${firm.name}: ${totalInserted} new jobs inserted, ${totalSkipped} duplicates skipped.`);
  }
  
  // Final summary
  const summaryUpdate = {
    type: 'summary' as const,
    firmName: '',
    grandTotalInserted,
    grandTotalSkipped
  };
  
  await updateProgress({ currentProgress: summaryUpdate });
  progressCallback?.(summaryUpdate);
  
  // Set search end
  await updateProgress({ isSearching: false });
  
  console.log(`\nSummary: ${grandTotalInserted} new jobs inserted, ${grandTotalSkipped} duplicates skipped across all firms.\n`);
  return { grandTotalInserted, grandTotalSkipped };
}

// Hourly scheduler that checks database settings
let hourlyScheduler: cron.ScheduledTask | null = null;
let isRestarting = false; // Flag to prevent multiple simultaneous restarts

export function startHourlyScheduler() {
  if (hourlyScheduler) {
    console.log('Hourly scheduler is already running, skipping start request');
    return;
  }
  console.log('>>> STARTING HOURLY SCHEDULER <<<', new Date().toISOString());

  if (isRestarting) {
    console.log('Scheduler restart in progress, skipping start request');
    return;
  }

  console.log('Starting hourly scheduler...');
  
  // Schedule job to run at the start of every hour (0 minutes)
  hourlyScheduler = cron.schedule('0 * * * *', async () => {
    try {
      console.log(`[${new Date().toISOString()}] Running scheduled job search...`);
      
      // Check if scheduled search is enabled
      const settings = getJobSearchSettings();
      if (!settings.scheduled) {
        console.log('Scheduled search is disabled, skipping...');
        return;
      }

      // Run the automated job search
      await scrapeJobsAutomated();
      console.log(`[${new Date().toISOString()}] Scheduled job search completed successfully`);
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scheduled job search failed:`, error);
    }
  }, {
    timezone: "UTC" // You can change this to your preferred timezone
  });

  console.log('Hourly scheduler started successfully');
}

export function stopHourlyScheduler() {
  if (!hourlyScheduler) {
    console.log('No hourly scheduler running');
    return;
  }

  console.log('Stopping hourly scheduler...');
  try {
    hourlyScheduler.stop();
    hourlyScheduler.destroy();
    hourlyScheduler = null;
    console.log('Hourly scheduler stopped successfully');
  } catch (error) {
    console.error('Error stopping hourly scheduler:', error);
    hourlyScheduler = null; // Force cleanup even if error
  }
}

export function isHourlySchedulerRunning(): boolean {
  return hourlyScheduler !== null;
}

// Function to restart scheduler when settings change
export function restartHourlyScheduler() {
  if (isRestarting) {
    console.log('Scheduler restart already in progress, skipping');
    return;
  }

  isRestarting = true;
  console.log('Restarting hourly scheduler...');
  
  try {
    stopHourlyScheduler();
    
    // Small delay to ensure cleanup
    setTimeout(() => {
      // Check if we should start it
      const settings = getJobSearchSettings();
      if (settings.scheduled) {
        startHourlyScheduler();
      }
      isRestarting = false;
      console.log('Scheduler restart completed');
    }, 100);
    
  } catch (error) {
    console.error('Error during scheduler restart:', error);
    isRestarting = false;
  }
}

// Initialize scheduler on module load
export function initializeScheduler() {
  console.log('Initializing scheduler...');
  const settings = getJobSearchSettings();
  if (settings.scheduled) {
    startHourlyScheduler();
  } else {
    console.log('Scheduled search is disabled, not starting scheduler');
  }
}
