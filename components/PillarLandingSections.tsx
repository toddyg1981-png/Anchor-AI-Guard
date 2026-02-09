import React, { useState } from 'react';
import { PRODUCT_PILLARS, PILLAR_STATS } from './PillarData';

// ═══════════════════════════════════════════════════════════════════════════════
// PILLAR LANDING SECTIONS — Replaces the flat feature grid on MarketingLanding
// Each pillar gets its own visual section with modules, world-first badges, CTAs
// ═══════════════════════════════════════════════════════════════════════════════

interface PillarLandingSectionsProps {
  onViewPricing?: () => void;
  onGetStarted?: () => void;
}

const PillarLandingSections: React.FC<PillarLandingSectionsProps> = ({ onViewPricing, onGetStarted }) => {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  return (
    <section id="pillars" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-cyan-500/10 to-pink-500/10 border border-cyan-500/20 rounded-full px-5 py-2 mb-6">
            <span className="text-cyan-400 text-sm font-semibold">5 PRODUCT PILLARS</span>
            <span className="text-slate-500">•</span>
            <span className="text-pink-400 text-sm font-semibold">{PILLAR_STATS.totalModules} MODULES</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 text-sm font-semibold">{PILLAR_STATS.totalWorldFirsts} WORLD FIRSTS</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            One Platform.{' '}
            <span className="bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Five Pillars.
            </span>
          </h2>
          <p className="text-xl text-purple-300 max-w-3xl mx-auto">
            Every layer of cybersecurity — from endpoint to boardroom — unified under five cohesive product pillars. 
            No gaps. No bolt-ons. No vendor sprawl.
          </p>
        </div>

        {/* Pillar Cards */}
        <div className="space-y-8">
          {PRODUCT_PILLARS.map((pillar, index) => {
            const isExpanded = expandedPillar === pillar.id;
            const worldFirstModules = pillar.modules.filter(m => m.worldFirst);
            const regularModules = pillar.modules.filter(m => !m.worldFirst);
            const isEven = index % 2 === 0;

            return (
              <div
                key={pillar.id}
                className={`relative rounded-3xl border border-slate-700/50 overflow-hidden transition-all duration-500 ${
                  isExpanded ? 'bg-linear-to-br from-slate-900/90 to-slate-800/90' : 'bg-slate-900/50'
                } hover:border-slate-600/80`}
              >
                {/* Pillar Number Accent */}
                <div className={`absolute top-0 ${isEven ? 'left-0' : 'right-0'} w-1 h-full bg-linear-to-b ${pillar.color}`} />

                {/* Pillar Header */}
                <button
                  onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                  className="w-full text-left p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-5">
                    <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${pillar.color} flex items-center justify-center text-3xl shadow-lg shrink-0`}>
                      {pillar.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pillar {pillar.number}</span>
                        {pillar.worldFirstCount > 0 && (
                          <span className="text-[10px] font-bold bg-linear-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">
                            🏆 {pillar.worldFirstCount} WORLD {pillar.worldFirstCount === 1 ? 'FIRST' : 'FIRSTS'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{pillar.name}</h3>
                      <p className={`text-lg ${pillar.accent}`}>{pillar.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <div className="text-2xl font-bold text-white">{pillar.modules.length}</div>
                      <div className="text-xs text-slate-400 uppercase">Modules</div>
                    </div>
                    <svg
                      className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-8 md:px-10 pb-10 animate-in fade-in duration-300">
                    <div className="border-t border-slate-700/50 pt-8">
                      {/* Description */}
                      <p className="text-purple-300 text-lg mb-8 max-w-4xl leading-relaxed">
                        {pillar.narrative.split('\n\n')[0]}
                      </p>

                      {/* Module Grid */}
                      <div className="mb-8">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                          Included Modules ({pillar.modules.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {regularModules.map((mod) => (
                            <div
                              key={mod.name}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                            >
                              <span className="text-lg">{mod.icon}</span>
                              <div>
                                <span className="text-sm text-white font-medium">{mod.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* World-First Modules */}
                      {worldFirstModules.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4">
                            🏆 World-First Modules
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {worldFirstModules.map((mod) => (
                              <div
                                key={mod.name}
                                className="flex items-start gap-4 px-5 py-4 rounded-xl bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-400/50 transition-colors"
                              >
                                <span className="text-2xl">{mod.icon}</span>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-semibold">{mod.name}</span>
                                    <span className="text-[9px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded-full">WORLD FIRST</span>
                                  </div>
                                  <p className="text-sm text-amber-200/70">{mod.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Competitors & Differentiator */}
                      <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="px-5 py-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                          <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Replaces</h5>
                          <div className="flex flex-wrap gap-2">
                            {pillar.competitors.map(c => (
                              <span key={c} className="text-xs bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full border border-red-500/20">{c}</span>
                            ))}
                          </div>
                        </div>
                        <div className="px-5 py-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                          <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Why Anchor Wins</h5>
                          <p className={`text-sm ${pillar.accent}`}>{pillar.differentiator}</p>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={onGetStarted}
                          className={`px-6 py-3 rounded-xl bg-linear-to-r ${pillar.color} text-white font-semibold hover:opacity-90 transition-opacity shadow-lg`}
                        >
                          Try {pillar.name} Free
                        </button>
                        <button
                          onClick={onViewPricing}
                          className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                        >
                          View Pricing →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 rounded-2xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-3xl font-bold text-cyan-400">{PILLAR_STATS.totalModules}+</div>
            <div className="text-sm text-slate-400 mt-1">Security Modules</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-3xl font-bold text-amber-400">{PILLAR_STATS.totalWorldFirsts}</div>
            <div className="text-sm text-slate-400 mt-1">World-First Features</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-3xl font-bold text-pink-400">5</div>
            <div className="text-sm text-slate-400 mt-1">Product Pillars</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-3xl font-bold text-purple-400">1</div>
            <div className="text-sm text-slate-400 mt-1">Unified Platform</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PillarLandingSections;
