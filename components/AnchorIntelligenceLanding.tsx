import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

interface Plan {
  tier: string;
  name: string;
  monthlyPrice: number;
  monthlyPriceFormatted: string;
  yearlyPrice: number;
  yearlyPriceFormatted: string;
  rateLimit: string;
  monthlyQuota: string;
  permissions: string[];
  description: string;
}

export default function AnchorIntelligenceLanding({ onBack }: { onBack?: () => void }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'api' | 'pricing' | 'docs'>('overview');
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', plan: '', message: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await backendApi.anchorIntelligence.getPlans();
      setPlans(res.plans || []);
    } catch (e) {
      setPlans([
        { tier: 'starter', name: 'Starter API', monthlyPrice: 99990, monthlyPriceFormatted: '$99,990', yearlyPrice: 959900, yearlyPriceFormatted: '$959,900', rateLimit: '60 req/min', monthlyQuota: '10,000', permissions: ['threat-intel', 'rule-generation'], description: 'Basic threat intelligence and rule generation' },
        { tier: 'professional', name: 'Professional API', monthlyPrice: 499990, monthlyPriceFormatted: '$499,990', yearlyPrice: 4799900, yearlyPriceFormatted: '$4,799,900', rateLimit: '300 req/min', monthlyQuota: '100,000', permissions: ['threat-intel', 'rule-generation', 'ai-analysis', 'predictive', 'competitive-intel'], description: 'Full AI analysis, prediction, and competitive intelligence' },
        { tier: 'enterprise', name: 'Enterprise API', monthlyPrice: 2499990, monthlyPriceFormatted: '$2,499,990', yearlyPrice: 23999900, yearlyPriceFormatted: '$23,999,900', rateLimit: '1,000 req/min', monthlyQuota: '1,000,000', permissions: ['threat-intel', 'rule-generation', 'ai-analysis', 'predictive', 'competitive-intel', 'white-label', 'custom-models', 'webhooks'], description: 'White-label AI, custom models, and unlimited capabilities' },
        { tier: 'unlimited', name: 'Unlimited / OEM', monthlyPrice: 0, monthlyPriceFormatted: 'Custom', yearlyPrice: 0, yearlyPriceFormatted: 'Custom', rateLimit: '5,000 req/min', monthlyQuota: 'Unlimited', permissions: ['*'], description: 'Custom pricing, unlimited usage, full OEM licensing' },
      ]);
    }
  };

  const permissionLabels: Record<string, { name: string; icon: string }> = {
    'threat-intel': { name: 'Threat Intelligence Feed', icon: '🔍' },
    'rule-generation': { name: 'Detection Rule Generation', icon: '📋' },
    'ai-analysis': { name: 'AI Threat Analysis', icon: '🧠' },
    'predictive': { name: 'Predictive Modeling', icon: '🔮' },
    'competitive-intel': { name: 'Competitive Intelligence', icon: '📊' },
    'white-label': { name: 'White-Label AI', icon: '🏷️' },
    'custom-models': { name: 'Custom AI Models', icon: '⚙️' },
    'webhooks': { name: 'Webhook Notifications', icon: '🔔' },
    '*': { name: 'All Capabilities', icon: '♾️' },
  };

  const codeExamples = {
    curl: `# Get threat intelligence feed
curl -X GET https://api.anchoraiguard.com/intelligence/v1/threats \\
  -H "x-api-key: anc_your_api_key_here"

# Generate a YARA detection rule
curl -X POST https://api.anchoraiguard.com/intelligence/v1/rules/generate \\
  -H "x-api-key: anc_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"threat": "Cobalt Strike beacon", "format": "yara"}'

# Analyze suspicious file hash
curl -X POST https://api.anchoraiguard.com/intelligence/v1/analyze \\
  -H "x-api-key: anc_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"type": "malware", "data": "hash:abc123..."}'`,

    python: `import requests

API_KEY = "anc_your_api_key_here"
BASE_URL = "https://api.anchoraiguard.com/intelligence/v1"
HEADERS = {"x-api-key": API_KEY, "Content-Type": "application/json"}

# Get real-time threat feed
threats = requests.get(f"{BASE_URL}/threats", headers=HEADERS).json()
print(f"Found {threats['total']} active threats")

# Generate Sigma rules for all critical threats
for threat in threats['threats']:
    if threat['severity'] == 'critical':
        rule = requests.post(f"{BASE_URL}/rules/generate", headers=HEADERS,
            json={"threat": threat['title'], "format": "sigma"}).json()
        print(f"Generated rule: {rule['rule']['id']}")

# Predict threats for your industry
predictions = requests.post(f"{BASE_URL}/predict", headers=HEADERS,
    json={"industry": "Financial Services", "timeframe": "30 days"}).json()
print(f"Risk score: {predictions.get('overallRiskScore', 'N/A')}/100")`,

    javascript: `const API_KEY = 'anc_your_api_key_here';
const BASE = 'https://api.anchoraiguard.com/intelligence/v1';

// Fetch latest threats
const threats = await fetch(\`\${BASE}/threats?severity=critical\`, {
  headers: { 'x-api-key': API_KEY }
}).then(r => r.json());

// Generate Snort rules for each threat  
for (const threat of threats.threats) {
  const rule = await fetch(\`\${BASE}/rules/generate\`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ threat: threat.title, format: 'snort' })
  }).then(r => r.json());
  
  console.log(\`Rule: \${rule.rule.content}\`);
}

// Enrich an IOC
const ioc = await fetch(\`\${BASE}/enrich\`, {
  method: 'POST',
  headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'ip', value: '185.220.101.1' })
}).then(r => r.json());`,
  };

  const [activeExample, setActiveExample] = useState<'curl' | 'python' | 'javascript'>('python');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-gray-950 to-blue-900/30" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-8">
              <span className="text-purple-400 text-sm font-semibold">ANCHOR INTELLIGENCE</span>
              <span className="mx-2 text-gray-600">|</span>
              <span className="text-gray-400 text-sm">Self-Evolving Security AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Security AI
              </span>
              <br />
              <span className="text-white">That Evolves Itself</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              The world's first self-evolving threat intelligence API. Generate detection rules, 
              predict attacks, and analyze threats — powered by AI that continuously improves 
              from global threat data. One API call away.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => setSelectedTab('pricing')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold text-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25"
              >
                Get API Access →
              </button>
              <button
                onClick={() => setSelectedTab('docs')}
                className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-lg font-bold text-lg hover:bg-gray-700 transition-all"
              >
                View Documentation
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                99.99% Uptime SLA
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                SOC 2 Type II
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                GDPR Compliant
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                ISO 27001
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-2">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-4 py-2.5 mr-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            )}
            {(['overview', 'api', 'pricing', 'docs'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedTab === tab
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'api' ? 'API Products' : tab === 'pricing' ? 'Pricing' : 'Documentation'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* ==================== OVERVIEW ==================== */}
        {selectedTab === 'overview' && (
          <div className="space-y-24">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '6', label: 'Threat Intelligence Sources', color: 'text-purple-400' },
                { value: '6', label: 'Rule Formats Supported', color: 'text-blue-400' },
                { value: '<100ms', label: 'Average Response Time', color: 'text-cyan-400' },
                { value: '24/7', label: 'Self-Evolving Coverage', color: 'text-green-400' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-6 bg-gray-900 rounded-xl border border-gray-800">
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* How It Works */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-12">How Anchor Intelligence Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: '1',
                    title: 'Connect',
                    description: 'Get your API key and start making calls in under 5 minutes. Drop-in REST API — works with any stack.',
                    icon: '🔌',
                  },
                  {
                    step: '2',
                    title: 'Consume',
                    description: 'Real-time threat feeds, auto-generated detection rules, AI-powered analysis. All from one unified API.',
                    icon: '⚡',
                  },
                  {
                    step: '3',
                    title: 'Evolve',
                    description: 'Our AI continuously learns from global threat data. Your defenses improve automatically — no manual updates ever.',
                    icon: '🧬',
                  },
                ].map((item) => (
                  <div key={item.step} className="relative p-8 bg-gray-900 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all">
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold text-lg">{item.step}</div>
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-4">Built For Security Teams</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Whether you're a MSSP, SOC, or security vendor — Anchor Intelligence 
                supercharges your capabilities with AI that was trained on the entire global threat landscape.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'MSSPs & MDRs', desc: 'White-label our AI to offer advanced threat intelligence to your customers. Auto-generate detection rules across their SIEM stack.', icon: '🏢' },
                  { title: 'SOC Teams', desc: 'Reduce alert fatigue with AI triage. Get instant IOC enrichment and automated rule generation when new threats emerge.', icon: '🛡️' },
                  { title: 'Security Vendors', desc: 'Embed our threat intelligence and rule generation into your product. OEM licensing available for deep integration.', icon: '🔧' },
                  { title: 'Threat Intel Teams', desc: 'Predictive modeling and competitive analysis. Know what threats are coming before they arrive and how your defenses compare.', icon: '🔬' },
                ].map((uc, i) => (
                  <div key={i} className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{uc.icon}</div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">{uc.title}</h3>
                        <p className="text-gray-400">{uc.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Advantages */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/20 p-12">
              <h2 className="text-3xl font-bold text-center mb-8">Why Anchor Intelligence?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { them: 'Static rule databases that require manual updates', us: 'Self-evolving AI that generates new rules automatically as threats emerge' },
                  { them: 'Separate vendors for intel, rules, analysis', us: 'One unified API — threat intel, rule gen, analysis, prediction, all in one' },
                  { them: 'Weeks to deploy new detection capabilities', us: '< 100ms API response. New threats detected and rules generated in real-time' },
                  { them: 'Generic threat feeds with noise', us: 'AI-enriched, context-aware intelligence with confidence scores and MITRE mapping' },
                ].map((comparison, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-xs">✕</div>
                      <div className="w-px h-4 bg-gray-700 mx-auto" />
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-xs">✓</div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm line-through">{comparison.them}</p>
                      <p className="text-white font-medium mt-1">{comparison.us}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== API PRODUCTS ==================== */}
        {selectedTab === 'api' && (
          <div className="space-y-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">API Products</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Six powerful APIs, one key. Everything you need to build world-class security.
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Threat Intelligence Feed',
                  endpoint: 'GET /v1/threats',
                  desc: 'Real-time aggregated threat intelligence from NVD, CISA KEV, MITRE ATT&CK, AlienVault OTX, and more. Filtered, enriched, and scored.',
                  features: ['Multi-source aggregation', 'CVSS scoring', 'MITRE ATT&CK mapping', 'Severity filtering', 'Real-time updates'],
                  icon: '🔍',
                  color: 'purple',
                },
                {
                  name: 'Detection Rule Generator',
                  endpoint: 'POST /v1/rules/generate',
                  desc: 'AI-powered rule generation in Sigma, YARA, Snort, Suricata, KQL, and SPL format. Production-ready with low false positive rates.',
                  features: ['6 rule formats', 'Bulk generation (25/req)', 'Confidence scoring', 'Test case generation', 'MITRE mapping'],
                  icon: '📋',
                  color: 'blue',
                },
                {
                  name: 'AI Threat Analysis',
                  endpoint: 'POST /v1/analyze',
                  desc: 'Deep AI analysis of malware, network traffic, logs, incidents, vulnerabilities, and IOCs. Instant verdicts with actionable recommendations.',
                  features: ['6 analysis types', 'Verdict + confidence', 'IOC extraction', 'Timeline suggestions', 'Related threats'],
                  icon: '🧠',
                  color: 'cyan',
                },
                {
                  name: 'Predictive Threat Modeling',
                  endpoint: 'POST /v1/predict',
                  desc: 'Know what\'s coming. Industry-specific threat predictions with likelihood, timeframes, and mitigation strategies.',
                  features: ['Industry-specific', 'Risk scoring (0-100)', 'Attack vector prediction', 'Mitigation planning', 'Emerging trends'],
                  icon: '🔮',
                  color: 'pink',
                },
                {
                  name: 'IOC Enrichment',
                  endpoint: 'POST /v1/enrich',
                  desc: 'Instantly enrich IPs, domains, hashes, URLs, and emails with reputation, geolocation, threat associations, and history.',
                  features: ['5 IOC types', 'Multi-source lookup', 'Reputation scoring', 'Related indicators', 'Historical data'],
                  icon: '🔎',
                  color: 'amber',
                },
                {
                  name: 'Competitive Intelligence',
                  endpoint: 'POST /v1/competitive',
                  desc: 'Stay ahead of the market. AI-powered analysis of competitor products, pricing, and market positioning in cybersecurity.',
                  features: ['Competitor analysis', 'Market trends', 'Gap identification', 'Strategic recommendations', 'Pricing intelligence'],
                  icon: '📊',
                  color: 'green',
                },
              ].map((product, i) => {
                const colorClass = {
                  purple: 'border-purple-500/30 hover:border-purple-500/60',
                  blue: 'border-blue-500/30 hover:border-blue-500/60',
                  cyan: 'border-cyan-500/30 hover:border-cyan-500/60',
                  pink: 'border-pink-500/30 hover:border-pink-500/60',
                  amber: 'border-amber-500/30 hover:border-amber-500/60',
                  green: 'border-green-500/30 hover:border-green-500/60',
                }[product.color] || '';

                return (
                  <div key={i} className={`p-6 bg-gray-900 rounded-xl border ${colorClass} transition-all`}>
                    <div className="text-4xl mb-4">{product.icon}</div>
                    <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                    <code className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{product.endpoint}</code>
                    <p className="text-gray-400 mt-3 text-sm">{product.desc}</p>
                    <ul className="mt-4 space-y-1">
                      {product.features.map((f, j) => (
                        <li key={j} className="text-sm text-gray-300 flex items-center gap-2">
                          <span className="text-green-400">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Code Examples */}
            <div>
              <h2 className="text-2xl font-bold text-center mb-8">Get Started in Minutes</h2>
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="flex border-b border-gray-800">
                  {(['python', 'javascript', 'curl'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setActiveExample(lang)}
                      className={`px-6 py-3 font-medium text-sm transition-all ${
                        activeExample === lang
                          ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {lang === 'curl' ? 'cURL' : lang === 'python' ? 'Python' : 'JavaScript'}
                    </button>
                  ))}
                </div>
                <pre className="p-6 text-sm text-gray-300 overflow-x-auto">
                  <code>{codeExamples[activeExample]}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PRICING ==================== */}
        {selectedTab === 'pricing' && (
          <div className="space-y-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-gray-400 mb-8">Start free. Scale to millions of API calls.</p>
              
              <div className="inline-flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'monthly' ? 'bg-purple-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'yearly' ? 'bg-purple-600 text-white' : 'text-gray-400'
                  }`}
                >
                  Yearly <span className="text-green-400 text-xs ml-1">Save 20%</span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, i) => {
                const isPro = plan.tier === 'professional';
                return (
                  <div key={i} className={`relative p-6 rounded-xl border transition-all ${
                    isPro 
                      ? 'bg-gradient-to-b from-purple-900/30 to-gray-900 border-purple-500/50 shadow-xl shadow-purple-500/10' 
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}>
                    {isPro && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </div>
                    )}
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <div className="my-4">
                      <span className="text-4xl font-bold">
                        {billingCycle === 'monthly' ? plan.monthlyPriceFormatted : plan.yearlyPriceFormatted}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-gray-400 text-sm">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                    <div className="space-y-2 mb-6">
                      <div className="text-sm text-gray-300">
                        <span className="text-gray-500">Rate:</span> {plan.rateLimit}
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="text-gray-500">Quota:</span> {plan.monthlyQuota} req/mo
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.permissions.map((p, j) => {
                        const label = permissionLabels[p];
                        return (
                          <li key={j} className="text-sm text-gray-300 flex items-center gap-2">
                            <span>{label?.icon || '✓'}</span>
                            <span>{label?.name || p}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      onClick={() => {
                        if (plan.tier === 'unlimited') {
                          document.getElementById('enterprise-contact')?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={`w-full py-3 rounded-lg font-bold transition-all ${
                      isPro
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500'
                        : plan.tier === 'unlimited'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                    }`}>
                      {plan.tier === 'unlimited' ? 'Contact Sales' : 'Get Started'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Premium Add-Ons Showcase */}
            <div className="bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 border border-cyan-500/20 rounded-2xl p-8 mt-12">
              <div className="text-center mb-8">
                <span className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full">PREMIUM ADD-ONS</span>
                <h3 className="text-2xl font-bold mt-3">World-First Security Modules</h3>
                <p className="text-gray-400 mt-2">Stack additional revenue-generating capabilities on top of any plan</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { name: 'Autonomous SOC', price: '$15K/mo', icon: '🏛️', tag: 'POPULAR' },
                  { name: 'Digital Twin Security', price: '$12K/mo', icon: '🪞', tag: 'NEW' },
                  { name: 'Supply Chain AI', price: '$7.5K/mo', icon: '🔗', tag: 'POPULAR' },
                  { name: 'Dark Web Monitor', price: '$8.5K/mo', icon: '🕵️', tag: 'POPULAR' },
                  { name: 'Quantum Cryptography', price: '$20K/mo', icon: '⚛️', tag: 'NEW' },
                  { name: 'Critical Infrastructure', price: '$25K/mo', icon: '⚡', tag: '' },
                  { name: 'Forensics Lab', price: '$10K/mo', icon: '🔬', tag: '' },
                  { name: 'Deception Technology', price: '$8K/mo', icon: '🪤', tag: '' },
                  { name: 'Breach Simulator', price: '$5K/mo', icon: '💥', tag: '' },
                  { name: 'Cyber Insurance', price: '$3K/mo', icon: '🛡️', tag: 'NEW' },
                ].map((addon, i) => (
                  <div key={i} className="bg-gray-800/60 rounded-xl p-4 text-center hover:bg-gray-800 transition-colors border border-gray-700/50 hover:border-cyan-500/30">
                    <div className="text-2xl mb-1">{addon.icon}</div>
                    <div className="text-white font-semibold text-sm">{addon.name}</div>
                    <div className="text-cyan-400 font-bold mt-1">{addon.price}</div>
                    {addon.tag && (
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                        addon.tag === 'NEW' ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>{addon.tag}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-800/40 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">Compliance Packs</div>
                  <div className="text-white font-bold">$5K–$25K/mo</div>
                  <div className="text-gray-400 text-xs mt-1">SOC 2, HIPAA, PCI, ISO, FedRAMP, CMMC, NIST</div>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">Threat Intel Feeds</div>
                  <div className="text-white font-bold">$10K–$75K/mo</div>
                  <div className="text-gray-400 text-xs mt-1">Predictive CVE, Zero-Day, Nation-State APT, Dark Web</div>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">Managed SOC Services</div>
                  <div className="text-white font-bold">$25K–$200K/mo</div>
                  <div className="text-gray-400 text-xs mt-1">Lite (8x5) to Elite (embedded analysts)</div>
                </div>
              </div>

              <div className="text-center mt-6 text-gray-400 text-sm">
                <span className="text-cyan-400 font-bold">25+</span> premium add-ons available in the marketplace •
                <span className="text-green-400 font-bold"> 14-day free trials</span> on all modules •
                <span className="text-purple-400 font-bold"> 20% discount</span> on annual billing
              </div>
            </div>

            {/* Enterprise Contact */}
            <div id="enterprise-contact" className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Enterprise & OEM Licensing</h3>
                  <p className="text-gray-400 mb-6">
                    Need custom pricing, dedicated infrastructure, SLA guarantees, or white-label licensing? 
                    Let's talk about how Anchor Intelligence can power your security platform.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Dedicated API infrastructure',
                      'Custom AI model training on your data',
                      'White-label with your branding',
                      'On-premise deployment option',
                      'Dedicated support engineer',
                      '99.99% SLA guarantee',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300">
                        <span className="text-purple-400">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Work Email"
                    value={contactForm.email}
                    onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={contactForm.company}
                    onChange={e => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                  <textarea
                    placeholder="Tell us about your use case..."
                    value={contactForm.message}
                    onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                  />
                  <button
                    onClick={() => {
                      if (formSubmitted || formSubmitting) return;
                      setFormSubmitting(true);
                      setTimeout(() => {
                        setFormSubmitting(false);
                        setFormSubmitted(true);
                      }, 2000);
                    }}
                    disabled={formSubmitting || formSubmitted}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      formSubmitted
                        ? 'bg-green-600 cursor-default'
                        : formSubmitting
                        ? 'bg-gray-600 cursor-wait'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500'
                    }`}
                  >
                    {formSubmitted ? '✓ Message Sent! We\'ll be in touch.' : formSubmitting ? '⏳ Sending...' : 'Contact Sales'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== DOCUMENTATION ==================== */}
        {selectedTab === 'docs' && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">API Documentation</h2>
              <p className="text-gray-400">Everything you need to integrate Anchor Intelligence</p>
            </div>

            {/* Quick Start */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
              <h3 className="text-xl font-bold mb-4">Quick Start Guide</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-purple-400 mb-2">1. Authentication</h4>
                  <p className="text-gray-400 text-sm mb-2">All API requests require an API key in the <code className="bg-gray-800 px-2 py-0.5 rounded text-purple-300">x-api-key</code> header.</p>
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300">
{`curl -H "x-api-key: anc_your_key_here" \\
  https://api.anchoraiguard.com/intelligence/v1/status`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-400 mb-2">2. Base URL</h4>
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300">
                    https://api.anchoraiguard.com/intelligence/v1
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-400 mb-2">3. Response Format</h4>
                  <p className="text-gray-400 text-sm mb-2">All responses are JSON. Successful requests return HTTP 200. Errors include descriptive messages.</p>
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300">
{`{
  "error": "Rate limit exceeded",
  "limit": 60,
  "resetAt": "2025-01-01T00:01:00.000Z"
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Endpoints Reference */}
            <div>
              <h3 className="text-xl font-bold mb-6">Endpoints Reference</h3>
              <div className="space-y-4">
                {[
                  { method: 'GET', path: '/v1/status', desc: 'API status, usage, and plan info', permission: 'Any plan' },
                  { method: 'GET', path: '/v1/threats', desc: 'Real-time threat intelligence feed', permission: 'threat-intel' },
                  { method: 'POST', path: '/v1/rules/generate', desc: 'Generate a detection rule', permission: 'rule-generation' },
                  { method: 'POST', path: '/v1/rules/bulk', desc: 'Bulk generate up to 25 rules', permission: 'rule-generation' },
                  { method: 'POST', path: '/v1/analyze', desc: 'AI-powered threat analysis', permission: 'ai-analysis' },
                  { method: 'POST', path: '/v1/predict', desc: 'Predictive threat modeling', permission: 'predictive' },
                  { method: 'POST', path: '/v1/competitive', desc: 'Competitive intelligence analysis', permission: 'competitive-intel' },
                  { method: 'POST', path: '/v1/enrich', desc: 'IOC enrichment (IP, domain, hash, URL, email)', permission: 'threat-intel' },
                  { method: 'POST', path: '/v1/webhooks', desc: 'Create a webhook subscription', permission: 'webhooks' },
                  { method: 'GET', path: '/v1/webhooks', desc: 'List webhook subscriptions', permission: 'webhooks' },
                ].map((endpoint, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${
                      endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm text-white font-mono flex-1">{endpoint.path}</code>
                    <span className="text-gray-400 text-sm hidden md:block">{endpoint.desc}</span>
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-500">{endpoint.permission}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rule Formats */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold mb-4">Supported Rule Formats</h3>
                <div className="space-y-3">
                  {[
                    { format: 'Sigma', desc: 'Generic SIEM rule format — works with Splunk, Elastic, QRadar, etc.' },
                    { format: 'YARA', desc: 'Malware identification and classification rules' },
                    { format: 'Snort', desc: 'Network intrusion detection rules' },
                    { format: 'Suricata', desc: 'Advanced network threat detection rules' },
                    { format: 'KQL', desc: 'Kusto Query Language for Microsoft Sentinel / Azure' },
                    { format: 'SPL', desc: 'Splunk Processing Language for Splunk SIEM' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <code className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-bold flex-shrink-0">{f.format}</code>
                      <span className="text-gray-400 text-sm">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold mb-4">Analysis Types</h3>
                <div className="space-y-3">
                  {[
                    { type: 'malware', desc: 'File hashes, samples, suspicious binaries' },
                    { type: 'network', desc: 'Network traffic patterns, DNS queries, connections' },
                    { type: 'log', desc: 'System logs, application logs, security events' },
                    { type: 'incident', desc: 'Full incident reports for AI triage' },
                    { type: 'vulnerability', desc: 'CVE analysis with exploitability assessment' },
                    { type: 'ioc', desc: 'Indicator of compromise analysis and enrichment' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <code className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold flex-shrink-0">{f.type}</code>
                      <span className="text-gray-400 text-sm">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SDKs */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/20 p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Official SDKs Available</h3>
              <p className="text-gray-400 mb-6">
                Official SDKs for Python, JavaScript/TypeScript, Go, Java, C#, and Ruby are ready to use.
                Install via your package manager and start integrating in minutes.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                {[
                  { lang: 'Python', icon: '🐍', cmd: 'pip install anchor-security-sdk' },
                  { lang: 'Node.js', icon: '🟢', cmd: 'npm install @anchor/security-sdk' },
                  { lang: 'Go', icon: '🔷', cmd: 'go get github.com/anchor/security-sdk-go' },
                  { lang: 'Java', icon: '☕', cmd: 'com.anchoraiguard:security-sdk' },
                  { lang: 'C#', icon: '💜', cmd: 'dotnet add package Anchor.SecuritySDK' },
                  { lang: 'Ruby', icon: '💎', cmd: 'gem install anchor-security-sdk' },
                ].map(sdk => (
                  <div key={sdk.lang} className="px-4 py-2 bg-gray-800 rounded-lg text-sm group hover:bg-cyan-600/20 hover:border-cyan-500/30 border border-transparent transition-colors cursor-default" title={sdk.cmd}>
                    <span className="mr-1">{sdk.icon}</span>
                    <span className="text-gray-200 group-hover:text-cyan-300">{sdk.lang}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">Anchor Intelligence</h4>
              <p className="text-gray-400 text-sm">
                Self-Evolving Security AI as a Service. Threat intelligence, detection rule generation, 
                and predictive analysis — powered by AI that never stops learning.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Threat Intelligence API</li>
                <li>Rule Generation Engine</li>
                <li>AI Threat Analysis</li>
                <li>Predictive Modeling</li>
                <li>IOC Enrichment</li>
                <li>Competitive Intelligence</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => setSelectedTab('docs')} className="hover:text-white transition-colors">API Documentation</button></li>
                <li><button onClick={() => setSelectedTab('api')} className="hover:text-white transition-colors">API Reference</button></li>
                <li><button onClick={() => setSelectedTab('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li>Status Page</li>
                <li>Changelog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>About Anchor</li>
                <li>Security</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact: api@anchoraiguard.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Anchor Intelligence, a division of Anchor Security. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
