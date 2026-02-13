import React, { useState, useEffect, useCallback } from 'react';
import { PRODUCT_PILLARS, PILLAR_STATS, type ProductPillar } from './PillarData';

// =============================================================================
// INVESTOR SLIDES � SOVEREIGN-GRADE PITCH DECK
// 16 slides: Title > TITAN > 5 Pillars (summary) > 5 Pillar deep-dives >
// 29 World-Firsts > National Security > Digital Twin + Red Team >
// Telemetry + Satellite > AI/LLM Security > Compliance + Threat Hub >
// Valuation Narrative > Financials & Ask
// =============================================================================

interface InvestorSlidesProps {
  onBack?: () => void;
}

// 29 World-First Technologies
const WORLD_FIRSTS = [
  { name: 'Predictive CVE Intelligence', icon: '\u{1F52E}', pillar: 1 },
  { name: 'Developer Security Score', icon: '\u{1F3C6}', pillar: 1 },
  { name: 'AI Security Chat', icon: '\u{1F916}', pillar: 1 },
  { name: 'Real-Time Collaboration', icon: '\u{1F465}', pillar: 1 },
  { name: 'AI Evolution Engine (Titan)', icon: '\u{1F9EC}', pillar: 1 },
  { name: 'Quantum-Safe Cryptography', icon: '\u269B\uFE0F', pillar: 2 },
  { name: 'Anti-Tampering Engine', icon: '\u{1F50F}', pillar: 2 },
  { name: 'Hardware Integrity', icon: '\u{1F529}', pillar: 2 },
  { name: 'Firmware & Microcode Security', icon: '\u{1F4BE}', pillar: 2 },
  { name: 'Identity Drift Detection', icon: '\u{1FAAA}', pillar: 2 },
  { name: 'Architecture Drift Engine', icon: '\u{1F3D7}\uFE0F', pillar: 2 },
  { name: 'Autonomous SOC', icon: '\u{1F3DB}\uFE0F', pillar: 3 },
  { name: 'Supply Chain AI', icon: '\u{1F517}', pillar: 3 },
  { name: 'AI Runtime Security', icon: '\u{1F916}', pillar: 3 },
  { name: 'Data Trust Engine', icon: '\u{1F9EC}', pillar: 3 },
  { name: 'Human Behaviour Risk Engine', icon: '\u{1F9E0}', pillar: 3 },
  { name: 'National-Scale Telemetry', icon: '\u{1F310}', pillar: 3 },
  { name: 'AI/LLM Security Scanner', icon: '\u{1F916}', pillar: 3 },
  { name: 'Predictive Attack Intelligence', icon: '\u{1F50D}', pillar: 3 },
  { name: 'AI Agent Security', icon: '\u{1F916}', pillar: 3 },
  { name: 'Deepfake Detection & Defence', icon: '\u{1F3AD}', pillar: 3 },
  { name: 'Satellite Comms Security', icon: '\u{1F6F0}\uFE0F', pillar: 3 },
  { name: 'LLM Supply Chain Security', icon: '\u{1F517}', pillar: 3 },
  { name: 'Autonomous Red Team', icon: '\u2694\uFE0F', pillar: 4 },
  { name: 'AI Breach Simulator', icon: '\u{1F4A5}', pillar: 4 },
  { name: 'Digital Twin Security', icon: '\u{1FA9E}', pillar: 4 },
  { name: 'Cyber Insurance Integration', icon: '\u{1F6E1}\uFE0F', pillar: 5 },
  { name: 'Critical Infrastructure (16 CISA)', icon: '\u{1F3D7}\uFE0F', pillar: 5 },
  { name: 'National Security Module', icon: '\u{1F3DB}\uFE0F', pillar: 5 },
];

const InvestorSlides: React.FC<InvestorSlidesProps> = ({ onBack }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 16;

  const nextSlide = useCallback(() => setCurrentSlide(s => Math.min(s + 1, totalSlides - 1)), []);
  const prevSlide = useCallback(() => setCurrentSlide(s => Math.max(s - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nextSlide, prevSlide]);

  const revenueProjections: Record<string, { y1: string; y3: string; y5: string }> = {
    'core-platform':            { y1: '$12M',  y3: '$180M',  y5: '$890M' },
    'protection-stack':         { y1: '$28M',  y3: '$420M',  y5: '$1.8B' },
    'intelligence-automation':  { y1: '$18M',  y3: '$280M',  y5: '$1.2B' },
    'offensive-simulation':     { y1: '$8M',   y3: '$120M',  y5: '$520M' },
    'governance-compliance':    { y1: '$6M',   y3: '$95M',   y5: '$550M' },
  };

  // SLIDE 0: TITLE � SOVEREIGN CAPABILITY STATEMENT
  const renderTitleSlide = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="mb-8">
        <div className="w-28 h-28 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-6xl shadow-2xl shadow-purple-500/30 mx-auto mb-6 animate-pulse">
          {'\u2693'}
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-white mb-2 tracking-tight">ANCHOR</h1>
        <p className="text-2xl md:text-3xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
          Sovereign Cyber Defence Platform
        </p>
        <p className="text-lg text-slate-400 mt-3 max-w-2xl mx-auto">
          The world&apos;s first and only all-in-one cybersecurity platform � protecting 29 layers no other vendor covers.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12 max-w-5xl w-full">
        {[
          { value: '109+', label: 'Security Modules', color: 'text-cyan-400' },
          { value: '29', label: 'World-First Technologies', color: 'text-amber-400' },
          { value: '5', label: 'Product Pillars', color: 'text-pink-400' },
          { value: '13', label: 'Revenue Streams', color: 'text-green-400' },
          { value: PILLAR_STATS.totalTAM, label: 'Combined TAM', color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/30 backdrop-blur-sm">
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-purple-500/20 p-10">
        <p className="text-lg text-purple-200 leading-relaxed">
          Anchor is not a startup pitch. It is a <strong className="text-white">sovereign cyber-defence capability</strong> �
          a platform that consolidates the entire cybersecurity stack into{' '}
          <strong className="text-cyan-400">five unified pillars</strong> with{' '}
          <strong className="text-amber-400">29 world-first innovations</strong> that no competitor, no government lab, and no
          defence contractor has ever built. We are <strong className="text-pink-400">strategic infrastructure</strong>.
        </p>
      </div>
      <div className="mt-8 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest">
        <span>{'\u{1F512}'}</span> Confidential � Investor Eyes Only
      </div>
    </div>
  );

  // SLIDE 1: TITAN COMMAND CENTRE
  const renderTitanSlide = () => (
    <div className="h-full px-8 py-6 flex flex-col">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
            {'\u{1F9E0}'}
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">The Unified Brain</span>
            <h2 className="text-4xl font-black text-white">TITAN Command Centre</h2>
          </div>
        </div>
        <p className="text-lg text-purple-300 max-w-3xl mx-auto">
          Every module, every signal, every threat � flowing through one sovereign-grade intelligence layer.
          TITAN is the self-evolving AI engine at the heart of Anchor.
        </p>
      </div>
      <div className="flex-1 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Architecture</h3>
          <div className="rounded-2xl bg-slate-800/40 border border-cyan-500/20 p-6 space-y-4">
            {[
              { icon: '\u{1F9EC}', title: 'Self-Evolving Detection', desc: 'Generates new threat rules autonomously. Every generation improves on the last.' },
              { icon: '\u{1F52E}', title: 'Predictive Intelligence', desc: 'Predicts CVEs before disclosure, attacks before launch, drift before breach.' },
              { icon: '\u{1F4E1}', title: 'Cross-Pillar Telemetry', desc: 'All 109+ modules feed telemetry into TITAN � creating compound intelligence.' },
              { icon: '\u{1F916}', title: 'Autonomous Operations', desc: 'Triage, investigate, remediate � without human intervention. 24/7/365.' },
              { icon: '\u{1F6E1}\uFE0F', title: 'Sovereign Isolation', desc: 'Air-gapped deployment option. No data leaves sovereign boundaries.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <h4 className="text-white font-semibold">{item.title}</h4>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Why TITAN Changes Everything</h3>
          <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 p-6 space-y-5">
            <div className="text-center pb-4 border-b border-slate-700/30">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Single Pane of Glass
              </div>
              <p className="text-sm text-slate-400 mt-2">Replace 15+ vendor dashboards with one sovereign command centre</p>
            </div>
            {[
              { label: 'Vendor Sprawl Eliminated', before: '15+ tools', after: '1 platform' },
              { label: 'MTTR Reduction', before: 'Hours', after: 'Minutes (autonomous)' },
              { label: 'Detection Coverage', before: '~40 layers', after: '109+ modules / 29 world-firsts' },
              { label: 'AI Model Generations', before: 'Static rules', after: 'Self-evolving (Gen N+1 auto-deployed)' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-300 font-medium">{row.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-red-400 line-through">{row.before}</span>
                  <span className="text-xs">{'\u2192'}</span>
                  <span className="text-xs text-cyan-400 font-bold">{row.after}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-slate-800/40 border border-amber-500/20 p-5">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">{'\u{1F4B0}'} Investor Signal</h4>
            <p className="text-sm text-slate-300">
              TITAN creates <strong className="text-white">95%+ retention</strong> � once a customer&apos;s operations live inside TITAN,
              switching costs are prohibitive. This is the moat that drives expansion revenue and makes Anchor a platform,
              not a point solution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // SLIDE 2: THE 5 PILLARS (SUMMARY)
  const renderPillarsSummarySlide = () => (
    <div className="h-full px-8 py-6 flex flex-col">
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Sovereign-Grade Architecture</span>
        <h2 className="text-4xl font-black text-white mt-2">The 5 Product Pillars</h2>
        <p className="text-purple-300 mt-3 max-w-2xl mx-auto">
          Clear. Structured. Sovereign-grade. Every layer of cybersecurity � unified under one roof.
        </p>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
        {PRODUCT_PILLARS.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrentSlide(PRODUCT_PILLARS.indexOf(p) + 3)}
            className={`group flex flex-col rounded-2xl bg-gradient-to-br ${p.color} bg-opacity-10 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1 cursor-pointer p-5 text-left`}
          >
            <span className="text-3xl mb-3">{p.icon}</span>
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Pillar {p.number}</span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">{p.name}</h3>
            <p className="text-xs text-white/70 leading-relaxed flex-1">{p.tagline}</p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-white">{p.modules.length}</span>
                <span className="text-xs text-white/50 ml-1">modules</span>
              </div>
              {p.worldFirstCount > 0 && (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-md border border-amber-500/30">
                  {'\u{1F3C6}'} {p.worldFirstCount} world-firsts
                </span>
              )}
            </div>
            <div className="mt-2">
              <span className={`text-sm font-bold ${p.accent}`}>{p.tam} TAM</span>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-8 py-4 rounded-2xl bg-slate-800/30 border border-slate-700/20">
        <div className="text-center">
          <span className="text-2xl font-black text-cyan-400">{PILLAR_STATS.totalModules}+</span>
          <span className="text-xs text-slate-400 ml-2">Total Modules</span>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div className="text-center">
          <span className="text-2xl font-black text-amber-400">{PILLAR_STATS.totalWorldFirsts}</span>
          <span className="text-xs text-slate-400 ml-2">World-First Technologies</span>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div className="text-center">
          <span className="text-2xl font-black text-pink-400">{PILLAR_STATS.totalTAM}</span>
          <span className="text-xs text-slate-400 ml-2">Combined TAM</span>
        </div>
      </div>
    </div>
  );

  // SLIDES 3-7: INDIVIDUAL PILLAR DEEP DIVES
  const renderPillarSlide = (pillar: ProductPillar) => {
    const revenue = revenueProjections[pillar.id];
    const worldFirstModules = pillar.modules.filter(m => m.worldFirst);
    return (
      <div className="h-full px-8 py-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center text-3xl shadow-lg`}>
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
        <div className="flex-1 grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Investment Thesis</h3>
              <p className="text-purple-300 leading-relaxed">{pillar.investorHook}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Modules ({pillar.modules.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {pillar.modules.map(m => (
                  <span key={m.name} className={`text-xs px-2 py-1 rounded-md ${m.worldFirst ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800/60 text-slate-300 border border-slate-700/30'}`}>
                    {m.icon} {m.name}
                  </span>
                ))}
              </div>
            </div>
            {worldFirstModules.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">{'\u{1F3C6}'} World-First Competitive Moats</h3>
                <div className="space-y-2">
                  {worldFirstModules.map(m => (
                    <div key={m.name} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-amber-300 font-medium">{m.name}</span>
                      <span className="text-slate-500">{'\u2014'}</span>
                      <span className="text-slate-400">{m.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-5">
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-4">Revenue Projection</h3>
              {revenue && (
                <div className="space-y-3">
                  {[
                    { label: 'Year 1', value: revenue.y1, width: 'w-[10%]' },
                    { label: 'Year 3', value: revenue.y3, width: 'w-[40%]' },
                    { label: 'Year 5', value: revenue.y5, width: 'w-full' },
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-sm">{r.label}</span>
                        <span className="text-white font-bold">{r.value}</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className={`bg-gradient-to-r from-green-500 to-cyan-400 h-2 rounded-full ${r.width}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-5">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Vendors We Replace</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {pillar.competitors.map(c => (
                  <span key={c} className="text-xs bg-red-500/10 text-red-400 px-2.5 py-1.5 rounded-lg border border-red-500/20">{c}</span>
                ))}
              </div>
              <div className="border-t border-slate-700/30 pt-3">
                <h4 className={`text-xs font-bold ${pillar.accent} uppercase tracking-wider mb-2`}>Our Unfair Advantage</h4>
                <p className="text-sm text-slate-300">{pillar.differentiator}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-5">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3">Pricing Range</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">From</span>
                <span className={`text-lg font-bold ${pillar.accent}`}>{pillar.pricingTiers[0].price}{pillar.pricingTiers[0].period}</span>
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

  // SLIDE 8: 29 WORLD-FIRST MODULES
  const renderWorldFirstsSlide = () => (
    <div className="h-full px-8 py-6 flex flex-col">
      <div className="text-center mb-6">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Unmatched Breadth</span>
        <h2 className="text-4xl font-black text-white mt-2">29 World-First Technologies</h2>
        <p className="text-purple-300 mt-2 max-w-3xl mx-auto">
          Every single one of these capabilities has <strong className="text-amber-400">zero vendors</strong> covering it.
          Not CrowdStrike. Not Palo Alto. Not SentinelOne. Not any government lab. <strong className="text-white">Nobody.</strong>
        </p>
      </div>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 overflow-auto">
        {WORLD_FIRSTS.map((wf, i) => (
          <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all">
            <span className="text-xl shrink-0">{wf.icon}</span>
            <div>
              <span className="text-xs font-bold text-amber-300 leading-tight block">{wf.name}</span>
              <span className="text-[10px] text-slate-500">Pillar {wf.pillar}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-slate-800/40 border border-slate-700/30 p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            {['CrowdStrike', 'Palo Alto', 'SentinelOne', 'Snyk', 'Wiz'].map(v => (
              <div key={v} className="text-center">
                <div className="text-lg font-black text-red-400">0/29</div>
                <div className="text-[10px] text-slate-500">{v}</div>
              </div>
            ))}
          </div>
          <div className="text-center px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-cyan-500/10 border border-amber-500/30">
            <div className="text-3xl font-black text-amber-400">29/29</div>
            <div className="text-xs text-white font-bold">ANCHOR</div>
          </div>
        </div>
      </div>
    </div>
  );

  // SLIDE 9: NATIONAL SECURITY POSITIONING
  const renderNationalSecuritySlide = () => (
    <div className="h-full px-8 py-6 flex flex-col">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-red-500/30">
            {'\u{1F3DB}\uFE0F'}
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Strategic Classification</span>
            <h2 className="text-4xl font-black text-white">National Security Asset</h2>
          </div>
        </div>
        <p className="text-lg text-red-200 max-w-3xl mx-auto">
          Anchor is not a commercial product � it is a <strong className="text-white">sovereign cyber-defence capability</strong>.
          A national asset with strategic implications for defence, intelligence, and critical infrastructure.
        </p>
      </div>
      <div className="flex-1 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Sovereign Capabilities</h3>
          <div className="space-y-3">
            {[
              { icon: '\u{1F3DB}\uFE0F', title: 'Classified Environment Management', desc: 'Air-gapped deployment. Cross-classification boundary controls. DCSA-ready.' },
              { icon: '\u{1F6F0}\uFE0F', title: 'Satellite Communications Security', desc: 'GPS spoofing defence, QKD for space links, ground station hardening.' },
              { icon: '\u{1F310}', title: 'National-Scale Telemetry', desc: 'Cross-industry threat correlation. National cyber-risk scoring. Early-warning systems.' },
              { icon: '\u{1F3D7}\uFE0F', title: '16 CISA Sector Coverage', desc: 'Energy, water, finance, transport, health, defence � all 16 critical infrastructure sectors.' },
              { icon: '\u2694\uFE0F', title: 'Autonomous Red Team', desc: 'Continuous offensive testing. MITRE ATT&CK mapped. 24/7 unattended operation.' },
              { icon: '\u{1F50F}', title: 'Anti-Tampering + Hardware Trust', desc: 'BIOS/UEFI integrity. Firmware scanning. Platform-level tamper detection.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Government Market Opportunity</h3>
          <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-amber-500/10 border border-red-500/20 p-6 space-y-4">
            {[
              { label: 'US Federal Cyber Spending (2026)', value: '$22.7B' },
              { label: 'Five Eyes Alliance IT Security', value: '$68B' },
              { label: 'NATO Cyber Defence Budgets', value: '$42B' },
              { label: 'Anchor Government Tier Pricing', value: '$5M\u2013$75M+/yr' },
              { label: 'Target: Top 20 Government Accounts', value: '$500M ARR' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-slate-300">{row.label}</span>
                <span className="text-sm font-bold text-white">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-slate-800/40 border border-amber-500/20 p-5">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">{'\u{1F3AF}'} Strategic Positioning</h4>
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                <strong className="text-white">Lockheed Martin</strong> builds fighter jets.<br/>
                <strong className="text-white">Palantir</strong> builds intelligence platforms.<br/>
                <strong className="text-white">Anchor</strong> builds sovereign cyber defence.
              </p>
              <p className="text-red-300">
                We are positioning as the <strong className="text-white">Palantir of cybersecurity</strong> � a platform that
                governments cannot afford <em>not</em> to deploy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // SLIDE 10: DIGITAL TWIN + AUTONOMOUS RED TEAM
  const renderDigitalTwinRedTeamSlide = () => (
    <div className="h-full px-8 py-6 flex flex-col">
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Capabilities That Elevate Us Above Every Vendor</span>
        <h2 className="text-4xl font-black text-white mt-2">Digital Twin + Autonomous Red Team</h2>
        <p className="text-purple-300 mt-2 max-w-3xl mx-auto">
          These two capabilities alone place Anchor in a category of one. No competitor has either.
        </p>
      </div>
      <div className="flex-1 grid md:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{'\u{1FA9E}'}</span>
            <div>
              <h3 className="text-2xl font-bold text-cyan-400">Digital Twin Security</h3>
              <span className="text-xs text-cyan-300/60 font-bold uppercase">World-First #26</span>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <p className="text-slate-300 leading-relaxed">
              Creates a <strong className="text-white">perfect virtual replica</strong> of your entire infrastructure � then
              attacks it relentlessly to find vulnerabilities <em>before</em> real adversaries do.
            </p>
            <div className="space-y-2">
              {['Full infrastructure cloning (network, endpoints, cloud)', 'Attack simulation on the twin \u2014 zero risk to production', 'Automated vulnerability discovery from clone analysis', 'Drift detection between twin and production state', 'MITRE ATT&CK kill-chain simulation on virtual assets'].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-cyan-400 mt-0.5">{'\u2713'}</span>
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-cyan-500/20 text-center">
            <span className="text-xs text-slate-500">Competitors with Digital Twin security:</span>
            <div className="text-2xl font-black text-red-400 mt-1">ZERO</div>
          </div>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{'\u2694\uFE0F'}</span>
            <div>
              <h3 className="text-2xl font-bold text-red-400">Autonomous Red Team</h3>
              <span className="text-xs text-red-300/60 font-bold uppercase">World-First #24</span>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <p className="text-slate-300 leading-relaxed">
              A <strong className="text-white">fully autonomous offensive security engine</strong> that continuously attacks
              your own infrastructure � finding and exploiting weaknesses 24/7/365 with no human intervention.
            </p>
            <div className="space-y-2">
              {['Autonomous exploit simulation & lateral movement mapping', 'Privilege escalation testing across entire attack surface', 'MITRE ATT&CK full kill-chain coverage', 'Misconfiguration exploitation & credential harvesting', '24/7 unattended operation \u2014 never stops testing'].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-red-400 mt-0.5">{'\u2713'}</span>
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-red-500/20 text-center">
            <span className="text-xs text-slate-500">Competitors with autonomous red team:</span>
            <div className="text-2xl font-black text-red-400 mt-1">ZERO</div>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-red-500/5 border border-purple-500/20 p-4 text-center">
        <p className="text-sm text-purple-300">
          <strong className="text-white">Together:</strong> Anchor clones your infrastructure, attacks the clone autonomously,
          discovers vulnerabilities, and remediates � all before any adversary reaches your real systems.
          <strong className="text-amber-400"> No vendor on Earth offers this workflow.</strong>
        </p>
      </div>
    </div>
  );

  // SLIDE 11: NATIONAL TELEMETRY + SATELLITE COMMS
  const renderTelemetrySatelliteSlide = () => (
    <div className="h-full px-8 py-6 flex flex-col">
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Strategic Infrastructure</span>
        <h2 className="text-4xl font-black text-white mt-2">National Telemetry + Satellite Comms</h2>
        <p className="text-green-200 mt-2 max-w-3xl mx-auto">
          This is where Anchor transcends cybersecurity and becomes <strong className="text-white">strategic national infrastructure</strong>.
        </p>
      </div>
      <div className="flex-1 grid md:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{'\u{1F310}'}</span>
            <div>
              <h3 className="text-2xl font-bold text-green-400">National-Scale Telemetry</h3>
              <span className="text-xs text-green-300/60 font-bold uppercase">World-First #17</span>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <p className="text-slate-300 leading-relaxed">
              A <strong className="text-white">sovereign cyber intelligence layer</strong> that correlates threat data across
              industries, sectors, and national boundaries to provide early-warning attack intelligence.
            </p>
            <div className="space-y-2">
              {['Cross-industry threat correlation at national scale', 'Attack-wave prediction & early-warning signals', 'National cyber-risk scoring dashboard', 'Sector-specific threat intelligence (all 16 CISA sectors)', 'Government-to-government intelligence sharing (Five Eyes ready)'].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-400 mt-0.5">{'\u2713'}</span>
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-green-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Pricing</span>
              <span className="text-green-400 font-bold">$5M+/yr per nation</span>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{'\u{1F6F0}\uFE0F'}</span>
            <div>
              <h3 className="text-2xl font-bold text-indigo-400">Satellite Communications Security</h3>
              <span className="text-xs text-indigo-300/60 font-bold uppercase">World-First #22</span>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <p className="text-slate-300 leading-relaxed">
              The <strong className="text-white">first cybersecurity platform to protect satellite links</strong> � from
              GPS spoofing defence to quantum key distribution for space-based communications.
            </p>
            <div className="space-y-2">
              {['GPS spoofing defence (L1/L5 switching + inertial navigation)', 'Jamming detection with autonomous frequency hopping', 'Quantum Key Distribution (QKD) for space links', 'Command injection blocking on TT&C channels', 'Ground station hardening & geo-fencing'].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-indigo-400 mt-0.5">{'\u2713'}</span>
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-indigo-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Pricing</span>
              <span className="text-indigo-400 font-bold">$50K+/mo per deployment</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-400">500 gov clients</span>
              <span className="text-white font-bold">= $300M ARR</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl bg-gradient-to-r from-green-500/5 via-indigo-500/5 to-violet-500/5 border border-indigo-500/20 p-4 text-center">
        <p className="text-sm text-indigo-300">
          <strong className="text-white">Combined Impact:</strong> These modules make Anchor a{' '}
          <strong className="text-green-400">national-scale cyber defence platform</strong> � the kind of capability that
          defence ministries and intelligence agencies procure as <strong className="text-white">strategic infrastructure</strong>,
          not commercial software. TAM: <strong className="text-amber-400">$8.5B+ (satellite) + $12B+ (national telemetry)</strong>.
        </p>
      </div>
    </div>
  );

  // SLIDE 12: AI/LLM SUPPLY CHAIN + RUNTIME SECURITY
  const renderAISecuritySlide = () => (
    <div className="h-full px-8 py-6 flex flex-col">
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">The Future of AI Security</span>
        <h2 className="text-4xl font-black text-white mt-2">AI/LLM Supply Chain + Runtime Security</h2>
        <p className="text-violet-200 mt-2 max-w-3xl mx-auto">
          Every enterprise is deploying AI. Nobody is securing it. <strong className="text-white">Anchor is.</strong>
        </p>
      </div>
      <div className="flex-1 grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 p-6 flex flex-col">
          <span className="text-3xl mb-3">{'\u{1F916}'}</span>
          <h3 className="text-xl font-bold text-violet-400 mb-2">AI Runtime Security</h3>
          <p className="text-sm text-slate-300 mb-4 flex-1">
            Protects AI models during inference � detecting prompt injection, model hijacking,
            and malicious fine-tuning in real time.
          </p>
          <div className="space-y-1.5">
            {['Prompt injection detection', 'Model hijacking prevention', 'Inference poisoning alerts', 'Malicious fine-tuning defence'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-violet-400">{'\u2713'}</span> {f}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 p-6 flex flex-col">
          <span className="text-3xl mb-3">{'\u{1F517}'}</span>
          <h3 className="text-xl font-bold text-pink-400 mb-2">LLM Supply Chain</h3>
          <p className="text-sm text-slate-300 mb-4 flex-1">
            First-ever model weight integrity and training data poisoning protection � securing the entire
            AI development pipeline.
          </p>
          <div className="space-y-1.5">
            {['SLSA Level 3 attestation for AI', 'Training data poisoning detection', 'Model weight integrity (SHA-256)', 'Hallucinated dependency blocking', 'External API drift monitoring'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-pink-400">{'\u2713'}</span> {f}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6 flex flex-col">
          <span className="text-3xl mb-3">{'\u{1F916}'}</span>
          <h3 className="text-xl font-bold text-amber-400 mb-2">AI Agent Security</h3>
          <p className="text-sm text-slate-300 mb-4 flex-1">
            First-ever permission boundary system for autonomous AI agents � controlling what AI can
            access, execute, and exfiltrate.
          </p>
          <div className="space-y-1.5">
            {['Sandbox enforcement', 'Action auditing & CoT logging', 'Prompt injection defence', 'Data exfiltration prevention', 'Hallucinated dependency blocking'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-amber-400">{'\u2713'}</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <div className="text-2xl font-black text-violet-400">$4.2B</div>
          <div className="text-xs text-slate-400">AI Agent Security TAM</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
          <div className="text-2xl font-black text-pink-400">$2.1B</div>
          <div className="text-xs text-slate-400">LLM Supply Chain TAM</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="text-2xl font-black text-amber-400">$3.8B</div>
          <div className="text-xs text-slate-400">Deepfake Defence TAM</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <div className="text-2xl font-black text-cyan-400">0</div>
          <div className="text-xs text-slate-400">Competitors in ANY of these</div>
        </div>
      </div>
    </div>
  );

  // SLIDE 13: COMPLIANCE HUB + THREAT HUB
  const renderComplianceThreatSlide = () => (
    <div className="h-full px-8 py-6 flex flex-col">
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Enterprise Maturity</span>
        <h2 className="text-4xl font-black text-white mt-2">Compliance Hub + Threat Hub</h2>
        <p className="text-blue-200 mt-2 max-w-3xl mx-auto">
          Enterprise readiness isn&apos;t optional. Anchor ships with built-in compliance automation
          and a unified threat intelligence platform.
        </p>
      </div>
      <div className="flex-1 grid md:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{'\u{1F4CB}'}</span>
            <div>
              <h3 className="text-2xl font-bold text-blue-400">Compliance Hub</h3>
              <span className="text-xs text-blue-300/60 font-bold uppercase">Automated Framework Coverage</span>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <p className="text-slate-300 text-sm leading-relaxed">
              Continuous compliance monitoring across every major framework � with automated evidence collection,
              gap analysis, and audit-ready reporting.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['SOC 2 Type II', 'ISO 27001', 'NIST 800-53', 'HIPAA', 'PCI DSS 4.0', 'GDPR', 'FedRAMP', 'NERC CIP', 'CMMC', 'CIS Benchmarks', 'DORA', 'NIS2'].map((fw, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-blue-500/10 text-blue-300 px-3 py-2 rounded-lg border border-blue-500/15">
                  <span className="text-blue-400">{'\u2713'}</span> {fw}
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
              <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">What This Means for Investors</h4>
              <p className="text-xs text-slate-400">
                Compliance is a <strong className="text-white">must-have gate</strong> for enterprise deals. Built-in compliance
                reduces sales cycle friction by 40-60% and is a key driver for $100K+ ACV contracts.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{'\u{1F3AF}'}</span>
            <div>
              <h3 className="text-2xl font-bold text-red-400">Threat Intelligence Hub</h3>
              <span className="text-xs text-red-300/60 font-bold uppercase">Predictive + Real-Time</span>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <p className="text-slate-300 text-sm leading-relaxed">
              Unified threat intelligence that combines real-time feeds, dark web monitoring, predictive CVE intelligence,
              and attack-wave forecasting into one actionable platform.
            </p>
            <div className="space-y-2.5">
              {[
                { icon: '\u{1F52E}', title: 'Predictive CVE Intelligence', desc: 'Predicts vulnerabilities before public disclosure' },
                { icon: '\u{1F575}\uFE0F', title: 'Dark Web Monitoring', desc: 'Credential leaks, data exposure, threat actor tracking' },
                { icon: '\u{1F4E1}', title: 'Real-Time Threat Feeds', desc: 'IOC ingestion, STIX/TAXII, MISP integration' },
                { icon: '\u{1F50D}', title: 'Attack-Wave Forecasting', desc: 'Predictive threat modelling & early warnings' },
                { icon: '\u{1F9E0}', title: 'Threat Actor Profiling', desc: 'APT group tracking, TTP mapping, attribution' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Revenue Signal</h4>
              <p className="text-xs text-slate-400">
                Threat intelligence is a <strong className="text-white">$12B+ market</strong>. Anchor bundles it into the platform �
                displacing standalone TIP vendors and adding $500K+ per enterprise account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // SLIDE 14: VALUATION-LEVEL NARRATIVE
  const renderValuationNarrativeSlide = () => (
    <div className="h-full px-8 py-6 flex flex-col">
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Not a Startup Pitch</span>
        <h2 className="text-4xl font-black text-white mt-2">A Sovereign Capability</h2>
        <p className="text-pink-200 mt-2 max-w-3xl mx-auto">
          This is not a seed-stage pitch for a feature. This is a valuation of a{' '}
          <strong className="text-white">sovereign-grade platform</strong> with no comparable in the market.
        </p>
      </div>
      <div className="flex-1 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider">Valuation Analysis</h3>
          <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Method</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase">Valuation</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { method: 'Comparable Transactions', value: '$50M \u2013 $100M', highlight: true },
                  { method: 'Berkus Method', value: '$32M', highlight: false },
                  { method: 'IP-Based (29 World-Firsts)', value: '$93M', highlight: false },
                  { method: 'Forward Revenue (Conservative)', value: '$80M \u2013 $100M', highlight: false },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-slate-700/20 ${row.highlight ? 'bg-pink-500/5' : ''}`}>
                    <td className="px-4 py-3 text-slate-300">{row.method}</td>
                    <td className="px-4 py-3 text-right font-bold text-white">{row.value}</td>
                  </tr>
                ))}
                <tr className="bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                  <td className="px-4 py-3 text-white font-bold">Blended Estimate</td>
                  <td className="px-4 py-3 text-right font-black text-pink-400 text-lg">$50M \u2013 $100M</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 p-5">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Comparable Seed-Stage Valuations</h4>
            <div className="space-y-2">
              {[
                { name: 'Snyk (2016)', val: '$2.5M', modules: '1 feature' },
                { name: 'Wiz (2020)', val: '$5M', modules: '1 feature' },
                { name: 'Lacework (2015)', val: '$3M', modules: '1 feature' },
                { name: 'Orca (2019)', val: '$4M', modules: '1 feature' },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{c.name}</span>
                  <span className="text-slate-500">{c.modules}</span>
                  <span className="text-white font-medium">{c.val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-700/30">
                <span className="text-pink-400 font-bold">Anchor (2026)</span>
                <span className="text-amber-400">109+ modules, 29 world-firsts</span>
                <span className="text-white font-bold">$50M\u2013$100M</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Anchor has 10-50x the feature breadth of these companies at seed stage.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider">Post-Traction Trajectory</h3>
          <div className="rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 p-5 space-y-3">
            {[
              { milestone: 'Prototype Complete (Now)', val: '$50M \u2013 $100M', active: true },
              { milestone: 'First Paying Customers', val: '$100M \u2013 $175M', active: false },
              { milestone: '$1M ARR', val: '$175M \u2013 $300M', active: false },
              { milestone: '$10M ARR', val: '$500M \u2013 $1B', active: false },
              { milestone: '$50M ARR', val: '$2B \u2013 $4B', active: false },
              { milestone: '$100M ARR', val: '$5B \u2013 $10B', active: false },
            ].map((row, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${row.active ? 'bg-pink-500/20 border border-pink-500/30' : 'bg-slate-800/30 border border-transparent'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${row.active ? 'bg-pink-500 animate-pulse' : 'bg-slate-600'}`} />
                  <span className={`text-sm ${row.active ? 'text-white font-bold' : 'text-slate-400'}`}>{row.milestone}</span>
                </div>
                <span className={`text-sm font-bold ${row.active ? 'text-pink-400' : 'text-slate-300'}`}>{row.val}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-slate-800/40 border border-amber-500/20 p-5">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">{'\u{1F3C6}'} IP Portfolio Value</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">29 World-First Layer Modules</span><span className="text-white font-bold">$29M</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Predictive CVE IP</span><span className="text-white">$2M</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Self-Evolving AI Engine</span><span className="text-white">$2M</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Autonomous SOC IP</span><span className="text-white">$1.5M</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Other 16 World-Firsts</span><span className="text-white">$8M</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-700/30">
                <span className="text-amber-400 font-bold">Total IP Value</span>
                <span className="text-amber-400 font-black text-lg">$46.5M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // SLIDE 15: FINANCIAL SUMMARY & ASK
  const renderFinancialSlide = () => (
    <div className="h-full px-8 py-6 flex flex-col">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Financial Summary � All 5 Pillars</h2>
      <div className="rounded-2xl bg-slate-800/40 border border-slate-700/30 overflow-hidden mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase">Pillar</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-400 uppercase">Modules</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-400 uppercase">{'\u{1F3C6}'}</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-slate-400 uppercase">TAM</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-slate-400 uppercase">Y1</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-slate-400 uppercase">Y3</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-slate-400 uppercase">Y5</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCT_PILLARS.map((p) => {
              const rev = revenueProjections[p.id];
              return (
                <tr key={p.id} className="border-b border-slate-700/20 hover:bg-slate-800/30">
                  <td className="px-5 py-3"><div className="flex items-center gap-2"><span className="text-lg">{p.icon}</span><span className="text-white font-medium text-sm">{p.name}</span></div></td>
                  <td className="text-center px-5 py-3 text-cyan-400 font-semibold">{p.modules.length}</td>
                  <td className="text-center px-5 py-3 text-amber-400 font-semibold">{p.worldFirstCount || '\u2014'}</td>
                  <td className={`text-center px-5 py-3 font-semibold ${p.accent}`}>{p.tam}</td>
                  <td className="text-right px-5 py-3 text-white text-sm">{rev?.y1}</td>
                  <td className="text-right px-5 py-3 text-white text-sm">{rev?.y3}</td>
                  <td className="text-right px-5 py-3 text-green-400 font-bold">{rev?.y5}</td>
                </tr>
              );
            })}
            <tr className="bg-slate-800/50">
              <td className="px-5 py-3 text-white font-bold">TOTAL</td>
              <td className="text-center px-5 py-3 text-cyan-400 font-bold">{PILLAR_STATS.totalModules}</td>
              <td className="text-center px-5 py-3 text-amber-400 font-bold">{PILLAR_STATS.totalWorldFirsts}</td>
              <td className="text-center px-5 py-3 text-pink-400 font-bold">{PILLAR_STATS.totalTAM}</td>
              <td className="text-right px-5 py-3 text-white font-bold">$72M</td>
              <td className="text-right px-5 py-3 text-white font-bold">$1.1B</td>
              <td className="text-right px-5 py-3 text-green-400 font-bold text-lg">$4.96B</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
          <div className="text-2xl font-bold text-cyan-400">$50M\u2013$100M</div>
          <div className="text-xs text-slate-400 mt-1">Pre-Revenue Valuation</div>
        </div>
        <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">$4.96B</div>
          <div className="text-xs text-slate-400 mt-1">Y5 Revenue Target</div>
        </div>
        <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-400">13</div>
          <div className="text-xs text-slate-400 mt-1">Revenue Streams</div>
        </div>
        <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
          <div className="text-2xl font-bold text-amber-400">{PILLAR_STATS.totalWorldFirsts}</div>
          <div className="text-xs text-slate-400 mt-1">Competitive Moats</div>
        </div>
      </div>
      <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30 p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">Investment Opportunity</h3>
        <p className="text-purple-300 max-w-3xl mx-auto mb-4">
          Anchor is seeking <strong className="text-pink-400">$5M\u2013$10M seed funding</strong> to accelerate go-to-market,
          scale the engineering team, and capture first-mover advantage across{' '}
          <strong className="text-cyan-400">{PILLAR_STATS.totalWorldFirsts} world-first security categories</strong> in a{' '}
          <strong className="text-white">{PILLAR_STATS.totalTAM} market</strong>.
        </p>
        <p className="text-sm text-slate-400 mb-6">
          This is not a startup pitch. This is an opportunity to own equity in a <strong className="text-white">sovereign-grade
          cyber defence platform</strong> � the only one of its kind on Earth.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-cyan-400 px-6 py-3 rounded-full bg-cyan-500/10 border border-cyan-500/30">
          <span>{'\u{1F4E7}'}</span> investors@anchoraiguard.com
        </div>
      </div>
    </div>
  );

  // SLIDE ROUTER
  const renderCurrentSlide = () => {
    if (currentSlide === 0) return renderTitleSlide();
    if (currentSlide === 1) return renderTitanSlide();
    if (currentSlide === 2) return renderPillarsSummarySlide();
    if (currentSlide >= 3 && currentSlide <= 7) return renderPillarSlide(PRODUCT_PILLARS[currentSlide - 3]);
    if (currentSlide === 8) return renderWorldFirstsSlide();
    if (currentSlide === 9) return renderNationalSecuritySlide();
    if (currentSlide === 10) return renderDigitalTwinRedTeamSlide();
    if (currentSlide === 11) return renderTelemetrySatelliteSlide();
    if (currentSlide === 12) return renderAISecuritySlide();
    if (currentSlide === 13) return renderComplianceThreatSlide();
    if (currentSlide === 14) return renderValuationNarrativeSlide();
    if (currentSlide === 15) return renderFinancialSlide();
    return renderTitleSlide();
  };

  const SLIDE_LABELS = [
    'Overview',
    'TITAN Command Centre',
    'The 5 Pillars',
    ...PRODUCT_PILLARS.map(p => p.name),
    '29 World-Firsts',
    'National Security',
    'Digital Twin + Red Team',
    'Telemetry + Satellite',
    'AI/LLM Security',
    'Compliance + Threat Hub',
    'Valuation Narrative',
    'Financials & Ask',
  ];

  const getSlideTitle = () => SLIDE_LABELS[currentSlide] || 'Overview';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-950 text-white flex flex-col">
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Anchor Investor Deck {'\u2014'} Sovereign Capability</span>
            <h2 className="text-lg font-semibold text-white">{getSlideTitle()}</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevSlide} disabled={currentSlide === 0} className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/30 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition-all" title="Previous slide">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'bg-cyan-400 w-5' : 'bg-slate-600 hover:bg-slate-500 w-2'}`} title={SLIDE_LABELS[i]} />
            ))}
          </div>
          <span className="text-xs text-slate-500 mx-2">{currentSlide + 1} / {totalSlides}</span>
          <button onClick={nextSlide} disabled={currentSlide === totalSlides - 1} className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/30 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition-all" title="Next slide">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className="text-xs text-slate-500 hidden md:block">
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] border border-slate-700">{'\u2190'} {'\u2192'}</kbd> navigate
        </div>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <div className="max-w-7xl mx-auto h-full">{renderCurrentSlide()}</div>
      </div>
      <div className="shrink-0 px-6 py-2 border-t border-slate-800/30 bg-slate-950/50 flex items-center justify-between">
        <span className="text-[10px] text-slate-600">CONFIDENTIAL {'\u2014'} Anchor AI Guard Ltd. {'\u2014'} February 2026</span>
        <span className="text-[10px] text-slate-600">Sovereign Cyber Defence Platform</span>
      </div>
    </div>
  );
};

export default InvestorSlides;
