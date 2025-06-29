"use client";

import { toast } from "sonner";
import { scrapeAndFetchJobs } from "./scrapeJobs";
import { VC_FIRMS } from "../../helpers";
import { useSSE } from "../../hooks/useSSE";
import { useEffect, useRef, useState } from "react";

export function useScrapeJobsWithProgress() {
  const { progress, isSearching, isConnected } = useSSE();
  const [completedFirms, setCompletedFirms] = useState(0);
  const [totalFirms] = useState(VC_FIRMS.filter(f => f.enabled).length);
  const completedFirmNames = useRef(new Set<string>());
  const currentToastId = useRef<string | null>(null);

  // Track completed firms based on SSE progress updates
  useEffect(() => {
    console.log('Progress update received:', progress);
    if (progress?.type === 'found' && progress.firmName) {
      if (!completedFirmNames.current.has(progress.firmName)) {
        completedFirmNames.current.add(progress.firmName);
        const newCount = completedFirmNames.current.size;
        console.log('Completed firms:', newCount, 'of', totalFirms);
        setCompletedFirms(newCount);
      }
    } else if (progress?.type === 'summary') {
      console.log('Search completed, setting completed firms to total');
      setCompletedFirms(totalFirms);
    }
  }, [progress, totalFirms]);

  // Update toast when progress changes
  useEffect(() => {
    if (isSearching && currentToastId.current) {
      console.log('Updating toast with progress:', completedFirms, 'of', totalFirms);
      toast.loading(`Starting job search...\n\n${completedFirms} of ${totalFirms} firms searched`, {
        id: currentToastId.current,
        duration: 5 * 60 * 1000, // 5 minutes
      });
    }
  }, [completedFirms, isSearching, totalFirms]);

  const scrapeJobs = async () => {
    const toastId = `job-search-${Date.now()}`;
    currentToastId.current = toastId;

    // Reset completed firms counter
    setCompletedFirms(0);
    completedFirmNames.current.clear();

    console.log('Starting job search with', totalFirms, 'enabled firms');

    // Create the initial toast
    toast.loading(`Starting job search...\n\n0 of ${totalFirms} firms searched`, {
      id: toastId,
      duration: 5 * 60 * 1000, // 5 minutes
    });

    try {
      const result = await scrapeAndFetchJobs();

      // Format the timestamp
      const timestamp = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Show final success toast with 10-second duration and timestamp for manual searches
      toast.success(`Job search completed!\n\nFound ${result.grandTotalInserted} new jobs, skipped ${result.grandTotalSkipped} duplicates\n\nCompleted at ${timestamp}`, {
        id: toastId,
        duration: 10000, // 10 seconds for manual searches
      });

      currentToastId.current = null;
      return result;
    } catch (error) {
      // Show error toast
      toast.error(`Job search failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        id: toastId,
        duration: 10000,
      });
      currentToastId.current = null;
      throw error;
    }
  };

  return {
    scrapeJobs,
    isConnected,
    progress,
    isSearching,
    completedFirms,
    totalFirms,
  };
} 