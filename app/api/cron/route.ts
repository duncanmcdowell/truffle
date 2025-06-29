import { NextRequest, NextResponse } from 'next/server';
import { scrapeJobsAutomated } from '../../actions/automatedScrapeJobs';
import { getJobSearchSettings } from '../../../db';

// This endpoint can be called by external schedulers (GitHub Actions, cron-job.org, etc.)
export async function POST(req: NextRequest) {
  try {
    // Verify the request (you can add authentication here)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if scheduled search is enabled
    const settings = getJobSearchSettings();
    if (!settings.scheduled) {
      return NextResponse.json({ 
        message: 'Scheduled search is disabled',
        scheduled: false 
      });
    }

    console.log(`[${new Date().toISOString()}] Running scheduled job search via cron endpoint...`);
    
    // Run the automated job search
    const result = await scrapeJobsAutomated();
    
    console.log(`[${new Date().toISOString()}] Scheduled job search completed successfully`);
    
    return NextResponse.json({
      success: true,
      message: 'Scheduled job search completed',
      result: {
        inserted: result.grandTotalInserted,
        skipped: result.grandTotalSkipped,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Scheduled job search failed:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for health checks
export async function GET() {
  const settings = getJobSearchSettings();
  
  return NextResponse.json({
    status: 'healthy',
    scheduled: settings.scheduled,
    timestamp: new Date().toISOString()
  });
} 