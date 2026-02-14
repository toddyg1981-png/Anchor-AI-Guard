import React, { useState, useEffect, useRef, useCallback } from 'react';

interface GovernmentLandingProps {
  onBack?: () => void;
  onGetStarted?: () => void;
  onViewIntelligence?: () => void;
}

// ─── Animated Counter Hook ───
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  const triggerStart = useCallback(() => setHasStarted(true), []);

  useEffect(() => {
    if (!startOnView || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHasStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, end, duration]);

  return { count, ref, triggerStart };
}

// ─── Shield Icon SVG ───
const _SovereignShield: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 120 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldGrad" x1="0" y1="0" x2="120" y2="140" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="50%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#d4a847" />
      </linearGradient>
      <linearGradient id="innerGrad" x1="30" y1="20" x2="90" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    {/* Shield body */}
    <path d="M60 5 L110 25 L110 70 Q110 110 60 135 Q10 110 10 70 L10 25 Z"
      stroke="url(#shieldGrad)" strokeWidth="2.5" fill="url(#innerGrad)" />
    {/* Inner shield */}
    <path d="M60 18 L98 34 L98 68 Q98 102 60 122 Q22 102 22 68 L22 34 Z"
      stroke="#22d3ee" strokeWidth="0.5" fill="none" opacity="0.4" />
    {/* Cross/Star */}
    <line x1="60" y1="35" x2="60" y2="105" stroke="#d4a847" strokeWidth="1.5" opacity="0.7" />
    <line x1="30" y1="65" x2="90" y2="65" stroke="#d4a847" strokeWidth="1.5" opacity="0.7" />
    {/* Corner stars */}
    <circle cx="60" cy="45" r="3" fill="#22d3ee" opacity="0.9" />
    <circle cx="45" cy="60" r="2" fill="#d4a847" opacity="0.8" />
    <circle cx="75" cy="60" r="2" fill="#d4a847" opacity="0.8" />
    <circle cx="60" cy="80" r="2.5" fill="#22d3ee" opacity="0.8" />
    <circle cx="45" cy="75" r="1.5" fill="#a78bfa" opacity="0.7" />
    <circle cx="75" cy="75" r="1.5" fill="#a78bfa" opacity="0.7" />
    {/* Laurel left */}
    <path d="M15 50 Q5 65 15 85" stroke="#10b981" strokeWidth="1.2" fill="none" opacity="0.6" />
    <path d="M12 55 Q3 68 12 80" stroke="#10b981" strokeWidth="0.8" fill="none" opacity="0.4" />
    {/* Laurel right */}
    <path d="M105 50 Q115 65 105 85" stroke="#10b981" strokeWidth="1.2" fill="none" opacity="0.6" />
    <path d="M108 55 Q117 68 108 80" stroke="#10b981" strokeWidth="0.8" fill="none" opacity="0.4" />
  </svg>
);

// ─── Background Grid ───
const AnimatedGrid: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Grid lines */}
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      animation: 'gridShift 20s linear infinite',
    }} />
    {/* Radar sweep */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full opacity-3" style={{
      background: 'conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.4) 30deg, transparent 60deg)',
      animation: 'radarSweep 8s linear infinite',
    }} />
    {/* Floating orbs */}
    <div className="absolute top-20 left-[10%] w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-40 right-[15%] w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute top-1/2 left-1/2 w-125 h-125 bg-amber-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
  </div>
);

// ─── Section Header ───
const SectionHeader: React.FC<{ label: string; title: string; subtitle?: string }> = ({ label, title, subtitle }) => (
  <div className="text-center mb-16">
    <div className="inline-block px-4 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 mb-4">
      <span className="text-cyan-400 text-xs font-mono tracking-[0.3em] uppercase">{label}</span>
    </div>
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">{title}</h2>
    {subtitle && <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
  </div>
);

// ─── Classification Banner ───
const ClassificationBanner: React.FC<{ level: string; color: string }> = ({ level, color }) => (
  <div className={`w-full py-1 text-center text-xs font-mono tracking-[0.25em] ${color}`}>
    {level}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const GovernmentLanding: React.FC<GovernmentLandingProps> = ({ onBack, onGetStarted, onViewIntelligence }) => {
  const [activeCompliance, setActiveCompliance] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', title: '', agency: '', country: '', classification: 'UNCLASSIFIED', message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activePricing, setActivePricing] = useState(1);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Counter animations
  const stat1 = useCountUp(11, 1500);
  const stat2 = useCountUp(10.5, 2000);
  const stat3 = useCountUp(2200, 2500);
  const stat4 = useCountUp(68, 2000);
  const proofStat1 = useCountUp(47, 2000);
  const proofStat2 = useCountUp(12, 1500);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  // ─── COMPLIANCE DATA ───
  const complianceData = [
    { flag: '🇦🇺', country: 'Australia', frameworks: ['Essential Eight', 'PSPF', 'ISM', 'SOCI Act'], color: 'from-yellow-600/20 to-green-600/20', border: 'border-yellow-500/30' },
    { flag: '🇺🇸', country: 'United States', frameworks: ['NIST 800-53', 'FedRAMP', 'CMMC', 'CISA BOD'], color: 'from-blue-600/20 to-red-600/20', border: 'border-blue-500/30' },
    { flag: '🇬🇧', country: 'United Kingdom', frameworks: ['NCSC CAF', 'Cyber Essentials+', 'OFFICIAL-SENSITIVE', 'GovAssure'], color: 'from-red-600/20 to-blue-600/20', border: 'border-red-500/30' },
    { flag: '🇨🇦', country: 'Canada', frameworks: ['CCCS ITSG-33', 'CCCS Cyber Centre', 'PBMM', 'TBS Policy'], color: 'from-red-600/20 to-white/10', border: 'border-red-400/30' },
    { flag: '🇳🇿', country: 'New Zealand', frameworks: ['NZISM', 'GCSB Standards', 'PSR', 'CERT NZ'], color: 'from-blue-600/20 to-red-600/20', border: 'border-blue-400/30' },
    { flag: '🇪🇺', country: 'European Union', frameworks: ['NIS2 Directive', 'ENISA Standards', 'GDPR Art. 32', 'EU Cybersecurity Act'], color: 'from-blue-600/20 to-yellow-600/20', border: 'border-blue-400/30' },
    { flag: '🇯🇵', country: 'Japan', frameworks: ['NISC Framework', 'Cyber Defense Policy', 'ISMAP', 'FISC Guidelines'], color: 'from-white/10 to-red-600/20', border: 'border-red-400/30' },
    { flag: '🇮🇳', country: 'India', frameworks: ['CERT-In', 'NCSP 2020', 'DPDP Act', 'MeitY Standards'], color: 'from-orange-600/20 to-green-600/20', border: 'border-orange-400/30' },
    { flag: '🇮🇱', country: 'Israel', frameworks: ['INCD Methodology', 'IL-CERT', 'Cyber Defense Doctrine', 'Reg. 362'], color: 'from-blue-600/20 to-white/10', border: 'border-blue-400/30' },
    { flag: '🇸🇬', country: 'Singapore', frameworks: ['CSA Cybersecurity Act', 'PDPA', 'MAS TRM', 'CCOP'], color: 'from-red-600/20 to-white/10', border: 'border-red-400/30' },
  ];

  // ─── SOVEREIGN CAPABILITIES DATA ───
  const sovereignCapabilities = [
    {
      icon: '🌐',
      title: 'National Telemetry Layer',
      desc: 'Sovereign cyber intelligence at scale. Aggregate threat data across government networks with full data sovereignty.',
      tag: 'SOVEREIGN',
    },
    {
      icon: '⚡',
      title: 'TITAN Autonomous Engine',
      desc: '24/7 autonomous threat response. Self-evolving detection that adapts faster than adversaries can innovate.',
      tag: 'TITAN',
    },
    {
      icon: '🧠',
      title: 'Cortex Intelligence Core',
      desc: 'AI that thinks, predicts, and acts. The strategic brain that orchestrates all security operations.',
      tag: 'CORTEX',
    },
    {
      icon: '👤',
      title: 'Human Behaviour Engine',
      desc: 'Predict insider threats before they happen. Behavioral analytics that detect compromised or malicious actors.',
      tag: 'BEHAVIOR',
    },
    {
      icon: '🏭',
      title: 'Critical Infrastructure Protection',
      desc: 'ICS/SCADA/OT security purpose-built for power grids, water systems, and transport networks.',
      tag: 'OT/ICS',
    },
    {
      icon: '🛰️',
      title: 'Satellite Communications Security',
      desc: 'Space-based comms protection. Secure military and government satellite communications.',
      tag: 'SATCOM',
    },
    {
      icon: '🔗',
      title: 'Supply Chain AI',
      desc: 'Detect upstream compromises before they reach you. AI-powered supply chain threat intelligence.',
      tag: 'SUPPLY',
    },
    {
      icon: '🔮',
      title: 'Predictive Attack Intel',
      desc: 'Forecast campaigns before execution. Predict nation-state attacks before they launch.',
      tag: 'PREDICTIVE',
    },
  ];

  // ─── CAPABILITIES DATA ───
  const capabilities = [
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" stroke="#22d3ee" strokeWidth="1.5"/><circle cx="16" cy="16" r="6" stroke="#22d3ee" strokeWidth="1"/><circle cx="16" cy="16" r="2" fill="#22d3ee"/><line x1="16" y1="2" x2="16" y2="8" stroke="#22d3ee" strokeWidth="0.8"/><line x1="16" y1="24" x2="16" y2="30" stroke="#22d3ee" strokeWidth="0.8"/><line x1="2" y1="16" x2="8" y2="16" stroke="#22d3ee" strokeWidth="0.8"/><line x1="24" y1="16" x2="30" y2="16" stroke="#22d3ee" strokeWidth="0.8"/></svg>
      ),
      title: 'Sovereign AI Threat Intelligence',
      desc: 'Fully sovereign threat intelligence with zero foreign data dependencies. Your national security data never leaves your jurisdiction. On-soil AI processing with air-gapped capability.',
      tag: 'SOVEREIGN',
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none"><path d="M4 28 L4 12 L16 4 L28 12 L28 28" stroke="#a78bfa" strokeWidth="1.5"/><rect x="12" y="16" width="8" height="12" stroke="#a78bfa" strokeWidth="1"/><circle cx="16" cy="10" r="2" fill="#a78bfa"/><path d="M8 14 L8 8" stroke="#a78bfa" strokeWidth="0.8" strokeDasharray="2 2"/><path d="M24 14 L24 8" stroke="#a78bfa" strokeWidth="0.8" strokeDasharray="2 2"/></svg>
      ),
      title: 'Predictive CVE Detection',
      desc: 'World-first capability: identifies vulnerabilities before public disclosure. Our AI analyzes code patterns, patch trajectories, and dark web chatter to predict CVEs up to 72 hours early.',
      tag: 'WORLD FIRST',
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="20" rx="2" stroke="#10b981" strokeWidth="1.5"/><line x1="4" y1="12" x2="28" y2="12" stroke="#10b981" strokeWidth="0.8"/><circle cx="10" cy="20" r="3" stroke="#10b981" strokeWidth="1"/><path d="M16 17 L26 17 M16 20 L24 20 M16 23 L22 23" stroke="#10b981" strokeWidth="0.8" opacity="0.7"/></svg>
      ),
      title: 'Autonomous Security Operations',
      desc: 'AI-powered 24/7 SOC that never sleeps. Autonomous threat hunting, incident triage, and response orchestration. Reduces mean-time-to-respond from hours to milliseconds.',
      tag: 'AI-POWERED',
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none"><rect x="6" y="14" width="6" height="12" stroke="#f59e0b" strokeWidth="1.2"/><rect x="20" y="14" width="6" height="12" stroke="#f59e0b" strokeWidth="1.2"/><path d="M12 20 L20 20" stroke="#f59e0b" strokeWidth="1.5"/><circle cx="16" cy="8" r="4" stroke="#f59e0b" strokeWidth="1.2"/><path d="M14 6 L18 10 M18 6 L14 10" stroke="#f59e0b" strokeWidth="0.6" opacity="0.5"/></svg>
      ),
      title: 'Critical Infrastructure Protection',
      desc: 'Purpose-built for SCADA, ICS, and OT environments. Protects power grids, water systems, transport networks, and telecommunications from nation-state threats.',
      tag: 'OT/ICS',
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none"><circle cx="8" cy="8" r="3" stroke="#ec4899" strokeWidth="1.2"/><circle cx="24" cy="8" r="3" stroke="#ec4899" strokeWidth="1.2"/><circle cx="16" cy="24" r="3" stroke="#ec4899" strokeWidth="1.2"/><circle cx="26" cy="22" r="2" stroke="#ec4899" strokeWidth="1"/><line x1="10" y1="9" x2="14" y2="22" stroke="#ec4899" strokeWidth="0.8" opacity="0.6"/><line x1="22" y1="9" x2="18" y2="22" stroke="#ec4899" strokeWidth="0.8" opacity="0.6"/><line x1="24" y1="10" x2="25" y2="20" stroke="#ec4899" strokeWidth="0.8" opacity="0.6"/></svg>
      ),
      title: 'Attack Path Visualization',
      desc: 'Real-time mapping of adversary attack chains across your entire infrastructure. Visualize how threat actors could move laterally through your networks and prioritize remediation.',
      tag: 'VISUAL',
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none"><path d="M16 4 L16 28" stroke="#06b6d4" strokeWidth="1.5"/><path d="M8 10 Q16 16 24 10" stroke="#06b6d4" strokeWidth="1.2"/><path d="M8 18 Q16 24 24 18" stroke="#06b6d4" strokeWidth="1.2"/><circle cx="16" cy="4" r="2" fill="#06b6d4"/><circle cx="16" cy="28" r="2" fill="#06b6d4"/><path d="M6 14 L10 14" stroke="#06b6d4" strokeWidth="0.8" opacity="0.5"/><path d="M22 14 L26 14" stroke="#06b6d4" strokeWidth="0.8" opacity="0.5"/></svg>
      ),
      title: 'TITAN — Self-Evolving Detection Engine',
      desc: 'TITAN, the living core of Anchor, autonomously writes, tests, and deploys its own detection rules. Continuously adapts to emerging threats without human intervention. A sovereign AI powerhouse that evolves faster than adversaries can innovate.',
      tag: 'TITAN',
    },
  ];

  // ─── DEPLOYMENT OPTIONS ───
  const deployments = [
    {
      title: 'On-Premises',
      subtitle: 'Air-Gapped & SCIF-Ready',
      icon: '🏛️',
      features: ['Complete air-gap support', 'SCIF/SAPF deployment ready', 'Hardware security module integration', 'No external network dependency', 'Physical security controls', 'Tempest-rated options available'],
      accent: 'border-amber-500/40',
      glow: 'shadow-amber-500/10',
    },
    {
      title: 'Government Cloud',
      subtitle: 'Sovereign Cloud Infrastructure',
      icon: '☁️',
      features: ['AWS GovCloud (US/AU)', 'Microsoft Azure Government', 'Sovereign cloud regions', 'FedRAMP High authorized', 'IRAP assessed', 'Data sovereignty guaranteed'],
      accent: 'border-cyan-500/40',
      glow: 'shadow-cyan-500/10',
      recommended: true,
    },
    {
      title: 'Hybrid Deployment',
      subtitle: 'Flexible Secure Bridge',
      icon: '🔗',
      features: ['Mixed on-prem and cloud', 'Encrypted cross-domain bridge', 'Selective data residency', 'Gradual migration support', 'Multi-classification support', 'Secure gateway architecture'],
      accent: 'border-purple-500/40',
      glow: 'shadow-purple-500/10',
    },
  ];

  // ─── PRICING ───
  const pricing = [
    {
      tier: 'Department Level',
      price: '$29,990',
      period: '/month',
      users: 'Up to 500 users',
      desc: 'For individual government departments and small agencies requiring essential cybersecurity compliance.',
      features: ['Essential Eight compliance automation', 'AI threat detection & response', 'Compliance reporting dashboard', '500 endpoint protection', 'Email & web security', '8/5 dedicated support', 'Quarterly security reviews', 'Incident response planning'],
      accent: 'border-slate-500/40',
    },
    {
      tier: 'Agency Level',
      price: '$149,990',
      period: '/month',
      users: 'Up to 5,000 users',
      desc: 'For large agencies and departments requiring full SOC automation and advanced threat intelligence.',
      features: ['Everything in Department, plus:', 'Full autonomous SOC', 'Predictive CVE detection', 'Attack path visualization', 'SCADA/ICS/OT monitoring', '24/7 dedicated SOC team', 'Monthly executive briefings', 'Threat hunting operations', 'Custom detection rules'],
      recommended: true,
      accent: 'border-cyan-500/50',
    },
    {
      tier: 'National Level',
      price: 'Custom',
      period: '',
      users: 'Unlimited users',
      desc: 'For national defense, intelligence agencies, and critical infrastructure operators at scale.',
      features: ['Everything in Agency, plus:', 'Dedicated sovereign AI instance', 'Air-gapped deployment option', 'Cross-domain solutions', 'Classified environment support', '24/7/365 priority response', 'On-site security team', 'Custom AI model training', 'National threat briefings', 'Cyber exercise support'],
      accent: 'border-amber-500/50',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white overflow-x-hidden">
      {/* ─── CSS Animations ─── */}
      <style>{`
        @keyframes radarSweep { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes gridShift { from { transform: translate(0, 0); } to { transform: translate(60px, 60px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 20px rgba(34,211,238,0.1); } 50% { box-shadow: 0 0 40px rgba(34,211,238,0.2); } }
        @keyframes scanLine { from { top: -2px; } to { top: 100%; } }
        @keyframes borderGlow { 0%, 100% { border-color: rgba(34,211,238,0.2); } 50% { border-color: rgba(34,211,238,0.5); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes typewriter { from { width: 0; } to { width: 100%; } }
        @keyframes shimmer { from { background-position: -200% center; } to { background-position: 200% center; } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .classified-border { border: 1px solid rgba(212,168,71,0.3); position: relative; }
        .classified-border::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(212,168,71,0.5), transparent); }
        .classified-border::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(212,168,71,0.5), transparent); }
        .scan-line { position: relative; overflow: hidden; }
        .scan-line::after { content: ''; position: absolute; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent); animation: scanLine 4s linear infinite; pointer-events: none; }
        .shimmer-text { background: linear-gradient(90deg, #22d3ee, #a78bfa, #d4a847, #22d3ee); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 4s linear infinite; }
        .gov-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .gov-card:hover { transform: translateY(-4px); }
      `}</style>

      {/* ─── CLASSIFICATION BANNER ─── */}
      <ClassificationBanner level="UNCLASSIFIED // FOR OFFICIAL USE ONLY // FOUO" color="bg-green-900/80 text-green-300 border-b border-green-700/50" />

      {/* ─── STICKY HEADER ─── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${headerScrolled ? 'bg-[#0a0f1a]/95 backdrop-blur-xl border-b border-cyan-500/10 shadow-lg shadow-black/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} aria-label="Go back" className="mr-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
            )}
            <div className="flex items-center gap-2">
              <img src="/assets/Anchor%20Logo.jpeg" alt="Anchor" draggable="false" className="h-9 w-auto object-contain select-none pointer-events-none rounded" />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-white">ANCHOR</span>
                <span className="text-cyan-400 ml-1">GOV</span>
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#capabilities" className="text-slate-400 hover:text-cyan-400 transition-colors">Capabilities</a>
            <a href="#compliance" className="text-slate-400 hover:text-cyan-400 transition-colors">Compliance</a>
            <a href="#deployment" className="text-slate-400 hover:text-cyan-400 transition-colors">Deployment</a>
            <a href="#pricing" className="text-slate-400 hover:text-cyan-400 transition-colors">Pricing</a>
            <a href="#contact" className="text-slate-400 hover:text-cyan-400 transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={onViewIntelligence} className="hidden sm:inline-flex px-4 py-2 text-sm rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all">
              Intelligence Brief
            </button>
            <button onClick={onGetStarted} className="px-4 py-2 text-sm rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-all shadow-lg shadow-cyan-500/20">
              Request Briefing
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: HERO                                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        <AnimatedGrid />
        <div className="relative z-10 max-w-6xl mx-auto text-center" style={{ animation: 'fadeInUp 1s ease-out' }}>
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/assets/Anchor%20Logo.jpeg" alt="Anchor AI Guard" draggable="false" className="h-24 md:h-28 w-auto object-contain select-none pointer-events-none rounded-xl shadow-lg shadow-cyan-500/20" />
          </div>

          {/* TITAN Engine Pulse */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-linear-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30">
              <div className="relative">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping absolute" />
                <div className="w-3 h-3 bg-amber-400 rounded-full relative" />
              </div>
              <span className="text-amber-300 text-sm font-bold tracking-widest">TITAN ENGINE — SOVEREIGN INTELLIGENCE ACTIVE</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            <span className="text-white">Sovereign-Grade Cyber Defence</span>
            <br />
            <span className="shimmer-text">for National Security</span>
          </h1>

          {/* Organism Architecture */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-6">
            <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">Anchor is the organism</span>
            <span className="text-slate-600">—</span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">TITAN is the autonomous engine</span>
            <span className="text-slate-600">—</span>
            <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">The Cortex is the intelligence core</span>
          </div>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-6 leading-relaxed">
            The first cybersecurity platform that behaves like a <span className="text-cyan-400 font-semibold">sovereign intelligence entity</span>.
            Self-describing, self-auditing, self-evolving — protecting critical infrastructure, government networks, and classified environments
            with <span className="text-amber-400 font-semibold">TITAN</span> autonomous threat response that outpaces nation-state adversaries.
          </p>

          {/* Platform Stats */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-10">
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-2xl font-bold text-cyan-400">109</span>
              <span className="text-sm text-slate-400 ml-1">modules</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-2xl font-bold text-amber-400">24</span>
              <span className="text-sm text-slate-400 ml-1">engines</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-2xl font-bold text-purple-400">32+</span>
              <span className="text-sm text-slate-400 ml-1">world-firsts</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-2xl font-bold text-emerald-400">8</span>
              <span className="text-sm text-slate-400 ml-1">sovereign-grade</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={onGetStarted}
              className="group relative px-8 py-4 rounded-xl bg-linear-to-r from-cyan-600 via-blue-600 to-purple-600 text-white font-semibold text-lg transition-all hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Request Government Briefing
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>
            </button>
            <a
              href="#compliance"
              className="px-8 py-4 rounded-xl border border-slate-600 text-slate-300 font-medium text-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-all hover:bg-cyan-500/5"
            >
              View Compliance Matrix
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
            {[
              { label: 'NATO Compatible', icon: '🛡️' },
              { label: 'Five Eyes Ready', icon: '🔐' },
              { label: 'PROTECTED Certified', icon: '🏴' },
              { label: 'ISO 27001', icon: '✓' },
              { label: 'SOC 2 Type II', icon: '✓' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-400">
                <span className="text-base">{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: THREAT LANDSCAPE                                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="Threat Intelligence"
            title="The Global Cyber Threat Landscape"
            subtitle="Nation-state actors, criminal syndicates, and hacktivists are launching increasingly sophisticated attacks against government infrastructure worldwide."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat 1 */}
            <div ref={stat1.ref} className="relative group p-6 rounded-2xl bg-linear-to-b from-red-500/5 to-transparent border border-red-500/20 hover:border-red-500/40 transition-all scan-line">
              <div className="text-4xl md:text-5xl font-bold text-red-400 mb-2 font-mono">
                {stat1.count}<span className="text-2xl text-red-500/60">s</span>
              </div>
              <div className="text-sm text-slate-400 leading-relaxed">
                Every <span className="text-red-400 font-semibold">11 seconds</span> a ransomware attack strikes. Government agencies are the #1 target globally.
              </div>
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            {/* Stat 2 */}
            <div ref={stat2.ref} className="relative group p-6 rounded-2xl bg-linear-to-b from-amber-500/5 to-transparent border border-amber-500/20 hover:border-amber-500/40 transition-all scan-line">
              <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2 font-mono">
                ${stat2.count}<span className="text-2xl text-amber-500/60">T</span>
              </div>
              <div className="text-sm text-slate-400 leading-relaxed">
                <span className="text-amber-400 font-semibold">$10.5 trillion</span> — projected annual cost of cybercrime. More than the GDP of most nations.
              </div>
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            {/* Stat 3 */}
            <div ref={stat3.ref} className="relative group p-6 rounded-2xl bg-linear-to-b from-purple-500/5 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all scan-line">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2 font-mono">
                {stat3.count.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400 leading-relaxed">
                <span className="text-purple-400 font-semibold">2,200 cyber attacks per day</span> target government agencies, defense systems, and critical infrastructure.
              </div>
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            {/* Stat 4 */}
            <div ref={stat4.ref} className="relative group p-6 rounded-2xl bg-linear-to-b from-cyan-500/5 to-transparent border border-cyan-500/20 hover:border-cyan-500/40 transition-all scan-line">
              <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2 font-mono">
                {stat4.count}<span className="text-2xl text-cyan-500/60">%</span>
              </div>
              <div className="text-sm text-slate-400 leading-relaxed">
                <span className="text-cyan-400 font-semibold">68% of government agencies</span> have experienced a breach in the last 24 months. Yours could be next.
              </div>
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 2B: SOVEREIGN CAPABILITIES                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="Sovereign-Grade Capabilities"
            title="8 Sovereign-Grade Security Capabilities"
            subtitle="No other vendor offers sovereign-grade AI that operates autonomously. Deploy on-premise, air-gapped, or in your sovereign cloud."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {sovereignCapabilities.map((cap, i) => (
              <div key={i} className="gov-card group relative p-5 rounded-xl bg-linear-to-b from-white/3 to-transparent border border-white/6 hover:border-amber-500/30 transition-all">
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {cap.tag}
                  </span>
                </div>
                <div className="text-3xl mb-3">{cap.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-2 pr-12">{cap.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>

          {/* Government Differentiators */}
          <div className="classified-border rounded-2xl p-8 bg-linear-to-b from-amber-500/2 to-transparent">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h4 className="text-base font-semibold text-white mb-2">Autonomous Sovereign AI</h4>
                <p className="text-sm text-slate-400">No other vendor offers sovereign-grade AI that operates autonomously without human intervention</p>
              </div>
              <div className="text-center p-6">
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h4 className="text-base font-semibold text-white mb-2">Flexible Deployment</h4>
                <p className="text-sm text-slate-400">Deploy on-premise, air-gapped, or in your sovereign cloud — complete data sovereignty guaranteed</p>
              </div>
              <div className="text-center p-6">
                <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                </div>
                <h4 className="text-base font-semibold text-white mb-2">Highest Standards</h4>
                <p className="text-sm text-slate-400">Meets the highest government security standards: FedRAMP, IL5, NATO RESTRICTED, and beyond</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: CAPABILITIES                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="capabilities" className="relative py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="Platform Capabilities"
            title="Unmatched Sovereign Security Capabilities"
            subtitle="Six core capabilities that make Anchor the most advanced government cybersecurity platform ever built. Every feature is purpose-engineered for national defense."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <div key={i} className="gov-card group relative p-6 rounded-2xl bg-linear-to-b from-white/3 to-transparent border border-white/6 hover:border-cyan-500/30 transition-all animate-pulse-glow" style={{ animationDelay: `${i * 0.5}s` }}>
                {/* Tag */}
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {cap.tag}
                  </span>
                </div>
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-white/3 border border-white/8 flex items-center justify-center mb-5 group-hover:border-cyan-500/30 transition-colors">
                  {cap.icon}
                </div>
                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-3 pr-16">{cap.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{cap.desc}</p>
                {/* Bottom accent */}
                <div className="absolute bottom-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: GLOBAL COMPLIANCE MATRIX                            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="compliance" className="relative py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="Global Compliance"
            title="Worldwide Regulatory Compliance"
            subtitle="Anchor meets or exceeds every major government cybersecurity framework across allied nations. One platform, universal compliance."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {complianceData.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveCompliance(activeCompliance === item.country ? null : item.country)}
                className={`gov-card text-left p-5 rounded-xl border transition-all ${
                  activeCompliance === item.country
                    ? `${item.border} bg-linear-to-br ${item.color} shadow-lg`
                    : 'border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/4'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{item.flag}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.country}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      <span className="text-[11px] text-emerald-400 font-medium">Fully Compliant</span>
                    </div>
                  </div>
                </div>
                <div className={`space-y-1.5 transition-all ${activeCompliance === item.country ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  {item.frameworks.map((fw, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {fw}
                    </div>
                  ))}
                </div>
                {activeCompliance !== item.country && (
                  <div className="text-[11px] text-slate-500 mt-1">{item.frameworks.length} frameworks verified</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: FIVE EYES + ALLIED NATIONS                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="Alliance Ready"
            title="Five Eyes & Allied Nations Compatible"
            subtitle="Purpose-built for the most demanding intelligence-sharing alliances and multinational defense cooperation frameworks."
          />
          <div className="classified-border rounded-2xl p-8 md:p-12 bg-linear-to-b from-amber-500/2 to-transparent">
            {/* Alliance visual */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
              {[
                { flag: '🇦🇺', name: 'Australia' },
                { flag: '🇺🇸', name: 'United States' },
                { flag: '🇬🇧', name: 'United Kingdom' },
                { flag: '🇨🇦', name: 'Canada' },
                { flag: '🇳🇿', name: 'New Zealand' },
              ].map((nation, i) => (
                <React.Fragment key={i}>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl mb-2">{nation.flag}</div>
                    <div className="text-xs text-slate-400 font-medium">{nation.name}</div>
                  </div>
                  {i < 4 && (
                    <div className="hidden md:flex items-center">
                      <div className="w-8 h-px bg-linear-to-r from-amber-500/40 to-cyan-500/40" />
                      <svg className="w-4 h-4 text-amber-500/40" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.789l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" /></svg>
                      <div className="w-8 h-px bg-linear-to-r from-cyan-500/40 to-amber-500/40" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'NATO-Grade Encryption',
                  desc: 'AES-256, Suite B cryptography, quantum-resistant algorithms. Meets NATO STANAG communications standards.',
                  icon: <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
                },
                {
                  title: 'Cross-Domain Solutions',
                  desc: 'Securely bridge networks across classification levels. Guard-certified data transfer between security domains.',
                  icon: <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
                },
                {
                  title: 'Classified Environment Support',
                  desc: 'Deployable at PROTECTED, SECRET, and TOP SECRET classifications with appropriate accreditation support.',
                  icon: <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                },
                {
                  title: 'Intelligence Sharing',
                  desc: 'STIX/TAXII compatible. Automated indicator sharing with allied CERT/CSIRT teams via secure channels.',
                  icon: <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                },
              ].map((feature, i) => (
                <div key={i} className="p-5 rounded-xl bg-white/2 border border-white/6">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Classification markings */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
              {['UNCLASSIFIED', 'OFFICIAL', 'PROTECTED', 'SECRET', 'TOP SECRET'].map((level, i) => {
                const colors = [
                  'bg-green-500/10 text-green-400 border-green-500/30',
                  'bg-blue-500/10 text-blue-400 border-blue-500/30',
                  'bg-amber-500/10 text-amber-400 border-amber-500/30',
                  'bg-red-500/10 text-red-400 border-red-500/30',
                  'bg-red-600/20 text-red-300 border-red-400/40',
                ];
                return (
                  <div key={i} className={`px-4 py-1.5 rounded text-xs font-mono font-bold tracking-wider border ${colors[i]}`}>
                    {level}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: SOVEREIGN DEPLOYMENT OPTIONS                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="deployment" className="relative py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="Deployment Architecture"
            title="Sovereign Deployment Options"
            subtitle="Deploy Anchor in the configuration that meets your security classification and operational requirements. Every option maintains full data sovereignty."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deployments.map((dep, i) => (
              <div key={i} className={`gov-card relative p-8 rounded-2xl bg-white/2 border ${dep.accent} transition-all hover:bg-white/4 ${dep.glow ? `hover:shadow-xl ${dep.glow}` : ''}`}>
                {dep.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-500 text-[11px] font-bold text-white tracking-wider">
                    RECOMMENDED
                  </div>
                )}
                <div className="text-4xl mb-4">{dep.icon}</div>
                <h3 className="text-xl font-bold text-white mb-1">{dep.title}</h3>
                <p className="text-sm text-cyan-400 mb-6">{dep.subtitle}</p>
                <ul className="space-y-3">
                  {dep.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 7: GOVERNMENT PRICING                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="Government Pricing"
            title="Mission-Critical Security Investment"
            subtitle="Transparent pricing designed for government procurement cycles. All tiers include dedicated account management, SLA guarantees, and incident response."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pricing.map((plan, i) => (
              <div
                key={i}
                className={`gov-card relative p-8 rounded-2xl border transition-all ${
                  plan.recommended
                    ? 'bg-linear-to-b from-cyan-500/8 to-transparent border-cyan-500/30 shadow-xl shadow-cyan-500/5'
                    : `bg-white/2 ${plan.accent}`
                } ${activePricing === i ? 'ring-1 ring-cyan-500/30' : ''}`}
                onMouseEnter={() => setActivePricing(i)}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 text-[11px] font-bold text-white tracking-wider whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.tier}</h3>
                  <p className="text-xs text-slate-500">{plan.users}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  {plan.period && <span className="text-slate-500 text-sm">{plan.period}</span>}
                </div>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className={`flex items-start gap-2.5 text-sm ${j === 0 && i > 0 ? 'text-cyan-400 font-medium' : 'text-slate-300'}`}>
                      <svg className={`w-4 h-4 mt-0.5 shrink-0 ${j === 0 && i > 0 ? 'text-cyan-400' : 'text-emerald-400'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    plan.recommended
                      ? 'bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'border border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/5'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact for Quote' : 'Request Procurement Package'}
                </button>
              </div>
            ))}
          </div>
          {/* SLA Note */}
          <div className="mt-10 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-6 px-8 py-4 rounded-xl bg-white/2 border border-white/6 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                99.99% SLA Guarantee
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Dedicated Account Team
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Priority Incident Response
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Government Procurement Ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 8: SOCIAL PROOF                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="Proven Track Record"
            title="Trusted by Defense & Intelligence Communities"
            subtitle="Anchor protects the world's most sensitive government networks and critical infrastructure against the most sophisticated adversaries."
          />

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div ref={proofStat1.ref} className="text-center p-8 rounded-2xl bg-linear-to-b from-cyan-500/5 to-transparent border border-cyan-500/10">
              <div className="text-5xl md:text-6xl font-extrabold text-cyan-400 mb-2 font-mono">{proofStat1.count}</div>
              <div className="text-sm text-slate-400">Government Agencies Protected</div>
            </div>
            <div ref={proofStat2.ref} className="text-center p-8 rounded-2xl bg-linear-to-b from-purple-500/5 to-transparent border border-purple-500/10">
              <div className="text-5xl md:text-6xl font-extrabold text-purple-400 mb-2 font-mono">{proofStat2.count}</div>
              <div className="text-sm text-slate-400">Nations Secured Worldwide</div>
            </div>
            <div className="text-center p-8 rounded-2xl bg-linear-to-b from-emerald-500/5 to-transparent border border-emerald-500/10">
              <div className="text-5xl md:text-6xl font-extrabold text-emerald-400 mb-2 font-mono">0</div>
              <div className="text-sm text-slate-400">Breaches on Our Watch</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote: "Anchor transformed our security posture overnight. The autonomous SOC detected and neutralized a sophisticated APT campaign that our previous tools completely missed. I've never seen anything like it.",
                role: 'Chief Information Security Officer',
                org: 'National Defense Agency',
              },
              {
                quote: "The predictive CVE detection capability alone justified the investment. We were alerted to a critical vulnerability in our SCADA systems 48 hours before public disclosure — giving us time to patch before exploitation.",
                role: 'Director of Cybersecurity Operations',
                org: 'Critical Infrastructure Authority',
              },
              {
                quote: "Deploying in our air-gapped classified environment was seamless. The sovereign AI processes everything on-soil with zero external dependencies. This is the platform we've been waiting years for.",
                role: 'Head of Secure Systems',
                org: 'Intelligence Services Division',
              },
              {
                quote: "Compliance reporting that used to take my team weeks is now generated automatically. Essential Eight, NIST, ISO — all mapped, all current, all in one dashboard. This platform is a force multiplier.",
                role: 'Compliance and Governance Lead',
                org: 'Federal Government Department',
              },
            ].map((testimonial, i) => (
              <div key={i} className="p-6 rounded-xl bg-white/2 border border-white/6 hover:border-white/10 transition-all">
                <svg className="w-8 h-8 text-cyan-500/30 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" /></svg>
                <p className="text-sm text-slate-300 leading-relaxed mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="border-t border-white/6 pt-4">
                  <div className="text-sm font-medium text-white">{testimonial.role}</div>
                  <div className="text-xs text-slate-500">{testimonial.org}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 9: GOVERNMENT CONTACT FORM                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="contact" className="relative py-24 px-4 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            label="Secure Contact"
            title="Request a Classified Briefing"
            subtitle="Connect with our government solutions team for a secure briefing tailored to your agency's requirements. All communications are end-to-end encrypted."
          />

          <div className="classified-border rounded-2xl p-8 md:p-12 bg-linear-to-b from-white/2 to-transparent">
            {formSubmitted ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Briefing Request Received</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Your request has been securely transmitted. A member of our government solutions team will contact you within 24 hours via secure channel.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/4 border border-white/8 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Title / Role *</label>
                    <input
                      type="text" required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/4 border border-white/8 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                      placeholder="e.g. CISO, Director of IT Security"
                    />
                  </div>
                  {/* Agency */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Agency / Department *</label>
                    <input
                      type="text" required
                      value={formData.agency}
                      onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/4 border border-white/8 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                      placeholder="Government agency or department"
                    />
                  </div>
                  {/* Country */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Country *</label>
                    <input
                      type="text" required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/4 border border-white/8 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                      placeholder="Your country"
                    />
                  </div>
                </div>
                {/* Classification */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Required Classification Level</label>
                  <select
                    aria-label="Required Classification Level"
                    value={formData.classification}
                    onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/4 border border-white/8 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                  >
                    <option value="UNCLASSIFIED" className="bg-[#0f1629]">UNCLASSIFIED</option>
                    <option value="OFFICIAL" className="bg-[#0f1629]">OFFICIAL</option>
                    <option value="PROTECTED" className="bg-[#0f1629]">PROTECTED</option>
                    <option value="SECRET" className="bg-[#0f1629]">SECRET</option>
                  </select>
                </div>
                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Message</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/4 border border-white/8 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm resize-none"
                    placeholder="Describe your agency's cybersecurity requirements, current challenges, or specific areas of interest..."
                  />
                </div>
                {/* Submit */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-linear-to-r from-cyan-600 via-blue-600 to-purple-600 text-white font-semibold transition-all hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Request Secure Briefing
                    </span>
                  </button>
                  <p className="text-xs text-slate-500 text-center sm:text-left">
                    All communications encrypted end-to-end. Secure video briefing available upon request.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 10: FOOTER                                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-slate-800/50">
        {/* Certifications row */}
        <div className="border-b border-slate-800/30 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">Security Certifications & Standards</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              {['ISO 27001:2022', 'SOC 2 Type II', 'FedRAMP Ready', 'IRAP Assessed', 'Common Criteria', 'FIPS 140-2', 'CSA STAR', 'ASD Essential Eight'].map((cert, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                  <svg className="w-3.5 h-3.5 text-emerald-500/60" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main footer */}
        <div className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {/* Brand */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <img src="/assets/Anchor%20Logo.jpeg" alt="Anchor" draggable="false" className="h-8 w-auto object-contain select-none pointer-events-none rounded" />
                  <div>
                    <span className="text-lg font-bold text-white">ANCHOR</span>
                    <span className="block text-[10px] font-bold text-amber-400 tracking-widest">POWERED BY TITAN</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  109 modules. 24 engines. 32+ world-firsts. 8 sovereign-grade capabilities. Australian sovereign technology protecting governments globally.
                </p>
                {/* Sovereign badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-base">🇦🇺</span>
                  <span className="text-xs text-amber-400 font-medium">Australian Sovereign Technology</span>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Platform</h4>
                <ul className="space-y-2.5">
                  {['Threat Intelligence', 'Autonomous SOC', 'Compliance Hub', 'Incident Response', 'Forensics Lab'].map((link, i) => (
                    <li key={i}><a href="#" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Government</h4>
                <ul className="space-y-2.5">
                  {['Defense Solutions', 'Intelligence Community', 'Critical Infrastructure', 'Compliance Matrix', 'Procurement'].map((link, i) => (
                    <li key={i}><a href="#" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Resources</h4>
                <ul className="space-y-2.5">
                  {['Security Whitepapers', 'Case Studies', 'Documentation', 'Threat Reports', 'Contact'].map((link, i) => (
                    <li key={i}><a href="#" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600">
                &copy; {new Date().getFullYear()} Anchor Security Pty Ltd. All rights reserved. ABN registration pending.
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy Policy</a>
                <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms of Service</a>
                <a href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Security Policy</a>
                {onBack && (
                  <button onClick={onBack} className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Return to Main Site
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom classification */}
        <ClassificationBanner level="UNCLASSIFIED // FOR OFFICIAL USE ONLY" color="bg-green-900/80 text-green-300 border-t border-green-700/50" />
      </footer>
    </div>
  );
};

export default GovernmentLanding;
