import React, { useState } from 'react';
import { PRODUCT_PILLARS, PILLAR_STATS } from './PillarData';

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT NARRATIVES — Full-page story for each pillar
// Deep-dive product pages with narrative, modules, use cases, and CTA
// ═══════════════════════════════════════════════════════════════════════════════

interface ProductNarrativesProps {
  onGetStarted?: () => void;
  onViewPricing?: () => void;
  onBack?: () => void;
  initialPillar?: string;
}

const ProductNarratives: React.FC<ProductNarrativesProps> = ({ onGetStarted, onViewPricing, onBack, initialPillar }) => {
  const [activePillar, setActivePillar] = useState<string>(initialPillar || PRODUCT_PILLARS[0].id);
  const pillar = PRODUCT_PILLARS.find(p => p.id === activePillar) || PRODUCT_PILLARS[0];

  const narrativeParagraphs = pillar.narrative.split('\n\n');
  const worldFirstModules = pillar.modules.filter(m => m.worldFirst);
  const regularModules = pillar.modules.filter(m => !m.worldFirst);

  // Use cases per pillar
  const useCases: Record<string, Array<{ persona: string; scenario: string; outcome: string }>> = {
    'core-platform': [
      { persona: 'CISO', scenario: 'Needs a single dashboard for board-level reporting across 95+ security capabilities', outcome: 'Replaces 8 vendor dashboards with one source of truth — saves 15hrs/week' },
      { persona: 'SOC Analyst', scenario: 'Drowning in alerts from 12 different tools with no correlation', outcome: 'Unified SOC Dashboard with AI-prioritized alerts — 73% alert fatigue reduction' },
      { persona: 'DevSecOps Lead', scenario: 'Needs to embed security into CI/CD without slowing developers', outcome: 'SDK Security + Intelligence API integrate in 30 minutes — zero friction' },
    ],
    'protection-stack': [
      { persona: 'Security Engineer', scenario: 'Managing CrowdStrike + Zscaler + Prisma Cloud + 5 other tools', outcome: 'Consolidates to one agent, one policy engine, one bill — 60% cost reduction' },
      { persona: 'Infrastructure Lead', scenario: 'Worried about hardware implants and firmware attacks after supply chain incident', outcome: '🏆 Hardware Integrity + Firmware Security detect threats no other tool catches' },
      { persona: 'IAM Manager', scenario: 'Identity sprawl across cloud, on-prem, SaaS — can\'t track who has access to what', outcome: '🏆 Identity Drift catches shadow accounts and privilege creep in real-time' },
    ],
    'intelligence-automation': [
      { persona: 'Threat Hunter', scenario: 'Manually correlating IOCs across 6 feeds — takes hours per investigation', outcome: 'AI correlates across all feeds + dark web in seconds — 10x investigation speed' },
      { persona: 'Security Director', scenario: 'Team is 5 people but adversaries attack 24/7 — can\'t afford a full SOC', outcome: 'Autonomous SOC provides 24/7 AI coverage — team of 5 operates like 50' },
      { persona: 'AI/ML Engineer', scenario: 'Building LLM-powered product but no way to protect the models themselves', outcome: '🏆 AI Runtime Security guards against prompt injection, model hijacking, inference poisoning' },
    ],
    'offensive-simulation': [
      { persona: 'Red Team Lead', scenario: 'Annual pen test is stale by the time the report lands — adversaries don\'t wait', outcome: '🏆 Autonomous Red Team runs continuous attack simulations — always current' },
      { persona: 'Compliance Officer', scenario: 'Needs to prove security controls work, not just that they exist', outcome: 'Breach Simulator validates controls against real MITRE ATT&CK techniques' },
      { persona: 'CTO', scenario: 'About to deploy new microservices architecture — needs to find weaknesses before launch', outcome: 'Digital Twin creates a virtual replica to attack safely — zero production risk' },
    ],
    'governance-compliance': [
      { persona: 'GRC Manager', scenario: 'Preparing for SOC 2 + ISO 27001 + GDPR audits simultaneously — it\'s a nightmare', outcome: 'Compliance Hub auto-maps controls across frameworks — 80% audit prep reduction' },
      { persona: 'Risk Manager', scenario: 'Cyber insurance premiums are skyrocketing — can\'t quantify actual risk', outcome: 'Cyber Insurance integration provides real-time risk scoring to insurers' },
      { persona: 'Federal CISO', scenario: 'Must meet CMMC, FedRAMP, NIST 800-53 for defense contracts', outcome: 'National Security module with TS/SCI support and air-gapped deployment' },
    ],
  };

  const currentUseCases = useCases[activePillar] || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-[#0a0f1e] to-slate-950 text-white">
      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors" title="Go back">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Product Deep Dive</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {PRODUCT_PILLARS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePillar(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activePillar === p.id
                      ? `bg-linear-to-r ${p.color} text-white`
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span>{p.icon}</span> {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`w-20 h-20 rounded-3xl bg-linear-to-br ${pillar.color} flex items-center justify-center text-4xl shadow-2xl`}>
              {pillar.icon}
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pillar {pillar.number} of 5</span>
            {pillar.worldFirstCount > 0 && (
              <span className="text-[10px] font-bold bg-linear-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-full">
                🏆 {pillar.worldFirstCount} WORLD {pillar.worldFirstCount === 1 ? 'FIRST' : 'FIRSTS'}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{pillar.name}</h1>
          <p className={`text-2xl ${pillar.accent} mb-6`}>{pillar.tagline}</p>
          <p className="text-lg text-purple-300 max-w-3xl mx-auto mb-8">{narrativeParagraphs[0]}</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className={`px-8 py-3 rounded-xl bg-linear-to-r ${pillar.color} text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg`}
            >
              Try {pillar.name} Free
            </button>
            <button
              onClick={onViewPricing}
              className="px-8 py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              View Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-5 rounded-2xl bg-slate-800/30 border border-slate-700/30">
            <div className={`text-3xl font-bold ${pillar.accent}`}>{pillar.modules.length}</div>
            <div className="text-xs text-slate-400 mt-1">Modules</div>
          </div>
          <div className="text-center p-5 rounded-2xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-3xl font-bold text-amber-400">{pillar.worldFirstCount}</div>
            <div className="text-xs text-slate-400 mt-1">World Firsts</div>
          </div>
          <div className="text-center p-5 rounded-2xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-3xl font-bold text-pink-400">{pillar.tam}</div>
            <div className="text-xs text-slate-400 mt-1">Market Size</div>
          </div>
          <div className="text-center p-5 rounded-2xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-3xl font-bold text-green-400">{pillar.competitors.length}+</div>
            <div className="text-xs text-slate-400 mt-1">Vendors Replaced</div>
          </div>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {narrativeParagraphs.slice(1).map((para, i) => (
              <p key={i} className="text-lg text-purple-300/90 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Module Showcase */}
      <div className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {pillar.modules.length} Modules Inside {pillar.name}
          </h2>

          {/* Regular Modules */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {regularModules.map((mod) => (
              <div
                key={mod.name}
                className="group p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-500/50 transition-all hover:-translate-y-0.5"
              >
                <span className="text-2xl block mb-2">{mod.icon}</span>
                <h4 className="text-sm font-semibold text-white mb-1">{mod.name}</h4>
                <p className="text-xs text-slate-400">{mod.description}</p>
              </div>
            ))}
          </div>

          {/* World-First Modules */}
          {worldFirstModules.length > 0 && (
            <>
              <h3 className="text-xl font-bold text-amber-400 mb-6 text-center">🏆 World-First Modules — No Other Vendor Has These</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {worldFirstModules.map((mod) => (
                  <div
                    key={mod.name}
                    className="p-6 rounded-2xl bg-linear-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-400/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{mod.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-bold text-amber-300">{mod.name}</h4>
                          <span className="text-[9px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-full">WORLD FIRST</span>
                        </div>
                        <p className="text-amber-200/70">{mod.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Use Cases */}
      <div className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Who Uses {pillar.name}?</h2>
          <div className="space-y-6">
            {currentUseCases.map((uc, i) => (
              <div key={i} className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-6 md:p-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Persona</span>
                    <h4 className="text-lg font-bold text-white mt-1">{uc.persona}</h4>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Challenge</span>
                    <p className="text-sm text-slate-300 mt-1">{uc.scenario}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Outcome</span>
                    <p className="text-sm text-green-300/80 mt-1">{uc.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitive Positioning */}
      <div className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-linear-to-br from-red-500/5 to-slate-900/50 border border-red-500/20 p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Why Choose Anchor Over Point Solutions?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">They Have Separate Tools For</h4>
                <div className="flex flex-wrap gap-2">
                  {pillar.competitors.map(c => (
                    <span key={c} className="text-sm bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20">{c}</span>
                  ))}
                </div>
                <p className="text-slate-400 text-sm mt-4">Multiple vendors. Multiple agents. Multiple invoices. No correlation.</p>
              </div>
              <div>
                <h4 className={`text-sm font-bold ${pillar.accent} uppercase tracking-wider mb-4`}>Anchor Gives You</h4>
                <p className="text-white font-medium text-lg mb-3">{pillar.differentiator}</p>
                <p className="text-slate-400 text-sm">One platform. One agent. One bill. Full correlation across all {PILLAR_STATS.totalModules} modules.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience {pillar.name}?</h2>
          <p className="text-purple-300 mb-8">Start your 14-day free trial. No credit card required.</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className={`px-8 py-3 rounded-xl bg-linear-to-r ${pillar.color} text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg`}
            >
              Start Free Trial
            </button>
            <button
              onClick={onViewPricing}
              className="px-8 py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              View {pillar.name} Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductNarratives;
