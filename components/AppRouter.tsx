import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<App />} />
          <Route path="/login" element={<App />} />
          <Route path="/signup" element={<App />} />
          <Route path="/forgot-password" element={<App />} />
          <Route path="/pricing" element={<App />} />
          <Route path="/government" element={<App />} />
          
          {/* Dashboard routes - all handled by App's internal switch */}
          <Route path="/dashboard/*" element={<App />} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
