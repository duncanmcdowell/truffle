# Truffle 🐖

Truffle is a job search and monitoring application that scrapes job boards from top VC companies in North America.

<img width="1616" alt="image" src="https://github.com/user-attachments/assets/dc82ba57-4cef-4d0b-a078-01f3c3deeaaf" />

## Current Functionality

The application provides:

- **Web Interface**: Next.js 14+ frontend with a data table displaying scraped jobs, search functionality, and filtering options
- **Real-time Job Scraping**: Manual and automated scraping of job boards from 15+ major VC firms including Sequoia, a16z, Accel, Bessemer, and others
- **Search Term Management**: Ability to add, remove, and manage search terms that are used to filter job listings
- **Seniority Filtering**: Configurable filters for job seniority levels (CXO, VP, Director, Senior, etc.)
- **Scheduled Automation**: Optional hourly automated job scraping with real-time progress tracking
- **Real-time Notifications**: Toast notifications for job search progress and completion
- **Data Persistence**: SQLite database for storing jobs, search terms, and search settings

## Technical Stack

- **Frontend**: Next.js 14+ with React 19, TypeScript, and Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **UI Components**: Shad/cn
- **Data Validation**: Zod for type safety and validation
- **Scheduling**: node-cron for automated hourly job searches
- **Email**: Resend integration (configured but not actively used for alerts)
- **Real-time Updates**: Server-Sent Events (SSE) for progress tracking

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

**⚠️ Important Note**: When running in development mode, the automated scheduler may create duplicate tasks if you restart the development server frequently. This is because the scheduler initializes on each server restart. For testing the scheduler functionality, it's recommended to use the production build locally.

#### Production Build (Recommended for Scheduler Testing)
```bash
npm run build
npm start
```

This runs the production build locally, which is more stable for testing and using the automated scheduling features.

### Database

The application uses SQLite for data storage. The database file (`jobs.db`) will be created automatically when you first run the application, and several default search terms will be populated.

### Features

- **Manual Job Search**: Use the "Find Jobs" button to manually trigger a job search across all enabled VC firms
- **Search Terms**: Add and manage search terms using the "Edit Search Terms" button (⌘+J)
- **Scheduled Search**: Enable automated hourly job searches through the settings in the Find Jobs dialog (⌘+K)
- **Seniority Filters**: Configure which job seniority levels to include in searches

## Job Board Platforms Supported

The application supports two major job board platforms:
- **Consider**: Used by firms like Sequoia, a16z, Bessemer, Kleiner Perkins, etc.
- **Getro**: Used by firms like Accel, Insight Partners, Khosla Ventures, etc.

Each platform has its own API integration, parsing logic, and data transformation pipeline, making it easy to add new VC firms that use these platforms.

## Architecture Overview

This project is designed to be scalable and easy to extend. The core components are:

- **`helpers.ts`**: This is the central configuration file. The `VC_FIRMS` array defines every VC firm the project knows about, including its name, the job board platform it uses (e.g., 'consider', 'getro'), its `boardId`, `apiUrl`, and whether it's enabled for scraping.

- **`job-boards/`**: This directory contains the "drivers" for different job board platforms. Each subdirectory (e.g., `consider/`, `getro/`) holds the specific logic for fetching, parsing, and inserting jobs from that platform. This makes the logic reusable for any VC firm that uses the same underlying job board software.

- **`vc-firms/handlers.ts`**: This file dynamically generates a `FIRM_HANDLERS` object by mapping each firm in `VC_FIRMS` to the correct platform driver in the `job-boards` directory. This eliminates the need for conditional logic (if/else or switch statements) when processing different firms.

- **`scheduler/index.ts`**: The main scheduler iterates through the enabled VC firms, uses the `FIRM_HANDLERS` to get the correct functions for each firm, and executes the scraping process.

### How to Add a New VC Firm

1.  **If the firm uses an existing platform (e.g., 'consider' or 'getro'):**
    -   Simply add a new entry to the `VC_FIRMS` array in `helpers.ts` with the correct `name`, `platform`, `boardId`, and `apiUrl`.
    -   Set `enabled: true` to have the scheduler pick it up automatically.

2.  **If the firm uses a new job board platform:**
    -   Create a new subdirectory in `job-boards/` for the new platform (e.g., `job-boards/new-platform/`).
    -   Implement the necessary files inside (`api.ts`, `parser.ts`, `payload.ts`, `insert.ts`, etc.) based on the new platform's API.
    -   Add the new platform driver to the `PLATFORM_DRIVERS` mapping in `vc-firms/handlers.ts`.
    -   Add the new VC firm to the `VC_FIRMS` array in `helpers.ts`, specifying its new platform.
