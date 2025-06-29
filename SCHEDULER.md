# Hourly Job Search Scheduler

This application now includes an automated hourly scheduler that can automatically search for new jobs when enabled.

## Features

- **Hourly Execution**: Runs at the start of every hour (e.g., 1:00, 2:00, 3:00, etc.)
- **Database-Driven**: Checks the `job_search_settings` table to determine if scheduled search is enabled
- **Automatic Restart**: Restarts when settings are changed via the UI
- **Status Monitoring**: Provides real-time status of the scheduler
- **Error Handling**: Gracefully handles errors and continues running
- **Success Notifications**: Shows 30-minute duration success toasts with timestamps when scheduled jobs complete

## How It Works

1. **Initialization**: The scheduler is initialized when the application starts by importing `server-init.ts`
2. **Database Check**: Before each run, it checks if `scheduled` is `true` in the database
3. **Execution**: If enabled, it runs the automated job search using `scrapeJobsAutomated()`
4. **Notification**: When completed, sends a notification to the client via `/api/scheduled-job-notification`
5. **Toast Display**: Client-side hook checks for notifications every 30 seconds and shows success toasts
6. **Logging**: All activities are logged with timestamps

## Toast Notifications

### Scheduled Job Completions
- **Duration**: 30 minutes
- **Content**: Shows number of new jobs found, duplicates skipped, and completion timestamp
- **Format**: "Scheduled job search completed! Found X new jobs, skipped Y duplicates. Completed at [timestamp]"
- **Reason**: Long duration ensures users see the notification even if they're not actively using the app

### Manual Job Searches
- **Duration**: 10 seconds
- **Content**: Shows number of new jobs found, duplicates skipped, and completion timestamp
- **Format**: "Job search completed! Found X new jobs, skipped Y duplicates. Completed at [timestamp]"
- **Reason**: Short duration since users are actively waiting for manual search results

### Progress Updates
- **Duration**: 5 minutes
- **Content**: Shows real-time progress during job search
- **Format**: "Starting job search... X of Y firms searched"

## Configuration

### Enable/Disable Scheduled Search

1. Open the "Find Jobs" dialog (⌘K)
2. Toggle the "Scheduled Search" switch
3. The scheduler will automatically start/stop based on this setting

### Timezone

The scheduler runs in UTC by default. To change the timezone, modify the `timezone` option in `scheduler/index.ts`:

```typescript
hourlyScheduler = cron.schedule('0 * * * *', async () => {
  // ... job search logic
}, {
  timezone: "America/New_York" // Change to your preferred timezone
});
```

## API Endpoints

### GET /api/scheduler
Returns the current status of the scheduler:
```json
{
  "isRunning": true,
  "scheduled": true,
  "nextRun": "At the start of the next hour"
}
```

### POST /api/scheduler
Manually control the scheduler:
```json
{
  "action": "start" | "stop" | "restart"
}
```

### POST /api/scheduled-job-notification
Stores a scheduled job completion notification:
```json
{
  "inserted": 5,
  "skipped": 10
}
```

### GET /api/scheduled-job-notification
Retrieves unread scheduled job notifications:
```json
{
  "notifications": [
    {
      "id": "scheduled-1234567890",
      "timestamp": "2024-01-15T10:00:00.000Z",
      "inserted": 5,
      "skipped": 10,
      "read": false
    }
  ]
}
```

## Testing

Run the test script to verify scheduler functionality:

```bash
npm run test-scheduler
```

## Monitoring

The scheduler logs all activities to the console:
- `[timestamp] Running scheduled job search...`
- `[timestamp] Scheduled job search completed successfully`
- `[timestamp] Scheduled job search failed: [error]`

## Troubleshooting

### Scheduler Not Starting
1. Check if the scheduled setting is enabled in the database
2. Verify the application is running and `server-init.ts` is imported
3. Check console logs for any errors

### Jobs Not Being Found
1. Verify the search terms are configured
2. Check if VC firms are enabled
3. Review the automated job search logs

### Toast Notifications Not Appearing
1. Ensure the `ScheduledJobNotificationsProvider` is properly imported in the layout
2. Check browser console for any errors in the notification hook
3. Verify the notification API endpoints are accessible

### Timezone Issues
1. Update the timezone setting in the scheduler configuration
2. Restart the application after changing timezone settings 