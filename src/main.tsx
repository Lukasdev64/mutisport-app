import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ReactQueryProvider } from './providers/ReactQueryProvider'
import ErrorBoundary from './components/common/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';
// Register PWA service worker (production only - OneSignal has its own SW in dev)
if (import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('New version available. Reload to update?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('[PWA] App ready for offline use');
      },
      onRegistered(registration) {
        console.log('[PWA] Service Worker registered:', registration);
      },
      onRegisterError(error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <ReactQueryProvider>
          <App />
        </ReactQueryProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
