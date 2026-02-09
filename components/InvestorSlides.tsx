import React, { useState } from 'react';
import { PRODUCT_PILLARS, PILLAR_STATS, type ProductPillar } from './PillarData';

// ═══════════════════════════════════════════════════════════════════════════════
// INVESTOR SLIDES — 5 pillar-based slides for pitch decks
// Each slide: Market size, differentiator, revenue model, competitive moat
// Plus: overview slide, financial summary, and TAM roll-up
// ═══════════════════════════════════════════════════════════════════════════════

interface InvestorSlidesProps {
  onBack?: () => void;
}

const InvestorSlides: React.FC<InvestorSlidesProps> = ({ onBack }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slide 0 = overview, Slides 1-5 = pillars, Slide 6 = financial summary
  const totalSlides = PRODUCT_PILLARS.length + 2;

  const nextSlide = () => setCurrentSlide(s => Math.min(s + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(s => Math.max(s - 1, 0));

  const revenueProjections: Record<string, { y1: string; y3: string; y5: string }> = {
    'core-platform':          { y1: '$12M',  y3: '$180M',  y5: '$890M' },
    'protection-stack':       { y1: '$28M',  y3: '$420M',  y5: '$1.8B' },
    'intelligence-automation': { y1: '$18M', y3: '$280M',  y5: '$1.2B' },
    'offensive-simulation':   { y1: '$8M',   y3: '$120M',  y5: '$520M' },
    'governance-compliance':  { y1: '$6M',   y3: '$95M',   y5: '$550M' },
  };

  const renderOverviewSlide = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      {/* Logo / Brand */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-linear-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-5xl shadow-2xl shadow-purple-500/30 mx-auto mb-6">
          ⚓
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-3">Anchor</h1>
        <p className="text-xl md:text-2xl bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
          The World&apos;s First All-in-One Cybersecurity Platform
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl">
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/30">
          <div className="text-3xl font-bold text-cyan-400">{PILLAR_STATS.totalModules}+</div>
          <div className="text-xs text-slate-400 mt-1">Security Modules</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/30">
          <div className="text-3xl font-bold text-amber-400">{PILLAR_STATS.totalWorldFirsts}</div>
          <div className="text-xs text-slate-400 mt-1">World-First Features</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/30">
          <div className="text-3xl font-bold text-pink-400">5</div>
          <div className="text-xs text-slate-400 mt-1">Product Pillars</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/30">
          <div className="text-3xl font-bold text-green-400">{PILLAR_STATS.totalTAM}</div>
          <div className="text-xs text-slate-400 mt-1">Combined TAM</div>
        </div>
      </div>

      {/* Pillar Overview */}
      <div className="grid grid-cols-5 gap-3 max-w-5xl w-full">
        {PRODUCT_PILLARS.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrentSlide(PRODUCT_PILLARS.indexOf(p) + 1)}
            className={`p-4 rounded-xl bg-linear-to-br ${p.color} bg-opacity-20 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1 cursor-pointer`}
          >
            <span className="text-2xl block mb-2">{p.icon}</span>
            <span className="text-xs font-bold text-white block">{p.name}</span>
            <span className="text-[10px] text-white/60 block mt-1">{p.modules.length} modules</span>
          </button>
        ))}
      </div>

      {/* Thesis */}
      <div className="mt-12 max-w-3xl">
        <p className="text-lg text-purple-300 leading-relaxed">
          Anchor consolidates the entire cybersecurity stack — endpoint, cloud, identity, AI, compliance, 
          and offensive security — into <strong className="text-white">five unified product pillars</strong> with{' '}
          <strong className="text-amber-400">{PILLAR_STATS.totalWorldFirsts} world-first innovations</strong> that 
          no competitor can match. We&apos;re targeting a <strong className="text-pink-400">{PILLAR_STATS.totalTAM} TAM</strong> with 
          a platform that makes vendor sprawl obsolete.
        </p>
      </div>
    </div>
  );

  const renderPillarSlide = (pillar: ProductPillar) => {
    const revenue = revenueProjections[pillar.id];
    const worldFirstModules = pillar.modules.filter(m => m.worldFirst);

    return (
      <div className="h-full px-8 py-6 flex flex-col">
        {/* Slide Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${pillar.color} flex items-center justify-center text-3xl shadow-lg`}>
              {pillar.icon}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pillar {pillar.number}</span>
              <h2 className="text-3xl font-bold text-white">{pillar.name}</h2>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${pillar.accent}`}>{pillar.tam}</div>
            <div className="text-xs text-slate-400">TAM</div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="flex-1 grid md:grid-cols-2 gap-8">
          {/* Left: Narrative + Modules */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Investment Thesis</h3>
              <p className="text-purple-300 leading-relaxed">{pillar.investorHook}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                Modules ({pillar.modules.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {pillar.modules.map(m => (
                  <span
                    key={m.name}
                    className={`text-xs px-2 py-1 rounded-md ${
                      m.worldFirst
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800/60 text-slate-300 border border-slate-700/30'
                    }`}
                  >
                    {m.icon} {m.name}
                  </span>
                ))}
              </div>
            </div>

            {worldFirstModules.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">
                  🏆 World-First Competitive Moats
                </h3>
                <div className="space-y-2">
                  {worldFirstModules.map(m => (
                    <div key={m.name} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-amber-300 font-medium">{m.name}</span>
                      <span className="text-slate-500">—</span>
                      <span className="text-slate-400">{m.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Revenue + Competitive */}
          <div className="space-y-6">
            {/* Revenue Projection */}
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-6">
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-4">Revenue Projection</h3>
              <div className="space-y-4">
                {revenue && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Year 1</span>
                      <span className="text-white font-bold text-lg">{revenue.y1}</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-[10%]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Year 3</span>
                      <span className="text-white font-bold text-lg">{revenue.y3}</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-[40%]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Year 5</span>
                      <span className="text-white font-bold text-lg">{revenue.y5}</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div className="bg-linear-to-r from-green-500 to-cyan-400 h-2 rounded-full w-full" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Competitive Landscape */}
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-6">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">Vendors We Replace</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {pillar.competitors.map(c => (
                  <span key={c} className="text-xs bg-red-500/10 text-red-400 px-2.5 py-1.5 rounded-lg border border-red-500/20">{c}</span>
                ))}
              </div>
              <div className="border-t border-slate-700/30 pt-4">
                <h4 className={`text-xs font-bold ${pillar.accent} uppercase tracking-wider mb-2`}>Our Unfair Advantage</h4>
                <p className="text-sm text-slate-300">{pillar.differentiator}</p>
              </div>
            </div>

            {/* Pricing Power */}
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-6">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3">Pricing Range</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">From</span>
                <span className={`text-lg font-bold ${pillar.accent}`}>
                  {pillar.pricingTiers[0].price}{pillar.pricingTiers[0].period}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-slate-400">Enterprise</span>
                <span className="text-lg font-bold text-white">Custom ($M/yr)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialSlide = () => (
    <div className="h-full px-8 py-6 flex flex-col">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Financial Summary — All 5 Pillars</h2>

      {/* Revenue Table */}
      <div className="flex-1">
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase">Pillar</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-slate-400 uppercase">Modules</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-slate-400 uppercase">World Firsts</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-slate-400 uppercase">TAM</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase">Y1 Rev</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase">Y3 Rev</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase">Y5 Rev</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCT_PILLARS.map((p) => {
                const rev = revenueProjections[p.id];
                return (
                  <tr key={p.id} className="border-b border-slate-700/20 hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{p.icon}</span>
                        <span className="text-white font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="text-center px-6 py-4 text-cyan-400 font-semibold">{p.modules.length}</td>
                    <td className="text-center px-6 py-4">
                      {p.worldFirstCount > 0 ? (
                        <span className="text-amber-400 font-semibold">🏆 {p.worldFirstCount}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className={`text-center px-6 py-4 font-semibold ${p.accent}`}>{p.tam}</td>
                    <td className="text-right px-6 py-4 text-white">{rev?.y1}</td>
                    <td className="text-right px-6 py-4 text-white">{rev?.y3}</td>
                    <td className="text-right px-6 py-4 text-green-400 font-bold">{rev?.y5}</td>
                  </tr>
                );
              })}
              {/* Totals */}
              <tr className="bg-slate-800/50">
                <td className="px-6 py-4 text-white font-bold">TOTAL</td>
                <td className="text-center px-6 py-4 text-cyan-400 font-bold">{PILLAR_STATS.totalModules}</td>
                <td className="text-center px-6 py-4 text-amber-400 font-bold">🏆 {PILLAR_STATS.totalWorldFirsts}</td>
                <td className="text-center px-6 py-4 text-pink-400 font-bold">{PILLAR_STATS.totalTAM}</td>
                <td className="text-right px-6 py-4 text-white font-bold">$72M</td>
                <td className="text-right px-6 py-4 text-white font-bold">$1.1B</td>
                <td className="text-right px-6 py-4 text-green-400 font-bold text-lg">$4.96B</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 rounded-2xl bg-linear-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
            <div className="text-3xl font-bold text-cyan-400">$20M–$40M</div>
            <div className="text-xs text-slate-400 mt-2">Pre-Revenue Valuation</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-linear-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <div className="text-3xl font-bold text-green-400">$4.96B</div>
            <div className="text-xs text-slate-400 mt-2">Y5 Revenue Target</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <div className="text-3xl font-bold text-purple-400">13</div>
            <div className="text-xs text-slate-400 mt-2">Revenue Streams</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-linear-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
            <div className="text-3xl font-bold text-amber-400">{PILLAR_STATS.totalWorldFirsts}</div>
            <div className="text-xs text-slate-400 mt-2">Competitive Moats</div>
          </div>
        </div>

        {/* Investment Ask */}
        <div className="mt-8 text-center rounded-3xl bg-linear-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30 p-10">
          <h3 className="text-2xl font-bold text-white mb-3">Investment Opportunity</h3>
          <p className="text-purple-300 max-w-2xl mx-auto mb-6">
            Anchor is seeking <strong className="text-pink-400">$5M–$10M seed funding</strong> to accelerate go-to-market, 
            expand the engineering team, and capture first-mover advantage across{' '}
            <strong className="text-cyan-400">{PILLAR_STATS.totalWorldFirsts} world-first security categories</strong> in a{' '}
            <strong className="text-white">{PILLAR_STATS.totalTAM} market</strong>.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-cyan-400">
            <span>📧</span> investors@anchoraiguard.com
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentSlide = () => {
    if (currentSlide === 0) return renderOverviewSlide();
    if (currentSlide === totalSlides - 1) return renderFinancialSlide();
    return renderPillarSlide(PRODUCT_PILLARS[currentSlide - 1]);
  };

  const getSlideTitle = () => {
    if (currentSlide === 0) return 'Overview';
    if (currentSlide === totalSlides - 1) return 'Financials';
    return PRODUCT_PILLARS[currentSlide - 1].name;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-[#0a0f1e] to-slate-950 text-white flex flex-col">
      {/* Slide Controls Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors" title="Go back">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Anchor Investor Deck</span>
            <h2 className="text-lg font-semibold text-white">{getSlideTitle()}</h2>
          </div>
        </div>

        {/* Slide Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/30 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition-all"
            title="Previous slide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Slide Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide ? 'bg-cyan-400 w-6' : 'bg-slate-600 hover:bg-slate-500'
                }`}
                title={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <span className="text-xs text-slate-500 mx-2">{currentSlide + 1} / {totalSlides}</span>

          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/30 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition-all"
            title="Next slide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Fullscreen hint */}
        <div className="text-xs text-slate-500 hidden md:block">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] border border-slate-700">← →</kbd> to navigate
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 overflow-auto py-8">
        <div className="max-w-7xl mx-auto h-full">
          {renderCurrentSlide()}
        </div>
      </div>
    </div>
  );
};

export default InvestorSlides;
