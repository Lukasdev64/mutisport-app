import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import ErrorBoundary from './components/common/ErrorBoundary';
import { ReactQueryProvider } from './providers/ReactQueryProvider'; // Assuming this path based on the usage

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ReactQueryProvider>
        <App />
      </ReactQueryProvider>
    </ErrorBoundary>
  </StrictMode>,
)
