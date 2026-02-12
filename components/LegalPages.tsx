import React from 'react';

interface LegalPageProps {
  onBack: () => void;
}

const DownloadButton: React.FC<{ title: string }> = ({ title }) => {
  const handleDownload = () => {
    const content = document.querySelector('.prose');
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title} - Anchor Security</title>
      <style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a2e;line-height:1.7}
      h1{color:#0891b2;border-bottom:2px solid #0891b2;padding-bottom:12px}h2{color:#1e293b;margin-top:32px}h3{color:#475569}
      ul{padding-left:24px}li{margin-bottom:8px}table{width:100%;border-collapse:collapse;margin:16px 0}
      td,th{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}th{background:#f1f5f9}
      a{color:#0891b2}p{margin-bottom:12px}.text-sm{font-size:0.875rem;color:#64748b}
      @media print{body{margin:20px}}</style></head><body>
      <h1>${title}</h1><p style="color:#64748b;font-size:14px">Anchor Security Pty Ltd — anchoraiguard.com</p>
      ${content.innerHTML.replace(/class="[^"]*"/g, '').replace(/style="[^"]*"/g, '')}</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors"
      title={`Download ${title} as PDF`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      Download / Print
    </button>
  );
};

export const PrivacyPolicy: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="mb-8 text-cyan-400 hover:text-pink-400 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>

        <DownloadButton title="Privacy Policy" />
        
        <div className="prose prose-invert prose-cyan max-w-none space-y-6 text-purple-200">
          <p className="text-sm text-purple-400">Last updated: February 5, 2026</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">1. Introduction</h2>
            <p>
              Anchor Security (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl text-pink-400 mt-4 mb-2">Personal Information</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Name and email address</li>
              <li>Company/organisation information</li>
              <li>Payment information (processed securely via Stripe)</li>
              <li>Authentication data from OAuth providers (GitHub, Google)</li>
            </ul>
            
            <h3 className="text-xl text-pink-400 mt-4 mb-2">Technical Information</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Code repositories you choose to scan</li>
              <li>Security scan results and findings</li>
              <li>Usage analytics and platform interactions</li>
              <li>Log data and device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and maintain our security scanning services</li>
              <li>To process transactions and manage subscriptions</li>
              <li>To improve and personalise your experience</li>
              <li>To communicate with you about service updates</li>
              <li>To detect and prevent security threats</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">4. Data Security</h2>
            <p>
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>End-to-end encryption for all data in transit</li>
              <li>AES-256 encryption for data at rest</li>
              <li>SOC 2 Type II compliance</li>
              <li>Regular security audits and penetration testing</li>
              <li>Zero-knowledge architecture for sensitive code analysis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">5. Data Retention</h2>
            <p>
              We retain your data only as long as necessary to provide our services. 
              You can request deletion of your data at any time by contacting support@anchoraiguard.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">6. Your Rights</h2>
            <p>Under GDPR and Australian Privacy Act, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Object to data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">7. Contact Us</h2>
            <p>
              For privacy-related inquiries, contact us at:
              <br />
              <a href="mailto:privacy@anchoraiguard.com" className="text-cyan-400 hover:text-pink-400">
                privacy@anchoraiguard.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const TermsOfService: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="mb-8 text-cyan-400 hover:text-pink-400 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>

        <DownloadButton title="Terms of Service" />
        
        <div className="prose prose-invert prose-cyan max-w-none space-y-6 text-purple-200">
          <p className="text-sm text-purple-400">Last updated: February 5, 2026</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Anchor Security&apos;s platform, you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">2. Description of Service</h2>
            <p>
              Anchor Security provides an AI-powered security platform including:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Automated code security scanning</li>
              <li>Vulnerability detection and management</li>
              <li>Compliance monitoring and reporting</li>
              <li>Threat intelligence and analysis</li>
              <li>Security operations automation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account. You must notify us immediately 
              of any unauthorised use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Reverse engineer or decompile the platform</li>
              <li>Share your account with unauthorised users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">5. Payment Terms</h2>
            <p>
              Subscription fees are billed in advance on a monthly or annual basis. 
              All fees are non-refundable except as required by law or as explicitly stated 
              in our refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">6. Intellectual Property</h2>
            <p>
              The Anchor Security platform, including all software, designs, and content, 
              is owned by Anchor Security Pty Ltd. You retain ownership of your code and data; 
              we claim no intellectual property rights over the materials you provide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Anchor Security shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages arising 
              from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">8. Governing Law</h2>
            <p>
              These terms are governed by the laws of Australia. Any disputes shall be 
              resolved in the courts of New South Wales, Australia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">9. Contact</h2>
            <p>
              For questions about these terms, contact us at:
              <br />
              <a href="mailto:legal@anchoraiguard.com" className="text-cyan-400 hover:text-pink-400">
                legal@anchoraiguard.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const SecurityPage: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="mb-8 text-cyan-400 hover:text-pink-400 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Security at Anchor
        </h1>

        <DownloadButton title="Security" />
        
        <div className="prose prose-invert prose-cyan max-w-none space-y-6 text-purple-200">
          <p className="text-lg">
            As a security company, we hold ourselves to the highest standards. 
            Here&apos;s how we protect your data and our platform.
          </p>

          <section className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 mt-8">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">🏆 Compliance & Certifications</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-pink-400">SOC 2 Type II</h3>
                <p className="text-sm mt-1">Annual audits by independent third parties</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-pink-400">ISO 27001</h3>
                <p className="text-sm mt-1">Information security management certified</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-pink-400">GDPR Compliant</h3>
                <p className="text-sm mt-1">Full EU data protection compliance</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-pink-400">Australian Privacy Act</h3>
                <p className="text-sm mt-1">APP compliance for Australian data</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">🔐 Data Protection</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>Encryption in Transit:</strong> TLS 1.3 for all communications</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>Encryption at Rest:</strong> AES-256 for all stored data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>Zero-Knowledge Scanning:</strong> Your code never leaves your infrastructure for sensitive scans</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>Data Isolation:</strong> Complete tenant isolation in multi-tenant environment</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">🛡️ Infrastructure Security</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>Cloud Hosting:</strong> Enterprise-grade cloud infrastructure with 99.99% SLA</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>DDoS Protection:</strong> Multi-layer protection against volumetric attacks</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>WAF:</strong> Web application firewall with custom rulesets</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>Penetration Testing:</strong> Quarterly third-party penetration tests</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">🔍 Security Practices</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>Bug Bounty Program:</strong> Active program for responsible disclosure</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>Security Training:</strong> Regular training for all employees</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>Incident Response:</strong> 24/7 security operations center</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <span><strong>Code Reviews:</strong> All code undergoes security review before deployment</span>
              </li>
            </ul>
          </section>

          <section className="bg-linear-to-r from-cyan-500/10 to-pink-500/10 border border-cyan-500/30 rounded-xl p-6 mt-8">
            <h2 className="text-xl font-semibold text-white mb-2">Report a Vulnerability</h2>
            <p className="mb-4">
              Found a security issue? We appreciate responsible disclosure.
            </p>
            <a 
              href="mailto:security@anchoraiguard.com" 
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Contact Security Team
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export const AboutPage: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="mb-8 text-cyan-400 hover:text-pink-400 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          About Anchor Security
        </h1>
        
        <div className="prose prose-invert prose-cyan max-w-none space-y-6 text-purple-200">
          <p className="text-xl leading-relaxed">
            We built the security tools we wished existed. Twelve world-first innovations 
            that fundamentally change how organisations protect their critical assets and code.
          </p>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Our Mission</h2>
            <p>
              To democratise enterprise-grade security, making it accessible to organisations 
              of all sizes. We believe every company deserves the same level of protection 
              that was once only available to Fortune 500 companies.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">What Makes Us Different</h2>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-pink-400 mb-2">🤖 AI-First</h3>
                <p className="text-sm">
                  Built from the ground up with AI at the core, not bolted on as an afterthought.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-pink-400 mb-2">🚀 World-First Features</h3>
                <p className="text-sm">
                  12 capabilities that don&apos;t exist anywhere else in the market.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-pink-400 mb-2">🏛️ Government Ready</h3>
                <p className="text-sm">
                  Purpose-built modules for national security and critical infrastructure.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-pink-400 mb-2">⚡ Developer Experience</h3>
                <p className="text-sm">
                  Security that developers actually want to use, integrated into existing workflows.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Founded</h2>
            <p>
              Anchor Security was founded in 2026 in Sydney, Australia, with a vision to 
              revolutionise how organisations approach cybersecurity.
            </p>
          </section>

          <section className="bg-linear-to-r from-cyan-500/10 to-pink-500/10 border border-cyan-500/30 rounded-xl p-6 mt-8">
            <h2 className="text-xl font-semibold text-white mb-2">Get in Touch</h2>
            <p className="mb-4">
              Interested in learning more or joining our team?
            </p>
            <div className="flex gap-4">
              <a 
                href="mailto:hello@anchoraiguard.com" 
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="mailto:careers@anchoraiguard.com" 
                className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Careers
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export const PurchaseTerms: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="mb-8 text-cyan-400 hover:text-pink-400 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Purchase Terms & Conditions
        </h1>

        <DownloadButton title="Purchase Terms" />
        
        <div className="prose prose-invert prose-cyan max-w-none space-y-6 text-purple-200">
          <p className="text-sm text-purple-400">Last updated: February 7, 2026</p>
          
          <p className="text-lg">
            These Purchase Terms & Conditions govern your purchase and use of Anchor Security 
            subscription plans and services. By completing a purchase, you agree to these terms.
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">1. Subscription Plans</h2>
            <p>Anchor Security offers the following subscription tiers:</p>
            <div className="grid gap-4 mt-4">
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-pink-400">Starter</h3>
                <p className="text-sm mt-1">$990/month - Ideal for individual developers and small projects</p>
              </div>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-pink-400">Professional</h3>
                <p className="text-sm mt-1">$4,990/month - For growing teams with advanced security needs</p>
              </div>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-pink-400">Enterprise</h3>
                <p className="text-sm mt-1">$49,990/month - Full platform access with premium support</p>
              </div>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-pink-400">Government</h3>
                <p className="text-sm mt-1">Custom pricing - Sovereign security for government agencies</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">2. Billing Cycle</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>Monthly Plans:</strong> Billed on the same date each month</li>
              <li><strong>Annual Plans:</strong> Billed annually with up to 20% discount</li>
              <li>Billing occurs at the start of each billing period</li>
              <li>Charges will appear as &quot;ANCHOR SECURITY&quot; on your statement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">3. Payment Methods</h2>
            <p>We accept the following payment methods via our secure Stripe payment processor:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Visa, Mastercard, American Express, Discover</li>
              <li>Apple Pay and Google Pay</li>
              <li>Bank transfers (Enterprise plans only)</li>
              <li>ACH direct debit (US customers)</li>
              <li>SEPA direct debit (EU customers)</li>
            </ul>
            <p className="mt-4 text-sm text-purple-400">
              All payments are processed securely through Stripe. Anchor Security does not store 
              your full payment card details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">4. Free Trial</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>New users receive a 14-day free trial on Professional and Enterprise plans</li>
              <li>No credit card required to start a trial</li>
              <li>Full access to all features during the trial period</li>
              <li>Trial automatically ends after 14 days unless you subscribe</li>
              <li>One free trial per user/organisation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">5. Refund Policy</h2>
            <div className="bg-slate-900/50 border border-green-500/30 rounded-xl p-6 mt-4">
              <h3 className="font-semibold text-green-400 mb-2">30-Day Money-Back Guarantee</h3>
              <p className="text-sm">
                If you&apos;re not satisfied with Anchor Security within the first 30 days of your 
                initial subscription, contact us for a full refund. No questions asked.
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <p><strong>After 30 days:</strong></p>
              <ul className="list-disc list-inside space-y-2">
                <li>Monthly subscriptions: No refunds for partial months</li>
                <li>Annual subscriptions: Pro-rated refund available within first 90 days</li>
                <li>Refunds are processed within 5-10 business days</li>
                <li>Refunds are returned to the original payment method</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">6. Cancellation</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Cancel anytime from your account settings or by contacting support</li>
              <li>Cancellation takes effect at the end of your current billing period</li>
              <li>You retain access until the end of your paid period</li>
              <li>Data is retained for 30 days after cancellation, then permanently deleted</li>
              <li>You can export your data before cancellation</li>
            </ul>
            <p className="mt-4 text-sm text-purple-400">
              To cancel, go to Settings → Billing → Cancel Subscription, or email{' '}
              <a href="mailto:billing@anchoraiguard.com" className="text-cyan-400 hover:text-pink-400">
                billing@anchoraiguard.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">7. Plan Changes</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>Upgrades:</strong> Take effect immediately; pro-rated charges apply</li>
              <li><strong>Downgrades:</strong> Take effect at next billing cycle</li>
              <li>Feature access adjusts according to the new plan</li>
              <li>No penalty fees for changing plans</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">8. Pricing Changes</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>We may update pricing with 30 days advance notice</li>
              <li>Existing subscribers are protected for their current billing cycle</li>
              <li>Annual subscribers keep their rate until renewal</li>
              <li>Price decreases take effect immediately</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">9. Taxes</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Prices displayed exclude applicable taxes unless stated</li>
              <li>GST (10%) applies to Australian customers</li>
              <li>VAT applies to EU customers based on their location</li>
              <li>Sales tax may apply to US customers based on state</li>
              <li>Tax invoices available in your billing dashboard</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">10. Enterprise Agreements</h2>
            <p>
              Enterprise and Government customers may have custom terms outlined in a separate 
              Master Service Agreement (MSA). In case of conflict, the MSA takes precedence 
              over these general purchase terms.
            </p>
            <p className="mt-4">
              Enterprise agreements may include:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Custom payment terms (NET 30, NET 60)</li>
              <li>Volume discounts</li>
              <li>Custom SLAs</li>
              <li>Dedicated support channels</li>
              <li>On-premise deployment options</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">11. Failed Payments</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>We will retry failed payments up to 3 times over 7 days</li>
              <li>You will receive email notifications of payment failures</li>
              <li>Access may be suspended after multiple failed payment attempts</li>
              <li>Update your payment method in Settings → Billing</li>
              <li>Contact support if you need temporary payment extension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">12. Disputes</h2>
            <p>
              If you believe there&apos;s an error with your billing:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Contact us within 60 days of the charge</li>
              <li>Provide transaction details and reason for dispute</li>
              <li>We will investigate and respond within 10 business days</li>
              <li>Valid disputes will be credited or refunded promptly</li>
            </ul>
          </section>

          <section className="bg-linear-to-r from-cyan-500/10 to-pink-500/10 border border-cyan-500/30 rounded-xl p-6 mt-8">
            <h2 className="text-xl font-semibold text-white mb-2">Billing Support</h2>
            <p className="mb-4">
              Questions about your subscription or billing?
            </p>
            <a 
              href="mailto:billing@anchoraiguard.com" 
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Contact Billing Support
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COOKIE POLICY
// ============================================================================
export const CookiePolicy: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={onBack} className="mb-8 text-cyan-400 hover:text-pink-400 flex items-center gap-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">Cookie Policy</h1>

        <DownloadButton title="Cookie Policy" />

        <div className="prose prose-invert prose-cyan max-w-none space-y-6 text-purple-200">
          <p className="text-sm text-purple-400">Last updated: February 12, 2026</p>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">2. Cookies We Use</h2>
            <h3 className="text-xl text-pink-400 mt-4 mb-2">Strictly Necessary Cookies</h3>
            <p>Required for the platform to function. These cannot be disabled.</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>anchor_auth_token</strong> — Authentication session token</li>
              <li><strong>anchor_csrf</strong> — CSRF protection token</li>
              <li><strong>anchor_preferences</strong> — Essential user preferences (theme, language)</li>
            </ul>

            <h3 className="text-xl text-pink-400 mt-4 mb-2">Analytics Cookies</h3>
            <p>Help us understand how visitors interact with our platform. You may opt out of these.</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>_ga / _gid</strong> — Google Analytics (if enabled)</li>
              <li><strong>anchor_analytics</strong> — First-party usage analytics</li>
            </ul>

            <h3 className="text-xl text-pink-400 mt-4 mb-2">Functional Cookies</h3>
            <p>Enable enhanced functionality and personalisation.</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>anchor_dashboard_state</strong> — Remembers your dashboard layout</li>
              <li><strong>anchor_notification_prefs</strong> — Notification preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">3. Third-Party Cookies</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>Stripe</strong> — Payment processing (strictly necessary for billing)</li>
              <li><strong>Sentry</strong> — Error monitoring (performance cookies)</li>
            </ul>
            <p className="mt-2">We do <strong>not</strong> use advertising cookies or sell cookie data to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">4. Managing Cookies</h2>
            <p>You can control and delete cookies through your browser settings. Note that disabling strictly necessary cookies may prevent the platform from functioning correctly.</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Cookies and Site Permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">5. Cookie Retention</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Session cookies are deleted when you close your browser</li>
              <li>Authentication tokens expire after 7 days of inactivity</li>
              <li>Analytics cookies are retained for a maximum of 13 months</li>
              <li>Preference cookies are retained for 12 months</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">6. Updates to This Policy</h2>
            <p>We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of our platform constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">7. Contact</h2>
            <p>For questions about our use of cookies: <a href="mailto:privacy@anchoraiguard.com" className="text-cyan-400 hover:text-pink-400">privacy@anchoraiguard.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ACCEPTABLE USE POLICY
// ============================================================================
export const AcceptableUsePolicy: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={onBack} className="mb-8 text-cyan-400 hover:text-pink-400 flex items-center gap-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">Acceptable Use Policy</h1>

        <DownloadButton title="Acceptable Use Policy" />

        <div className="prose prose-invert prose-cyan max-w-none space-y-6 text-purple-200">
          <p className="text-sm text-purple-400">Last updated: February 12, 2026</p>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">1. Purpose</h2>
            <p>This Acceptable Use Policy (&ldquo;AUP&rdquo;) governs your use of Anchor Security&apos;s platform, APIs, and services. By using our services, you agree to comply with this policy. Violation may result in suspension or termination of your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">2. Permitted Use</h2>
            <p>You may use Anchor Security to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Scan and analyse code, applications, and infrastructure <strong>that you own or have explicit authorisation to test</strong></li>
              <li>Generate security reports for your organisation</li>
              <li>Integrate with your CI/CD pipelines and development workflows</li>
              <li>Access threat intelligence data for defensive security purposes</li>
              <li>Use AI analysis capabilities for security assessments of your own systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">3. Prohibited Use</h2>
            <p>You must <strong>NOT</strong> use Anchor Security to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Scan, attack, or probe systems you do not own or have written authorisation to test</li>
              <li>Conduct unauthorised penetration testing or vulnerability scanning of third-party systems</li>
              <li>Distribute malware, viruses, or other malicious code</li>
              <li>Engage in any form of &ldquo;hacking back&rdquo; or offensive cyber operations, except where the platform provides legal defensive measures on your own systems</li>
              <li>Circumvent rate limits, usage quotas, or licensing restrictions</li>
              <li>Share, resell, or sublicense your account or API keys</li>
              <li>Use the platform for any activity that violates applicable laws, including the Australian Criminal Code Act 1995, the Computer Fraud and Abuse Act (US), or the Computer Misuse Act (UK)</li>
              <li>Abuse the AI features to generate harmful, misleading, or illegal content</li>
              <li>Attempt to extract, reverse-engineer, or replicate Anchor&apos;s proprietary algorithms, TITAN Engine, or detection rules</li>
              <li>Use the platform to harass, threaten, or intimidate any individual</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">4. Scanning Authorisation</h2>
            <p>Before scanning any system, you must ensure:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>You are the owner of the target system, <strong>OR</strong></li>
              <li>You have explicit, written permission from the system owner</li>
              <li>The scan complies with all applicable laws in your jurisdiction</li>
              <li>You have documented authorisation available for audit purposes</li>
            </ul>
            <p className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
              <strong>WARNING:</strong> Scanning systems without authorisation is illegal in most jurisdictions and may result in criminal prosecution. Anchor Security is <strong>not liable</strong> for any unauthorised scanning activities performed by users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">5. Resource Limits</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>API rate limits are enforced per your subscription tier</li>
              <li>Excessive automated requests may be throttled</li>
              <li>Bulk data extraction is prohibited without prior written approval</li>
              <li>Storage limits apply per your subscription plan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">6. Enforcement</h2>
            <p>Anchor Security reserves the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Monitor usage for compliance with this policy</li>
              <li>Suspend or terminate accounts violating this policy without prior notice</li>
              <li>Report illegal activities to relevant law enforcement authorities</li>
              <li>Cooperate with law enforcement investigations where required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">7. Reporting Violations</h2>
            <p>If you become aware of any violation of this policy, please report it to: <a href="mailto:abuse@anchoraiguard.com" className="text-cyan-400 hover:text-pink-400">abuse@anchoraiguard.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DATA PROCESSING AGREEMENT (DPA)
// ============================================================================
export const DataProcessingAgreement: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={onBack} className="mb-8 text-cyan-400 hover:text-pink-400 flex items-center gap-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">Data Processing Agreement</h1>

        <DownloadButton title="Data Processing Agreement" />

        <div className="prose prose-invert prose-cyan max-w-none space-y-6 text-purple-200">
          <p className="text-sm text-purple-400">Last updated: February 12, 2026</p>
          <p className="text-lg">This Data Processing Agreement (&ldquo;DPA&rdquo;) forms part of the Terms of Service between Anchor Security Pty Ltd (ABN pending) (&ldquo;Processor&rdquo;) and you (&ldquo;Controller&rdquo;) and governs the processing of personal data.</p>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">1. Definitions</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>&ldquo;Personal Data&rdquo;</strong> — any data relating to an identified or identifiable natural person</li>
              <li><strong>&ldquo;Processing&rdquo;</strong> — any operation performed on personal data (collection, storage, use, disclosure, deletion)</li>
              <li><strong>&ldquo;Sub-processor&rdquo;</strong> — a third party engaged by the Processor to process personal data</li>
              <li><strong>&ldquo;Data Subject&rdquo;</strong> — the individual to whom personal data relates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">2. Scope of Processing</h2>
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 mt-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-slate-700"><td className="py-2 text-pink-400 font-semibold w-1/3">Subject matter</td><td className="py-2">Provision of AI-powered security scanning and analysis services</td></tr>
                  <tr className="border-b border-slate-700"><td className="py-2 text-pink-400 font-semibold">Duration</td><td className="py-2">For the duration of the service agreement plus 30 days</td></tr>
                  <tr className="border-b border-slate-700"><td className="py-2 text-pink-400 font-semibold">Nature &amp; purpose</td><td className="py-2">Security analysis of code, infrastructure, and threat data to identify vulnerabilities</td></tr>
                  <tr className="border-b border-slate-700"><td className="py-2 text-pink-400 font-semibold">Categories of data</td><td className="py-2">User account data, code repositories, scan results, usage logs, IP addresses</td></tr>
                  <tr><td className="py-2 text-pink-400 font-semibold">Data subjects</td><td className="py-2">Customer employees, authorised users</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">3. Processor Obligations</h2>
            <p>Anchor Security shall:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Process personal data only on documented instructions from the Controller</li>
              <li>Ensure all personnel processing data are bound by confidentiality obligations</li>
              <li>Implement appropriate technical and organisational security measures (see Section 4)</li>
              <li>Assist the Controller in responding to data subject access requests</li>
              <li>Delete or return all personal data upon termination of the agreement</li>
              <li>Make available all information necessary to demonstrate compliance</li>
              <li>Immediately inform the Controller if an instruction infringes applicable data protection laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">4. Security Measures</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>AES-256 encryption at rest for all personal data</li>
              <li>TLS 1.3 encryption in transit</li>
              <li>Multi-factor authentication for all administrative access</li>
              <li>Role-based access control (RBAC)</li>
              <li>Regular penetration testing and vulnerability assessments</li>
              <li>Automated intrusion detection and prevention</li>
              <li>Comprehensive audit logging</li>
              <li>Disaster recovery with RPO &lt; 1 hour and RTO &lt; 4 hours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">5. Sub-processors</h2>
            <p>The following sub-processors are authorised:</p>
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 mt-4">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700"><th className="text-left py-2 text-pink-400">Sub-processor</th><th className="text-left py-2 text-pink-400">Purpose</th><th className="text-left py-2 text-pink-400">Location</th></tr></thead>
                <tbody>
                  <tr className="border-b border-slate-700"><td className="py-2">Stripe, Inc.</td><td className="py-2">Payment processing</td><td className="py-2">USA</td></tr>
                  <tr className="border-b border-slate-700"><td className="py-2">Anthropic, PBC</td><td className="py-2">AI analysis (Claude API)</td><td className="py-2">USA</td></tr>
                  <tr className="border-b border-slate-700"><td className="py-2">Resend, Inc.</td><td className="py-2">Email delivery</td><td className="py-2">USA</td></tr>
                  <tr className="border-b border-slate-700"><td className="py-2">Supabase, Inc.</td><td className="py-2">Database hosting</td><td className="py-2">USA/EU</td></tr>
                  <tr><td className="py-2">Sentry (Functional Software)</td><td className="py-2">Error monitoring</td><td className="py-2">USA</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">The Controller will be notified at least 30 days before any new sub-processor is engaged, with the right to object.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">6. Data Breach Notification</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Anchor Security will notify the Controller of any personal data breach without undue delay and no later than <strong>72 hours</strong> after becoming aware</li>
              <li>Notification will include: nature of the breach, categories and approximate number of data subjects affected, likely consequences, and measures taken to mitigate</li>
              <li>Anchor Security will cooperate with the Controller and any supervisory authority in investigating the breach</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">7. International Transfers</h2>
            <p>Where personal data is transferred outside the European Economic Area or Australia, Anchor Security ensures appropriate safeguards are in place, including:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Standard Contractual Clauses (SCCs) as approved by the European Commission</li>
              <li>Data Processing Agreements with all sub-processors</li>
              <li>Compliance with the Australian Privacy Principles (APPs)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">8. Audit Rights</h2>
            <p>The Controller may audit Anchor Security&apos;s compliance with this DPA, subject to reasonable notice and scope. Anchor Security will provide reasonable assistance and access to information necessary for such audits.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">9. Governing Law</h2>
            <p>This DPA is governed by the laws of New South Wales, Australia. For EU data subjects, the provisions of the GDPR shall apply. For UK data subjects, the UK GDPR applies.</p>
          </section>

          <section className="bg-linear-to-r from-cyan-500/10 to-pink-500/10 border border-cyan-500/30 rounded-xl p-6 mt-8">
            <h2 className="text-xl font-semibold text-white mb-2">Request a Signed DPA</h2>
            <p className="mb-4">Enterprise customers can request a countersigned copy of this DPA.</p>
            <a href="mailto:legal@anchoraiguard.com?subject=DPA%20Request" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors">Request Signed DPA</a>
          </section>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DISCLAIMER & WARRANTY LIMITATIONS
// ============================================================================
export const Disclaimer: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={onBack} className="mb-8 text-cyan-400 hover:text-pink-400 flex items-center gap-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">Disclaimer &amp; Warranty Limitations</h1>

        <DownloadButton title="Disclaimer & Warranty Limitations" />

        <div className="prose prose-invert prose-cyan max-w-none space-y-6 text-purple-200">
          <p className="text-sm text-purple-400">Last updated: February 12, 2026</p>

          <section className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-amber-400 mt-0 mb-4">Important Notice</h2>
            <p className="text-amber-200">Anchor Security is a <strong>security analysis and monitoring tool</strong>. It is <strong>not</strong> a guarantee of absolute security. No software can detect all vulnerabilities or prevent all breaches. Use of our platform should be part of a comprehensive security programme, not a substitute for one.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">1. No Guarantee of Complete Security</h2>
            <p>While Anchor Security employs advanced AI and detection techniques, we do <strong>not</strong> warrant that:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>All vulnerabilities in your code, infrastructure, or applications will be detected</li>
              <li>The platform will be free from errors, interruptions, or defects</li>
              <li>Security scan results are exhaustive or infallible</li>
              <li>Use of the platform will prevent all security breaches or data loss</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">2. AI-Generated Content</h2>
            <p>Anchor Security uses artificial intelligence (including the TITAN Engine and Claude API) to analyse threats and generate recommendations. AI-generated content:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>May contain inaccuracies or false positives/negatives</li>
              <li>Should be reviewed by qualified security professionals before acting upon</li>
              <li>Does not constitute professional security advice, legal advice, or compliance certification</li>
              <li>Is provided as decision-support tooling, not as a definitive assessment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">3. Compliance Disclaimer</h2>
            <p>Compliance monitoring features (SOC 2, ISO 27001, GDPR, HIPAA, etc.) are provided to <strong>assist</strong> with compliance efforts. They do <strong>not</strong> constitute legal certification or guarantee regulatory compliance. You remain solely responsible for meeting your regulatory obligations. Consult qualified legal and compliance professionals.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">4. Threat Intelligence Disclaimer</h2>
            <p>Threat intelligence data, including CVE information, IOCs, dark web monitoring, and predictive analytics:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Is sourced from third-party feeds and public databases</li>
              <li>May not be complete, current, or accurate at all times</li>
              <li>Should not be the sole basis for security decisions</li>
              <li>Is provided &ldquo;as-is&rdquo; without warranty of accuracy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">5. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law (including the Australian Consumer Law):</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Anchor Security&apos;s total liability is limited to the fees paid by you in the 12 months preceding the claim</li>
              <li>We are not liable for any indirect, incidental, consequential, special, or punitive damages</li>
              <li>We are not liable for loss of data, loss of profit, business interruption, or security breaches that occur despite use of our platform</li>
              <li>We are not liable for actions taken by users based on AI-generated recommendations</li>
            </ul>
            <p className="mt-4 text-sm text-purple-400">Nothing in this disclaimer excludes or limits liability that cannot be excluded under applicable law, including Australian Consumer Law guarantees.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">6. Indemnification</h2>
            <p>You agree to indemnify Anchor Security against any claims arising from:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Your use of the platform in violation of applicable laws</li>
              <li>Unauthorised scanning of systems you do not own or have permission to test</li>
              <li>Your failure to implement recommended security measures</li>
              <li>Your violation of the Acceptable Use Policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">7. Force Majeure</h2>
            <p>Anchor Security is not liable for any failure or delay caused by circumstances beyond our reasonable control, including natural disasters, war, terrorism, government actions, internet disruptions, or third-party service outages.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">8. Contact</h2>
            <p>For questions about these disclaimers: <a href="mailto:legal@anchoraiguard.com" className="text-cyan-400 hover:text-pink-400">legal@anchoraiguard.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// RESPONSIBLE DISCLOSURE POLICY
// ============================================================================
export const ResponsibleDisclosure: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={onBack} className="mb-8 text-cyan-400 hover:text-pink-400 flex items-center gap-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">Responsible Disclosure Policy</h1>

        <DownloadButton title="Responsible Disclosure Policy" />

        <div className="prose prose-invert prose-cyan max-w-none space-y-6 text-purple-200">
          <p className="text-sm text-purple-400">Last updated: February 12, 2026</p>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">1. Our Commitment</h2>
            <p>Anchor Security takes the security of our platform seriously. We welcome and appreciate the security research community&apos;s efforts to improve our security. If you discover a vulnerability, we want to work with you to resolve it quickly and responsibly.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">2. Scope</h2>
            <p>The following are in scope for responsible disclosure:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>anchoraiguard.com and all subdomains</li>
              <li>Anchor Security API endpoints</li>
              <li>Anchor Security CLI tools</li>
              <li>Anchor Security mobile applications (when available)</li>
            </ul>
            <p className="mt-4"><strong>Out of scope:</strong></p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Third-party services and integrations</li>
              <li>Social engineering attacks against Anchor employees</li>
              <li>Denial of service attacks</li>
              <li>Physical security of Anchor offices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">3. How to Report</h2>
            <p>Send your findings to: <a href="mailto:security@anchoraiguard.com" className="text-cyan-400 hover:text-pink-400">security@anchoraiguard.com</a></p>
            <p className="mt-2">Please include:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Description of the vulnerability</li>
              <li>Steps to reproduce</li>
              <li>Potential impact</li>
              <li>Any proof-of-concept code or screenshots</li>
              <li>Your preferred contact method</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">4. Our Promises</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>We will acknowledge your report within 48 hours</li>
              <li>We will provide a timeline for resolution within 5 business days</li>
              <li>We will not take legal action against researchers acting in good faith</li>
              <li>We will credit you (with your permission) when the issue is resolved</li>
              <li>We aim to resolve critical vulnerabilities within 7 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mt-8 mb-4">5. Safe Harbour</h2>
            <p>We consider security research conducted in accordance with this policy to be:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Authorised and not a violation of our Terms of Service</li>
              <li>Lawful and not subject to legal action by Anchor Security</li>
              <li>Helpful and conducted in the public interest</li>
            </ul>
            <p className="mt-4">This safe harbour is conditional on researchers:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Making a good faith effort to avoid privacy violations and data damage</li>
              <li>Not accessing or modifying other users&apos; data</li>
              <li>Reporting findings promptly and not disclosing publicly before we have had time to address them</li>
              <li>Not exploiting the vulnerability beyond what is necessary to demonstrate it</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="mb-8 text-cyan-400 hover:text-pink-400 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Contact Us
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-pink-400 mb-2">📧 General Inquiries</h3>
                <a href="mailto:hello@anchoraiguard.com" className="text-cyan-400 hover:text-pink-400">
                  hello@anchoraiguard.com
                </a>
              </div>
              
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-pink-400 mb-2">💼 Sales</h3>
                <a href="mailto:sales@anchoraiguard.com" className="text-cyan-400 hover:text-pink-400">
                  sales@anchoraiguard.com
                </a>
              </div>
              
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-pink-400 mb-2">🛠️ Support</h3>
                <a href="mailto:support@anchoraiguard.com" className="text-cyan-400 hover:text-pink-400">
                  support@anchoraiguard.com
                </a>
              </div>
              
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-pink-400 mb-2">🔐 Security</h3>
                <a href="mailto:security@anchoraiguard.com" className="text-cyan-400 hover:text-pink-400">
                  security@anchoraiguard.com
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Send a Message</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="you@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Subject</label>
                <select aria-label="Subject" className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none">
                  <option>General Inquiry</option>
                  <option>Sales Question</option>
                  <option>Technical Support</option>
                  <option>Partnership Opportunity</option>
                  <option>Press/Media</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none resize-none"
                  placeholder="How can we help?"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-linear-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SERVICE LEVEL AGREEMENT (SLA)
// ═══════════════════════════════════════════════════════════════════
export const ServiceLevelAgreement: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-cyan-400">Service Level Agreement</h1>
          <DownloadButton title="Service Level Agreement" />
        </div>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p>This Service Level Agreement (&quot;SLA&quot;) forms part of the agreement between Anchor Security Pty Ltd (ABN: pending registration) (&quot;Anchor&quot;, &quot;we&quot;, &quot;us&quot;) and the customer (&quot;you&quot;, &quot;Customer&quot;) for the Anchor AI Guard platform.</p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Service Availability</h2>
          <p>Anchor commits to the following monthly uptime percentages based on your subscription tier:</p>
          <table className="w-full text-sm border-collapse mt-4">
            <thead><tr className="border-b border-gray-700">
              <th className="text-left py-2 px-3 text-cyan-400">Tier</th>
              <th className="text-left py-2 px-3 text-cyan-400">Monthly Uptime SLA</th>
              <th className="text-left py-2 px-3 text-cyan-400">Max Monthly Downtime</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">Free / Starter</td><td className="py-2 px-3">99.0%</td><td className="py-2 px-3">~7.3 hours</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">Pro</td><td className="py-2 px-3">99.5%</td><td className="py-2 px-3">~3.6 hours</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">Team</td><td className="py-2 px-3">99.9%</td><td className="py-2 px-3">~43 minutes</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">Business</td><td className="py-2 px-3">99.9%</td><td className="py-2 px-3">~43 minutes</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">Enterprise</td><td className="py-2 px-3">99.95%</td><td className="py-2 px-3">~22 minutes</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">Enterprise+</td><td className="py-2 px-3">99.99%</td><td className="py-2 px-3">~4.3 minutes</td></tr>
            </tbody>
          </table>

          <h2 className="text-xl font-semibold text-white mt-8">2. Measurement & Exclusions</h2>
          <p>Uptime is measured as the percentage of total minutes in a calendar month during which the core platform services (dashboard, API, scanning engine) are operational. The following are excluded from downtime calculations:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Scheduled maintenance windows (notified 48+ hours in advance, max 4 hours/month)</li>
            <li>Force majeure events (natural disasters, government actions, pandemic-related disruptions)</li>
            <li>Customer-caused outages (misconfigured integrations, exceeded rate limits)</li>
            <li>Third-party service failures outside Anchor&apos;s reasonable control</li>
            <li>Network issues between the Customer and Anchor&apos;s infrastructure</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Service Credits</h2>
          <p>If Anchor fails to meet the SLA for your tier, you are entitled to service credits as follows:</p>
          <table className="w-full text-sm border-collapse mt-4">
            <thead><tr className="border-b border-gray-700">
              <th className="text-left py-2 px-3 text-cyan-400">Uptime Achieved</th>
              <th className="text-left py-2 px-3 text-cyan-400">Service Credit (% of monthly fee)</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">&lt; SLA target but ≥ 99.0%</td><td className="py-2 px-3">10%</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">&lt; 99.0% but ≥ 95.0%</td><td className="py-2 px-3">25%</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">&lt; 95.0%</td><td className="py-2 px-3">50%</td></tr>
            </tbody>
          </table>
          <p>Service credits are capped at 50% of your monthly subscription fee. Credits must be requested within 30 days of the affected month by emailing support@anchoraiguard.com.</p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Support Response Times</h2>
          <table className="w-full text-sm border-collapse mt-4">
            <thead><tr className="border-b border-gray-700">
              <th className="text-left py-2 px-3 text-cyan-400">Priority</th>
              <th className="text-left py-2 px-3 text-cyan-400">Free/Starter</th>
              <th className="text-left py-2 px-3 text-cyan-400">Pro</th>
              <th className="text-left py-2 px-3 text-cyan-400">Team/Business</th>
              <th className="text-left py-2 px-3 text-cyan-400">Enterprise</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">P1 - Critical</td><td className="py-2 px-3">48h</td><td className="py-2 px-3">4h</td><td className="py-2 px-3">1h</td><td className="py-2 px-3">15 min</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">P2 - High</td><td className="py-2 px-3">72h</td><td className="py-2 px-3">8h</td><td className="py-2 px-3">4h</td><td className="py-2 px-3">1h</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">P3 - Medium</td><td className="py-2 px-3">5 days</td><td className="py-2 px-3">24h</td><td className="py-2 px-3">8h</td><td className="py-2 px-3">4h</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3">P4 - Low</td><td className="py-2 px-3">10 days</td><td className="py-2 px-3">72h</td><td className="py-2 px-3">24h</td><td className="py-2 px-3">8h</td></tr>
            </tbody>
          </table>

          <h2 className="text-xl font-semibold text-white mt-8">5. Incident Communication</h2>
          <p>During any service disruption, Anchor will:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Post real-time updates to our status page at status.anchoraiguard.com</li>
            <li>Send email notifications to affected customers within 30 minutes of incident detection</li>
            <li>Provide a post-incident report (PIR) within 5 business days of resolution</li>
            <li>For Enterprise customers: direct phone notification via dedicated CSM</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">6. Data Durability</h2>
          <p>Anchor maintains 99.999% data durability through geographically redundant backups across Australian data centres. All customer data is backed up at minimum every 24 hours, with point-in-time recovery available for Enterprise tier customers.</p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Governing Law</h2>
          <p>This SLA is governed by the laws of New South Wales, Australia. Any dispute arising under this SLA will be subject to the exclusive jurisdiction of the courts of New South Wales.</p>

          <p className="text-sm text-gray-500 mt-8 border-t border-gray-700 pt-4">Anchor Security Pty Ltd · ABN pending registration · Sydney, Australia · support@anchoraiguard.com</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// END USER LICENCE AGREEMENT (EULA)
// ═══════════════════════════════════════════════════════════════════
export const EndUserLicenceAgreement: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-cyan-400">End User Licence Agreement</h1>
          <DownloadButton title="End User Licence Agreement" />
        </div>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p><strong>IMPORTANT — READ CAREFULLY:</strong> This End User Licence Agreement (&quot;EULA&quot;) is a legal agreement between you (either an individual or an entity) and Anchor Security Pty Ltd (ABN: pending registration), trading as Anchor AI Guard (&quot;Anchor&quot;, &quot;we&quot;, &quot;us&quot;), for the Anchor AI Guard cybersecurity platform (&quot;Software&quot;).</p>
          <p>By accessing or using the Software, you agree to be bound by this EULA. If you do not agree, do not use the Software.</p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Licence Grant</h2>
          <h3 className="text-lg font-medium text-gray-200 mt-4">1.1 Subscription Licence</h3>
          <p>Subject to payment of the applicable subscription fees and compliance with this EULA, Anchor grants you a non-exclusive, non-transferable, revocable licence to access and use the Software as a cloud-hosted service (SaaS) for the duration of your subscription period.</p>
          <h3 className="text-lg font-medium text-gray-200 mt-4">1.2 Source Code Licence (BUSL-1.1)</h3>
          <p>The underlying source code of the Software is licensed under the Business Source License 1.1 (BUSL-1.1). This means:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You may view, fork, and modify the source code for <strong>non-production purposes</strong> (development, testing, evaluation, contribution).</li>
            <li>You may <strong>not</strong> use the source code to operate a competing commercial service.</li>
            <li>Production use of the Software is exclusively available through paid subscription plans on the Anchor platform.</li>
            <li>The source code converts to a permissive open-source licence automatically on the Change Date specified in the LICENSE file.</li>
          </ul>
          <h3 className="text-lg font-medium text-gray-200 mt-4">1.3 Subscription vs Source Licence</h3>
          <p>Your paid subscription grants you production-use rights that override the BUSL-1.1 non-production restriction. If your subscription lapses, your production-use rights terminate and you must cease production use within 30 days.</p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Restrictions</h2>
          <p>You shall not:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sublicence, sell, resell, rent, or lease the Software to any third party</li>
            <li>Use the Software to build a competing cybersecurity product or service</li>
            <li>Reverse engineer, decompile, or disassemble any proprietary components (AI models, threat intelligence feeds)</li>
            <li>Remove or alter any copyright notices, trademarks, or proprietary markings</li>
            <li>Use the Software to conduct malicious activities, attack third parties, or violate any applicable law</li>
            <li>Exceed your subscription tier limits (projects, scans, team members, AI queries)</li>
            <li>Share your account credentials or allow unauthorised users to access the platform</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Intellectual Property</h2>
          <p>All intellectual property rights in the Software, including but not limited to code, AI models, algorithms, training data, trade secrets, trademarks (&quot;Anchor AI Guard&quot;, the Anchor logo), and documentation, are and remain the exclusive property of Anchor Security Pty Ltd.</p>
          <p>You retain ownership of your data processed through the Software. Anchor claims no ownership over your security findings, scan results, or configuration data.</p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Data Processing</h2>
          <p>Our processing of your personal data is governed by our Privacy Policy and Data Processing Agreement. By using the Software, you consent to data processing as described in those documents.</p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Warranties & Disclaimers</h2>
          <p>The Software is provided &quot;as is&quot; and &quot;as available&quot;. To the maximum extent permitted by the Australian Consumer Law (Schedule 2 of the Competition and Consumer Act 2010), Anchor disclaims all warranties whether express, implied, or statutory, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.</p>
          <p>Anchor does not warrant that the Software will detect all vulnerabilities, prevent all security breaches, or that its operation will be uninterrupted or error-free. The Software is a tool to assist with cybersecurity and does not replace professional security assessment.</p>
          <p><strong>Nothing in this EULA excludes, restricts, or modifies any consumer guarantee under the Australian Consumer Law that cannot lawfully be excluded.</strong></p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Anchor&apos;s total aggregate liability under this EULA shall not exceed the fees paid by you in the 12 months preceding the claim.</li>
            <li>Anchor shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business opportunity, or goodwill.</li>
            <li>Anchor is not liable for damages arising from any security breach that the Software failed to detect or prevent.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">7. Term & Termination</h2>
          <p>This EULA is effective from the date you first access the Software and continues until terminated. Anchor may terminate this EULA immediately if you breach any term. Upon termination, you must cease all use of the Software and delete any local copies. Sections 2, 3, 5, 6, and 9 survive termination.</p>

          <h2 className="text-xl font-semibold text-white mt-8">8. Export Control</h2>
          <p>The Software may be subject to Australian export control laws (Defence Trade Controls Act 2012) and applicable international regulations. You shall not export, re-export, or transfer the Software to any prohibited country, entity, or individual without appropriate government authorisation.</p>

          <h2 className="text-xl font-semibold text-white mt-8">9. Governing Law</h2>
          <p>This EULA is governed by the laws of New South Wales, Australia. Any dispute shall be subject to the exclusive jurisdiction of the courts of New South Wales. Before commencing legal proceedings, both parties agree to attempt resolution through good-faith negotiation for a period of 30 days.</p>

          <h2 className="text-xl font-semibold text-white mt-8">10. Entire Agreement</h2>
          <p>This EULA, together with the Terms of Service, Privacy Policy, SLA, and any applicable Order Form, constitutes the entire agreement between you and Anchor regarding the Software and supersedes all prior agreements and representations.</p>

          <p className="text-sm text-gray-500 mt-8 border-t border-gray-700 pt-4">Anchor Security Pty Ltd · ABN pending registration · Sydney, Australia · legal@anchoraiguard.com</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SOVEREIGN DATA RESIDENCY POLICY
// ═══════════════════════════════════════════════════════════════════
export const SovereignDataResidencyPolicy: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-cyan-400">Sovereign Data Residency Policy</h1>
          <DownloadButton title="Sovereign Data Residency Policy" />
        </div>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p>Anchor Security Pty Ltd (&quot;Anchor&quot;) is an Australian sovereign cybersecurity company. This policy outlines our commitment to data sovereignty and the residency of customer data within Australian borders.</p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Australian Data Sovereignty Commitment</h2>
          <p>Anchor is committed to maintaining Australian data sovereignty as a foundational principle of our platform:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Australian-owned and operated:</strong> Anchor Security Pty Ltd is a 100% Australian-owned company, incorporated in New South Wales, Australia.</li>
            <li><strong>No foreign ownership or control:</strong> No foreign government, entity, or individual holds a controlling interest in Anchor.</li>
            <li><strong>Australian-resident key personnel:</strong> All directors, officers, and key security personnel are Australian residents.</li>
            <li><strong>Subject to Australian law:</strong> Anchor operates exclusively under Australian jurisdiction and law.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. Data Storage & Processing Locations</h2>
          <h3 className="text-lg font-medium text-gray-200 mt-4">2.1 Default — Australian Data Centres</h3>
          <p>All customer data, including security findings, scan results, configuration data, logs, and personal data, is stored and processed exclusively in Australian data centres by default. Our primary infrastructure providers operate in:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Sydney, NSW (primary region)</li>
            <li>Melbourne, VIC (disaster recovery)</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-200 mt-4">2.2 Government & Defence Customers</h3>
          <p>For Government and Defence tier customers, Anchor offers:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Dedicated Australian sovereign cloud infrastructure</li>
            <li>Air-gapped deployment options (no internet connectivity)</li>
            <li>On-premise deployment within customer-controlled facilities</li>
            <li>PROTECTED-level classification support (aligned with Australian Government ISM)</li>
            <li>Data processed only by security-cleared Australian personnel</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-200 mt-4">2.3 Enterprise Multi-Region (opt-in only)</h3>
          <p>Enterprise+ tier customers may opt-in to multi-region deployment for performance reasons. In such cases, data residency is contractually agreed upon and documented in the customer&apos;s Order Form. No data leaves Australia without explicit written consent.</p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Third-Party Sub-Processors</h2>
          <p>Where Anchor engages sub-processors, we ensure:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>All sub-processors processing Australian customer data maintain Australian-region data processing</li>
            <li>Sub-processors are subject to contractual data residency obligations</li>
            <li>Customers are notified of any sub-processor changes with 30 days&apos; notice</li>
            <li>A current list of sub-processors is available upon request</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">4. International Data Transfer Safeguards</h2>
          <p>In the limited circumstances where data may be processed outside Australia (e.g., AI model inference via cloud providers), Anchor ensures:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Compliance with Australian Privacy Principle (APP) 8 — cross-border disclosure requirements</li>
            <li>Standard Contractual Clauses (SCCs) or binding corporate rules are in place</li>
            <li>Data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
            <li>No personally identifiable information (PII) is included in outbound AI queries</li>
            <li>Government and Defence tier customers are never subject to international data transfers</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">5. Compliance Framework</h2>
          <p>Anchor&apos;s data residency practices align with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Privacy Act 1988 (Cth)</strong> — Australian Privacy Principles (APPs)</li>
            <li><strong>Notifiable Data Breaches (NDB) scheme</strong> — Part IIIC of the Privacy Act</li>
            <li><strong>Australian Government Information Security Manual (ISM)</strong></li>
            <li><strong>Security of Critical Infrastructure Act 2018 (SOCI Act)</strong></li>
            <li><strong>Hosting Certification Framework (HCF)</strong> — for government workloads</li>
            <li><strong>Essential Eight Maturity Model</strong> — ACSC guidelines</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">6. Customer Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Request written confirmation of where your data is stored and processed</li>
            <li>Receive notification of any change to data storage locations</li>
            <li>Terminate your subscription if data is moved outside agreed regions</li>
            <li>Request and receive all your data in portable format upon account closure</li>
            <li>Request deletion of all your data within 30 days of account closure</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">7. Contact</h2>
          <p>For questions about data residency or to request a Data Residency Certificate for your account, contact: <strong>privacy@anchoraiguard.com</strong></p>

          <p className="text-sm text-gray-500 mt-8 border-t border-gray-700 pt-4">Anchor Security Pty Ltd · ABN pending registration · Sydney, Australia · privacy@anchoraiguard.com</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// WHISTLEBLOWER POLICY
// ═══════════════════════════════════════════════════════════════════
export const WhistleblowerPolicy: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-cyan-400">Whistleblower Policy</h1>
          <DownloadButton title="Whistleblower Policy" />
        </div>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p>Anchor Security Pty Ltd (&quot;Anchor&quot;) is committed to maintaining the highest standards of ethical conduct and corporate governance. This Whistleblower Policy is established in compliance with Part 9.4AAA of the Corporations Act 2001 (Cth) and the Treasury Laws Amendment (Enhancing Whistleblower Protections) Act 2019.</p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Purpose</h2>
          <p>This policy encourages and facilitates the reporting of misconduct, illegal activity, or improper conduct within Anchor, while protecting those who report in good faith from retaliation or detrimental action.</p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Who Can Report</h2>
          <p>Eligible whistleblowers under this policy include:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Current and former employees (including contractors, consultants, interns)</li>
            <li>Current and former officers and directors</li>
            <li>Suppliers and their employees</li>
            <li>Associates and relatives of any of the above</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. What Can Be Reported</h2>
          <p>Disclosable matters include conduct that is:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Illegal (fraud, theft, corruption, money laundering, bribery)</li>
            <li>In breach of Commonwealth or state legislation</li>
            <li>A danger to the public or the financial system</li>
            <li>Misconduct or an improper state of affairs (e.g., data mishandling, privacy violations)</li>
            <li>Dishonest, unethical, or in breach of Anchor&apos;s Code of Conduct</li>
            <li>A risk to the security of customer data or platform integrity</li>
          </ul>
          <p><strong>Personal work-related grievances</strong> (e.g., interpersonal conflicts, performance management) are generally not covered unless they involve a disclosable matter above.</p>

          <h2 className="text-xl font-semibold text-white mt-8">4. How to Report</h2>
          <p>Reports can be made through any of the following channels:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Email:</strong> whistleblower@anchoraiguard.com (monitored by Whistleblower Protection Officer)</li>
            <li><strong>Mail:</strong> Whistleblower Protection Officer, Anchor Security Pty Ltd, Sydney NSW, Australia (marked &quot;Confidential&quot;)</li>
            <li><strong>External regulators:</strong> ASIC, APRA, ATO, or the AFP as applicable</li>
            <li><strong>Legal practitioner:</strong> for the purpose of obtaining legal advice</li>
          </ul>
          <p>Reports may be made <strong>anonymously</strong>. Anonymous disclosures are still protected under the Corporations Act.</p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Protections for Whistleblowers</h2>
          <p>Under the Corporations Act 2001 and this policy, eligible whistleblowers are protected from:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Termination or demotion</li>
            <li>Harassment, victimisation, or discrimination</li>
            <li>Threats or other detrimental conduct</li>
            <li>Civil, criminal, or administrative liability for making the disclosure</li>
          </ul>
          <p>Any person who retaliates against a whistleblower will be subject to disciplinary action, up to and including termination, and may face criminal penalties under the Corporations Act.</p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Confidentiality</h2>
          <p>The identity of a whistleblower (or information likely to identify them) will be kept strictly confidential, subject only to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Consent of the whistleblower</li>
            <li>Disclosure to ASIC, APRA, the AFP, or a legal practitioner</li>
            <li>Disclosure required by law or court order</li>
          </ul>
          <p>Breach of confidentiality is a criminal offence under the Corporations Act and will result in disciplinary action.</p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Investigation Process</h2>
          <p>All disclosures will be assessed within 7 days. Where an investigation is warranted, Anchor will:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Appoint an independent investigator (internal or external as appropriate)</li>
            <li>Conduct the investigation in a fair, objective, and timely manner</li>
            <li>Keep the whistleblower informed of progress (where identity is known)</li>
            <li>Document findings and implement remedial actions as required</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">8. Whistleblower Protection Officer</h2>
          <p>Anchor&apos;s designated Whistleblower Protection Officer is responsible for overseeing the implementation of this policy, ensuring disclosures are handled appropriately, and that whistleblowers are protected from detriment.</p>
          <p>Contact: <strong>whistleblower@anchoraiguard.com</strong></p>

          <p className="text-sm text-gray-500 mt-8 border-t border-gray-700 pt-4">Anchor Security Pty Ltd · ABN pending registration · Sydney, Australia · This policy is reviewed annually and approved by the Board of Directors.</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// INCIDENT RESPONSE POLICY
// ═══════════════════════════════════════════════════════════════════
export const IncidentResponsePolicy: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-cyan-400">Incident Response Policy</h1>
          <DownloadButton title="Incident Response Policy" />
        </div>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p>Anchor Security Pty Ltd (&quot;Anchor&quot;) maintains a comprehensive incident response program to detect, respond to, and recover from security incidents affecting our platform, infrastructure, and customer data.</p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Scope</h2>
          <p>This policy applies to all security incidents involving:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Unauthorised access to Anchor systems, infrastructure, or customer data</li>
            <li>Data breaches (confirmed or suspected loss, theft, or exposure of personal information)</li>
            <li>Denial-of-service attacks affecting platform availability</li>
            <li>Malware, ransomware, or other malicious code in Anchor infrastructure</li>
            <li>Compromise of employee credentials or internal systems</li>
            <li>Supply chain compromise affecting Anchor dependencies</li>
            <li>Physical security incidents affecting data centre operations</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. Incident Classification</h2>
          <table className="w-full text-sm border-collapse mt-4">
            <thead><tr className="border-b border-gray-700">
              <th className="text-left py-2 px-3 text-cyan-400">Severity</th>
              <th className="text-left py-2 px-3 text-cyan-400">Description</th>
              <th className="text-left py-2 px-3 text-cyan-400">Response Time</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-gray-800"><td className="py-2 px-3 font-medium text-red-400">P1 — Critical</td><td className="py-2 px-3">Active data breach, complete platform outage, active attacker in systems</td><td className="py-2 px-3">15 minutes</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3 font-medium text-orange-400">P2 — High</td><td className="py-2 px-3">Suspected breach, partial outage, vulnerability under active exploitation</td><td className="py-2 px-3">1 hour</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3 font-medium text-yellow-400">P3 — Medium</td><td className="py-2 px-3">Anomalous activity, vulnerability discovered, failed attack attempts</td><td className="py-2 px-3">4 hours</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 px-3 font-medium text-blue-400">P4 — Low</td><td className="py-2 px-3">Informational security event, policy violation, minor misconfiguration</td><td className="py-2 px-3">24 hours</td></tr>
            </tbody>
          </table>

          <h2 className="text-xl font-semibold text-white mt-8">3. Response Phases</h2>
          <h3 className="text-lg font-medium text-gray-200 mt-4">3.1 Detection & Triage</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>24/7 automated monitoring via SIEM, IDS/IPS, and AI anomaly detection</li>
            <li>Initial assessment and severity classification within 15 minutes of detection</li>
            <li>Incident Commander assigned from on-call rotation</li>
          </ul>
          <h3 className="text-lg font-medium text-gray-200 mt-4">3.2 Containment</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Immediate isolation of affected systems</li>
            <li>Credential rotation for compromised accounts</li>
            <li>Network segmentation to prevent lateral movement</li>
            <li>Preservation of forensic evidence</li>
          </ul>
          <h3 className="text-lg font-medium text-gray-200 mt-4">3.3 Eradication & Recovery</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Root cause identification and elimination</li>
            <li>System restoration from verified clean backups</li>
            <li>Security patch deployment</li>
            <li>Phased service restoration with enhanced monitoring</li>
          </ul>
          <h3 className="text-lg font-medium text-gray-200 mt-4">3.4 Post-Incident Review</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Post-Incident Report (PIR) published within 5 business days</li>
            <li>Lessons learned incorporated into runbooks and training</li>
            <li>Preventive controls implemented to address root cause</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">4. Notifiable Data Breaches (NDB Scheme)</h2>
          <p>In compliance with Part IIIC of the Privacy Act 1988 (Cth), Anchor will:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Assess whether a data breach is &quot;eligible&quot; (likely to result in serious harm) within 30 days of becoming aware</li>
            <li>Notify the <strong>Office of the Australian Information Commissioner (OAIC)</strong> as soon as practicable if an eligible data breach is confirmed</li>
            <li>Notify all affected individuals whose personal information was involved</li>
            <li>Include in notifications: description of the breach, types of information involved, steps individuals should take, and Anchor&apos;s contact details</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">5. Customer Notification</h2>
          <p>For incidents affecting customer data or platform availability:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>P1/P2:</strong> Affected customers notified within 1 hour via email and status page</li>
            <li><strong>P3:</strong> Notification within 24 hours</li>
            <li><strong>P4:</strong> Included in monthly security digest</li>
            <li>Enterprise customers receive direct phone notification from their CSM</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">6. Contact</h2>
          <p>To report a security incident: <strong>security@anchoraiguard.com</strong> (24/7 monitored)</p>
          <p>For responsible disclosure of vulnerabilities, see our <strong>Responsible Disclosure Policy</strong>.</p>

          <p className="text-sm text-gray-500 mt-8 border-t border-gray-700 pt-4">Anchor Security Pty Ltd · ABN pending registration · Sydney, Australia · This policy is reviewed quarterly and tested through annual tabletop exercises.</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ACCESSIBILITY STATEMENT
// ═══════════════════════════════════════════════════════════════════
export const AccessibilityStatement: React.FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-cyan-400">Accessibility Statement</h1>
          <DownloadButton title="Accessibility Statement" />
        </div>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p>Anchor Security Pty Ltd (&quot;Anchor&quot;) is committed to ensuring that the Anchor AI Guard platform is accessible to all users, including people with disabilities, in accordance with the Disability Discrimination Act 1992 (Cth) and the Web Content Accessibility Guidelines (WCAG) 2.1.</p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Our Commitment</h2>
          <p>We strive to ensure that our platform meets WCAG 2.1 Level AA conformance. Our accessibility efforts include:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Semantic HTML structure with proper heading hierarchy</li>
            <li>ARIA labels and roles for interactive elements</li>
            <li>Keyboard navigation support throughout the platform</li>
            <li>Sufficient colour contrast ratios (minimum 4.5:1 for normal text)</li>
            <li>Text alternatives for non-text content</li>
            <li>Responsive design that supports zoom up to 200%</li>
            <li>Focus indicators for keyboard users</li>
            <li>Screen reader compatibility testing</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. Known Limitations</h2>
          <p>While we strive for full compliance, certain areas of the platform may have limitations:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Some data visualisations (charts, attack path graphs) may not be fully accessible to screen readers. We provide alternative data tables where possible.</li>
            <li>Real-time threat feed updates may not be immediately announced to screen readers.</li>
            <li>PDF exports may have limited accessibility depending on the PDF reader used.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Assistive Technologies</h2>
          <p>Anchor AI Guard has been tested with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>NVDA (Windows) and VoiceOver (macOS/iOS)</li>
            <li>JAWS screen reader</li>
            <li>Browser zoom up to 400%</li>
            <li>High contrast mode (Windows)</li>
            <li>Voice control software</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">4. Feedback & Requests</h2>
          <p>If you encounter any accessibility barriers or have suggestions for improvement, please contact us:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email: <strong>accessibility@anchoraiguard.com</strong></li>
            <li>We aim to respond to accessibility feedback within 5 business days</li>
            <li>We commit to resolving critical accessibility issues within 30 days</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">5. Conformance Status</h2>
          <p>Current status: <strong>Partially conformant</strong> with WCAG 2.1 Level AA. We are actively working toward full conformance and conduct accessibility audits quarterly.</p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Legal Framework</h2>
          <p>This statement is made in compliance with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Disability Discrimination Act 1992 (Cth)</strong></li>
            <li><strong>Disability Standards for Accessible Public Transport 2002</strong> (where applicable)</li>
            <li><strong>WCAG 2.1 Level AA</strong> — Web Content Accessibility Guidelines</li>
            <li><strong>EN 301 549</strong> — European accessibility requirements (for international customers)</li>
          </ul>

          <p className="text-sm text-gray-500 mt-8 border-t border-gray-700 pt-4">Anchor Security Pty Ltd · ABN pending registration · Sydney, Australia · accessibility@anchoraiguard.com</p>
        </div>
      </div>
    </div>
  );
};