
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { logger } from './utils/logger';
import { performanceMonitor } from './utils/performanceMonitor';

// Log application startup
logger.info('🚀 Anchor Security Dashboard starting...', {
  version: '1.0.0',
  environment: import.meta.env.VITE_APP_ENV || 'development',
});

// Start performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.mark('app-init-start');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Log when app is fully rendered
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.mark('app-init-end');
    performanceMonitor.measure('app-initialization', 'app-init-start', 'app-init-end');
    logger.info('✅ Application fully loaded');
  });
}
