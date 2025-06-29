# Vercel Deployment Guide

This guide explains how to deploy the job search scheduler on Vercel infrastructure and the necessary modifications.

## Vercel Limitations

Vercel's serverless infrastructure has several limitations that affect traditional schedulers:

### ❌ **What Won't Work on Vercel:**
- **Node-cron**: Serverless functions can't run continuous background processes
- **In-memory state**: State is lost between function invocations
- **SQLite**: File-based database doesn't work well in serverless environments
- **Long-running processes**: Functions have timeout limits (10s hobby, 60s pro)

### ✅ **What Works on Vercel:**
- **API endpoints**: Can be called by external schedulers
- **Serverless functions**: Stateless job processing
- **Cloud databases**: PostgreSQL, MySQL, MongoDB
- **External scheduling services**: GitHub Actions, cron-job.org, etc.

## Recommended Architecture

### 1. **External Scheduler + API Endpoint**

Instead of running cron jobs directly, use external services to call your API:

```bash
# External scheduler calls this endpoint every hour
POST https://your-app.vercel.app/api/cron
Authorization: Bearer YOUR_SECRET
```

### 2. **Database Migration**

Replace SQLite with a cloud database:

```typescript
// Instead of better-sqlite3, use:
// - Vercel Postgres
// - PlanetScale (MySQL)
// - MongoDB Atlas
// - Supabase
```

## Implementation Options

### Option 1: GitHub Actions (Recommended)

**Pros:**
- Free for public repositories
- Reliable and well-documented
- Easy to set up and monitor

**Setup:**
1. Add the workflow file: `.github/workflows/scheduled-job-search.yml`
2. Set GitHub secrets: `CRON_SECRET` and `VERCEL_URL`
3. The workflow runs every hour automatically

### Option 2: cron-job.org

**Pros:**
- Free tier available
- Simple web interface
- No GitHub repository required

**Setup:**
1. Create account at cron-job.org
2. Add new cron job pointing to `/api/cron`
3. Set authentication header: `Bearer YOUR_SECRET`

### Option 3: Vercel Cron Jobs (Pro Plan)

**Pros:**
- Native Vercel integration
- No external dependencies

**Setup:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Environment Variables

Add these to your Vercel project:

```bash
CRON_SECRET=your-secure-random-string
VERCEL_URL=https://your-app.vercel.app
```

## Database Considerations

### Current SQLite Issues:
- File-based storage doesn't persist across deployments
- Connection pooling issues in serverless environment
- No concurrent access support

### Recommended Solutions:

#### 1. Vercel Postgres
```bash
# Install
npm install @vercel/postgres

# Usage
import { sql } from '@vercel/postgres';
```

#### 2. PlanetScale (MySQL)
```bash
# Install
npm install mysql2

# Usage
import mysql from 'mysql2/promise';
```

#### 3. MongoDB Atlas
```bash
# Install
npm install mongodb

# Usage
import { MongoClient } from 'mongodb';
```

## Migration Steps

### 1. **Replace the Scheduler**
```typescript
// Remove from server-init.ts
// import { initializeScheduler } from './scheduler';

// The scheduler will now be triggered externally
```

### 2. **Update Database**
```typescript
// Replace better-sqlite3 with cloud database
// Update db.ts to use your chosen database
```

### 3. **Test the API Endpoint**
```bash
# Test locally
curl -X POST \
  -H "Authorization: Bearer your-secret" \
  http://localhost:3000/api/cron
```

## Monitoring and Debugging

### 1. **Vercel Function Logs**
- Check Vercel dashboard for function execution logs
- Monitor cold start times and function duration

### 2. **GitHub Actions Logs**
- View workflow runs in GitHub repository
- Check for failed executions and error messages

### 3. **Health Check Endpoint**
```bash
# Check if the endpoint is working
curl https://your-app.vercel.app/api/cron
```

## Cost Considerations

### Vercel Pricing:
- **Hobby**: 100GB-hours/month (usually sufficient for this use case)
- **Pro**: 1000GB-hours/month
- **Enterprise**: Custom pricing

### External Scheduler Costs:
- **GitHub Actions**: Free for public repos, $4/month for private
- **cron-job.org**: Free tier available
- **Vercel Cron**: Included in Pro plan

## Security Best Practices

### 1. **API Authentication**
```typescript
// Always verify the cron secret
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. **Environment Variables**
- Never commit secrets to version control
- Use Vercel's environment variable management
- Rotate secrets regularly

### 3. **Rate Limiting**
```typescript
// Consider adding rate limiting to prevent abuse
// Use libraries like express-rate-limit or similar
```

## Troubleshooting

### Common Issues:

1. **Function Timeout**
   - Optimize job search performance
   - Consider breaking into smaller chunks
   - Upgrade to Vercel Pro for longer timeouts

2. **Database Connection Issues**
   - Use connection pooling
   - Implement retry logic
   - Check database provider limits

3. **Cold Start Delays**
   - Use Vercel's edge functions where possible
   - Implement warm-up requests
   - Consider keeping functions warm with periodic calls

4. **Memory Issues**
   - Monitor function memory usage
   - Optimize data processing
   - Use streaming for large datasets 