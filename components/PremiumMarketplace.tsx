import React, { useState } from 'react';
import { PREMIUM_ADDONS, PremiumAddon, formatPrice, getAddonsByCategory } from './FeatureGate';

interface PremiumMarketplaceProps {
  currentTier?: string;
  purchasedAddons?: string[];
  onPurchase?: (addonId: string) => void;
}

type CategoryFilter = 'all' | PremiumAddon['category'];

export const PremiumMarketplace: React.FC<PremiumMarketplaceProps> = ({
  currentTier = 'starter',
  purchasedAddons = [],
  onPurchase,
}) => {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [expandedAddon, setExpandedAddon] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<string[]>([]);

  const categories: { key: CategoryFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All Add-Ons', count: PREMIUM_ADDONS.length },
    { key: 'world-first', label: '🌟 World-First Modules', count: getAddonsByCategory('world-first').length },
    { key: 'compliance', label: '📋 Compliance Packs', count: getAddonsByCategory('compliance').length },
    { key: 'threat-intel', label: '🧠 Threat Intel Feeds', count: getAddonsByCategory('threat-intel').length },
    { key: 'managed-service', label: '🛡️ Managed Services', count: getAddonsByCategory('managed-service').length },
  ];

  const filteredAddons = category === 'all' ? PREMIUM_ADDONS : getAddonsByCategory(category);

  const handlePurchase = (addonId: string) => {
    setPurchaseStatus(prev => ({ ...prev, [addonId]: 'processing' }));
    setTimeout(() => {
      setPurchaseStatus(prev => ({ ...prev, [addonId]: 'success' }));
      onPurchase?.(addonId);
      setTimeout(() => {
        setPurchaseStatus(prev => ({ ...prev, [addonId]: '' }));
      }, 3000);
    }, 2000);
  };

  const toggleCart = (addonId: string) => {
    setCart(prev => prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]);
  };

  const cartTotal = cart.reduce((sum, id) => {
    const addon = PREMIUM_ADDONS.find(a => a.id === id);
    if (!addon) return sum;
    return sum + (billingCycle === 'annual' ? addon.annualPrice / 12 : addon.price);
  }, 0);

  const cartAnnualTotal = cart.reduce((sum, id) => {
    const addon = PREMIUM_ADDONS.find(a => a.id === id);
    if (!addon) return sum;
    return sum + addon.annualPrice;
  }, 0);

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'pro': return 'bg-blue-500/20 text-blue-400';
      case 'team': return 'bg-purple-500/20 text-purple-400';
      case 'business': return 'bg-orange-500/20 text-orange-400';
      case 'enterprise': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🏪</span>
              Premium Add-On Marketplace
            </h2>
            <p className="text-gray-400 mt-1">
              Unlock world-first security capabilities, compliance automation, and threat intelligence feeds
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual
              <span className="ml-1 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Revenue stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { label: 'World-First Modules', value: '10', sub: 'Industry exclusives' },
            { label: 'Compliance Frameworks', value: '7+', sub: 'SOC 2, HIPAA, PCI, ISO...' },
            { label: 'Threat Intel Feeds', value: '5', sub: 'Including predictive CVE' },
            { label: 'Managed SOC Tiers', value: '3', sub: 'Lite to Elite' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-cyan-400">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              category === cat.key
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600'
            }`}
          >
            {cat.label}
            <span className="ml-2 text-xs opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Cart summary */}
      {cart.length > 0 && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🛒</span>
              <div>
                <span className="text-white font-medium">{cart.length} add-on{cart.length > 1 ? 's' : ''} selected</span>
                <span className="text-gray-400 text-sm ml-3">
                  {billingCycle === 'annual'
                    ? `${formatPrice(cartAnnualTotal)}/yr (${formatPrice(Math.round(cartAnnualTotal / 12))}/mo effective)`
                    : `${formatPrice(cartTotal)}/mo`}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCart([])}
                className="text-gray-400 hover:text-white text-sm cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => cart.forEach(id => handlePurchase(id))}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-cyan-500/25 cursor-pointer hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                Purchase Bundle — {billingCycle === 'annual' ? `${formatPrice(cartAnnualTotal)}/yr` : `${formatPrice(cartTotal)}/mo`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add-on grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAddons.map(addon => {
          const isPurchased = purchasedAddons.includes(addon.id);
          const isInCart = cart.includes(addon.id);
          const status = purchaseStatus[addon.id];
          const isExpanded = expandedAddon === addon.id;
          const price = billingCycle === 'annual' ? Math.round(addon.annualPrice / 12) : addon.price;
          const fullPrice = billingCycle === 'annual' ? addon.annualPrice : addon.price * 12;

          return (
            <div
              key={addon.id}
              className={`bg-gray-800 rounded-xl border transition-all hover:shadow-lg ${
                isPurchased
                  ? 'border-green-500/30 shadow-green-500/5'
                  : isInCart
                  ? 'border-cyan-500/50 shadow-cyan-500/10'
                  : addon.isPopular
                  ? 'border-cyan-500/30'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="p-5">
                {/* Header badges */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{addon.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{addon.name}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTierBadgeColor(addon.tier)}`}>
                        {addon.tier.charAt(0).toUpperCase() + addon.tier.slice(1)}+
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {addon.isNew && (
                      <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
                    )}
                    {addon.isPopular && (
                      <span className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full">POPULAR</span>
                    )}
                    {isPurchased && (
                      <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{addon.description}</p>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-2xl font-bold text-white">{formatPrice(price)}</span>
                  <span className="text-gray-400 text-sm">/mo</span>
                  {billingCycle === 'annual' && (
                    <div className="text-xs text-gray-500">
                      {formatPrice(fullPrice)}/yr • Save {formatPrice(addon.price * 12 - addon.annualPrice)}/yr
                    </div>
                  )}
                  {billingCycle === 'monthly' && (
                    <div className="text-xs text-gray-500">
                      {formatPrice(addon.price * 12)}/yr billed monthly
                    </div>
                  )}
                </div>

                {/* Features (expandable) */}
                <div className="mb-4">
                  {addon.features.slice(0, isExpanded ? addon.features.length : 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 py-0.5">
                      <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300 text-xs">{f}</span>
                    </div>
                  ))}
                  {addon.features.length > 3 && (
                    <button
                      onClick={() => setExpandedAddon(isExpanded ? null : addon.id)}
                      className="text-cyan-400 text-xs mt-1 hover:text-cyan-300 cursor-pointer"
                    >
                      {isExpanded ? '▲ Less' : `▼ +${addon.features.length - 3} more`}
                    </button>
                  )}
                </div>

                {/* Actions */}
                {isPurchased ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Active — Included in your plan
                  </div>
                ) : status === 'processing' ? (
                  <button disabled className="w-full bg-cyan-500/20 text-cyan-400 py-2 rounded-lg text-sm font-medium">
                    ⏳ Processing...
                  </button>
                ) : status === 'success' ? (
                  <button disabled className="w-full bg-green-500/20 text-green-400 py-2 rounded-lg text-sm font-medium">
                    ✓ Activated!
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleCart(addon.id)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        isInCart
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      }`}
                    >
                      {isInCart ? '✓ In Cart' : '+ Add to Cart'}
                    </button>
                    <button
                      onClick={() => handlePurchase(addon.id)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise CTA */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 border border-purple-500/20 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Need Everything?</h3>
        <p className="text-gray-400 max-w-2xl mx-auto mb-4">
          Enterprise and Enterprise+ plans include all world-first modules, compliance packs, and threat intelligence feeds.
          Government plans add air-gapped deployment, FedRAMP authorization, and nation-state defense capabilities.
        </p>
        <div className="flex justify-center gap-6 mb-6">
          {[
            { tier: 'Enterprise', price: '$5M-$10M/yr', features: 'All modules + on-prem + custom AI' },
            { tier: 'Enterprise+', price: '$10M-$25M/yr', features: 'Multi-region + white-label + unlimited API' },
            { tier: 'Government', price: '$25M-$75M+/yr', features: 'Air-gap + FedRAMP + nation-state defense' },
          ].map((plan, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4 min-w-[200px]">
              <div className="text-white font-semibold">{plan.tier}</div>
              <div className="text-cyan-400 font-bold text-lg">{plan.price}</div>
              <div className="text-gray-500 text-xs mt-1">{plan.features}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => window.open('mailto:enterprise@anchor.security?subject=Enterprise%20Inquiry', '_blank')}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-purple-500/25 cursor-pointer"
        >
          Contact Enterprise Sales
        </button>
      </div>

      {/* Total potential revenue highlight */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500">World-First Modules</div>
            <div className="text-sm font-bold text-cyan-400">{formatPrice(getAddonsByCategory('world-first').reduce((s, a) => s + a.price, 0))}/mo</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">All Compliance</div>
            <div className="text-sm font-bold text-purple-400">{formatPrice(25000)}/mo</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">All Threat Intel</div>
            <div className="text-sm font-bold text-orange-400">{formatPrice(75000)}/mo</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Managed SOC Elite</div>
            <div className="text-sm font-bold text-red-400">{formatPrice(200000)}/mo</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumMarketplace;
