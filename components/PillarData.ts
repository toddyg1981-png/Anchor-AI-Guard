// ═══════════════════════════════════════════════════════════════════════════════
// ANCHOR — 5 PRODUCT PILLARS — SHARED DATA LAYER
// Used by: Landing sections, Pricing, Narratives, Investor slides
// ═══════════════════════════════════════════════════════════════════════════════

export interface PillarModule {
  name: string;
  icon: string;
  worldFirst?: boolean;
  description: string;
}

export interface ProductPillar {
  id: string;
  number: number;
  name: string;
  icon: string;
  color: string;     // tailwind gradient "from-X to-Y"
  accent: string;    // accent text color
  tagline: string;
  narrative: string; // 2–3 paragraph product story
  investorHook: string;
  tam: string;       // Total addressable market for this pillar
  competitors: string[];
  differentiator: string;
  modules: PillarModule[];
  worldFirstCount: number;
  pricingTiers: PillarPricingTier[];
}

export interface PillarPricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlight?: boolean;
  cta: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE FIVE PILLARS
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCT_PILLARS: ProductPillar[] = [
  // ═══════════════════════════════════════════════════════════════
  // PILLAR 1: CORE PLATFORM
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'core-platform',
    number: 1,
    name: 'Core Platform',
    icon: '⚡',
    color: 'from-cyan-500 to-blue-600',
    accent: 'text-cyan-400',
    tagline: 'The command centre for your entire security posture',
    narrative: `Anchor's Core Platform is the single pane of glass that security teams, CISOs, and executives have been waiting for. Instead of juggling 15 dashboards from 15 vendors, Anchor unifies everything — real-time threat posture, executive risk scoring, AI engine health, and team operations — into one seamlessly integrated command centre.

The platform includes a self-evolving AI Engine that continuously generates new detection rules, an Intelligence API that lets customers monetise their own threat data, and built-in training and support so teams can onboard in hours, not weeks. Every module across all five pillars feeds telemetry back into the Core Platform, creating a single source of truth that gets smarter with every interaction.

For investors: This is the "sticky" layer. Once a team's workflows live inside the Core Platform, switching costs become prohibitive — driving 95%+ retention and massive expansion revenue.`,
    investorHook: 'Single pane of glass with 95%+ retention — the platform everything else plugs into',
    tam: '$18.2B',
    competitors: ['Splunk', 'Datadog Security', 'Microsoft Sentinel'],
    differentiator: 'Only platform with self-evolving AI + B2B Intelligence API built in',
    worldFirstCount: 0,
    modules: [
      { name: 'Dashboard', icon: '📊', description: 'Real-time security posture overview' },
      { name: 'Executive View', icon: '👔', description: 'C-suite security overview' },
      { name: 'Security Metrics', icon: '📈', description: 'KPIs and reporting' },
      { name: 'SOC Dashboard', icon: '📺', description: 'Security operations center' },
      { name: 'AI Engine', icon: '🧬', description: 'Self-evolving threat detection' },
      { name: 'Intelligence API', icon: '🔑', description: 'B2B AI-as-a-Service platform' },
      { name: 'SDK Security', icon: '📦', description: 'SDK management & scanning' },
      { name: 'Training', icon: '🎓', description: 'Awareness & gamified learning' },
      { name: 'AI Help Desk', icon: '💬', description: 'Instant AI-powered support' },
      { name: 'How-To Guide', icon: '📚', description: 'Learn all features' },
    ],
    pricingTiers: [
      { name: 'Starter', price: '$0', period: '/mo', features: ['Dashboard', 'Security Metrics', '5 scans/mo', 'Community support'], cta: 'Start Free' },
      { name: 'Professional', price: '$990', period: '/mo', features: ['Executive View', 'SOC Dashboard', 'AI Engine access', '100 AI queries', 'Email support'], cta: 'Start Trial' },
      { name: 'Business', price: '$4,990', period: '/mo', features: ['Intelligence API access', 'SDK Security', 'Training platform', 'Unlimited AI queries', 'API access'], highlight: true, cta: 'Start Trial' },
      { name: 'Enterprise', price: 'Custom', period: '', features: ['White-label API', 'Custom AI models', 'Dedicated CSM', 'On-premise deployment', 'SLA guarantee'], cta: 'Contact Sales' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // PILLAR 2: PROTECTION STACK
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'protection-stack',
    number: 2,
    name: 'Protection Stack',
    icon: '🛡️',
    color: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-400',
    tagline: 'Every layer defended — from hardware to cloud',
    narrative: `The Protection Stack is where Anchor replaces an entire security vendor portfolio. 28 modules spanning endpoint, network, cloud, identity, data, and cryptographic protection — unified under a single agent, a single policy engine, and a single billing relationship.

But what truly sets this pillar apart are the four world-first modules that protect layers no other vendor touches. Hardware Integrity verifies physical trust boundaries. Firmware Security scans the invisible layer between hardware and OS. Identity Drift catches privilege creep and shadow accounts before IAM tools even notice. Architecture Drift detects misconfigurations and forgotten services continuously, not just at audit time.

For investors: This pillar drives the largest ARR because it replaces 8–12 point solutions per customer. Average deal expansion is 3.2x within 12 months as teams consolidate vendors onto Anchor's unified stack.`,
    investorHook: 'Replaces 8–12 point solutions — 3.2x expansion revenue within 12 months',
    tam: '$42.8B',
    competitors: ['CrowdStrike', 'Palo Alto Networks', 'Zscaler', 'SentinelOne', 'Fortinet'],
    differentiator: '4 world-first layers (hardware, firmware, identity drift, architecture drift) that no competitor offers',
    worldFirstCount: 4,
    modules: [
      { name: 'EDR / XDR', icon: '🖥️', description: 'Endpoint detection & response' },
      { name: 'Endpoint Protection', icon: '🔒', description: 'Next-gen endpoint security' },
      { name: 'Cloud Security (CSPM)', icon: '☁️', description: 'Multi-cloud posture management' },
      { name: 'Container Security', icon: '🐳', description: 'K8s, images, runtime guard' },
      { name: 'API Security', icon: '🔌', description: 'API endpoint scanning' },
      { name: 'Vulnerability Mgmt', icon: '🛠️', description: 'CVE tracking & remediation' },
      { name: 'CI/CD Security', icon: '🔄', description: 'Pipeline & build security' },
      { name: 'Network Traffic', icon: '🌐', description: 'Flow analytics & anomalies' },
      { name: 'Network Segmentation', icon: '🧱', description: 'Micro-segmentation & policies' },
      { name: 'Email Security', icon: '📨', description: 'Phishing & DMARC enforcement' },
      { name: 'Browser Isolation', icon: '🌐', description: 'Remote browser isolation' },
      { name: 'Mobile Security', icon: '📱', description: 'Mobile app & device security' },
      { name: 'RASP Agent', icon: '🛡️', description: 'Runtime app self-protection' },
      { name: 'Identity Governance', icon: '🧾', description: 'Access reviews & lifecycle' },
      { name: 'Zero Trust', icon: '🚫', description: 'Zero trust architecture' },
      { name: 'Data Loss Prevention', icon: '🔒', description: 'Data classification & DLP' },
      { name: 'Password Vault', icon: '🔑', description: 'Secrets & credential hygiene' },
      { name: 'Secrets Rotation', icon: '🔐', description: 'Automated secret lifecycle' },
      { name: 'Cryptography', icon: '📜', description: 'Keys, certs & HSMs' },
      { name: 'Quantum Crypto', icon: '⚛️', description: 'Post-quantum readiness' },
      { name: 'Active Defense', icon: '⚔️', description: 'Automated countermeasures' },
      { name: 'Asset Inventory', icon: '🗄️', description: 'CMDB & discovery' },
      { name: 'Backup & DR', icon: '💾', description: 'Disaster recovery' },
      { name: 'Self-Protection', icon: '🔰', description: 'Platform self-defense' },
      { name: 'Hardware Integrity', icon: '🔩', description: 'Hardware trust verification', worldFirst: true },
      { name: 'Firmware Security', icon: '💾', description: 'Firmware & microcode scanner', worldFirst: true },
      { name: 'Identity Drift', icon: '🪪', description: 'AI identity integrity engine', worldFirst: true },
      { name: 'Architecture Drift', icon: '🏗️', description: 'Continuous drift detection', worldFirst: true },
    ],
    pricingTiers: [
      { name: 'Essential', price: '$2,990', period: '/mo', features: ['EDR/XDR', 'Cloud Security', 'Vulnerability Mgmt', 'Email Security', 'Asset Inventory'], cta: 'Start Trial' },
      { name: 'Advanced', price: '$9,990', period: '/mo', features: ['All Essential +', 'Container & API Security', 'Zero Trust', 'DLP', 'Identity Governance', 'Network Segmentation'], highlight: true, cta: 'Start Trial' },
      { name: 'Complete', price: '$29,990', period: '/mo', features: ['All 28 modules', '🏆 Hardware Integrity', '🏆 Firmware Security', '🏆 Identity Drift', '🏆 Architecture Drift', 'Quantum Crypto'], cta: 'Start Trial' },
      { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited endpoints', 'On-premise agent', 'Custom integrations', 'Dedicated support', '99.99% SLA'], cta: 'Contact Sales' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // PILLAR 3: INTELLIGENCE & AUTOMATION
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'intelligence-automation',
    number: 3,
    name: 'Intelligence & Automation',
    icon: '🧠',
    color: 'from-purple-500 to-violet-600',
    accent: 'text-purple-400',
    tagline: 'AI that thinks, hunts, and responds — autonomously',
    narrative: `Intelligence & Automation is the brain of Anchor. 18 modules powered by AI that don't just detect threats — they understand them, predict them, and respond to them autonomously. From threat intelligence correlation to automated incident response, this pillar turns a security team of 5 into a team of 50.

The four world-first modules in this pillar represent technology that fundamentally changes how security operations work. AI Runtime Security protects AI models themselves from attack. Data Trust Engine treats data integrity as a first-class security concern. Human Behaviour Engine predicts insider threats before they happen. National Telemetry provides sovereign-grade cyber intelligence at a scale no other vendor attempts.

For investors: This pillar is the AI moat. Every customer interaction makes the models smarter, creating a flywheel that competitors can't replicate without years of data. SOAR + Autonomous SOC alone command $800K+ ACVs at enterprise.`,
    investorHook: 'AI flywheel moat — every customer makes models smarter. $800K+ enterprise ACVs',
    tam: '$31.5B',
    competitors: ['Palo Alto Cortex XSOAR', 'Recorded Future', 'Mandiant/Google', 'Darktrace'],
    differentiator: '4 world-firsts: AI Runtime Security, Data Trust, Human Behaviour, National Telemetry',
    worldFirstCount: 4,
    modules: [
      { name: 'Threat Intelligence', icon: '🔍', description: 'IOC feeds & correlation' },
      { name: 'Threat Hunting', icon: '🎯', description: 'Proactive MITRE ATT&CK hunts' },
      { name: 'Dark Web Monitor', icon: '🕶️', description: 'Dark web intelligence feeds' },
      { name: 'AI Security Guard', icon: '🧠', description: 'LLM & AI protection controls' },
      { name: 'SOAR', icon: '🤖', description: 'Orchestration & auto-response' },
      { name: 'Automation', icon: '⚡', description: 'No-code security workflows' },
      { name: 'Autonomous SOC', icon: '🏛️', description: 'AI-powered 24/7 SOC' },
      { name: 'Incident Response', icon: '🚨', description: 'Automated playbooks' },
      { name: 'UEBA', icon: '👤', description: 'User behavior analytics' },
      { name: 'Insider Threats', icon: '🕵️', description: 'Insider threat detection' },
      { name: 'Malware Analysis', icon: '🐞', description: 'Sandbox & reverse engineering' },
      { name: 'Forensics Lab', icon: '🧪', description: 'Evidence & analysis' },
      { name: 'Supply Chain AI', icon: '🔗', description: 'AI supply chain analysis' },
      { name: 'Supply Chain Attestation', icon: '📋', description: 'Provenance verification' },
      { name: 'AI Runtime Security', icon: '🤖', description: 'AI model runtime protection', worldFirst: true },
      { name: 'Data Trust Engine', icon: '🧬', description: 'Data integrity verification', worldFirst: true },
      { name: 'Human Behaviour', icon: '🧠', description: 'Behavioural risk engine', worldFirst: true },
      { name: 'National Telemetry', icon: '🌐', description: 'Sovereign cyber intelligence', worldFirst: true },
    ],
    pricingTiers: [
      { name: 'Intel Starter', price: '$3,990', period: '/mo', features: ['Threat Intelligence', 'Dark Web Monitor', 'UEBA', 'Basic Automation', 'Incident Response'], cta: 'Start Trial' },
      { name: 'Intel Pro', price: '$14,990', period: '/mo', features: ['All Starter +', 'SOAR', 'Autonomous SOC', 'Forensics Lab', 'AI Security Guard', 'Malware Analysis'], highlight: true, cta: 'Start Trial' },
      { name: 'Intel Complete', price: '$39,990', period: '/mo', features: ['All 18 modules', '🏆 AI Runtime Security', '🏆 Data Trust Engine', '🏆 Human Behaviour', '🏆 National Telemetry'], cta: 'Start Trial' },
      { name: 'Enterprise', price: 'Custom', period: '', features: ['Custom AI training', 'Sovereign deployment', 'Classified feeds', 'Dedicated analyst team', '24/7 support'], cta: 'Contact Sales' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // PILLAR 4: OFFENSIVE & SIMULATION
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'offensive-simulation',
    number: 4,
    name: 'Offensive & Simulation',
    icon: '⚔️',
    color: 'from-red-500 to-orange-600',
    accent: 'text-red-400',
    tagline: 'Attack yourself before the adversary does',
    narrative: `Offensive & Simulation flips the security model on its head. Instead of waiting for attackers to find your weaknesses, Anchor's 9 offensive modules continuously probe, test, and exploit your own infrastructure — giving you the attacker's view before they get it.

The crown jewel is the world's first Autonomous Red Team: a fully self-directed AI adversary that conducts continuous penetration tests, lateral movement chains, privilege escalation paths, and misconfiguration exploitation — all without human intervention. Combined with Digital Twin Security (virtual replicas of your entire infrastructure for safe attack simulation), Breach Simulator, and Deception Technology, this pillar provides complete offensive coverage.

For investors: Offensive security is the fastest-growing segment in cybersecurity ($6.5B CAGR 18%). The Autonomous Red Team has no direct competitor — it's a category-creating feature that commands premium pricing and generates massive press/analyst coverage.`,
    investorHook: 'Category-creating Autonomous Red Team — no direct competitor in $6.5B market',
    tam: '$6.5B',
    competitors: ['HackerOne', 'Pentera', 'SafeBreach', 'AttackIQ'],
    differentiator: 'World-first fully autonomous red team — no human operator required',
    worldFirstCount: 1,
    modules: [
      { name: 'Autonomous Red Team', icon: '🔴', description: 'Self-attacking security engine', worldFirst: true },
      { name: 'Breach Simulator', icon: '💥', description: 'MITRE ATT&CK simulation' },
      { name: 'Digital Twin', icon: '🪞', description: 'Attack sim on virtual replicas' },
      { name: 'Deception Technology', icon: '🎭', description: 'Honeypots & attacker traps' },
      { name: 'Attack Surface', icon: '🛰️', description: 'External asset discovery' },
      { name: 'Penetration Testing', icon: '🛠️', description: 'Automated pen testing' },
      { name: 'Purple Team', icon: '💜', description: 'Adversary emulation exercises' },
      { name: 'Phishing Simulator', icon: '✉️', description: 'Realistic phishing campaigns' },
      { name: 'Threat Modeling', icon: '🗺️', description: 'STRIDE/DREAD & attack trees' },
    ],
    pricingTiers: [
      { name: 'Assess', price: '$4,990', period: '/mo', features: ['Attack Surface Mgmt', 'Phishing Simulator', 'Threat Modeling', 'Vulnerability scanning'], cta: 'Start Trial' },
      { name: 'Simulate', price: '$14,990', period: '/mo', features: ['All Assess +', 'Breach Simulator', 'Digital Twin', 'Purple Team', 'Deception Technology'], highlight: true, cta: 'Start Trial' },
      { name: 'Autonomous', price: '$34,990', period: '/mo', features: ['All 9 modules', '🏆 Autonomous Red Team', 'Continuous pen testing', 'Attack path analysis', 'Executive reporting'], cta: 'Start Trial' },
      { name: 'Enterprise', price: 'Custom', period: '', features: ['Managed red team', 'Custom scenarios', 'Board reporting', 'Compliance mapping', 'Dedicated team'], cta: 'Contact Sales' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // PILLAR 5: GOVERNANCE & COMPLIANCE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'governance-compliance',
    number: 5,
    name: 'Governance & Compliance',
    icon: '📋',
    color: 'from-amber-500 to-yellow-600',
    accent: 'text-amber-400',
    tagline: 'Automate compliance. Quantify risk. Prove it to the board.',
    narrative: `Governance & Compliance transforms the most painful part of security — audits, compliance reports, vendor questionnaires, and board presentations — into an automated, continuous process. Instead of quarterly fire drills, Anchor provides real-time compliance posture across 16+ frameworks with evidence generation that auditors actually trust.

This pillar includes capabilities that no other CSPM or GRC tool offers: real-time regulatory intelligence that tracks global regulation changes and auto-maps them to your controls, cyber insurance integration that provides live risk scoring to insurers, and critical infrastructure protection covering all 16 CISA sectors with NERC CIP compliance built in.

For investors: GRC is a $15B market growing at 14% CAGR. Anchor's approach — compliance as a byproduct of security operations rather than a separate workflow — is the thesis behind Drata ($1B+ valuation) but with 10x more depth. Government contracts ($25M–$75M/yr) flow through this pillar.`,
    investorHook: 'GRC-as-a-byproduct in $15B market — government contracts at $25M–$75M/yr',
    tam: '$15.1B',
    competitors: ['Drata', 'Vanta', 'ServiceNow GRC', 'Archer'],
    differentiator: 'Compliance as a byproduct of actual security operations, not a separate checkbox exercise',
    worldFirstCount: 0,
    modules: [
      { name: 'Compliance Hub', icon: '✅', description: 'Unified compliance management' },
      { name: 'Regulatory Intel', icon: '📚', description: 'Track global regulation changes' },
      { name: 'Vendor Risk', icon: '🤝', description: 'Third-party risk management' },
      { name: 'Cyber Insurance', icon: '🛡️', description: 'Risk scoring for insurers' },
      { name: 'OT/ICS Security', icon: '🏭', description: 'Industrial control security' },
      { name: 'Critical Infrastructure', icon: '🏗️', description: 'NERC CIP, 16 sectors' },
      { name: 'National Security', icon: '🏛️', description: 'Classified environment mgmt' },
    ],
    pricingTiers: [
      { name: 'Comply', price: '$2,990', period: '/mo', features: ['Compliance Hub', 'Regulatory Intel', 'Vendor Risk', 'Evidence automation', 'Audit reports'], cta: 'Start Trial' },
      { name: 'Govern', price: '$9,990', period: '/mo', features: ['All Comply +', 'Cyber Insurance scoring', 'OT/ICS Security', 'Board reporting', 'Framework mapping'], highlight: true, cta: 'Start Trial' },
      { name: 'Sovereign', price: '$24,990', period: '/mo', features: ['All 7 modules', 'Critical Infrastructure', 'National Security', 'FedRAMP Ready', 'CMMC Compliant'], cta: 'Start Trial' },
      { name: 'Government', price: 'Custom', period: '', features: ['All sovereign +', 'Air-gapped deploy', 'TS/SCI support', 'Cleared staff', 'Custom frameworks'], cta: 'Contact Sales' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AGGREGATE STATS
// ─────────────────────────────────────────────────────────────────────────────
export const PILLAR_STATS = {
  totalModules: PRODUCT_PILLARS.reduce((sum, p) => sum + p.modules.length, 0),
  totalWorldFirsts: PRODUCT_PILLARS.reduce((sum, p) => sum + p.worldFirstCount, 0),
  totalTAM: '$114.1B',
  pillarsCount: PRODUCT_PILLARS.length,
};
