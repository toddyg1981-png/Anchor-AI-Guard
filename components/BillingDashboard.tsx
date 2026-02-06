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
  onManageBilling: _onManageBilling,
}) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [planName, setPlanName] = useState('Starter');
  const [isTrialing, setIsTrialing] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const token = localStorage.getItem('anchor_auth_token');
      const [subResponse, usageResponse] = await Promise.all([
        fetch(`${env.apiBaseUrl}/billing/subscription`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${env.apiBaseUrl}/billing/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const subData = await subResponse.json();
      const usageData = await usageResponse.json();

      setSubscription(subData.subscription);
      setPlanName(subData.plan?.name || 'Starter');
      setIsTrialing(subData.isTrialing);
      setTrialDaysRemaining(subData.trialDaysRemaining || 0);
      setUsage(usageData.usage);
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch(`${env.apiBaseUrl}/billing/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('anchor_auth_token')}`,
        },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    } finally {
      setPortalLoading(false);
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
      {/* Trial Banner */}
      {isTrialing && (
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-xl p-4 flex items-center justify-between">
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
            onClick={onUpgrade}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
            onClick={openBillingPortal}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Update Payment
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
              onClick={openBillingPortal}
              disabled={portalLoading}
              className="text-gray-400 hover:text-white px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors disabled:opacity-50"
            >
              {portalLoading ? 'Loading...' : 'Manage Billing'}
            </button>
            <button
              onClick={onUpgrade}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
          onClick={openBillingPortal}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
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
          <p className="text-gray-400 text-sm">Update or add payment methods</p>
        </button>

        <button
          onClick={openBillingPortal}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
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
          <p className="text-gray-400 text-sm">View and download past invoices</p>
        </button>

        <button
          onClick={onUpgrade}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
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
