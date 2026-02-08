import React, { useState, useEffect } from 'react';
import { env } from '../config/env';

interface UsageData {
  projects: { used: number; limit: number };
  scans: { used: number; limit: number };
  teamMembers: { used: number; limit: number };
  aiQueries: { used: number; limit: number };
}

interface SubscriptionData {
  id: string;
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID';
  planTier: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface BillingDashboardProps {
  onUpgrade?: () => void;
  onManageBilling?: () => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  onUpgrade,
  onManageBilling,
}) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [planName, setPlanName] = useState('Starter');
  const [isTrialing, setIsTrialing] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchBillingData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('anchor_auth_token');
      const [subResponse, usageResponse] = await Promise.all([
        fetch(`${env.apiBaseUrl}/billing/subscription`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${env.apiBaseUrl}/billing/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!subResponse.ok || !usageResponse.ok) {
        throw new Error('Failed to load billing information');
      }

      const subData = await subResponse.json();
      const usageData = await usageResponse.json();

      setSubscription(subData.subscription);
      setPlanName(subData.plan?.name || 'Starter');
      setIsTrialing(subData.isTrialing);
      setTrialDaysRemaining(subData.trialDaysRemaining || 0);
      setUsage(usageData.usage);
    } catch (err) {
      console.error('Failed to fetch billing data:', err);
      setError('Unable to load billing data. Showing default plan info.');
      // Set defaults so the UI still renders
      setPlanName('Starter');
      setIsTrialing(true);
      setTrialDaysRemaining(14);
    } finally {
      setLoading(false);
    }
  };

  const hasStripeAccount = subscription?.id && subscription.status !== 'TRIALING';

  const openBillingPortal = async () => {
    // If no active subscription/Stripe customer, redirect to pricing
    if (!hasStripeAccount) {
      showNotification('info', 'Set up a paid plan first to manage billing.');
      if (onUpgrade) {
        setTimeout(() => onUpgrade(), 800);
      }
      return;
    }

    setPortalLoading(true);
    try {
      const token = localStorage.getItem('anchor_auth_token');
      if (!token) {
        showNotification('error', 'Please log in to manage billing.');
        return;
      }

      const response = await fetch(`${env.apiBaseUrl}/billing/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error || '';
        // If no billing account, redirect to pricing page
        if (response.status === 400 && errMsg.includes('No billing account')) {
          showNotification('info', 'No billing account found. Choose a plan to get started.');
          if (onUpgrade) {
            setTimeout(() => onUpgrade(), 800);
          }
          return;
        }
        throw new Error(errMsg || 'Unable to open billing portal');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      console.error('Failed to open billing portal:', err);
      showNotification('error', err instanceof Error ? err.message : 'Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleManageBilling = () => {
    if (onManageBilling) {
      onManageBilling();
    } else {
      openBillingPortal();
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      TRIALING: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Trial' },
      ACTIVE: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
      PAST_DUE: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Past Due' },
      CANCELED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Canceled' },
      UNPAID: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Unpaid' },
    };

    const badge = badges[status] || badges.ACTIVE;
    return (
      <span className={`${badge.bg} ${badge.text} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
        {badge.label}
      </span>
    );
  };

  const UsageBar: React.FC<{ used: number; limit: number; label: string }> = ({
    used,
    limit,
    label,
  }) => {
    const percentage = limit === -1 ? 0 : Math.min((used / limit) * 100, 100);
    const isUnlimited = limit === -1;
    const isWarning = percentage >= 80;
    const isCritical = percentage >= 95;

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-400">{label}</span>
          <span className="text-sm text-gray-300">
            {used.toLocaleString()} / {isUnlimited ? '∞' : limit.toLocaleString()}
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isCritical
                ? 'bg-red-500'
                : isWarning
                ? 'bg-yellow-500'
                : 'bg-cyan-500'
            }`}
            style={{ width: isUnlimited ? '5%' : `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3 mb-6"></div>
        <div className="space-y-3">
          <div className="h-2 bg-gray-700 rounded"></div>
          <div className="h-2 bg-gray-700 rounded"></div>
          <div className="h-2 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border animate-in fade-in slide-in-from-top-2 ${
          notification.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-200' :
          notification.type === 'success' ? 'bg-green-900/90 border-green-500/50 text-green-200' :
          'bg-blue-900/90 border-blue-500/50 text-blue-200'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {notification.type === 'error' && (
                <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'success' && (
                <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <p className="text-sm">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white" title="Dismiss notification">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-yellow-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-yellow-300 text-sm">{error}</p>
          <button
            onClick={fetchBillingData}
            className="ml-auto text-yellow-400 hover:text-yellow-300 text-sm font-medium whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {/* Trial Banner */}
      {isTrialing && (
        <div className="bg-linear-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 rounded-full p-2">
              <svg
                className="w-5 h-5 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">
                {trialDaysRemaining} days left in your trial
              </p>
              <p className="text-gray-400 text-sm">
                Upgrade now to keep access to all features
              </p>
            </div>
          </div>
          <button
            onClick={() => onUpgrade?.()}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Past Due Warning */}
      {subscription?.status === 'PAST_DUE' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 rounded-full p-2">
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Payment failed</p>
              <p className="text-gray-400 text-sm">
                Please update your payment method to continue using Anchor
              </p>
            </div>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {portalLoading ? 'Loading...' : 'Update Payment'}
          </button>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              {planName} Plan
              {subscription && getStatusBadge(subscription.status)}
            </h2>
            {subscription?.currentPeriodEnd && (
              <p className="text-gray-400 text-sm mt-1">
                {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="text-gray-400 hover:text-white px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {portalLoading ? 'Loading...' : 'Manage Billing'}
            </button>
            <button
              onClick={() => onUpgrade?.()}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Usage Stats */}
        {usage && (
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Current Usage</h3>
            <div className="grid md:grid-cols-2 gap-x-8">
              <UsageBar
                used={usage.projects.used}
                limit={usage.projects.limit}
                label="Projects"
              />
              <UsageBar
                used={usage.scans.used}
                limit={usage.scans.limit}
                label="Scans this month"
              />
              <UsageBar
                used={usage.teamMembers.used}
                limit={usage.teamMembers.limit}
                label="Team members"
              />
              <UsageBar
                used={usage.aiQueries.used}
                limit={usage.aiQueries.limit}
                label="AI queries this month"
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={handleManageBilling}
          disabled={portalLoading}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gray-700 rounded-lg p-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <span className="text-white font-medium">Payment Methods</span>
          </div>
          <p className="text-gray-400 text-sm">
            {hasStripeAccount ? 'Update or add payment methods' : 'Set up a plan to add payment methods'}
          </p>
        </button>

        <button
          onClick={handleManageBilling}
          disabled={portalLoading}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gray-700 rounded-lg p-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-white font-medium">Invoices</span>
          </div>
          <p className="text-gray-400 text-sm">
            {hasStripeAccount ? 'View and download past invoices' : 'Invoices available after first payment'}
          </p>
        </button>

        <button
          onClick={() => onUpgrade?.()}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gray-700 rounded-lg p-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-white font-medium">Compare Plans</span>
          </div>
          <p className="text-gray-400 text-sm">See all features and pricing</p>
        </button>
      </div>
    </div>
  );
};

export default BillingDashboard;
