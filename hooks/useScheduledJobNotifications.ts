"use client";

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface ScheduledJobNotification {
  id: string;
  timestamp: string;
  inserted: number;
  skipped: number;
  read: boolean;
}

export function useScheduledJobNotifications() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const processedNotifications = useRef(new Set<string>());

  useEffect(() => {
    // Check for notifications every 30 seconds
    const checkNotifications = async () => {
      try {
        const response = await fetch('/api/scheduled-job-notification');
        const data = await response.json();
        
        if (data.notifications && Array.isArray(data.notifications)) {
          data.notifications.forEach((notification: ScheduledJobNotification) => {
            // Only show toast if we haven't processed this notification before
            if (!processedNotifications.current.has(notification.id)) {
              processedNotifications.current.add(notification.id);
              
              // Format the timestamp
              const timestamp = new Date(notification.timestamp);
              const formattedTime = timestamp.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
              
              // Show success toast with 30-minute duration
              toast.success(
                `Scheduled job search completed!\n\nFound ${notification.inserted} new jobs, skipped ${notification.skipped} duplicates.\n\nCompleted at ${formattedTime}`,
                {
                  duration: 30 * 60 * 1000, // 30 minutes
                  id: notification.id,
                  closeButton: true,
                }
              );
            }
          });
        }
      } catch (error) {
        console.error('Failed to check for scheduled job notifications:', error);
      }
    };

    // Check immediately on mount
    checkNotifications();
    
    // Set up interval to check every 30 seconds
    intervalRef.current = setInterval(checkNotifications, 30 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null; // This hook doesn't return anything, it just handles side effects
} 