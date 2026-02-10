import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-400">Loading Anchor Security...</p>
    </div>
  </div>
);

// Lazy import the main App component
const App = React.lazy(() => import('../App'));
const StatusPage = React.lazy(() => import('./StatusPage'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* All app routes render the same App component — use a single wildcard
                so React Router never unmounts/remounts App when the URL changes. */}
            <Route path="/status" element={<div className="min-h-screen bg-slate-950"><StatusPage /></div>} />
            <Route path="*" element={<App />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
