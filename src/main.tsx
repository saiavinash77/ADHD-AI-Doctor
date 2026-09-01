import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
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

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
// Auth0 SPA needs both domain and clientId. If either is missing, render the
// app without an Auth0Provider so the rest of the UI still works.
const isAuth0Configured =
  typeof auth0Domain === 'string' &&
  auth0Domain.length > 0 &&
  typeof auth0ClientId === 'string' &&
  auth0ClientId.length > 0;

if (!isAuth0Configured) {
  console.warn(
    '[app] VITE_AUTH0_DOMAIN / VITE_AUTH0_CLIENT_ID missing in .env.local. ' +
    'Rendering without auth. Set them to enable sign-in via Auth0.',
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAuth0Configured ? (
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri:
            typeof window !== 'undefined' ? window.location.origin : undefined,
        }}
      >
        <App />
      </Auth0Provider>
    ) : (
      <App />
    )}
  </StrictMode>,
);

