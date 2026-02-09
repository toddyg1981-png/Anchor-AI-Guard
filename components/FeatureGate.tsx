import React, { useState } from 'react';

export interface PremiumAddon {
  id: string;
  name: string;
  description: string;
  price: number;           // monthly price in USD
  annualPrice: number;     // annual price in USD (discounted)
  category: 'world-first' | 'intelligence' | 'compliance' | 'managed-service' | 'threat-intel';
  tier: 'pro' | 'team' | 'business' | 'enterprise';
  icon: string;            // emoji icon
  features: string[];
  isPopular?: boolean;
  isNew?: boolean;
}

// Master catalog of all premium add-ons
export const PREMIUM_ADDONS: PremiumAddon[] = [
  // World-First Security Modules
  {
    id: 'autonomous-soc',
    name: 'Autonomous SOC',
    description: 'AI-powered Security Operations Centre that triages, investigates, and responds to threats 24/7 without human intervention.',
    price: 15000,
    annualPrice: 144000,
    category: 'world-first',
    tier: 'business',
    icon: '🏛️',
    features: ['24/7 automated triage', 'AI incident response', 'Auto-escalation workflows', 'SOAR integration', 'Playbook engine'],
    isPopular: true,
  },
  {
    id: 'digital-twin-security',
    name: 'Digital Twin Security',
    description: 'Create a virtual replica of your infrastructure to simulate attacks and test defenses without risk to production.',
    price: 12000,
    annualPrice: 115200,
    category: 'world-first',
    tier: 'business',
    icon: '🪞',
    features: ['Infrastructure mirroring', 'Attack simulation sandbox', 'What-if scenario testing', 'Drift comparison', 'Continuous validation'],
    isNew: true,
  },
  {
    id: 'deception-technology',
    name: 'Deception Technology',
    description: 'Deploy honeypots, honeytokens, and decoy systems to detect and trap attackers before they reach real assets.',
    price: 8000,
    annualPrice: 76800,
    category: 'world-first',
    tier: 'team',
    icon: '🪤',
    features: ['Automated honeypot deployment', 'Honeytoken generation', 'Decoy credential tracking', 'Attacker profiling', 'Real-time alerts'],
  },
  {
    id: 'forensics-lab',
    name: 'Forensics Lab',
    description: 'Full digital forensics investigation suite with evidence chain-of-custody, memory analysis, and court-ready reporting.',
    price: 10000,
    annualPrice: 96000,
    category: 'world-first',
    tier: 'business',
    icon: '🔬',
    features: ['Memory forensics', 'Disk image analysis', 'Network packet forensics', 'Chain of custody', 'Court-ready reports'],
  },
  {
    id: 'supply-chain-ai',
    name: 'Supply Chain AI',
    description: 'AI-driven analysis of your entire software supply chain — every dependency, every contributor, every risk scored in real-time.',
    price: 7500,
    annualPrice: 72000,
    category: 'world-first',
    tier: 'team',
    icon: '🔗',
    features: ['Dependency risk scoring', 'Contributor trust analysis', 'Build provenance tracking', 'SBOM generation', 'Typosquat detection'],
    isPopular: true,
  },
  {
    id: 'quantum-cryptography',
    name: 'Quantum Cryptography Manager',
    description: 'Post-quantum cryptographic readiness — audit, migrate, and manage quantum-safe encryption across your stack.',
    price: 20000,
    annualPrice: 192000,
    category: 'world-first',
    tier: 'enterprise',
    icon: '⚛️',
    features: ['PQC readiness audit', 'Algorithm migration planner', 'Key rotation automation', 'Quantum risk scoring', 'NIST PQC compliance'],
    isNew: true,
  },
  {
    id: 'critical-infrastructure',
    name: 'Critical Infrastructure Protection',
    description: 'Purpose-built for SCADA, ICS, and OT environments — protect power grids, water systems, and industrial controls.',
    price: 25000,
    annualPrice: 240000,
    category: 'world-first',
    tier: 'enterprise',
    icon: '⚡',
    features: ['SCADA/ICS monitoring', 'OT protocol analysis', 'Industrial anomaly detection', 'Safety system validation', 'NERC CIP compliance'],
  },
  {
    id: 'breach-simulator',
    name: 'Breach Simulator',
    description: 'Simulate real-world breach scenarios against your live infrastructure using MITRE ATT&CK techniques.',
    price: 5000,
    annualPrice: 48000,
    category: 'world-first',
    tier: 'pro',
    icon: '💥',
    features: ['MITRE ATT&CK simulation', 'Custom attack chains', 'Defense validation', 'Gap analysis reports', 'Remediation playbooks'],
  },
  {
    id: 'dark-web-monitor',
    name: 'Dark Web Monitor',
    description: 'Continuous monitoring of dark web marketplaces, forums, and paste sites for your organization\'s exposed credentials and data.',
    price: 8500,
    annualPrice: 81600,
    category: 'world-first',
    tier: 'team',
    icon: '🕵️',
    features: ['Credential leak detection', 'Brand impersonation alerts', 'Data broker monitoring', 'Executive threat alerts', 'Takedown assistance'],
    isPopular: true,
  },
  {
    id: 'cyber-insurance',
    name: 'Cyber Insurance Integration',
    description: 'Reduce premiums by up to 40% with automated compliance evidence and real-time risk posture shared with insurers.',
    price: 3000,
    annualPrice: 28800,
    category: 'world-first',
    tier: 'pro',
    icon: '🛡️',
    features: ['Insurer API integration', 'Premium optimization', 'Claims automation', 'Risk posture reporting', 'Coverage gap analysis'],
    isNew: true,
  },

  // Compliance Packs
  {
    id: 'compliance-soc2',
    name: 'SOC 2 Type II Pack',
    description: 'Automated SOC 2 Type II audit preparation with continuous monitoring and evidence collection.',
    price: 5000,
    annualPrice: 50000,
    category: 'compliance',
    tier: 'team',
    icon: '📋',
    features: ['Automated evidence', 'Continuous monitoring', 'Auditor portal', 'Gap remediation', 'Annual renewal'],
  },
  {
    id: 'compliance-hipaa',
    name: 'HIPAA Compliance Pack',
    description: 'Full HIPAA compliance suite for healthcare and health-tech organizations.',
    price: 7500,
    annualPrice: 75000,
    category: 'compliance',
    tier: 'team',
    icon: '🏥',
    features: ['PHI data mapping', 'Access controls audit', 'BAA management', 'Breach notification', 'Training tracking'],
  },
  {
    id: 'compliance-pci',
    name: 'PCI-DSS Pack',
    description: 'Payment card industry compliance with automated scanning and quarterly ASV reports.',
    price: 6000,
    annualPrice: 60000,
    category: 'compliance',
    tier: 'team',
    icon: '💳',
    features: ['ASV scanning', 'SAQ automation', 'Card data discovery', 'Segmentation testing', 'QSA portal'],
  },
  {
    id: 'compliance-iso27001',
    name: 'ISO 27001 Pack',
    description: 'Information Security Management System automation and certification readiness.',
    price: 5000,
    annualPrice: 50000,
    category: 'compliance',
    tier: 'team',
    icon: '🌍',
    features: ['ISMS automation', 'Risk assessment', 'Policy templates', 'Internal audit tools', 'Certification prep'],
  },
  {
    id: 'compliance-fedramp',
    name: 'FedRAMP Pack',
    description: 'Federal risk and authorization management for US government cloud services.',
    price: 15000,
    annualPrice: 150000,
    category: 'compliance',
    tier: 'enterprise',
    icon: '🇺🇸',
    features: ['800+ controls mapped', 'POAM management', '3PAO coordination', 'Continuous monitoring', 'ConMon reporting'],
  },
  {
    id: 'compliance-bundle',
    name: 'All Compliance Bundle',
    description: 'Every compliance framework supported — SOC 2, HIPAA, PCI, ISO, FedRAMP, CMMC, NIST, and more.',
    price: 25000,
    annualPrice: 250000,
    category: 'compliance',
    tier: 'business',
    icon: '📦',
    features: ['All 7 frameworks', 'Unified dashboard', 'Cross-framework mapping', 'Priority support', '30% savings vs individual'],
    isPopular: true,
  },

  // Threat Intelligence Feeds
  {
    id: 'feed-predictive-cve',
    name: 'Predictive CVE Feed',
    description: 'AI-predicted Common Vulnerabilities and Exposures before public disclosure — average 14-day early warning.',
    price: 10000,
    annualPrice: 96000,
    category: 'threat-intel',
    tier: 'business',
    icon: '🔮',
    features: ['Pre-disclosure CVE alerts', '14-day avg early warning', 'Exploit likelihood scoring', 'Patch priority ranking', 'API & webhook delivery'],
    isPopular: true,
  },
  {
    id: 'feed-zero-day',
    name: 'Zero-Day Intelligence',
    description: 'Real-time zero-day exploit intelligence sourced from global honeypot networks and dark web monitoring.',
    price: 25000,
    annualPrice: 240000,
    category: 'threat-intel',
    tier: 'enterprise',
    icon: '🎯',
    features: ['Zero-day exploit alerts', 'Global honeypot network', 'Weaponization tracking', 'Mitigation guidance', 'IOC feeds'],
    isNew: true,
  },
  {
    id: 'feed-nation-state',
    name: 'Nation-State APT Feed',
    description: 'Track and defend against advanced persistent threats from state-sponsored actors — full TTP mapping by actor group.',
    price: 50000,
    annualPrice: 480000,
    category: 'threat-intel',
    tier: 'enterprise',
    icon: '🏴',
    features: ['APT group tracking', 'TTP intelligence', 'Campaign attribution', 'Target sector alerts', 'Geopolitical context'],
  },
  {
    id: 'feed-dark-web-intel',
    name: 'Dark Web Intelligence Feed',
    description: 'Structured intelligence from dark web markets, forums, Telegram channels, and paste sites — delivered via API.',
    price: 20000,
    annualPrice: 192000,
    category: 'threat-intel',
    tier: 'business',
    icon: '🌑',
    features: ['Market monitoring', 'Forum intelligence', 'Paste site scraping', 'Actor profiling', 'Structured IOCs'],
  },
  {
    id: 'feed-bundle',
    name: 'Full Intelligence Bundle',
    description: 'All threat intelligence feeds combined — predictive CVE, zero-day, nation-state, dark web, and industry-specific.',
    price: 75000,
    annualPrice: 720000,
    category: 'threat-intel',
    tier: 'enterprise',
    icon: '🧠',
    features: ['All 5 feeds', 'Unified API', 'Custom queries', 'Analyst support', '35% savings vs individual'],
    isPopular: true,
  },

  // Managed Services
  {
    id: 'managed-soc-lite',
    name: 'Managed SOC Lite',
    description: 'Business-hours SOC monitoring with 4-hour SLA — perfect for growing teams that need expert oversight.',
    price: 25000,
    annualPrice: 240000,
    category: 'managed-service',
    tier: 'business',
    icon: '👁️',
    features: ['8x5 monitoring', '4-hour SLA', 'Incident triage', 'Monthly reports', 'Escalation support'],
  },
  {
    id: 'managed-soc-premium',
    name: 'Managed SOC Premium',
    description: '24/7/365 SOC with 15-minute SLA, dedicated analysts, threat hunting, and incident response.',
    price: 100000,
    annualPrice: 960000,
    category: 'managed-service',
    tier: 'enterprise',
    icon: '🛡️',
    features: ['24/7/365 monitoring', '15-min SLA', 'Dedicated analysts', 'Proactive hunting', 'IR retainer included'],
    isPopular: true,
  },
  {
    id: 'managed-soc-elite',
    name: 'Managed SOC Elite',
    description: 'White-glove SOC service with embedded analysts, custom playbooks, and executive briefings.',
    price: 200000,
    annualPrice: 1920000,
    category: 'managed-service',
    tier: 'enterprise',
    icon: '👑',
    features: ['Embedded analyst team', 'Custom playbooks', 'Board-level reporting', 'Red team exercises', 'Crisis management'],
  },
];

// Get add-ons by category
export const getAddonsByCategory = (category: PremiumAddon['category']) =>
  PREMIUM_ADDONS.filter(a => a.category === category);

// Check if a feature is unlocked for the current plan
export const isFeatureUnlocked = (addonId: string, currentTier: string, purchasedAddons: string[]): boolean => {
  if (purchasedAddons.includes(addonId)) return true;
  const addon = PREMIUM_ADDONS.find(a => a.id === addonId);
  if (!addon) return true; // unknown add-on = don't gate
  const tierOrder = ['free', 'starter', 'pro', 'team', 'business', 'enterprise'];
  const currentIdx = tierOrder.indexOf(currentTier.toLowerCase());
  const requiredIdx = tierOrder.indexOf(addon.tier);
  // Business and Enterprise tiers include all world-first features
  if (currentIdx >= tierOrder.indexOf('business') && addon.category === 'world-first') return true;
  return currentIdx >= requiredIdx;
};

// Format price for display
export const formatPrice = (price: number): string => {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
  return `$${price}`;
};

interface FeatureGateProps {
  addonId: string;
  currentTier?: string;
  purchasedAddons?: string[];
  children: React.ReactNode;
  onUpgrade?: (addonId: string) => void;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  addonId,
  currentTier = 'starter',
  purchasedAddons = [],
  children,
  onUpgrade,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const addon = PREMIUM_ADDONS.find(a => a.id === addonId);
  const unlocked = isFeatureUnlocked(addonId, currentTier, purchasedAddons);

  if (unlocked || !addon) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred preview of the feature */}
      <div className="filter blur-sm opacity-40 pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-gray-900/95 border border-cyan-500/30 rounded-2xl p-8 max-w-lg mx-auto text-center backdrop-blur-sm shadow-2xl shadow-cyan-500/10">
          {/* Lock icon */}
          <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div className="text-2xl mb-1">{addon.icon}</div>
          <h3 className="text-xl font-bold text-white mb-2">{addon.name}</h3>

          {addon.isNew && (
            <span className="inline-block bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full mb-2">NEW</span>
          )}

          <p className="text-gray-400 text-sm mb-4">{addon.description}</p>

          {/* Price */}
          <div className="mb-4">
            <span className="text-3xl font-bold text-white">{formatPrice(addon.price)}</span>
            <span className="text-gray-400">/mo</span>
            <div className="text-xs text-gray-500 mt-1">
              or {formatPrice(addon.annualPrice)}/yr (save {Math.round((1 - addon.annualPrice / (addon.price * 12)) * 100)}%)
            </div>
          </div>

          {/* Feature preview */}
          {showDetails && (
            <div className="text-left mb-4 bg-gray-800/50 rounded-lg p-3">
              {addon.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors cursor-pointer"
            >
              {showDetails ? 'Hide Details' : 'View Features'}
            </button>
            <button
              onClick={() => onUpgrade?.(addonId)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              Unlock {addon.name}
            </button>
          </div>

          <p className="text-gray-500 text-xs mt-3">
            Requires {addon.tier.charAt(0).toUpperCase() + addon.tier.slice(1)} plan or higher • 14-day free trial available
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureGate;
