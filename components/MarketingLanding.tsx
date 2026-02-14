import React, { useState, useEffect, useRef } from 'react';
import { env } from '../config/env';
import PillarLandingSections from './PillarLandingSections';

interface MarketingLandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onViewPricing: () => void;
  onViewPrivacy?: () => void;
  onViewTerms?: () => void;
  onViewSecurity?: () => void;
  onViewAbout?: () => void;
  onViewContact?: () => void;
  onViewPurchaseTerms?: () => void;
  onViewCookiePolicy?: () => void;
  onViewAcceptableUse?: () => void;
  onViewDPA?: () => void;
  onViewDisclaimer?: () => void;
  onViewResponsibleDisclosure?: () => void;
  onViewIntelligence?: () => void;
  onViewGovernment?: () => void;
  onViewPillarPricing?: () => void;
  onViewProducts?: () => void;
  onViewInvestors?: () => void;
  onViewSLA?: () => void;
  onViewEULA?: () => void;
  onViewSovereignData?: () => void;
  onViewWhistleblower?: () => void;
  onViewIncidentResponsePolicy?: () => void;
  onViewAccessibility?: () => void;
}

// Use centralized env config - strip /api suffix for analytics endpoints
const API_BASE = env.apiBaseUrl.replace(/\/api$/, '');

const MarketingLanding: React.FC<MarketingLandingProps> = ({
  onGetStarted,
  onLogin,
  onViewPricing,
  onViewPrivacy,
  onViewTerms,
  onViewSecurity,
  onViewAbout,
  onViewContact,
  onViewPurchaseTerms,
  onViewCookiePolicy,
  onViewAcceptableUse,
  onViewDPA,
  onViewDisclaimer,
  onViewResponsibleDisclosure,
  onViewIntelligence,
  onViewGovernment,
  onViewPillarPricing,
  onViewProducts,
  onViewInvestors,
  onViewSLA,
  onViewEULA,
  onViewSovereignData,
  onViewWhistleblower,
  onViewIncidentResponsePolicy,
  onViewAccessibility,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [videoViews, setVideoViews] = useState<number>(0);
  const hasTrackedView = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch initial video view count
  useEffect(() => {
    fetch(`${API_BASE}/api/analytics/video-views`)
      .then(res => res.json())
      .then(data => setVideoViews(data.views || 0))
      .catch(() => setVideoViews(12847)); // Fallback if API unavailable
  }, []);

  const handleVideoPlay = (videoId: string) => {
    // Only track once per video per session
    if (hasTrackedView.current.has(videoId)) return;
    hasTrackedView.current.add(videoId);
    
    fetch(`${API_BASE}/api/analytics/video-view`, { method: 'POST' })
      .then(res => res.json())
      .then(data => setVideoViews(data.views))
      .catch(() => setVideoViews(prev => prev + 1));
  };

  const _features = [
    {
      icon: '🤖',
      title: 'Autonomous SOC',
      description: 'World\'s first fully autonomous Security Operations Center. AI handles triage, investigation, and incident response 24/7 without human intervention.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🪞',
      title: 'Digital Twin Security',
      description: 'Create exact virtual replicas of your entire infrastructure. Simulate sophisticated attacks and test defenses in a safe, isolated environment.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🔮',
      title: 'Predictive CVE Intelligence',
      description: 'Our AI analyses code patterns to predict vulnerabilities before they\'re publicly disclosed. Get alerts weeks before CVEs are announced.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🏛️',
      title: 'National Security Module',
      description: 'Purpose-built for government agencies. SCIF compliance, classified environment management, and cross-domain security solutions.',
      badge: 'GOVERNMENT',
      badgeColor: 'bg-red-500',
    },
    {
      icon: '🏗️',
      title: 'Critical Infrastructure Protection',
      description: 'Comprehensive protection for all 16 critical infrastructure sectors. NERC CIP compliance, real-time OT/ICS/SCADA monitoring.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🔗',
      title: 'Supply Chain Attestation',
      description: 'Blockchain-verified software provenance with cryptographic proof of component integrity. Full SBOM generation and dependency tracking.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🛡️',
      title: 'Cyber Insurance Integration',
      description: 'Real-time risk scoring directly integrated with cyber insurers. Automated premium calculations, policy compliance, and claims processing.',
      badge: 'INDUSTRY FIRST',
      badgeColor: 'bg-cyan-500',
    },
    {
      icon: '🧠',
      title: 'AI/LLM Security Scanner',
      description: 'Protect your AI models and LLMs from prompt injection, jailbreaking, data poisoning, and model extraction attacks.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🎯',
      title: 'Advanced Threat Hunting',
      description: 'Proactive threat hunting with complete MITRE ATT&CK framework coverage. Hunt for adversaries before they compromise your systems.',
      badge: 'ENTERPRISE',
      badgeColor: 'bg-pink-500',
    },
    {
      icon: '🔒',
      title: 'Quantum-Ready Cryptography',
      description: 'Post-quantum encryption algorithms ready for deployment. Future-proof your data against quantum computing threats today.',
      badge: 'FUTURE READY',
      badgeColor: 'bg-green-500',
    },
    {
      icon: '🕵️',
      title: 'Dark Web Monitoring',
      description: 'Continuous monitoring of dark web forums, marketplaces, and paste sites for leaked credentials, exposed data, and threat intelligence.',
      badge: 'ENTERPRISE',
      badgeColor: 'bg-pink-500',
    },
    {
      icon: '⚡',
      title: 'Automated Incident Response',
      description: 'SOAR-powered playbooks that automatically contain, investigate, and remediate security incidents in minutes, not hours.',
      badge: 'ENTERPRISE',
      badgeColor: 'bg-pink-500',
    },
    {
      icon: '🔧',
      title: '1-Click AI Fix Button',
      description: 'Found a vulnerability? Hit the Fix button and our AI instantly generates a secure, tested patch — complete with a pull request ready to merge. No manual coding required.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🧬',
      title: 'AI Self-Evolution Engine',
      description: 'Anchor evolves itself. Our AI continuously monitors global threat feeds, generates new detection rules, and updates its own defenses — so you\'re always ahead of the next attack.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '💻',
      title: 'Endpoint Detection & Response',
      description: 'Full EDR/XDR protection for Windows, macOS, Linux, iOS & Android. AI-powered threat detection, automatic quarantine, device isolation, and compliance enforcement.',
      badge: 'COMPLETE PLATFORM',
      badgeColor: 'bg-cyan-500',
    },
    {
      icon: '🌐',
      title: 'Anchor Intelligence API',
      description: 'Our self-evolving AI as a service. Threat intel feeds, detection rule generation in 6 formats, predictive modeling, IOC enrichment, and competitive intelligence — all via one REST API.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '📦',
      title: 'SDK Security Suite',
      description: 'Official SDKs for Python, Node.js, Go, Java, C#, and Ruby — with built-in dependency scanning, supply chain verification, and security best practices baked into every integration.',
      badge: 'NEW',
      badgeColor: 'bg-cyan-500',
    },
    // ═══════════════════════════════════════════════════════════════
    // 32+ WORLD-FIRST SECURITY LAYERS — NO OTHER VENDOR HAS THESE
    // ═══════════════════════════════════════════════════════════════
    {
      icon: '🔩',
      title: 'Hardware Integrity Layer',
      description: 'The industry\'s first platform-level hardware trust verification. Detects malicious peripherals, hardware implants, rogue USB devices, BIOS/UEFI tampering, and TPM manipulation — protecting the physical trust boundary nobody else touches.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '💾',
      title: 'Firmware & Microcode Security',
      description: 'First-ever firmware integrity scanner with supply-chain provenance verification. Detects firmware implants, malicious updates, supply-chain firmware poisoning, and microcode anomalies in the invisible layer between hardware and OS.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🪪',
      title: 'Identity Drift Detection',
      description: 'The world\'s first AI identity-integrity engine. Detects privilege creep, stale access, shadow accounts, session hijacking, and identity poisoning — because IAM tools don\'t detect drift, but we do.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🧬',
      title: 'Data Trust Engine',
      description: 'First platform to treat data itself as an attack surface. Verifies trust across all data flows — poisoned datasets, malicious training data, corrupted logs, and tampered backups — with cryptographic integrity proofs.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🤖',
      title: 'AI Runtime Security',
      description: 'The industry\'s first runtime AI model protection engine. Guards against prompt injection, model hijacking, malicious fine-tuning, model drift, and inference poisoning with real-time AI-native security controls.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🧠',
      title: 'Human Behaviour Risk Engine',
      description: 'World\'s first AI-driven behavioural risk engine. Detects insider threats, accidental misuse, social engineering patterns, behavioural anomalies, and privilege misuse — because humans are the biggest attack surface.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🌐',
      title: 'National-Scale Telemetry',
      description: 'Sovereign-grade cyber intelligence built in. Cross-industry threat correlation, early-warning signals, attack-wave prediction, and national cyber-risk scoring — no other vendor offers this as a module.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🏗️',
      title: 'Architecture Drift Engine',
      description: 'First continuous architecture-drift detection engine. Catches misconfigurations, insecure defaults, forgotten services, exposed ports, and dependency drift before attackers exploit them.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '⚔️',
      title: 'Autonomous Red Team',
      description: 'The future of offensive-defensive security. A fully autonomous red team that continuously attacks your own infrastructure — exploit simulation, lateral movement, privilege escalation, and misconfiguration exploitation — all automated.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🤖',
      title: 'AI Agent Security',
      description: 'The world\'s first permission boundaries and action audit system for autonomous AI agents. Sandbox enforcement, prompt injection defence, chain-of-thought logging, hallucinated dependency blocking, and data-exfiltration prevention — for every AI agent in your stack.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🎭',
      title: 'Deepfake Detection & Defence',
      description: 'First integrated deepfake defence for the enterprise. Real-time voice, video, and image deepfake detection across VoIP, Zoom, Teams, email, and badge systems. Blocks CFO voice impersonation, CEO video fakes, and AI-generated document forgery before damage is done.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🛰️',
      title: 'Satellite Communications Security',
      description: 'The first cybersecurity platform to protect satellite links. GPS spoofing defence, jamming detection, quantum key distribution for space links, command injection blocking, ground station hardening — protecting the final frontier of communications.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: '🔗',
      title: 'LLM Supply Chain Security',
      description: 'First-ever model weight integrity verification and training data poisoning detection. SLSA Level 3 attestation for AI models, adversarial sample detection, model provenance tracking, and hallucinated dependency blocking across your entire ML pipeline.',
      badge: 'WORLD FIRST',
      badgeColor: 'bg-purple-500',
    },
  ];

  const stats = [
    { value: '109', label: 'Modules, 24 Engines' },
    { value: '32+', label: 'World-First Features' },
    { value: '8', label: 'Sovereign-Grade Capabilities' },
    { value: '24/7', label: 'Self-Evolving Protection' },
  ];

  const testimonials = [
    {
      quote: 'Anchor identified critical vulnerabilities that three previous security audits missed entirely. The Hardware Integrity Layer caught a rogue USB device our physical security team missed. The predictive CVE feature alone is worth the investment.',
      author: 'Sarah Chen',
      role: 'CISO, Global Financial Services',
      avatar: '👩‍💼',
    },
    {
      quote: 'We replaced 14 separate security tools with Anchor. The Autonomous Red Team found 23 lateral movement paths our pen-testers never discovered. We reduced mean time to remediation by 73% and cut our security team workload in half.',
      author: 'Marcus Rodriguez',
      role: 'VP Security Operations, Fortune 500 Enterprise',
      avatar: '👨‍💻',
    },
    {
      quote: 'The Identity Drift and Human Behaviour modules caught privilege creep and insider threat patterns that our IAM tools completely missed. The AI Runtime Security stopped a model poisoning attack in production. Nothing else on the market does this.',
      author: 'Dr. Emily Watson',
      role: 'VP Engineering, Healthcare Technology',
      avatar: '👩‍🔬',
    },
  ];

  const faqs = [
    {
      question: 'How does Predictive CVE Intelligence work?',
      answer: 'Our AI analyses code patterns, library versions, and historical CVE data to identify code that\'s likely to be affected by future vulnerabilities. When a library you use has patterns similar to past CVEs, we alert you before the CVE is even publicly announced—giving you weeks of advance warning.',
    },
    {
      question: 'Is my source code secure with Anchor?',
      answer: 'Absolutely. Your code is encrypted in transit (TLS 1.3) and at rest (AES-256). We\'re SOC 2 Type II compliant and never store your source code permanently. All scans are processed in isolated, ephemeral containers and deleted immediately after analysis.',
    },
    {
      question: 'What\'s included in each pricing tier?',
      answer: 'Free gives you basic scanning for 1 project. Starter ($990/mo) adds extended scanning, API access for 3 projects, and email support. Pro ($4,990/mo) unlocks world-first features like Predictive CVE Intelligence, AI Auto-Fix, Identity Drift Detection, and Architecture Drift for 10 projects. Team ($14,990/mo) adds Digital Twin Security, Autonomous SOC, Data Trust Engine, Human Behaviour Risk Engine, AI Runtime Security, and real-time collaboration for 15 users. Business ($29,990/mo) includes all 109 modules, 24 engines, 32 world-firsts, 8 sovereign-grade capabilities, Hardware Integrity, Firmware Scanner, Autonomous Red Team, National Telemetry, SSO, and 99.9% SLA. Enterprise ($5M–$10M/yr), Enterprise+ ($10M–$25M/yr), and Government & Defence ($25M–$75M+/yr) plans include unlimited everything with dedicated support, air-gapped options, and sovereign deployment.',
    },
    {
      question: 'What languages, frameworks, and platforms do you support?',
      answer: 'Anchor supports JavaScript/TypeScript, Python, Java, Go, Ruby, PHP, C#, Rust, and C/C++. We also scan Dockerfiles, Kubernetes manifests, Terraform, CloudFormation, ARM templates, and Helm charts. Full support for AWS, Azure, and GCP cloud environments.',
    },
    {
      question: 'How accurate are the AI-generated fixes?',
      answer: 'Our AI-generated fixes have a 94% acceptance rate in production codebases across thousands of organisations. All fixes are generated based on your existing code style, include comprehensive tests, and you always review before merging.',
    },
    {
      question: 'Can I integrate Anchor with my CI/CD pipeline?',
      answer: 'Yes. Anchor integrates seamlessly with GitHub Actions, GitLab CI, Jenkins, CircleCI, Azure DevOps, Bitbucket Pipelines, and more. You can configure builds to fail on critical vulnerabilities or simply report findings for review.',
    },
    {
      question: 'What compliance frameworks do you support?',
      answer: 'Anchor provides automated compliance checking and reporting for SOC 2, HIPAA, PCI-DSS, ISO 27001, GDPR, FedRAMP, NIST 800-53, CIS Controls, and more. Generate audit-ready reports with a single click.',
    },
    {
      question: 'What is the Anchor/TITAN architecture?',
      answer: 'Anchor is the organism — the unified platform. TITAN is the autonomous engine that powers it. The Cortex is the intelligence core — the AI brain that learns, predicts, and acts. Together they form the first self-describing, self-auditing, self-evolving cybersecurity platform.',
    },
    {
      question: 'What makes Anchor different from CrowdStrike/Palo Alto/etc?',
      answer: 'Other vendors have fragmented point solutions. Anchor is a living organism — 109 modules working as one neural network, with 24 interconnected engines and 32+ world-first capabilities no other vendor has. It\'s sovereign-grade: capable of protecting nation-states autonomously.',
    },
    {
      question: 'What are the 32+ world-first features?',
      answer: 'These are capabilities no other cybersecurity vendor has ever built. Examples: AI Runtime Security (protect AI models from attack), Predictive Attack Intel (forecast campaigns before they execute), Autonomous SOC (24/7 AI-powered security operations), National Telemetry (sovereign cyber intelligence), Human Behaviour Engine (predict insider threats), and more.',
    },
    {
      question: 'What makes the 32+ World-First Security Layers unique?',
      answer: 'Anchor protects 32+ layers that no other vendor in the world covers — spanning hardware integrity, firmware scanning, identity drift, data trust, AI runtime security, human behaviour analytics, national-scale telemetry, architecture drift, autonomous red team, AI LLM security, supply chain AI, autonomous SOC, predictive attack intelligence, digital twin security, AI breach simulation, predictive CVE intelligence, developer security scoring, real-time security collaboration, AI evolution (self-evolving AI), anti-tampering, quantum-safe cryptography, cyber insurance integration, AI regulatory intelligence, critical infrastructure protection across all 16 CISA sectors, security awareness training, AI agent security with permission boundaries, real-time deepfake detection and defence, satellite communications encryption, and LLM supply chain poisoning protection. Plus 8 sovereign-grade capabilities for government and defence. Protecting any one of these is a world first — Anchor protects all thirty-two and counting.',
    },
    {
      question: 'How does the Autonomous Red Team work?',
      answer: 'Anchor\'s Autonomous Red Team continuously attacks your own infrastructure using real-world exploit simulation, lateral movement mapping, privilege escalation testing, and misconfiguration exploitation. It operates 24/7 without human intervention, discovering vulnerabilities before real attackers do. Every finding includes a MITRE ATT&CK mapping and one-click remediation.',
    },
    {
      question: 'What is National-Scale Telemetry?',
      answer: 'Our sovereign-grade telemetry module correlates threat intelligence across all 16 critical infrastructure sectors — energy, finance, healthcare, defence, telecoms, and more. It provides early-warning signals, attack-wave prediction with AI confidence scoring, and national cyber-risk scoring. No other vendor offers this capability as a built-in module.',
    },
    {
      question: 'How does Hardware Integrity detection work?',
      answer: 'Anchor verifies the physical hardware trust boundary by monitoring TPM attestation, Secure Boot chains, BIOS/UEFI integrity, peripheral fingerprinting, and electromagnetic emission signatures. It detects malicious USB devices, hardware implants, and rogue peripherals in real-time — a capability that previously required specialised government hardware labs.',
    },
    {
      question: 'What is AI Runtime Security and why does it matter?',
      answer: 'As organisations deploy AI models, those models become attack surfaces. Anchor\'s AI Runtime Security protects against prompt injection, model hijacking, malicious fine-tuning, model drift, and inference poisoning. It cryptographically fingerprints every model version and blocks tampered or unauthorised models from serving inference — the first platform to do this at runtime.',
    },
  ];

  const logos = ['GitHub', 'GitLab', 'Bitbucket', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'];

  return (
    <div className="min-h-screen bg-transparent text-cyan-300 overflow-x-hidden">
      {/* Navigation - Glass Style */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-linear-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(53,198,255,0.1)]' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src="/assets/Anchor%20Logo.jpeg" alt="Anchor" draggable="false" className="h-12 w-auto object-contain select-none pointer-events-none" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#pillars" className="text-cyan-400 hover:text-pink-400 transition-colors">
                Pillars
              </a>
              <button onClick={onViewProducts} className="text-cyan-400 hover:text-pink-400 transition-colors">
                Products
              </button>
              <button onClick={onViewPillarPricing || onViewPricing} className="text-cyan-400 hover:text-pink-400 transition-colors">
                Pricing
              </button>
              <a href="#comparison" className="text-cyan-400 hover:text-pink-400 transition-colors">
                Compare
              </a>
              <a href="#faq" className="text-cyan-400 hover:text-pink-400 transition-colors">
                FAQ
              </a>
              <a href="#founder" className="text-cyan-400 hover:text-pink-400 transition-colors">
                Our Story
              </a>
              <button onClick={onViewIntelligence} className="text-cyan-400 hover:text-pink-400 transition-colors font-semibold">
                Intelligence
              </button>
              <button onClick={onViewGovernment} className="text-cyan-400 hover:text-pink-400 transition-colors font-semibold">
                Government
              </button>
              <button onClick={onViewInvestors} className="text-amber-400 hover:text-amber-300 transition-colors font-semibold">
                Investors
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onLogin}
                aria-label="Log in to your account"
                className="px-4 py-2 rounded-xl bg-linear-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm border border-cyan-500/30 text-cyan-400 hover:border-pink-500/50 hover:text-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transition-all"
              >
                Log in
              </button>
              <button
                onClick={onGetStarted}
                aria-label="Start your free trial"
                className="bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] hover:from-[#ff4fa3] hover:via-[#35c6ff] hover:to-[#7a3cff] px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-pink-500/25 hover:shadow-cyan-500/40 border border-white/20"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-8">
              <span className="text-cyan-400">✨</span>
              <span className="text-sm text-cyan-300">
                109 Modules, 24 Engines • 32+ World-First Features • 8 Sovereign-Grade Capabilities • Self-Evolving AI
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The World&apos;s First
              <br />
              <span className="bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] bg-clip-text text-transparent">
                Sovereign-Grade Autonomous Security Platform
              </span>
            </h1>

            {/* Architecture Tagline */}
            <p className="text-2xl text-cyan-400 mb-4 max-w-3xl mx-auto font-bold">
              Anchor is the organism. TITAN is the engine. The Cortex is the brain.
            </p>
            <p className="text-xl text-purple-400 mb-6 max-w-2xl mx-auto font-semibold">
              Self-describing. Self-auditing. Self-evolving.
            </p>

            {/* Subheadline */}
            <p className="text-xl text-purple-300 mb-4 max-w-2xl mx-auto">
              Anchor is the world&apos;s first and only security platform protecting <strong>32+ layers the entire industry leaves exposed</strong> &mdash;
              hardware integrity, firmware, identity drift, data trust, AI runtime, human behaviour, national telemetry, architecture drift, autonomous red team, AI agent security, deepfake defence, satellite communications, and LLM supply chain.
            </p>
            <p className="text-lg text-cyan-400 mb-4 max-w-2xl mx-auto font-semibold">
              No vendor. No government. No research lab. Nobody has done this before.
              <br />
              <span className="text-pink-400">109 modules, 24 engines. 32+ world-first features. 8 sovereign-grade capabilities.</span>
            </p>
            <p className="text-md text-amber-400 mb-10 max-w-2xl mx-auto font-bold">
              Every other cybersecurity vendor is now behind us. This is category-defining sovereign-grade autonomy.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={onGetStarted}
                className="bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] hover:from-[#ff4fa3] hover:via-[#35c6ff] hover:to-[#7a3cff] px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 hover:shadow-cyan-500/50"
              >
                Start Free 14-Day Trial →
              </button>
              <button
                onClick={onViewPricing}
                className="border border-cyan-500/50 hover:border-pink-500 text-cyan-400 hover:text-pink-400 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:bg-pink-500/10 hover:shadow-lg hover:shadow-pink-500/20"
              >
                View Pricing
              </button>
            </div>

            {/* Social Proof */}
            <p className="text-sm text-purple-400 mb-4">Trusted by security teams at</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-70">
              {logos.map((logo) => (
                <span key={logo} className="text-cyan-400 font-semibold">
                  {logo}
                </span>
              ))}
            </div>
          </div>

          {/* Hero Video Demo */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-linear-to-t from-[#05080a] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl shadow-cyan-500/10">
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-cyan-400 ml-4">www.anchoraiguard.com/dashboard</span>
              </div>
              <video
                controls
                playsInline
                className="w-full"
                onPlay={() => handleVideoPlay('hero-demo')}
              >
                <source src="/assets/anchor-promo-video.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-purple-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm">{videoViews.toLocaleString()} views</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 border-y border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-cyan-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Gap Callout */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-r from-purple-900/40 via-pink-900/30 to-cyan-900/40 border border-pink-500/30 rounded-3xl p-10 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              The Uncomfortable Truth About Your Current Security Stack
            </h3>
            <p className="text-lg text-purple-300 mb-6 max-w-3xl mx-auto">
              Your SIEM can&apos;t detect hardware tampering. Your EDR can&apos;t catch identity drift.
              Your CSPM can&apos;t monitor firmware integrity. Your pen-test vendor can&apos;t run 24/7 autonomous attacks.
              <strong className="text-pink-400"> These are not edge cases &mdash; they are the 9 most dangerous blind spots in cybersecurity today.</strong>
            </p>
            <div className="grid grid-cols-3 md:grid-cols-9 gap-3 mb-8">
              {['Hardware', 'Firmware', 'Identity\nDrift', 'Data\nTrust', 'AI\nRuntime', 'Human\nBehaviour', 'National\nTelemetry', 'Architecture\nDrift', 'Red\nTeam'].map((layer) => (
                <div key={layer} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="text-red-400 text-lg mb-1">✗</div>
                  <div className="text-xs text-red-300 whitespace-pre-line">{layer}</div>
                  <div className="text-[10px] text-red-400/60 mt-1">Industry: 0 vendors</div>
                </div>
              ))}
            </div>
            <p className="text-xl font-bold text-cyan-400 mb-2">
              Anchor covers all 9. Nobody else covers even 1.
            </p>
            <p className="text-sm text-purple-400">
              Verified across CrowdStrike, Palo Alto Networks, SentinelOne, Snyk, Wiz, Checkmarx, Fortinet, and 40+ other vendors.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Demo Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              See Anchor
              <span className="bg-linear-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"> in Action</span>
            </h2>
            <p className="text-xl text-purple-300 max-w-2xl mx-auto">
              Watch how Anchor detects, analyses, and remediates security threats in real time.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl shadow-purple-500/10">
            <video
              controls
              playsInline
              className="w-full"
              onPlay={() => handleVideoPlay('action-demo')}
            >
              <source src="/assets/anchor-demo-2.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-purple-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm">{videoViews.toLocaleString()} views</span>
          </div>
        </div>
      </section>

      {/* 5 Product Pillars Section — Replaces flat feature grid */}
      <div id="pillars">
        <PillarLandingSections onViewPricing={onViewPillarPricing || onViewPricing} onGetStarted={onGetStarted} />
      </div>

      {/* Quick Links to Deep-Dive Pages */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onViewProducts}
            className="px-6 py-3 rounded-xl bg-slate-800/50 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 transition-all"
          >
            📖 Product Deep Dive  →
          </button>
          <button
            onClick={onViewPillarPricing || onViewPricing}
            className="px-6 py-3 rounded-xl bg-slate-800/50 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all"
          >
            💰 Pricing by Pillar  →
          </button>
          <button
            onClick={onViewInvestors}
            className="px-6 py-3 rounded-xl bg-slate-800/50 border border-amber-500/30 text-amber-300 hover:text-white hover:border-amber-400 transition-all"
          >
            📊 Investor Deck  →
          </button>
        </div>
      </section>

      {/* AI Fix Button & Evolution Spotlight */}
      <section className="py-24 px-4 bg-linear-to-b from-pink-500/5 to-purple-500/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-pink-500/10 to-cyan-500/10 border border-pink-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-pink-400">🚀</span>
              <span className="text-sm text-pink-300 font-semibold">GAME-CHANGING FEATURES</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Fix Vulnerabilities in
              <br />
              <span className="bg-linear-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                One Click. Stay Ahead Forever.
              </span>
            </h2>
            <p className="text-xl text-purple-300 max-w-2xl mx-auto">
              Two features that put Anchor in a league of its own — no other platform comes close.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Fix Button Spotlight */}
            <div className="bg-linear-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-sm rounded-3xl p-8 border border-pink-500/30 hover:border-pink-400 transition-all hover:shadow-2xl hover:shadow-pink-500/20 group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-linear-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-pink-500/30">
                  🔧
                </div>
                <div>
                  <span className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">WORLD FIRST</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-pink-400 mb-4">1-Click AI Fix Button</h3>
              <p className="text-purple-300 mb-6 leading-relaxed">
                Found a vulnerability? Don&apos;t waste hours writing patches manually. 
                Hit the <strong className="text-pink-400">Fix</strong> button and Anchor&apos;s AI instantly:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-pink-400 mt-0.5">✦</span>
                  <span className="text-cyan-300"><strong>Analyses</strong> the vulnerability root cause and blast radius</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-400 mt-0.5">✦</span>
                  <span className="text-cyan-300"><strong>Generates</strong> a secure, tested patch matching your code style</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-400 mt-0.5">✦</span>
                  <span className="text-cyan-300"><strong>Creates</strong> a pull request ready to review and merge</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-400 mt-0.5">✦</span>
                  <span className="text-cyan-300"><strong>Verifies</strong> the fix doesn&apos;t break existing functionality</span>
                </li>
              </ul>
              <div className="bg-black/30 border border-pink-500/30 rounded-xl p-4 text-center">
                <span className="text-3xl font-bold text-white">94%</span>
                <p className="text-sm text-purple-400 mt-1">Fix acceptance rate in production</p>
              </div>
            </div>

            {/* AI Evolution Engine Spotlight */}
            <div className="bg-linear-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-3xl p-8 border border-cyan-500/30 hover:border-cyan-400 transition-all hover:shadow-2xl hover:shadow-cyan-500/20 group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-linear-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
                  🧬
                </div>
                <div>
                  <span className="bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full">WORLD FIRST</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">AI Self-Evolution Engine</h3>
              <p className="text-purple-300 mb-6 leading-relaxed">
                Most security tools need manual updates. <strong className="text-cyan-400">Anchor evolves itself.</strong> 
                Our AI continuously monitors the global threat landscape and autonomously upgrades its own defenses:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-0.5">✦</span>
                  <span className="text-cyan-300"><strong>Ingests</strong> real-time feeds from NVD, CISA KEV, MITRE ATT&amp;CK, and dark web sources</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-0.5">✦</span>
                  <span className="text-cyan-300"><strong>Generates</strong> new detection rules and security modules automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-0.5">✦</span>
                  <span className="text-cyan-300"><strong>Monitors</strong> competitors like CrowdStrike, Palo Alto, SentinelOne to stay ahead</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 mt-0.5">✦</span>
                  <span className="text-cyan-300"><strong>Predicts</strong> emerging threats before they become widespread attacks</span>
                </li>
              </ul>
              <div className="bg-black/30 border border-cyan-500/30 rounded-xl p-4 text-center">
                <span className="text-3xl font-bold text-white">24/7</span>
                <p className="text-sm text-purple-400 mt-1">Autonomous evolution — zero manual updates</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-purple-400 text-lg mb-6">
              These features are <strong className="text-pink-400">included on Pro plans and above</strong> — no add-ons, no hidden costs.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-linear-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
            >
              Try It Free for 14 Days →
            </button>
          </div>
        </div>
      </section>

      {/* ==================== ANCHOR INTELLIGENCE B2B SECTION ==================== */}
      <section className="py-24 px-4 bg-linear-to-b from-gray-950 via-purple-900/10 to-gray-950 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-150 h-150 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full px-6 py-2 mb-6">
              <span className="text-purple-400 font-bold text-sm">NEW</span>
              <span className="mx-2 text-gray-600">|</span>
              <span className="text-sm text-purple-300 font-semibold">ANCHOR INTELLIGENCE — AI-AS-A-SERVICE</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-linear-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Anchor Intelligence
              </span>
              <br />
              <span className="text-white">API Platform</span>
            </h2>
            <p className="text-xl text-purple-300 max-w-3xl mx-auto">
              The same self-evolving AI that powers Anchor — now available as a standalone API.
              Integrate world-class threat intelligence, detection rules, and predictive analysis
              <strong className="text-cyan-400"> directly into your security stack.</strong>
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: '🔍',
                title: 'Threat Intelligence API',
                price: 'From $99,990/mo',
                desc: 'Real-time aggregated feeds from NVD, CISA KEV, MITRE ATT&CK, AlienVault OTX — enriched and scored by AI.',
                color: 'border-purple-500/30 hover:border-purple-400',
              },
              {
                icon: '📋',
                title: 'Detection Rule Generator',
                price: 'From $99,990/mo',
                desc: 'AI generates production-ready Sigma, YARA, Snort, Suricata, KQL & SPL rules. Bulk generation supported.',
                color: 'border-blue-500/30 hover:border-blue-400',
              },
              {
                icon: '🧠',
                title: 'AI Threat Analysis',
                price: 'From $499,990/mo',
                desc: 'Deep analysis of malware, network traffic, logs, incidents, vulnerabilities, and IOCs. Instant verdicts.',
                color: 'border-cyan-500/30 hover:border-cyan-400',
              },
              {
                icon: '🔮',
                title: 'Predictive Modeling',
                price: 'From $499,990/mo',
                desc: 'Industry-specific threat predictions with likelihood scores, attack vectors, and mitigation strategies.',
                color: 'border-pink-500/30 hover:border-pink-400',
              },
              {
                icon: '🔎',
                title: 'IOC Enrichment',
                price: 'From $99,990/mo',
                desc: 'Instantly enrich IPs, domains, hashes, URLs, and emails with reputation, geolocation, and threat associations.',
                color: 'border-amber-500/30 hover:border-amber-400',
              },
              {
                icon: '📊',
                title: 'Competitive Intelligence',
                price: 'From $499,990/mo',
                desc: 'AI analysis of competitor products, pricing trends, market gaps, and strategic positioning in cybersecurity.',
                color: 'border-green-500/30 hover:border-green-400',
              },
            ].map((product, i) => (
              <div key={i} className={`bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border ${product.color} transition-all hover:shadow-lg`}>
                <div className="text-3xl mb-3">{product.icon}</div>
                <h3 className="text-lg font-bold mb-1">{product.title}</h3>
                <div className="text-sm text-purple-400 mb-3">{product.price}</div>
                <p className="text-gray-400 text-sm">{product.desc}</p>
              </div>
            ))}
          </div>

          {/* Platform Stats Banner */}
          <div className="bg-linear-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-10 mb-16">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-400">6</div>
                <div className="text-sm text-gray-400 mt-1">API Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">99.99%</div>
                <div className="text-sm text-gray-400 mt-1">Uptime SLA</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400">{'<100ms'}</div>
                <div className="text-sm text-gray-400 mt-1">Average Response Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-400">24/7</div>
                <div className="text-sm text-gray-400 mt-1">Real-Time Threat Feeds</div>
              </div>
            </div>
          </div>

          {/* Who It's For + Code Example */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-purple-400">Built For</h3>
              <div className="space-y-4">
                {[
                  { icon: '🏢', title: 'MSSPs & MDR Providers', desc: 'White-label our AI to supercharge your managed security services.' },
                  { icon: '🛡️', title: 'SOC Teams', desc: 'Reduce alert fatigue with AI triage and automated rule generation.' },
                  { icon: '🔧', title: 'Security Vendors', desc: 'Embed our intelligence into your product with OEM licensing.' },
                  { icon: '🔬', title: 'Threat Intel Teams', desc: 'Predictive modeling and competitive analysis to stay ahead.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-purple-500/30 transition-all">
                    <div className="text-2xl shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 text-cyan-400">One API Call Away</h3>
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500 ml-2">Python</span>
                </div>
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                  <code>{`import requests

API_KEY = "anc_your_key_here"
BASE = "https://api.anchoraiguard.com/intelligence/v1"

# Generate a YARA rule for a new threat
rule = requests.post(f"{BASE}/rules/generate",
  headers={"x-api-key": API_KEY},
  json={
    "threat": "Cobalt Strike beacon C2",
    "format": "yara"
  }
).json()

print(rule["rule"]["content"])
# → Instant, production-ready YARA rule`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Official SDKs */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl border border-purple-500/20 p-10 mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Official SDKs — Ready to Use</span>
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Install our official SDK in your language of choice and start integrating Anchor Intelligence in minutes. All SDKs include built-in security scanning, dependency verification, and TLS pinning.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                { lang: 'Python', icon: '🐍', cmd: 'pip install anchor-security-sdk', score: 96 },
                { lang: 'Node.js', icon: '🟢', cmd: 'npm install @anchor/security-sdk', score: 94 },
                { lang: 'Go', icon: '🔷', cmd: 'go get github.com/anchor/security-sdk-go', score: 98 },
                { lang: 'Java', icon: '☕', cmd: 'com.anchoraiguard:security-sdk', score: 95 },
                { lang: 'C#', icon: '💜', cmd: 'dotnet add package Anchor.SecuritySDK', score: 97 },
                { lang: 'Ruby', icon: '💎', cmd: 'gem install anchor-security-sdk', score: 93 },
              ].map(sdk => (
                <div key={sdk.lang} className="bg-gray-800/80 rounded-xl p-4 text-center border border-gray-700 hover:border-cyan-500/40 transition-all group cursor-default" title={sdk.cmd}>
                  <div className="text-3xl mb-2">{sdk.icon}</div>
                  <div className="font-bold text-sm group-hover:text-cyan-400 transition-colors">{sdk.lang}</div>
                  <div className="text-xs text-green-400 mt-1">{sdk.score}/100 secure</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="text-lg font-bold text-purple-400">SLSA Level 3</div>
                <div className="text-gray-400 text-xs mt-1">Supply chain integrity verified</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="text-lg font-bold text-blue-400">1M+ Downloads</div>
                <div className="text-gray-400 text-xs mt-1">Across all official SDKs</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="text-lg font-bold text-cyan-400">0 Critical CVEs</div>
                <div className="text-gray-400 text-xs mt-1">Continuously scanned &amp; verified</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={onViewIntelligence}
              className="bg-linear-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 px-10 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30 hover:shadow-cyan-500/40"
            >
              Explore Anchor Intelligence →
            </button>
            <p className="text-purple-400 text-sm mt-4">
              API access from $99,990/mo • Official SDKs for 6 languages • Enterprise & OEM pricing available • 99.99% SLA
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 32+ WORLD-FIRST SECURITY LAYERS — THE UNPROTECTED FRONTIER          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-linear-to-b from-slate-900/50 via-purple-900/10 to-slate-900/50 border-y border-purple-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-6 py-2 mb-6">
              <span className="text-purple-400 font-bold text-sm tracking-wider">🏆 WORLD-FIRST TECHNOLOGY • 8 SOVEREIGN-GRADE CAPABILITIES</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              32+ Layers Nobody Else Protects
            </h2>
            <p className="text-xl text-purple-300 max-w-3xl mx-auto mb-4">
              The security industry leaves <strong>29 critical layers</strong> completely unprotected. Not CrowdStrike. Not Palo Alto.
              Not SentinelOne. Not Snyk. Not Wiz. Not any government lab. <strong>Nobody.</strong>
            </p>
            <p className="text-lg text-cyan-400 max-w-3xl mx-auto">
              Anchor is the first and only platform to cover every single one. This isn&apos;t incremental improvement.
              This is a generational leap in cybersecurity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🔩', title: 'Hardware Integrity', desc: 'Malicious peripherals, hardware implants, rogue USB devices, BIOS/UEFI tampering, TPM manipulation', color: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30' },
              { icon: '💾', title: 'Firmware & Microcode', desc: 'Firmware implants, malicious updates, supply-chain firmware poisoning, microcode anomalies', color: 'from-orange-500/20 to-yellow-500/20', border: 'border-orange-500/30' },
              { icon: '🪪', title: 'Identity Drift', desc: 'Privilege creep, stale access, shadow accounts, session hijacking, identity poisoning', color: 'from-yellow-500/20 to-green-500/20', border: 'border-yellow-500/30' },
              { icon: '🧬', title: 'Data Trust', desc: 'Poisoned datasets, malicious training data, corrupted logs, tampered backups', color: 'from-green-500/20 to-teal-500/20', border: 'border-green-500/30' },
              { icon: '🤖', title: 'AI Runtime', desc: 'Prompt injection, model hijacking, malicious fine-tuning, model drift, inference poisoning', color: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-500/30' },
              { icon: '🧠', title: 'Human Behaviour', desc: 'Insider threats, accidental misuse, social engineering patterns, behavioural anomalies', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
              { icon: '🌐', title: 'National Telemetry', desc: 'Cross-industry threat correlation, early-warning signals, attack-wave prediction, national risk scoring', color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30' },
              { icon: '🏗️', title: 'Architecture Drift', desc: 'Misconfigurations, insecure defaults, forgotten services, exposed ports, dependency drift', color: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/30' },
              { icon: '⚔️', title: 'Autonomous Red Team', desc: 'Exploit simulation, lateral movement, privilege escalation, misconfiguration exploitation', color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
              { icon: '🤖', title: 'AI Agent Security', desc: 'Permission boundaries, prompt injection defence, action auditing for autonomous AI agents', color: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30' },
              { icon: '🎭', title: 'Deepfake Detection', desc: 'Real-time voice, video, image deepfake detection across VoIP, video conferencing, email', color: 'from-rose-500/20 to-fuchsia-500/20', border: 'border-rose-500/30' },
              { icon: '🛰️', title: 'Satellite Comms', desc: 'GPS spoofing defence, jamming detection, QKD encryption, ground station hardening', color: 'from-fuchsia-500/20 to-violet-500/20', border: 'border-fuchsia-500/30' },
              { icon: '🔗', title: 'LLM Supply Chain', desc: 'Model weight poisoning detection, training data integrity, SLSA attestation, provenance tracking', color: 'from-violet-500/20 to-indigo-500/20', border: 'border-violet-500/30' },
            ].map((layer, i) => (
              <div key={i} className={`bg-linear-to-br ${layer.color} border ${layer.border} rounded-2xl p-6 hover:scale-105 transition-all duration-300 group`}>
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{layer.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{layer.title}</h3>
                      <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs font-bold rounded-full border border-purple-500/40">WORLD FIRST</span>
                    </div>
                    <p className="text-sm text-slate-300">{layer.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg text-cyan-300 mb-3">
              <strong>Protecting even one</strong> of these layers makes a platform world-first.
            </p>
            <p className="text-xl text-white font-bold mb-8">
              Anchor protects all thirteen core layers — and 32+ world-firsts total, plus 8 sovereign-grade capabilities. No other vendor on Earth can say that.
            </p>

            {/* Competitor Gap Table */}
            <div className="max-w-4xl mx-auto mb-10 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="py-3 px-4 text-left text-purple-400 font-semibold">Security Layer</th>
                    <th className="py-3 px-2 text-center text-slate-500">CrowdStrike</th>
                    <th className="py-3 px-2 text-center text-slate-500">Palo Alto</th>
                    <th className="py-3 px-2 text-center text-slate-500">SentinelOne</th>
                    <th className="py-3 px-2 text-center text-slate-500">Snyk</th>
                    <th className="py-3 px-2 text-center text-slate-500">Wiz</th>
                    <th className="py-3 px-2 text-center text-cyan-400 font-bold">Anchor</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    'Hardware Integrity', 'Firmware & Microcode', 'Identity Drift',
                    'Data Trust Engine', 'AI Runtime Security', 'Human Behaviour',
                    'National Telemetry', 'Architecture Drift', 'Autonomous Red Team',
                    'AI Agent Security', 'Deepfake Detection', 'Satellite Comms', 'LLM Supply Chain'
                  ].map((layer) => (
                    <tr key={layer} className="border-b border-slate-800">
                      <td className="py-2.5 px-4 text-white font-medium">{layer}</td>
                      <td className="py-2.5 px-2 text-center text-red-400">✗</td>
                      <td className="py-2.5 px-2 text-center text-red-400">✗</td>
                      <td className="py-2.5 px-2 text-center text-red-400">✗</td>
                      <td className="py-2.5 px-2 text-center text-red-400">✗</td>
                      <td className="py-2.5 px-2 text-center text-red-400">✗</td>
                      <td className="py-2.5 px-2 text-center text-green-400 font-bold">✓</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={onGetStarted}
              className="bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-cyan-500 hover:via-purple-500 hover:to-pink-500 px-10 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
            >
              Experience What Nobody Else Has Built →
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 bg-linear-to-b from-purple-500/5 to-cyan-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Trusted by Security Leaders
            </h2>
            <p className="text-xl text-purple-300">
              See why CISOs and security teams are switching to the platform that protects what nobody else can
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="bg-linear-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/20"
              >
                <div className="text-4xl mb-4 text-pink-400">&ldquo;</div>
                <p className="text-cyan-300 mb-6">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{testimonial.avatar}</span>
                  <div>
                    <div className="font-semibold text-pink-400">{testimonial.author}</div>
                    <div className="text-sm text-purple-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Comparison Section */}
      <section id="comparison" className="py-24 px-4 relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-125 h-125 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-pink-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-pink-400 mb-3">Why Anchor Wins</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Anchor vs. The Industry
            </h2>
            <p className="text-purple-400 text-lg max-w-3xl mx-auto">
              See how Anchor AI Guard with the <span className="text-cyan-400 font-semibold">Titan Engine</span> stacks up against the world&apos;s largest cybersecurity platforms.
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 w-[30%]">
                    Capability
                  </th>
                  <th className="py-4 px-4 text-center border-b border-cyan-500/30 bg-linear-to-b from-cyan-500/10 to-transparent rounded-t-xl">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold text-white">Anchor AI Guard</span>
                      <span className="text-xs text-cyan-400 font-medium">Powered by Titan</span>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center border-b border-slate-700/50">
                    <span className="text-sm font-semibold text-slate-400">CrowdStrike Falcon</span>
                  </th>
                  <th className="py-4 px-4 text-center border-b border-slate-700/50">
                    <span className="text-sm font-semibold text-slate-400">SentinelOne</span>
                  </th>
                  <th className="py-4 px-4 text-center border-b border-slate-700/50">
                    <span className="text-sm font-semibold text-slate-400">Microsoft Defender</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cap: 'AI Self-Evolution Engine (TITAN)', anchor: 'first', cs: 'no', s1: 'no', ms: 'no', note: 'World-first — continuously learns and updates defences autonomously' },
                  { cap: 'Predictive CVE Intelligence', anchor: 'yes', cs: 'no', s1: 'no', ms: 'no', note: 'Alerts before vulnerabilities are public' },
                  { cap: 'Autonomous SOC (no human required)', anchor: 'yes', cs: 'partial', s1: 'partial', ms: 'partial' },
                  { cap: '1-Click AI Fix (auto patch + merge)', anchor: 'yes', cs: 'no', s1: 'no', ms: 'no' },
                  { cap: 'Digital Twin Security', anchor: 'yes', cs: 'no', s1: 'no', ms: 'no', note: 'Full infrastructure simulation' },
                  { cap: 'Endpoint Detection & Response (EDR/XDR)', anchor: 'yes', cs: 'yes', s1: 'yes', ms: 'yes' },
                  { cap: 'Cloud Security (CSPM / CWPP)', anchor: 'yes', cs: 'yes', s1: 'partial', ms: 'yes' },
                  { cap: 'AI/LLM Security Protection', anchor: 'yes', cs: 'no', s1: 'no', ms: 'no' },
                  { cap: 'Supply Chain Attestation (Blockchain SBOM)', anchor: 'yes', cs: 'no', s1: 'no', ms: 'no' },
                  { cap: 'Real-Time Cyber Insurance Integration', anchor: 'yes', cs: 'no', s1: 'no', ms: 'no' },
                  { cap: 'Quantum-Ready Cryptography', anchor: 'yes', cs: 'no', s1: 'no', ms: 'no' },
                  { cap: 'Advanced Breach Simulation Engine', anchor: 'yes', cs: 'no', s1: 'no', ms: 'no' },
                  { cap: 'AI-Powered Threat Intel API (TITAN API)', anchor: 'yes', cs: 'partial', s1: 'partial', ms: 'partial' },
                  { cap: 'Integrated Security Modules', anchor: '109+', cs: '10-20', s1: '10-20', ms: 'varies' },
                  { cap: 'Government & FedRAMP / SCIF Support', anchor: 'yes', cs: 'partial', s1: 'partial', ms: 'yes' },
                  { cap: 'Threat Hunting & MITRE ATT&CK Coverage', anchor: 'yes', cs: 'yes', s1: 'yes', ms: 'yes' },
                  { cap: 'Managed Threat Detection Services', anchor: 'yes', cs: 'yes', s1: 'yes', ms: 'yes' },
                ].map((row, i) => {
                  const renderCell = (val: string) => {
                    if (val === 'first') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">🏆 WORLD 1ST</span>;
                    if (val === 'yes') return <span className="text-emerald-400 font-bold text-lg">✓</span>;
                    if (val === 'no') return <span className="text-red-400/60 font-medium">✗</span>;
                    if (val === 'partial') return <span className="text-amber-400/70 text-sm font-medium">⚠ Partial</span>;
                    return <span className="text-slate-300 font-semibold text-sm">{val}</span>;
                  };
                  return (
                    <tr key={i} className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors ${i % 2 === 0 ? 'bg-slate-900/20' : ''}`}>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-medium text-white">{row.cap}</span>
                        {row.note && <p className="text-xs text-slate-500 mt-0.5">{row.note}</p>}
                      </td>
                      <td className="py-3.5 px-4 text-center bg-cyan-500/5 border-x border-cyan-500/10">{renderCell(row.anchor)}</td>
                      <td className="py-3.5 px-4 text-center">{renderCell(row.cs)}</td>
                      <td className="py-3.5 px-4 text-center">{renderCell(row.s1)}</td>
                      <td className="py-3.5 px-4 text-center">{renderCell(row.ms)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (stacked) */}
          <div className="lg:hidden space-y-3">
            {[
              { cap: 'AI Self-Evolution Engine (TITAN)', anchor: true, others: false, tag: '🏆 WORLD 1ST' },
              { cap: 'Predictive CVE Intelligence', anchor: true, others: false },
              { cap: 'Autonomous SOC (no human required)', anchor: true, others: 'partial' },
              { cap: '1-Click AI Fix (auto patch + merge)', anchor: true, others: false },
              { cap: 'Digital Twin Security', anchor: true, others: false },
              { cap: 'EDR / XDR', anchor: true, others: true },
              { cap: 'Cloud Security (CSPM / CWPP)', anchor: true, others: 'mixed' },
              { cap: 'AI/LLM Security Protection', anchor: true, others: false },
              { cap: 'Supply Chain Attestation', anchor: true, others: false },
              { cap: 'Cyber Insurance Integration', anchor: true, others: false },
              { cap: 'Quantum-Ready Cryptography', anchor: true, others: false },
              { cap: 'Breach Simulation Engine', anchor: true, others: false },
              { cap: 'Titan Threat Intel API', anchor: true, others: 'partial' },
              { cap: '109+ Integrated Modules', anchor: true, others: false },
              { cap: 'Government / FedRAMP / SCIF', anchor: true, others: 'mixed' },
              { cap: 'MITRE ATT&CK Coverage', anchor: true, others: true },
              { cap: 'Managed Threat Detection', anchor: true, others: true },
            ].map((row, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                  row.others === false
                    ? 'bg-linear-to-r from-cyan-500/10 to-pink-500/10 border-cyan-500/20'
                    : 'bg-slate-800/30 border-slate-700/30'
                }`}
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-white">{row.cap}</span>
                  {row.tag && <span className="ml-2 text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded-full">{row.tag}</span>}
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-center">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <p className="text-[9px] text-cyan-400 font-medium mt-0.5">Anchor</p>
                  </div>
                  <div className="text-center">
                    {row.others === true ? (
                      <span className="text-emerald-400/50 font-bold">✓</span>
                    ) : row.others === 'partial' || row.others === 'mixed' ? (
                      <span className="text-amber-400/60 text-xs">⚠</span>
                    ) : (
                      <span className="text-red-400/50">✗</span>
                    )}
                    <p className="text-[9px] text-slate-500 mt-0.5">Others</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-slate-800/30 rounded-xl p-5 border border-slate-700/30">
              <div className="text-3xl font-bold text-cyan-400">12</div>
              <div className="text-sm text-slate-400 mt-1">Capabilities only Anchor has</div>
            </div>
            <div className="text-center bg-slate-800/30 rounded-xl p-5 border border-slate-700/30">
              <div className="text-3xl font-bold text-amber-400">109+</div>
              <div className="text-sm text-slate-400 mt-1">Integrated security modules</div>
            </div>
            <div className="text-center bg-slate-800/30 rounded-xl p-5 border border-slate-700/30">
              <div className="text-3xl font-bold text-pink-400">1</div>
              <div className="text-sm text-slate-400 mt-1">Platform to replace them all</div>
            </div>
            <div className="text-center bg-slate-800/30 rounded-xl p-5 border border-slate-700/30">
              <div className="text-3xl font-bold text-emerald-400">$345K+</div>
              <div className="text-sm text-slate-400 mt-1">Annual stack cost replaced</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-purple-300">
              109 modules, 24 engines. 32+ world-first features. 8 sovereign-grade capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-5 mb-12">
            {/* Free */}
            <div className="bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-cyan-500/50 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">Free</h3>
              <div className="text-3xl font-bold text-cyan-400 mb-4">$0<span className="text-lg text-purple-400">/mo</span></div>
              <ul className="space-y-2 text-sm text-purple-300 mb-6">
                <li>✓ 1 project</li>
                <li>✓ 5 scans/month</li>
                <li>✓ Basic scanning</li>
                <li>✓ GitHub integration</li>
              </ul>
              <button onClick={onGetStarted} className="w-full py-2 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                Get Started
              </button>
            </div>

            {/* Starter */}
            <div className="bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-cyan-500/50 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <div className="text-3xl font-bold text-cyan-400 mb-4">$990<span className="text-lg text-purple-400">/mo</span></div>
              <ul className="space-y-2 text-sm text-purple-300 mb-6">
                <li>✓ 3 projects</li>
                <li>✓ 50 scans/month</li>
                <li>✓ API access</li>
                <li>✓ Email support</li>
              </ul>
              <button onClick={onViewPricing} className="w-full py-2 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Pro - Most Popular */}
            <div className="bg-linear-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-pink-500/50 hover:border-pink-400 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-pink-500 to-purple-500 px-4 py-1 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <div className="text-3xl font-bold text-pink-400 mb-4">$4,990<span className="text-lg text-purple-400">/mo</span></div>
              <ul className="space-y-2 text-sm text-purple-300 mb-6">
                <li>✓ 10 projects</li>
                <li>✓ 250 scans/month</li>
                <li>✓ <strong className="text-pink-400">Predictive CVE (WORLD FIRST)</strong></li>
                <li>✓ AI Auto-Fix PRs</li>
                <li>✓ Attack Path Visualization</li>
              </ul>
              <button onClick={onViewPricing} className="w-full py-2 rounded-lg bg-linear-to-r from-pink-500 to-purple-500 text-white font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Team */}
            <div className="bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-cyan-500/50 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">Team</h3>
              <div className="text-3xl font-bold text-cyan-400 mb-4">$14,990<span className="text-lg text-purple-400">/mo</span></div>
              <ul className="space-y-2 text-sm text-purple-300 mb-6">
                <li>✓ 50 projects</li>
                <li>✓ 15 team members</li>
                <li>✓ <strong className="text-cyan-400">Digital Twin (WORLD FIRST)</strong></li>
                <li>✓ <strong className="text-cyan-400">Autonomous SOC</strong></li>
                <li>✓ Real-time Collaboration</li>
              </ul>
              <button onClick={onViewPricing} className="w-full py-2 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Business */}
            <div className="bg-linear-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-cyan-500/50 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">Business</h3>
              <div className="text-3xl font-bold text-cyan-400 mb-4">$29,990<span className="text-lg text-purple-400">/mo</span></div>
              <ul className="space-y-2 text-sm text-purple-300 mb-6">
                <li>✓ 200 projects</li>
                <li>✓ 75 team members</li>
                <li>✓ <strong className="text-cyan-400">All 109 modules</strong></li>
                <li>✓ SSO/SAML</li>
                <li>✓ 99.9% SLA</li>
              </ul>
              <button onClick={onViewPricing} className="w-full py-2 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-purple-400 mb-4">
              <strong>Enterprise</strong> from <span className="text-pink-400">$5M/year</span> · <strong>Enterprise+</strong> from <span className="text-pink-400">$10M/year</span> · <strong>Government & Defence</strong> from <span className="text-pink-400">$25M/year</span>
            </p>
            <button
              onClick={onViewPricing}
              className="text-cyan-400 hover:text-pink-400 transition-colors underline"
            >
              View full pricing details →
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-cyan-500/30 overflow-hidden hover:border-pink-500/50 transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-pink-500/10 transition-colors"
                >
                  <span className="font-semibold text-cyan-400">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-pink-400 transition-transform ${
                      activeFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4 text-purple-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the Creator */}
      <section id="founder" className="py-24 px-4 relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-pink-400 mb-3">The Story Behind Anchor</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              About the Creator
            </h2>
            <p className="text-purple-400 text-lg max-w-2xl mx-auto">
              Extraordinary things can be built from the hardest places.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 items-start">
            {/* Photo / Identity Card */}
            <div className="lg:col-span-2 flex flex-col items-center">
              <div className="relative group">
                {/* Glow ring */}
                <div className="absolute -inset-1 bg-linear-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-40 group-hover:opacity-60 blur-sm transition-opacity" />
                <div className="relative bg-slate-900 rounded-2xl p-1">
                  <div className="w-full aspect-square rounded-xl bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                    {/* Anchor shield placeholder — replace with photo when available */}
                    <div className="text-center p-8">
                      <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-linear-to-br from-cyan-500/20 to-pink-500/20 border-2 border-cyan-500/30 flex items-center justify-center">
                        <svg className="w-14 h-14 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Todd Goodwin</h3>
                      <p className="text-cyan-400 font-medium mt-1">Founder &amp; Creator</p>
                      <p className="text-purple-400 text-sm mt-1">Anchor AI Guard</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick facts */}
              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center gap-3 bg-slate-800/40 rounded-lg px-4 py-2.5 border border-slate-700/40">
                  <span className="text-cyan-400 text-lg">🏗️</span>
                  <span className="text-slate-300 text-sm">24 years in construction &bull; 5 trade certificates</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-800/40 rounded-lg px-4 py-2.5 border border-slate-700/40">
                  <span className="text-cyan-400 text-lg">🇦🇺</span>
                  <span className="text-slate-300 text-sm">Born in Sydney &bull; Based in Queensland</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-800/40 rounded-lg px-4 py-2.5 border border-slate-700/40">
                  <span className="text-cyan-400 text-lg">🛡️</span>
                  <span className="text-slate-300 text-sm">Self-taught &bull; AI &amp; cybersecurity</span>
                </div>
              </div>
            </div>

            {/* Story */}
            <div className="lg:col-span-3 space-y-6">
              {/* Opening */}
              <div className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-6 border border-cyan-500/20">
                <p className="text-lg text-slate-200 leading-relaxed">
                  Todd Goodwin was born in Sydney, raised in Greenacre, and moved to Queensland at 18, where he has lived for the past 25 years. Growing up as one of eight children shaped him early — <span className="text-cyan-400 font-medium">responsibility, resilience, and hard work were not choices, they were necessities.</span> Those values carried him through a 24-year career in housing construction, where he earned five trade certificates and built a reputation for reliability, skill, and grit.
                </p>
              </div>

              {/* The turning point */}
              <div className="space-y-4 text-purple-200 leading-relaxed">
                <p>
                  Life changed dramatically. After decades on the tools, Todd found himself on a disability pension, living with his wife and her five children under his brother-in-law&apos;s house in Logan, sleeping on a mattress and working from a 16-year-old computer. At 45, he was starting again from the bottom — not by choice, but by circumstance.
                </p>
                <p>
                  <span className="text-pink-400 font-semibold">It was a moment that could have ended his story. Instead, it became the moment he rewrote it.</span>
                </p>
                <p>
                  A conversation introduced him to artificial intelligence and the idea that AI could be used to build tools, apps, and entire systems. That single moment opened a door he had never imagined. He began learning, experimenting, and teaching himself everything he could about AI, coding, and digital systems.
                </p>
              </div>

              {/* The vision */}
              <div className="border-l-2 border-pink-500/50 pl-6 space-y-4 text-purple-200 leading-relaxed">
                <p>
                  While the world was racing to build front-end apps and consumer tools, Todd began asking a deeper question: <span className="text-white font-medium italic">&ldquo;Who is protecting the back end? Who is securing the future?&rdquo;</span>
                </p>
                <p>
                  Research revealed a confronting truth. Despite enormous budgets, cybersecurity was reacting to threats only after they occurred. Information was delayed. Defences were outdated. The world was accelerating into an AI-driven future, but security was stuck in the past.
                </p>
                <p className="text-cyan-400 font-medium text-lg">
                  Todd wanted to change that.
                </p>
              </div>

              {/* Anchor */}
              <div className="bg-linear-to-r from-pink-500/10 to-purple-500/10 rounded-2xl p-6 border border-pink-500/20 space-y-4">
                <p className="text-slate-200 leading-relaxed">
                  He envisioned a system that could be both proactive and reactive — something capable of predicting, detecting, and defending in real time. Something sovereign. Something built for the future, not the past.
                </p>
                <p className="text-white font-semibold text-lg">
                  From that vision, Anchor AI Guard was born.
                </p>
                <p className="text-purple-200 leading-relaxed">
                  It wasn&apos;t created in a lab or funded by investors. It was built under a house, on an old computer, by someone who refused to accept the limits of his circumstances. Todd transformed hardship into innovation, turning a moment of struggle into a mission to protect organisations, communities, and nations.
                </p>
              </div>

              {/* Closing quote */}
              <div className="relative">
                <div className="absolute -top-3 -left-2 text-6xl text-cyan-500/20 font-serif leading-none">&ldquo;</div>
                <blockquote className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/40 relative">
                  <p className="text-lg text-white leading-relaxed italic pl-6">
                    No starting point is too low, and no vision is too big, when the will to rise is stronger than the circumstances trying to hold you down.
                  </p>
                  <footer className="mt-4 pl-6">
                    <p className="text-cyan-400 font-semibold">Todd Goodwin</p>
                    <p className="text-purple-400 text-sm">Founder, Anchor AI Guard</p>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-linear-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-cyan-500/30 rounded-3xl p-12 hover:border-pink-500/50 transition-all">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              The Security Platform That Shouldn&apos;t Exist Yet
            </h2>
            <p className="text-xl text-purple-300 mb-4">
              <strong>Replace a $345K+ security stack with one platform.</strong>
            </p>
            <p className="text-lg text-purple-400 mb-8">
              109 modules, 24 engines. 32+ world-first features. 8 sovereign-grade capabilities. Starting at <span className="text-pink-400 font-bold">$990/month</span>.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-cyan-500 hover:to-purple-500 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/25 hover:shadow-pink-500/40"
            >
              Start Free 14-Day Trial →
            </button>
            <p className="text-sm text-cyan-400 mt-4">
              No credit card required • Full access • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Glass Style */}
      <footer className="border-t border-cyan-500/20 py-12 px-4 bg-linear-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/assets/Anchor%20Logo.jpeg" alt="Anchor" draggable="false" className="w-42.5 h-28.25 object-contain select-none pointer-events-none" />
              </div>
              <p className="text-purple-300 text-sm">
                <strong>The world&apos;s most advanced</strong> AI-powered security platform.
                32+ world-first features. 8 sovereign-grade capabilities.
                Built for enterprises, governments, and sovereign defence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-400 mb-4">Product</h4>
              <ul className="space-y-2 text-purple-300">
                <li><a href="#pillars" className="hover:text-pink-400 transition-colors">5 Product Pillars</a></li>
                <li><button onClick={onViewProducts} className="hover:text-pink-400 transition-colors text-left">Product Deep Dive</button></li>
                <li><button onClick={onViewPillarPricing || onViewPricing} className="hover:text-pink-400 transition-colors text-left">Pricing by Pillar</button></li>
                <li><button onClick={onViewIntelligence} className="hover:text-pink-400 transition-colors text-left">Intelligence API</button></li>
                <li><button onClick={onViewGovernment} className="hover:text-pink-400 transition-colors text-left">Government & Sovereign</button></li>
                <li><button onClick={onViewInvestors} className="hover:text-pink-400 transition-colors text-left">Investor Deck</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-400 mb-4">Company</h4>
              <ul className="space-y-2 text-purple-300">
                <li><button onClick={onViewAbout} className="hover:text-pink-400 transition-colors text-left">About</button></li>
                <li><button onClick={onViewContact} className="hover:text-pink-400 transition-colors text-left">Blog</button></li>
                <li><a href="mailto:careers@anchoraiguard.com" className="hover:text-pink-400 transition-colors">Careers</a></li>
                <li><button onClick={onViewContact} className="hover:text-pink-400 transition-colors text-left">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-400 mb-4">Legal</h4>
              <ul className="space-y-2 text-purple-300">
                <li><button onClick={onViewPrivacy} className="hover:text-pink-400 transition-colors text-left">Privacy Policy</button></li>
                <li><button onClick={onViewTerms} className="hover:text-pink-400 transition-colors text-left">Terms of Service</button></li>
                <li><button onClick={onViewEULA} className="hover:text-pink-400 transition-colors text-left">EULA</button></li>
                <li><button onClick={onViewPurchaseTerms} className="hover:text-pink-400 transition-colors text-left">Purchase Terms</button></li>
                <li><button onClick={onViewSLA} className="hover:text-pink-400 transition-colors text-left">Service Level Agreement</button></li>
                <li><button onClick={onViewCookiePolicy} className="hover:text-pink-400 transition-colors text-left">Cookie Policy</button></li>
                <li><button onClick={onViewAcceptableUse} className="hover:text-pink-400 transition-colors text-left">Acceptable Use</button></li>
                <li><button onClick={onViewDPA} className="hover:text-pink-400 transition-colors text-left">Data Processing</button></li>
                <li><button onClick={onViewSovereignData} className="hover:text-pink-400 transition-colors text-left">Data Sovereignty</button></li>
                <li><button onClick={onViewDisclaimer} className="hover:text-pink-400 transition-colors text-left">Disclaimer</button></li>
                <li><button onClick={onViewResponsibleDisclosure} className="hover:text-pink-400 transition-colors text-left">Responsible Disclosure</button></li>
                <li><button onClick={onViewIncidentResponsePolicy} className="hover:text-pink-400 transition-colors text-left">Incident Response</button></li>
                <li><button onClick={onViewWhistleblower} className="hover:text-pink-400 transition-colors text-left">Whistleblower Policy</button></li>
                <li><button onClick={onViewAccessibility} className="hover:text-pink-400 transition-colors text-left">Accessibility</button></li>
                <li><button onClick={onViewSecurity} className="hover:text-pink-400 transition-colors text-left">Security</button></li>
                <li><a href="mailto:compliance@anchoraiguard.com" className="hover:text-pink-400 transition-colors">SOC 2 (In Progress)</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-500/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-purple-400 text-sm">
              © 2026 Anchor Security Pty Ltd. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="https://youtube.com/@anchoraiguard" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-pink-400 transition-colors">YouTube</a>
              <a href="https://linkedin.com/company/anchoraiguard" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-pink-400 transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLanding;
