import React, { useState, useEffect } from 'react';

interface MarketingLandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onViewPricing: () => void;
  onViewPrivacy?: () => void;
  onViewTerms?: () => void;
  onViewSecurity?: () => void;
  onViewAbout?: () => void;
  onViewContact?: () => void;
}

const MarketingLanding: React.FC<MarketingLandingProps> = ({
  onGetStarted,
  onLogin,
  onViewPricing,
  onViewPrivacy,
  onViewTerms,
  onViewSecurity,
  onViewAbout,
  onViewContact,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      badgeColor: 'bg-indigo-500',
    },
  ];

  const stats = [
    { value: '85+', label: 'Security Modules' },
    { value: '12', label: 'World-First Features' },
    { value: '16', label: 'Compliance Frameworks' },
    { value: '24/7', label: 'Autonomous Protection' },
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
          scrolled ? 'bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(53,198,255,0.1)]' : ''
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
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onLogin}
                aria-label="Log in to your account"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm border border-cyan-500/30 text-cyan-400 hover:border-pink-500/50 hover:text-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transition-all"
              >
                Log in
              </button>
              <button
                onClick={onGetStarted}
                aria-label="Start your free trial"
                className="bg-gradient-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] hover:from-[#ff4fa3] hover:via-[#35c6ff] hover:to-[#7a3cff] px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-pink-500/25 hover:shadow-cyan-500/40 border border-white/20"
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
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-8">
              <span className="text-cyan-400">✨</span>
              <span className="text-sm text-cyan-300">
                85+ Security Modules • 12 World-First AI Features
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The World&apos;s First
              <br />
              <span className="bg-gradient-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] bg-clip-text text-transparent">
                AI Security Platform
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-purple-300 mb-10 max-w-2xl mx-auto">
              <strong>Government-grade protection</strong> for enterprises and agencies worldwide. 
              Featuring <strong>autonomous SOC</strong>, <strong>digital twin simulation</strong>, 
              <strong>predictive CVE intelligence</strong>, and <strong>85+ integrated security modules</strong> in one unified platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] hover:from-[#ff4fa3] hover:via-[#35c6ff] hover:to-[#7a3cff] px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 hover:shadow-cyan-500/50"
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#05080a] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl shadow-cyan-500/10">
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-cyan-400 ml-4">app.anchorsecurity.io/dashboard</span>
              </div>
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full"
              >
                <source src="/assets/anchor-demo-1.mp4" type="video/mp4" />
              </video>
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
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] bg-clip-text text-transparent mb-2">
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
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"> in Action</span>
            </h2>
            <p className="text-xl text-purple-300 max-w-2xl mx-auto">
              Watch how Anchor detects, analyses, and remediates security threats in real time.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl shadow-purple-500/10">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full"
            >
              <source src="/assets/anchor-demo-2.mp4" type="video/mp4" />
            </video>
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
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Don&apos;t Exist Anywhere Else
              </span>
            </h2>
            <p className="text-xl text-purple-300 max-w-2xl mx-auto">
              <strong>We built the security tools we wished existed.</strong> Twelve world-first innovations 
              that fundamentally change how organisations protect their critical assets and code.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-cyan-500/5 to-purple-500/5 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/20 hover:border-pink-500/50 transition-all group hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20"
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 bg-gradient-to-b from-purple-500/5 to-cyan-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
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
                className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/20"
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

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-cyan-500/30 overflow-hidden hover:border-pink-500/50 transition-all"
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
          <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-cyan-500/30 rounded-3xl p-12 hover:border-pink-500/50 transition-all">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ready to Transform Your Security?
            </h2>
            <p className="text-xl text-purple-300 mb-8">
              <strong>Start your free 14-day trial today.</strong> No credit card required. 
              Full access to all 85+ security modules.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-cyan-500 hover:to-purple-500 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/25 hover:shadow-pink-500/40"
            >
              Start Free Trial →
            </button>
            <p className="text-sm text-cyan-400 mt-4">
              14-day free trial • No credit card • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Glass Style */}
      <footer className="border-t border-cyan-500/20 py-12 px-4 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/assets/Anchor%20Logo.jpeg" alt="Anchor" draggable="false" className="w-[170px] h-[113px] object-contain select-none pointer-events-none" />
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
                <li><a href="https://github.com/toddyg1981-png/Anchor" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">CLI Tool</a></li>
                <li><a href="#features" className="hover:text-pink-400 transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-400 mb-4">Company</h4>
              <ul className="space-y-2 text-purple-300">
                <li><button onClick={onViewAbout} className="hover:text-pink-400 transition-colors text-left">About</button></li>
                <li><a href="https://blog.anchorsecurity.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">Blog</a></li>
                <li><a href="mailto:careers@anchorsecurity.com" className="hover:text-pink-400 transition-colors">Careers</a></li>
                <li><button onClick={onViewContact} className="hover:text-pink-400 transition-colors text-left">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-400 mb-4">Legal</h4>
              <ul className="space-y-2 text-purple-300">
                <li><button onClick={onViewPrivacy} className="hover:text-pink-400 transition-colors text-left">Privacy Policy</button></li>
                <li><button onClick={onViewTerms} className="hover:text-pink-400 transition-colors text-left">Terms of Service</button></li>
                <li><button onClick={onViewSecurity} className="hover:text-pink-400 transition-colors text-left">Security</button></li>
                <li><a href="mailto:compliance@anchorsecurity.com" className="hover:text-pink-400 transition-colors">SOC 2 Report</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-500/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-purple-400 text-sm">
              © 2026 Anchor Security. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="https://twitter.com/anchorsecurity" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-pink-400 transition-colors">Twitter</a>
              <a href="https://github.com/toddyg1981-png/Anchor" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-pink-400 transition-colors">GitHub</a>
              <a href="https://linkedin.com/company/anchorsecurity" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-pink-400 transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLanding;
