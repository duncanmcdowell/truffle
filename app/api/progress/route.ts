import { NextRequest } from 'next/server';

export const runtime = 'edge';

// In-memory store (will be per-instance, but works for demo)
let progressStore: {
  currentProgress: unknown;
  isSearching: boolean;
} = {
  currentProgress: null,
  isSearching: false,
};

// Store active SSE controllers with error handling
let activeControllers: ReadableStreamDefaultController[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'stream') {
    // SSE endpoint for progress streaming
    const stream = new ReadableStream({
      start(controller) {
        const sendProgress = () => {
          try {
            const data = JSON.stringify({
              progress: progressStore.currentProgress,
              isSearching: progressStore.isSearching,
            });
            controller.enqueue(`data: ${data}\n\n`);
          } catch (error: unknown) {
            console.error('Error sending SSE data:', error);
            // Remove this controller from active list if it fails
            const index = activeControllers.indexOf(controller);
            if (index > -1) {
              activeControllers.splice(index, 1);
            }
          }
        };

        // Add controller to active list
        activeControllers.push(controller);

        // Send initial state
        sendProgress();

        // Clean up on close
        return () => {
          const index = activeControllers.indexOf(controller);
          if (index > -1) {
            activeControllers.splice(index, 1);
          }
        };
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // Regular GET for current progress
  return Response.json({
    progress: progressStore.currentProgress,
    isSearching: progressStore.isSearching,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  console.log('Progress update received:', body);
  
  progressStore = {
    ...progressStore,
    ...body,
  };

  // Notify all active SSE connections
  const data = JSON.stringify({
    progress: progressStore.currentProgress,
    isSearching: progressStore.isSearching,
  });

  console.log('Sending SSE data to', activeControllers.length, 'controllers:', data);

  // Send to all active controllers and remove failed ones
  const validControllers: ReadableStreamDefaultController[] = [];
  
  for (const controller of activeControllers) {
    try {
      controller.enqueue(`data: ${data}\n\n`);
      validControllers.push(controller);
    } catch (error) {
      console.error('Error sending to SSE controller:', error);
      // Don't add failed controllers back to the list
    }
  }
  
  activeControllers = validControllers;
  console.log('Active controllers after update:', activeControllers.length);

  return Response.json({ success: true });
} 