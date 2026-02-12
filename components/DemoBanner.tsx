import React from 'react';

interface DemoBannerProps {
  className?: string;
}

/**
 * A prominent banner that displays when the user is in demo mode.
 * Shows important information about demo limitations.
 */
export const DemoBanner: React.FC<DemoBannerProps> = ({ className = '' }) => {
  return (
    <div className={`bg-linear-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 bg-amber-500/30 rounded-full flex items-center justify-center">
          <span className="text-xl">🎭</span>
        </div>
        <div className="flex-1">
          <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            Demo Mode Active
            <span className="px-2 py-0.5 bg-amber-500/30 rounded text-xs">Preview Only</span>
          </h3>
          <p className="text-amber-200/80 text-sm mt-1">
            You&apos;re exploring Anchor AI Guard in demo mode. All data shown is simulated, and any API keys generated are <strong className="text-amber-300">for demonstration purposes only</strong> — they will not work in production integrations.
          </p>
          <div className="flex items-center gap-4 mt-3">
            <a
              href="https://anchoraiguard.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-amber-400 hover:text-amber-300 underline underline-offset-2"
            >
              Create a real account →
            </a>
            <a
              href="https://anchoraiguard.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-gray-400 hover:text-gray-300"
            >
              View pricing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact inline demo mode indicator for use in headers or tight spaces.
 */
export const DemoModeIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded text-xs font-medium text-amber-400 ${className}`}>
      <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
      Demo Mode
    </div>
  );
};

/**
 * Warning box specifically for API key generation in demo mode.
 */
export const DemoAPIKeyWarning: React.FC = () => {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <h4 className="text-red-400 font-semibold text-sm">Demo API Keys Are Not Functional</h4>
          <p className="text-red-300/80 text-xs mt-1">
            API keys generated in demo mode are simulated and <strong>cannot be used for real integrations</strong>. 
            To get working API keys for your production environment, please{' '}
            <a href="https://anchoraiguard.com/signup" className="underline hover:text-red-200">
              create a real account
            </a>{' '}
            and subscribe to a plan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
