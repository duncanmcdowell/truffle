import { NextRequest, NextResponse } from 'next/server';
import { getJobSearchSettings, setJobSearchSettings, createJobSearchSettingsTable } from '../../../db';
import { restartHourlyScheduler } from '../../../scheduler';

// Ensure table exists
createJobSearchSettingsTable();

// Debounce scheduler restarts to prevent multiple rapid calls
let restartTimeout: NodeJS.Timeout | null = null;

export async function GET() {
  const settings = getJobSearchSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const currentSettings = getJobSearchSettings();
  
  setJobSearchSettings(data);
  
  // Restart scheduler if scheduled setting changed, with debouncing
  if (data.scheduled !== undefined && data.scheduled !== currentSettings.scheduled) {
    console.log(`Scheduled setting changed from ${currentSettings.scheduled} to ${data.scheduled}`);
    
    // Clear any existing timeout
    if (restartTimeout) {
      clearTimeout(restartTimeout);
    }
    
    // Debounce the restart to prevent multiple rapid calls
    restartTimeout = setTimeout(() => {
      console.log('Debounced scheduler restart triggered');
      restartHourlyScheduler();
      restartTimeout = null;
    }, 500); // 500ms debounce
  }
  
  return NextResponse.json({ success: true });
} 