import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service Worker registered', reg))
      .catch((err) => console.error('Service Worker registration failed', err));
  });
}

// Global PWA installation event listener
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome from automatically showing the mini-infobar on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  (window as any).deferredPrompt = e;
  // Dispatch custom event to notify components that the install prompt is available
  window.dispatchEvent(new CustomEvent('pwa-install-prompt-available'));
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
