#!/usr/bin/env tsx

// Test script for the scheduler
import { 
  startHourlyScheduler, 
  stopHourlyScheduler, 
  isHourlySchedulerRunning,
  restartHourlyScheduler 
} from './scheduler';
import { getJobSearchSettings, setJobSearchSettings } from './db';

async function testScheduler() {
  console.log('=== Scheduler Test ===');
  
  // Check current settings
  const settings = getJobSearchSettings();
  console.log('Current settings:', settings);
  
  // Test starting scheduler
  console.log('\n1. Starting scheduler...');
  startHourlyScheduler();
  console.log('Scheduler running:', isHourlySchedulerRunning());
  
  // Test stopping scheduler
  console.log('\n2. Stopping scheduler...');
  stopHourlyScheduler();
  console.log('Scheduler running:', isHourlySchedulerRunning());
  
  // Test enabling scheduled search
  console.log('\n3. Enabling scheduled search...');
  setJobSearchSettings({ scheduled: true });
  
  // Test restarting scheduler
  console.log('\n4. Restarting scheduler...');
  restartHourlyScheduler();
  console.log('Scheduler running:', isHourlySchedulerRunning());
  
  // Test disabling scheduled search
  console.log('\n5. Disabling scheduled search...');
  setJobSearchSettings({ scheduled: false });
  restartHourlyScheduler();
  console.log('Scheduler running:', isHourlySchedulerRunning());
  
  console.log('\n=== Test Complete ===');
}

testScheduler().catch(console.error); 