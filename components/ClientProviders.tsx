"use client";

import React from 'react';
import { useScheduledJobNotifications } from '../hooks/useScheduledJobNotifications';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  // This hook will handle checking for scheduled job notifications and showing toasts
  useScheduledJobNotifications();
  
  return <>{children}</>;
} 