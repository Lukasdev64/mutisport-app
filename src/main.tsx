import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ReactQueryProvider } from './providers/ReactQueryProvider'
import ErrorBoundary from './components/common/ErrorBoundary';

import { HelmetProvider } from 'react-helmet-async';

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
