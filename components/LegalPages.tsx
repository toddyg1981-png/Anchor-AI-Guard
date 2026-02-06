import React from 'react';

interface LegalPageProps {
  onBack: () => void;
}

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
              You can request deletion of your data at any time by contacting support@anchorsecurity.com.
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
              <a href="mailto:privacy@anchorsecurity.com" className="text-cyan-400 hover:text-pink-400">
                privacy@anchorsecurity.com
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
              <a href="mailto:legal@anchorsecurity.com" className="text-cyan-400 hover:text-pink-400">
                legal@anchorsecurity.com
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
              href="mailto:security@anchorsecurity.com" 
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
                href="mailto:hello@anchorsecurity.com" 
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="mailto:careers@anchorsecurity.com" 
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
                <p className="text-sm mt-1">$29/month - Ideal for individual developers and small projects</p>
              </div>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-pink-400">Professional</h3>
                <p className="text-sm mt-1">$99/month - For growing teams with advanced security needs</p>
              </div>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-pink-400">Enterprise</h3>
                <p className="text-sm mt-1">$299/month - Full platform access with premium support</p>
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
              <a href="mailto:billing@anchorsecurity.com" className="text-cyan-400 hover:text-pink-400">
                billing@anchorsecurity.com
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
              href="mailto:billing@anchorsecurity.com" 
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
                <a href="mailto:hello@anchorsecurity.com" className="text-cyan-400 hover:text-pink-400">
                  hello@anchorsecurity.com
                </a>
              </div>
              
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-pink-400 mb-2">💼 Sales</h3>
                <a href="mailto:sales@anchorsecurity.com" className="text-cyan-400 hover:text-pink-400">
                  sales@anchorsecurity.com
                </a>
              </div>
              
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-pink-400 mb-2">🛠️ Support</h3>
                <a href="mailto:support@anchorsecurity.com" className="text-cyan-400 hover:text-pink-400">
                  support@anchorsecurity.com
                </a>
              </div>
              
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-pink-400 mb-2">🔐 Security</h3>
                <a href="mailto:security@anchorsecurity.com" className="text-cyan-400 hover:text-pink-400">
                  security@anchorsecurity.com
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
