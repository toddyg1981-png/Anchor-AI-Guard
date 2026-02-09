import React, { useState } from 'react';
import { PRODUCT_PILLARS, PILLAR_STATS, type ProductPillar } from './PillarData';

// ═══════════════════════════════════════════════════════════════════════════════
// PILLAR PRICING — Groups all pricing by pillar with per-pillar tiers
// Replaces flat 8-tier grid with pillar-organized purchasing
// ═══════════════════════════════════════════════════════════════════════════════

interface PillarPricingProps {
  onSelectPlan?: (pillarId: string, tierName: string) => void;
  onBack?: () => void;
  onGetStarted?: () => void;
}

const PillarPricing: React.FC<PillarPricingProps> = ({ onSelectPlan, onBack, onGetStarted }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [activePillar, setActivePillar] = useState<string>(PRODUCT_PILLARS[0].id);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSelect = (pillar: ProductPillar, tierName: string) => {
    if (onSelectPlan) {
      onSelectPlan(pillar.id, tierName);
    } else if (tierName === 'Enterprise' || tierName === 'Government') {
      window.open('mailto:sales@anchoraiguard.com?subject=' + encodeURIComponent(`${pillar.name} - ${tierName} Inquiry`), '_blank');
      showNotification('info', 'Opening email client...');
    } else if (onGetStarted) {
      onGetStarted();
    }
  };

  const currentPillar = PRODUCT_PILLARS.find(p => p.id === activePillar) || PRODUCT_PILLARS[0];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-[#0a0f1e] to-slate-950 text-white">
      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm shadow-lg animate-in slide-in-from-right">
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Pricing by{' '}
              <span className="bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Product Pillar
              </span>
            </h1>
            <p className="text-xl text-purple-300 max-w-2xl mx-auto mb-8">
              Buy exactly what you need. Scale pillar by pillar. Bundle for maximum savings.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 bg-slate-800/50 rounded-full p-1.5 border border-slate-700/50">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'monthly' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'yearly' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly <span className="text-green-400 text-xs ml-1">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Pillar Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {PRODUCT_PILLARS.map((pillar) => (
              <button
                key={pillar.id}
                onClick={() => setActivePillar(pillar.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activePillar === pillar.id
                    ? `bg-linear-to-r ${pillar.color} text-white shadow-lg`
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/30'
                }`}
              >
                <span>{pillar.icon}</span>
                <span>{pillar.name}</span>
                <span className="text-xs opacity-70">({pillar.modules.length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Pillar Pricing */}
      <div className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Pillar Info Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 px-6 py-5 rounded-2xl bg-linear-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/30">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${currentPillar.color} flex items-center justify-center text-2xl`}>
                {currentPillar.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{currentPillar.name}</h2>
                <p className="text-sm text-slate-400">{currentPillar.tagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div><span className="text-white font-semibold">{currentPillar.modules.length}</span> <span className="text-slate-400">modules</span></div>
              {currentPillar.worldFirstCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-amber-400 font-semibold">🏆 {currentPillar.worldFirstCount}</span>
                  <span className="text-slate-400">world firsts</span>
                </div>
              )}
              <div><span className={currentPillar.accent}>TAM:</span> <span className="text-white font-semibold">{currentPillar.tam}</span></div>
            </div>
          </div>

          {/* Tier Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {currentPillar.pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-6 transition-all hover:-translate-y-1 ${
                  tier.highlight
                    ? `bg-linear-to-br from-slate-800/80 to-slate-900/80 border-2 border-pink-500/50 shadow-lg shadow-pink-500/10`
                    : 'bg-slate-900/50 border border-slate-700/30 hover:border-slate-600/60'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-pink-500 to-purple-500 px-4 py-1 rounded-full text-xs font-bold text-white">
                    MOST POPULAR
                  </div>
                )}

                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                <div className="mb-5">
                  <span className={`text-3xl font-bold ${tier.highlight ? 'text-pink-400' : 'text-cyan-400'}`}>
                    {tier.price === 'Custom' ? 'Custom' : (billingPeriod === 'yearly' && tier.price !== '$0' ? tier.price : tier.price)}
                  </span>
                  {tier.period && <span className="text-slate-400 text-sm">{tier.period}</span>}
                  {billingPeriod === 'yearly' && tier.price !== 'Custom' && tier.price !== '$0' && (
                    <div className="text-xs text-green-400 mt-1">Save 20% with annual billing</div>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 ${feature.startsWith('🏆') ? 'text-amber-400' : 'text-green-400'}`}>
                        {feature.startsWith('🏆') ? '' : '✓'}
                      </span>
                      <span className={feature.startsWith('🏆') ? 'text-amber-300 font-medium' : 'text-slate-300'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(currentPillar, tier.name)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    tier.highlight
                      ? 'bg-linear-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                      : tier.price === 'Custom'
                      ? 'border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500'
                      : `border border-slate-600 text-white hover:bg-linear-to-r hover:${currentPillar.color} hover:border-transparent`
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Module List for Active Pillar */}
          <div className="rounded-2xl bg-slate-900/50 border border-slate-700/30 p-8">
            <h3 className="text-lg font-bold text-white mb-6">All {currentPillar.name} Modules</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentPillar.modules.map((mod) => (
                <div
                  key={mod.name}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${
                    mod.worldFirst
                      ? 'bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/50'
                      : 'bg-slate-800/40 border border-slate-700/20 hover:border-slate-600/40'
                  }`}
                >
                  <span className="text-lg">{mod.icon}</span>
                  <div className="min-w-0">
                    <span className={`text-sm font-medium block truncate ${mod.worldFirst ? 'text-amber-300' : 'text-white'}`}>
                      {mod.name}
                    </span>
                    {mod.worldFirst && <span className="text-[9px] font-bold text-amber-500">WORLD FIRST</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bundle CTA */}
      <div className="px-4 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl bg-linear-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30 p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Bundle All 5 Pillars & Save 40%</h2>
            <p className="text-purple-300 mb-2 text-lg">
              Get the complete Anchor platform — all {PILLAR_STATS.totalModules} modules, {PILLAR_STATS.totalWorldFirsts} world-firsts — at the best price.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8 mb-8">
              <div className="text-center">
                <div className="text-sm text-slate-400 line-through">$89,950/mo individually</div>
                <div className="text-4xl font-bold text-pink-400">$49,990<span className="text-lg text-purple-400">/mo</span></div>
                <div className="text-sm text-green-400">Save $479,520/year</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-3 rounded-xl bg-linear-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-xl shadow-purple-500/25"
              >
                Start 14-Day Free Trial
              </button>
              <button
                onClick={() => {
                  window.open('mailto:sales@anchoraiguard.com?subject=Enterprise%20Bundle%20Inquiry', '_blank');
                }}
                className="px-8 py-3 rounded-xl border border-purple-500/50 text-purple-300 hover:text-white hover:border-purple-400 transition-colors"
              >
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise & Government Row */}
      <div className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-linear-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-8">
              <h3 className="text-xl font-bold text-white mb-2">🏢 Enterprise</h3>
              <div className="text-2xl font-bold text-cyan-400 mb-3">$5M – $10M<span className="text-sm text-slate-400">/year</span></div>
              <p className="text-slate-400 text-sm mb-4">For 100–500 developers. All modules, on-premise, custom AI.</p>
              <button
                onClick={() => window.open('mailto:sales@anchoraiguard.com?subject=Enterprise%20Inquiry', '_blank')}
                className="w-full py-2 rounded-lg border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition-colors text-sm"
              >
                Contact Sales
              </button>
            </div>
            <div className="rounded-2xl bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-8">
              <h3 className="text-xl font-bold text-white mb-2">🏢 Enterprise+</h3>
              <div className="text-2xl font-bold text-purple-400 mb-3">$10M – $25M<span className="text-sm text-slate-400">/year</span></div>
              <p className="text-slate-400 text-sm mb-4">For 500–2000+ developers. Multi-region, white-label, custom APIs.</p>
              <button
                onClick={() => window.open('mailto:sales@anchoraiguard.com?subject=Enterprise+%20Inquiry', '_blank')}
                className="w-full py-2 rounded-lg border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 transition-colors text-sm"
              >
                Contact Sales
              </button>
            </div>
            <div className="rounded-2xl bg-linear-to-br from-red-500/10 to-amber-500/10 border border-red-500/30 p-8">
              <h3 className="text-xl font-bold text-white mb-2">🏛️ Government & Defense</h3>
              <div className="text-2xl font-bold text-red-400 mb-3">$25M – $75M+<span className="text-sm text-slate-400">/year</span></div>
              <p className="text-slate-400 text-sm mb-4">Federal, state & defense. FedRAMP, CMMC, TS/SCI, air-gapped.</p>
              <button
                onClick={() => window.open('mailto:sales@anchoraiguard.com?subject=Government%20Inquiry', '_blank')}
                className="w-full py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PillarPricing;
