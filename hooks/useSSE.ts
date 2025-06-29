import { useEffect, useRef, useState, useCallback } from 'react';

type ProgressUpdate = {
  type: 'searching' | 'found' | 'summary';
  firmName: string;
  inserted?: number;
  skipped?: number;
  grandTotalInserted?: number;
  grandTotalSkipped?: number;
};

type SSEMessage = {
  progress: ProgressUpdate | null;
  isSearching: boolean;
};

export function useSSE() {
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return; // Already connected
    }

    console.log('Connecting to SSE...');
    const eventSource = new EventSource('/api/progress?action=stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connected successfully');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      console.log('SSE message received:', event.data);
      try {
        const data: SSEMessage = JSON.parse(event.data);
        console.log('Parsed SSE data:', data);
        
        if (data.progress) {
          setProgress(data.progress);
        }
        setIsSearching(data.isSearching);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setIsConnected(false);
      setProgress(null);
      setIsSearching(false);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('Disconnecting SSE...');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    progress,
    isSearching,
    connect,
    disconnect,
  };
} 