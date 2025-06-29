import { NextRequest, NextResponse } from 'next/server';
import { 
  isHourlySchedulerRunning, 
  startHourlyScheduler, 
  stopHourlyScheduler,
  restartHourlyScheduler 
} from '../../../scheduler';
import { getJobSearchSettings } from '../../../db';

export async function GET() {
  const settings = getJobSearchSettings();
  let isRunning = isHourlySchedulerRunning();
  
  // Auto-recover scheduler if it should be running but isn't
  if (settings.scheduled && !isRunning) {
    console.log('Auto-recovering scheduler - scheduled is enabled but scheduler is not running');
    startHourlyScheduler();
    isRunning = isHourlySchedulerRunning(); // Check again after starting
  }
  
  // Determine the status message
  let statusMessage: string;
  if (settings.scheduled) {
    if (isRunning) {
      statusMessage = 'At the start of the next hour';
    } else {
      statusMessage = 'Scheduled but not running (server restart required)';
    }
  } else {
    statusMessage = 'Not scheduled';
  }
  
  return NextResponse.json({
    isRunning,
    scheduled: settings.scheduled,
    nextRun: statusMessage
  });
}

export async function POST(req: NextRequest) {
  const { action } = await req.json();
  
  switch (action) {
    case 'start':
      startHourlyScheduler();
      return NextResponse.json({ success: true, message: 'Scheduler started' });
      
    case 'stop':
      stopHourlyScheduler();
      return NextResponse.json({ success: true, message: 'Scheduler stopped' });
      
    case 'restart':
      restartHourlyScheduler();
      return NextResponse.json({ success: true, message: 'Scheduler restarted' });
      
    default:
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  }
} 