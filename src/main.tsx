import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Suppress benign connection & HMR websocket errors when HMR is disabled in development env
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonStr = reason ? String(reason.stack || reason.message || reason) : '';
    if (
      reasonStr.includes('WebSocket') || 
      reasonStr.includes('websocket') || 
      reasonStr.includes('WS') ||
      reasonStr.includes('closed without opened') ||
      reasonStr.includes('failed to connect')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const errorMsg = event.error ? String(event.error.stack || event.error.message || event.error) : '';
    const message = event.message || '';
    if (
      message.includes('WebSocket') || 
      message.includes('websocket') || 
      message.includes('closed without opened') ||
      message.includes('failed to connect') ||
      errorMsg.includes('WebSocket') ||
      errorMsg.includes('websocket') ||
      errorMsg.includes('closed without opened')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);

