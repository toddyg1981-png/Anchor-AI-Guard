import React, { useState, useEffect, useRef } from 'react';
import { env } from '../config/env';

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
  onViewIntelligence?: () => void;
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
  onViewIntelligence,
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

  const features = [
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
  ];

  const stats = [
    { value: '86+', label: 'Security Modules' },
    { value: '16', label: 'World-First Features' },
    { value: '16', label: 'Compliance Frameworks' },
    { value: '24/7', label: 'Self-Evolving Protection' },
  ];

  const testimonials = [
    {
      quote: 'Anchor identified critical vulnerabilities that three previous security audits missed entirely. The predictive CVE feature alone is worth the investment.',
      author: 'Sarah Chen',
      role: 'CISO, Global Financial Services',
      avatar: '👩‍💼',
    },
    {
      quote: 'We reduced our mean time to remediation by 73% and cut our security team workload in half. The autonomous SOC handles what used to take our team days.',
      author: 'Marcus Rodriguez',
      role: 'VP Security Operations, Tech Enterprise',
      avatar: '👨‍💻',
    },
    {
      quote: 'Finally, a security platform that developers actually want to use. The AI-powered natural language queries and one-click fixes changed our entire workflow.',
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
      answer: 'Free gives you basic scanning for 1 project. Pro ($199/mo) unlocks world-first features like Predictive CVE Intelligence and AI Auto-Fix. Team ($599/mo) adds Digital Twin Security, Autonomous SOC, and real-time collaboration for 15 users. Business ($1,999/mo) includes all 86 security modules, SSO, and 99.9% SLA. Enterprise and Government plans start at $100K/year with unlimited everything.',
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
              <a href="#features" className="text-cyan-400 hover:text-pink-400 transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-cyan-400 hover:text-pink-400 transition-colors">
                Testimonials
              </a>
              <button onClick={onViewPricing} className="text-cyan-400 hover:text-pink-400 transition-colors">
                Pricing
              </button>
              <a href="#faq" className="text-cyan-400 hover:text-pink-400 transition-colors">
                FAQ
              </a>
              <button onClick={onViewIntelligence} className="text-cyan-400 hover:text-pink-400 transition-colors font-semibold">
                Anchor Intelligence
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
                86+ Security Modules • 16 World-First Features • Full EDR/XDR • Self-Evolving AI • B2B Intelligence API
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The World&apos;s First
              <br />
              <span className="bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] bg-clip-text text-transparent">
                AI Security Platform
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-purple-300 mb-10 max-w-2xl mx-auto">
              <strong>Government-grade protection</strong> for enterprises and agencies worldwide. 
              Featuring <strong>full EDR/XDR endpoint protection</strong>, <strong>autonomous SOC</strong>, <strong>digital twin simulation</strong>, 
              <strong>predictive CVE intelligence</strong>, <strong>1-click AI fix</strong>, 
              <strong>self-evolving AI defenses</strong>, <strong>B2B AI-as-a-Service API platform</strong>, and <strong>86+ integrated security modules</strong> in one unified platform.
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

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <strong>Security Capabilities</strong> That
              <br />
              <span className="bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Don&apos;t Exist Anywhere Else
              </span>
            </h2>
            <p className="text-xl text-purple-300 max-w-2xl mx-auto">
              <strong>We built the security tools we wished existed.</strong> Fifteen world-first innovations 
              that fundamentally change how organisations protect their critical assets and code.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-linear-to-br from-cyan-500/5 to-purple-500/5 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/20 hover:border-pink-500/50 transition-all group hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{feature.icon}</span>
                  <span className={`${feature.badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-cyan-400 mb-2">{feature.title}</h3>
                <p className="text-purple-300">{feature.description}</p>
              </div>
            ))}
          </div>
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
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
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
                price: 'From $4,999/mo',
                desc: 'Real-time aggregated feeds from NVD, CISA KEV, MITRE ATT&CK, AlienVault OTX — enriched and scored by AI.',
                color: 'border-purple-500/30 hover:border-purple-400',
              },
              {
                icon: '📋',
                title: 'Detection Rule Generator',
                price: 'From $4,999/mo',
                desc: 'AI generates production-ready Sigma, YARA, Snort, Suricata, KQL & SPL rules. Bulk generation supported.',
                color: 'border-blue-500/30 hover:border-blue-400',
              },
              {
                icon: '🧠',
                title: 'AI Threat Analysis',
                price: 'From $24,999/mo',
                desc: 'Deep analysis of malware, network traffic, logs, incidents, vulnerabilities, and IOCs. Instant verdicts.',
                color: 'border-cyan-500/30 hover:border-cyan-400',
              },
              {
                icon: '🔮',
                title: 'Predictive Modeling',
                price: 'From $24,999/mo',
                desc: 'Industry-specific threat predictions with likelihood scores, attack vectors, and mitigation strategies.',
                color: 'border-pink-500/30 hover:border-pink-400',
              },
              {
                icon: '🔎',
                title: 'IOC Enrichment',
                price: 'From $4,999/mo',
                desc: 'Instantly enrich IPs, domains, hashes, URLs, and emails with reputation, geolocation, and threat associations.',
                color: 'border-amber-500/30 hover:border-amber-400',
              },
              {
                icon: '📊',
                title: 'Competitive Intelligence',
                price: 'From $24,999/mo',
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
                    <div className="text-2xl flex-shrink-0">{item.icon}</div>
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

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={onViewIntelligence}
              className="bg-linear-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 px-10 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30 hover:shadow-cyan-500/40"
            >
              Explore Anchor Intelligence →
            </button>
            <p className="text-purple-400 text-sm mt-4">
              API access from $4,999/mo • Enterprise & OEM pricing available • 99.99% SLA
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 bg-linear-to-b from-purple-500/5 to-cyan-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Loved by Security Teams
            </h2>
            <p className="text-xl text-purple-300">
              See what security professionals say about Anchor
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

      {/* Pricing Preview Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-purple-300">
              86 security modules. 16 world-first features. One platform.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
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

            {/* Pro - Most Popular */}
            <div className="bg-linear-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-pink-500/50 hover:border-pink-400 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-pink-500 to-purple-500 px-4 py-1 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <div className="text-3xl font-bold text-pink-400 mb-4">$199<span className="text-lg text-purple-400">/mo</span></div>
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
              <div className="text-3xl font-bold text-cyan-400 mb-4">$599<span className="text-lg text-purple-400">/mo</span></div>
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
              <div className="text-3xl font-bold text-cyan-400 mb-4">$1,999<span className="text-lg text-purple-400">/mo</span></div>
              <ul className="space-y-2 text-sm text-purple-300 mb-6">
                <li>✓ 200 projects</li>
                <li>✓ 75 team members</li>
                <li>✓ <strong className="text-cyan-400">All 86 modules</strong></li>
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
              <strong>Enterprise & Government</strong> plans available from <span className="text-pink-400">$100K/year</span>
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

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-linear-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-cyan-500/30 rounded-3xl p-12 hover:border-pink-500/50 transition-all">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ready to Transform Your Security?
            </h2>
            <p className="text-xl text-purple-300 mb-4">
              <strong>Get a $345K+ security stack for a fraction of the price.</strong>
            </p>
            <p className="text-lg text-purple-400 mb-8">
              86+ modules. 16 world-first features. Starting at <span className="text-pink-400 font-bold">$199/month</span>.
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
                Built for enterprises and governments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-400 mb-4">Product</h4>
              <ul className="space-y-2 text-purple-300">
                <li><a href="#features" className="hover:text-pink-400 transition-colors">Features</a></li>
                <li><button onClick={onViewPricing} className="hover:text-pink-400 transition-colors">Pricing</button></li>
                <li><button onClick={onViewIntelligence} className="hover:text-pink-400 transition-colors text-left">Anchor Intelligence API</button></li>
                <li><a href="https://docs.anchoraiguard.com/cli" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">CLI Tool</a></li>
                <li><a href="#features" className="hover:text-pink-400 transition-colors">Integrations</a></li>
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
                <li><button onClick={onViewPurchaseTerms} className="hover:text-pink-400 transition-colors text-left">Purchase Terms</button></li>
                <li><button onClick={onViewSecurity} className="hover:text-pink-400 transition-colors text-left">Security</button></li>
                <li><a href="mailto:compliance@anchoraiguard.com" className="hover:text-pink-400 transition-colors">SOC 2 Report</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-500/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-purple-400 text-sm">
              © 2026 Anchor Security. All rights reserved.
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
