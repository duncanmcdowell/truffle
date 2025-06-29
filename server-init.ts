// Server initialization - this should be imported early in the application lifecycle
import { initializeScheduler } from './scheduler';

// Initialize the hourly scheduler if scheduled search is enabled
initializeScheduler();

console.log('Server initialization complete'); 