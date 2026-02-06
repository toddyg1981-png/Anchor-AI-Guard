import React, { useState, useEffect } from 'react';
import { env } from '../config/env';

interface Plan {
  tier: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceFormatted: string;
  yearlyPriceFormatted: string;
  yearlySavings: string;
  maxProjects: number;
  maxScansPerMonth: number;
  maxTeamMembers: number;
  maxAIQueries: number;
  features: string[];
  highlight?: string;
}

interface PricingPageProps {
  onSelectPlan?: (tier: string) => void;
  onBack?: () => void;
  currentPlan?: string;
  isAuthenticated?: boolean;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onSelectPlan,
  onBack,
  currentPlan,
  isAuthenticated = false,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);

  useEffect(() => {
    fetchPlans();
    // Generate a referral code for the user
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'ANC-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setReferralCode(code);
    };
    generateCode();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${env.apiBaseUrl}/billing/plans`);
      const data = await response.json();
      setPlans(data.plans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      // WORLD-FIRST PRICING - Premium for 86 modules & 12 world-first features
      setPlans([
        {
          tier: 'FREE',
          name: 'Free',
          monthlyPrice: 0,
          yearlyPrice: 0,
          monthlyPriceFormatted: '$0',
          yearlyPriceFormatted: '$0',
          yearlySavings: '$0',
          maxProjects: 1,
          maxScansPerMonth: 5,
          maxTeamMembers: 1,
          maxAIQueries: 10,
          features: [
            '1 project',
            '5 scans/month',
            '10 AI queries/month',
            'Basic vulnerability scanning',
            'GitHub integration',
            'Community support',
          ],
          highlight: 'Try before you buy',
        },
        {
          tier: 'STARTER',
          name: 'Starter',
          monthlyPrice: 4900,
          yearlyPrice: 47000,
          monthlyPriceFormatted: '$49',
          yearlyPriceFormatted: '$470',
          yearlySavings: '$118',
          maxProjects: 3,
          maxScansPerMonth: 50,
          maxTeamMembers: 1,
          maxAIQueries: 100,
          features: [
            '3 projects',
            '50 scans/month',
            '100 AI queries/month',
            'All vulnerability scanners',
            'AI Security Chat',
            'Email support',
            'Export reports (PDF)',
            'Security score badge',
          ],
          highlight: 'For indie developers',
        },
        {
          tier: 'PRO',
          name: 'Pro',
          monthlyPrice: 19900,
          yearlyPrice: 191000,
          monthlyPriceFormatted: '$199',
          yearlyPriceFormatted: '$1,910',
          yearlySavings: '$478',
          maxProjects: 10,
          maxScansPerMonth: 250,
          maxTeamMembers: 3,
          maxAIQueries: 1000,
          features: [
            '10 projects',
            '250 scans/month',
            '1,000 AI queries/month',
            '3 team members',
            '🔮 Predictive CVE Intelligence (WORLD FIRST)',
            '🔧 AI Auto-Fix with 1-click PRs',
            '🗺️ Attack Path Visualization',
            '🛡️ Threat Hunting Module',
            'API access',
            'Priority email support',
            'Slack integration',
          ],
          highlight: 'Most popular - World-first AI features',
        },
        {
          tier: 'TEAM',
          name: 'Team',
          monthlyPrice: 59900,
          yearlyPrice: 575000,
          monthlyPriceFormatted: '$599',
          yearlyPriceFormatted: '$5,750',
          yearlySavings: '$1,438',
          maxProjects: 50,
          maxScansPerMonth: 1500,
          maxTeamMembers: 15,
          maxAIQueries: 7500,
          features: [
            '50 projects',
            '1,500 scans/month',
            '7,500 AI queries/month',
            '15 team members',
            '👥 Real-time Collaboration (WORLD FIRST)',
            '🪞 Digital Twin Security (WORLD FIRST)',
            '🤖 Autonomous SOC Access',
            'All Pro features included',
            'Team dashboard & analytics',
            'Role-based access control',
            'Full audit logs',
            'Jira & GitHub integration',
            'Priority support',
          ],
          highlight: 'Full platform access for teams',
        },
        {
          tier: 'BUSINESS',
          name: 'Business',
          monthlyPrice: 199900,
          yearlyPrice: 1919000,
          monthlyPriceFormatted: '$1,999',
          yearlyPriceFormatted: '$19,190',
          yearlySavings: '$4,798',
          maxProjects: 200,
          maxScansPerMonth: 10000,
          maxTeamMembers: 75,
          maxAIQueries: 50000,
          features: [
            '200 projects',
            '10,000 scans/month',
            '50,000 AI queries/month',
            '75 team members',
            '📊 All 86 Security Modules',
            '🔐 SSO/SAML authentication',
            '🏥 Cyber Insurance Integration (WORLD FIRST)',
            '⛓️ Supply Chain Attestation (WORLD FIRST)',
            'Custom security rules',
            'Advanced threat analytics',
            'Dedicated CSM',
            'Phone & Slack support',
            '99.9% SLA',
          ],
          highlight: 'Complete security platform',
        },
        {
          tier: 'ENTERPRISE',
          name: 'Enterprise',
          monthlyPrice: 0,
          yearlyPrice: 0,
          monthlyPriceFormatted: 'Custom',
          yearlyPriceFormatted: 'Custom',
          yearlySavings: '',
          maxProjects: -1,
          maxScansPerMonth: -1,
          maxTeamMembers: -1,
          maxAIQueries: -1,
          features: [
            '💰 $100,000 - $250,000/year',
            '🏢 For 100-500 developers',
            'Unlimited everything',
            'On-premise deployment option',
            'Custom AI model training',
            'Dedicated security engineer',
            '24/7/365 phone & Slack support',
            '99.95% SLA guarantee',
            'SOC 2 Type II compliance',
            'Quarterly business reviews',
            'Custom integrations',
          ],
          highlight: 'Enterprise security platform',
        },
        {
          tier: 'ENTERPRISE_PLUS',
          name: 'Enterprise+',
          monthlyPrice: 0,
          yearlyPrice: 0,
          monthlyPriceFormatted: 'Custom',
          yearlyPriceFormatted: 'Custom',
          yearlySavings: '',
          maxProjects: -1,
          maxScansPerMonth: -1,
          maxTeamMembers: -1,
          maxAIQueries: -1,
          features: [
            '💰 $250,000 - $750,000/year',
            '🏢 For 500-2000+ developers',
            'Everything in Enterprise',
            'Multi-region deployment',
            'Custom AI model fine-tuning',
            'White-label licensing available',
            'Dedicated CSM + security team',
            'Custom API development',
            '99.99% SLA guarantee',
            'Priority feature roadmap input',
            'Executive business reviews',
            'On-site training & workshops',
          ],
          highlight: 'Global enterprise scale',
        },
        {
          tier: 'GOVERNMENT',
          name: 'Government & Defense',
          monthlyPrice: 0,
          yearlyPrice: 0,
          monthlyPriceFormatted: 'Custom',
          yearlyPriceFormatted: 'Custom',
          yearlySavings: '',
          maxProjects: -1,
          maxScansPerMonth: -1,
          maxTeamMembers: -1,
          maxAIQueries: -1,
          features: [
            '💰 $750,000 - $3,000,000+/year',
            '🏛️ Federal, State & Defense',
            '🛡️ National Security Module (WORLD FIRST)',
            '🏭 Critical Infrastructure Protection (WORLD FIRST)',
            '🔒 FedRAMP High Ready',
            '🛡️ NIST 800-53 / CMMC Compliant',
            '🇺🇸 ITAR/EAR Compliant',
            'Air-gapped deployment',
            'Classified environment support (TS/SCI)',
            'Security-cleared support staff',
            'Custom threat intelligence feeds',
            'Nation-state threat detection',
            'Dedicated government account team',
          ],
          highlight: 'Nation-state grade security',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (tier: string) => {
    if (onSelectPlan) {
      onSelectPlan(tier);
      return;
    }

    // If not authenticated, redirect to signup
    if (!isAuthenticated) {
      window.location.href = `/signup?plan=${tier}`;
      return;
    }

    // Create Stripe checkout session
    setCheckoutLoading(tier);
    try {
      const token = localStorage.getItem('anchor_auth_token');
      const response = await fetch(`${env.apiBaseUrl}/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planTier: tier.toUpperCase(),
          billingPeriod,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing?checkout=canceled`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        alert('Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getPrice = (plan: Plan) => {
    if (billingPeriod === 'yearly') {
      return Math.round(plan.yearlyPrice / 12 / 100);
    }
    return plan.monthlyPrice / 100;
  };

  const isPopular = (tier: string) => tier === 'PRO';
  const isCurrent = (tier: string) => currentPlan === tier;

  const copyReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${referralCode || 'YOUR_CODE'}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-cyan-400 hover:text-pink-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium mb-4">
            🚀 WORLD-FIRST PREDICTIVE CVE INTELLIGENCE
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-purple-300 max-w-2xl mx-auto">
            The future of security starts here. Get predictive CVE intelligence before vulnerabilities go public.
          </p>
        </div>

        {/* Referral Program Banner */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-cyan-900/40 border border-pink-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-pink-400 mb-1">🎁 Referral Program</h3>
                <p className="text-cyan-300">
                  <span className="font-semibold">Give 1 month free, get 1 month free.</span>
                  <span className="text-purple-300 ml-2">Invite 3 devs → Get Pro free forever!</span>
                </p>
              </div>
              <button
                onClick={() => setShowReferral(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-pink-500/30 whitespace-nowrap"
              >
                Get Your Referral Link
              </button>
            </div>
          </div>
        </div>

        {/* Referral Modal */}
        {showReferral && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full backdrop-blur-xl">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">🎁 Your Referral Program</h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-pink-400 font-semibold mb-1">Give 1 Month Free</p>
                  <p className="text-purple-300 text-sm">Friends you refer get their first month completely free</p>
                </div>
                <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-cyan-400 font-semibold mb-1">Get 1 Month Free</p>
                  <p className="text-purple-300 text-sm">You get a free month for every friend who signs up</p>
                </div>
                <div className="bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border border-pink-500/50 rounded-lg p-4">
                  <p className="text-white font-bold mb-1">🏆 Invite 3 Devs = Pro FREE Forever!</p>
                  <p className="text-cyan-300 text-sm">Get 3 friends on paid plans and unlock Pro for life</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-purple-300 text-sm mb-1 block">Your Referral Link:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.host}/signup?ref=${referralCode || 'YOUR_CODE'}`}
                    readOnly
                    placeholder="Your referral link"
                    aria-label="Your referral link"
                    className="flex-1 bg-black/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-400 text-sm"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowReferral(false)}
                className="w-full py-3 bg-transparent border border-purple-500/50 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-1.5 flex backdrop-blur-sm">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                  : 'text-purple-400 hover:text-cyan-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                  : 'text-purple-400 hover:text-cyan-400'
              }`}
            >
              Yearly
              <span className="text-xs bg-green-500/30 text-green-400 px-2 py-0.5 rounded-full border border-green-500/50">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`relative bg-black/40 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all hover:scale-[1.02] hover:shadow-xl ${
                isPopular(plan.tier)
                  ? 'border-pink-500 shadow-lg shadow-pink-500/30'
                  : isCurrent(plan.tier)
                  ? 'border-green-500 shadow-lg shadow-green-500/30'
                  : plan.tier === 'FREE'
                  ? 'border-cyan-500/50 hover:border-cyan-400'
                  : 'border-purple-500/30 hover:border-purple-400'
              }`}
            >
              {/* Popular Badge */}
              {isPopular(plan.tier) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-pink-500/50">
                    ⭐ MOST POPULAR
                  </span>
                </div>
              )}

              {/* Current Badge */}
              {isCurrent(plan.tier) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    ✓ CURRENT PLAN
                  </span>
                </div>
              )}

              {/* Plan Highlight */}
              {plan.highlight && !isPopular(plan.tier) && !isCurrent(plan.tier) && (
                <div className="text-xs text-purple-400 mb-2 font-medium">{plan.highlight}</div>
              )}

              {/* Plan Name */}
              <h3 className={`text-xl font-bold mb-2 ${
                plan.tier === 'FREE' ? 'text-cyan-400' :
                isPopular(plan.tier) ? 'text-pink-400' :
                'text-purple-300'
              }`}>{plan.name}</h3>

              {/* Price */}
              <div className="mb-6">
                {plan.tier === 'ENTERPRISE' ? (
                  <div>
                    <span className="text-3xl font-bold text-white">Custom</span>
                    <p className="text-sm text-purple-400 mt-1">Contact us for pricing</p>
                  </div>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-white">${getPrice(plan)}</span>
                    <span className="text-purple-400 ml-2">/mo</span>
                    {billingPeriod === 'yearly' && plan.monthlyPrice > 0 && (
                      <p className="text-sm text-green-400 mt-1">
                        Save {plan.yearlySavings}/year
                      </p>
                    )}
                    {plan.tier === 'FREE' && (
                      <p className="text-sm text-cyan-400 mt-1">Free forever</p>
                    )}
                  </>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.tier)}
                disabled={isCurrent(plan.tier) || checkoutLoading === plan.tier}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 mb-6 ${
                  isCurrent(plan.tier) || checkoutLoading === plan.tier
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : plan.tier === 'FREE'
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black shadow-lg shadow-cyan-500/30'
                    : isPopular(plan.tier)
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-lg shadow-pink-500/30'
                    : plan.tier === 'ENTERPRISE'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 text-purple-300'
                }`}
              >
                {checkoutLoading === plan.tier
                  ? 'Loading...'
                  : isCurrent(plan.tier)
                  ? 'Current Plan'
                  : plan.tier === 'FREE'
                  ? 'Start Free'
                  : plan.tier === 'ENTERPRISE'
                  ? 'Contact Sales'
                  : isAuthenticated
                  ? 'Upgrade Now'
                  : 'Start 14-Day Trial'}
              </button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        feature.includes('🔮') || feature.includes('🔧') || feature.includes('👥')
                          ? 'text-pink-400'
                          : 'text-cyan-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className={`text-sm ${
                      feature.includes('🔮') || feature.includes('🔧') || feature.includes('👥')
                        ? 'text-pink-300 font-medium'
                        : 'text-purple-300'
                    }`}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* World-First Features Banner */}
        <div className="mb-16 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">🌟 World-First Features Included</h2>
            <p className="text-purple-300">Technology that doesn&apos;t exist anywhere else</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 border border-cyan-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🔮</div>
              <h3 className="font-bold text-cyan-400 mb-1">Predictive CVE Intelligence</h3>
              <p className="text-sm text-purple-300">Know about vulnerabilities before they&apos;re public</p>
            </div>
            <div className="bg-black/30 border border-pink-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🔧</div>
              <h3 className="font-bold text-pink-400 mb-1">AI Auto-Fix</h3>
              <p className="text-sm text-purple-300">One-click fixes generated by AI</p>
            </div>
            <div className="bg-black/30 border border-purple-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🗺️</div>
              <h3 className="font-bold text-purple-400 mb-1">Attack Path Visualization</h3>
              <p className="text-sm text-purple-300">See exactly how hackers can reach your data</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                What&apos;s included in the free plan?
              </h3>
              <p className="text-purple-300">
                Get 1 project, 10 scans/month, and 25 AI queries to test our platform. Perfect for side projects and evaluation.
              </p>
            </div>
            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-purple-300">
                Yes! Upgrade or downgrade instantly. Changes take effect immediately with prorated billing.
              </p>
            </div>
            <div className="bg-black/40 border border-pink-500/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-pink-400 mb-2">
                How does the referral program work?
              </h3>
              <p className="text-purple-300">
                Share your link, friends get 1 month free. You get 1 month free when they subscribe. Get 3 friends on paid plans = Pro free forever!
              </p>
            </div>
            <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Is there a startup discount?
              </h3>
              <p className="text-purple-300">
                Yes! 50% off the first year for qualifying startups with less than $5M in funding. Contact us to apply.
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-20 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-pink-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">
            Need enterprise-grade security?
          </h2>
          <p className="text-purple-300 mb-6 max-w-xl mx-auto">
            Custom integrations, on-premise deployment, dedicated security engineer, and SOC 2 Type II compliance for large organizations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-pink-500/30">
              Talk to Sales
            </button>
            <button className="bg-transparent border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-3 rounded-lg font-semibold transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>

        {/* Money-back Guarantee */}
        <div className="mt-12 text-center">
          <p className="text-purple-400 text-sm">
            💯 30-day money-back guarantee • 🔒 SOC 2 Type II Compliant • 🌍 GDPR Ready
          </p>
          <p className="text-purple-500 text-xs mt-4">
            By subscribing, you agree to our{' '}
            <a href="/purchase-terms" className="text-cyan-400 hover:text-pink-400 underline">
              Purchase Terms & Conditions
            </a>
            {' '}and{' '}
            <a href="/terms" className="text-cyan-400 hover:text-pink-400 underline">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
