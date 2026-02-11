import React, { useState, useEffect, useRef } from 'react';
import { AppView, DashboardView } from '../App';
import { useDebouncedSearch } from '../hooks/useSecurityHooks';
import { useAuth } from '../hooks/useAuth';
import AIStatusWidget from './AIStatusWidget';
import { DemoModeIndicator } from './DemoBanner';

interface User {
  id?: string;
  name?: string | null;
  email?: string;
  role?: string;
}

interface DashboardLayoutProps {
  currentView: AppView | string;
  setCurrentView: (view: AppView) => void;
  setDashboardView: (view: DashboardView) => void;
  onViewTeam?: () => void;
  onViewIntegrations?: () => void;
  onViewBilling?: () => void;
  onViewProfile?: () => void;
  onViewAdmin?: () => void;
  onNewScan?: () => void;
  onRepair?: () => void;
  onLogout?: () => void;
  user?: User | null;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentView: _currentView,
  setCurrentView: _setCurrentView,
  setDashboardView,
  onViewTeam,
  onViewIntegrations,
  onViewBilling,
  onViewProfile,
  onViewAdmin,
  onNewScan,
  onRepair,
  onLogout,
  user,
  children,
}) => {
  const { isDemoMode } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const { value: searchQuery, setValue: setSearchQuery } = useDebouncedSearch((_query) => {
    // Search functionality - implement as needed
  }, 300);

  type NavItem = { id: string; label: string; icon: string; view: DashboardView; description?: string; worldFirst?: boolean; };

  const navCategories: Array<{ category: string; icon: string; pillar?: string; items: NavItem[] }> = [
    // ─────────────────────────────────────────────────────────────
    // PILLAR 1: CORE PLATFORM
    // ─────────────────────────────────────────────────────────────
    {
      category: 'Core Platform',
      icon: '⚡',
      pillar: '1',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', view: 'overview', description: 'Real-time security posture overview' },
        { id: 'executive', label: 'Executive View', icon: '👔', view: 'executiveDashboard', description: 'C-suite security overview' },
        { id: 'metrics', label: 'Security Metrics', icon: '📈', view: 'securityMetrics', description: 'KPIs and reporting' },
        { id: 'soc', label: 'SOC Dashboard', icon: '📺', view: 'socDashboard', description: 'Security operations center' },
        { id: 'ai-evolution', label: 'Titan Engine', icon: '🧬', view: 'aiEvolution', description: 'Self-evolving threat detection' },
        { id: 'ai-command', label: 'Titan Command Centre', icon: '🎛️', view: 'aiCommandCenter', description: 'Unified AI analysis hub' },
        { id: 'intelligence', label: 'Intelligence API', icon: '🔑', view: 'intelligenceDashboard', description: 'B2B AI-as-a-Service platform' },
        { id: 'sdk-security', label: 'SDK Security', icon: '📦', view: 'sdkSecurity', description: 'SDK management & scanning' },
        { id: 'security-training', label: 'Training', icon: '🎓', view: 'securityTraining', description: 'Awareness & gamified learning' },
        { id: 'security-awareness', label: 'Awareness Training', icon: '🏆', view: 'securityAwarenessTraining', description: 'Gamified security courses' },
        { id: 'help-desk', label: 'AI Help Desk', icon: '💬', view: 'helpDesk', description: 'Instant AI-powered support' },
        { id: 'how-to-guide', label: 'How-To Guide', icon: '📚', view: 'howToGuide', description: 'Learn all features' },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // PILLAR 2: PROTECTION STACK
    // ─────────────────────────────────────────────────────────────
    {
      category: 'Protection Stack',
      icon: '🛡️',
      pillar: '2',
      items: [
        { id: 'edr', label: 'EDR / XDR', icon: '🖥️', view: 'edr', description: 'Endpoint detection & response' },
        { id: 'endpoint', label: 'Endpoint Protection', icon: '🔒', view: 'endpointProtection', description: 'Next-gen endpoint security' },
        { id: 'cloud-security', label: 'Cloud Security (CSPM)', icon: '☁️', view: 'cloudSecurity', description: 'Multi-cloud posture management' },
        { id: 'container-security', label: 'Container Security', icon: '🐳', view: 'containerSecurity', description: 'K8s, images, runtime guard' },
        { id: 'api-security', label: 'API Security', icon: '🔌', view: 'apiSecurity', description: 'API endpoint scanning' },
        { id: 'vuln-mgmt', label: 'Vulnerability Mgmt', icon: '🛠️', view: 'vulnerability', description: 'CVE tracking & remediation' },
        { id: 'cicd', label: 'CI/CD Security', icon: '🔄', view: 'cicdSecurity', description: 'Pipeline & build security' },
        { id: 'network-traffic', label: 'Network Traffic', icon: '🌐', view: 'networkTraffic', description: 'Flow analytics & anomalies' },
        { id: 'network-seg', label: 'Network Segmentation', icon: '🧱', view: 'networkSegmentation', description: 'Micro-segmentation & policies' },
        { id: 'email-security', label: 'Email Security', icon: '📨', view: 'emailSecurity', description: 'Phishing & DMARC enforcement' },
        { id: 'browser-isolation', label: 'Browser Isolation', icon: '🌐', view: 'browserIsolation', description: 'Remote browser isolation' },
        { id: 'mobile', label: 'Mobile Security', icon: '📱', view: 'mobileSecurity', description: 'Mobile app & device security' },
        { id: 'rasp', label: 'RASP Agent', icon: '🛡️', view: 'raspAgent', description: 'Runtime app self-protection' },
        { id: 'identity', label: 'Identity Governance', icon: '🧾', view: 'identityGovernance', description: 'Access reviews & lifecycle' },
        { id: 'zero-trust', label: 'Zero Trust', icon: '🚫', view: 'zeroTrust', description: 'Zero trust architecture' },
        { id: 'dlp', label: 'Data Loss Prevention', icon: '🔒', view: 'dlp', description: 'Data classification & DLP' },
        { id: 'password-vault', label: 'Password Vault', icon: '🔑', view: 'passwordVault', description: 'Secrets & credential hygiene' },
        { id: 'secrets', label: 'Secrets Rotation', icon: '🔐', view: 'secretsRotation', description: 'Automated secret lifecycle' },
        { id: 'crypto', label: 'Cryptography', icon: '📜', view: 'cryptographyManager', description: 'Keys, certs & HSMs' },
        { id: 'quantum', label: 'Quantum Crypto', icon: '⚛️', view: 'quantumCryptography', description: 'Post-quantum readiness' },
        { id: 'active-defense', label: 'Active Defense', icon: '⚔️', view: 'activeDefense', description: 'Automated countermeasures' },
        { id: 'asset-inventory', label: 'Asset Inventory', icon: '🗄️', view: 'assetInventory', description: 'CMDB & discovery' },
        { id: 'backup', label: 'Backup & DR', icon: '💾', view: 'backupRecovery', description: 'Disaster recovery' },
        { id: 'self-protect', label: 'Self-Protection', icon: '🔰', view: 'selfProtection', description: 'Platform self-defense' },
        { id: 'anti-tampering', label: 'Anti-Tampering', icon: '🔏', view: 'antiTampering', description: 'Code integrity & tamper detection' },
        { id: 'hardware-integrity', label: 'Hardware Integrity', icon: '🔩', view: 'hardwareIntegrity', description: 'Hardware trust verification', worldFirst: true },
        { id: 'firmware-security', label: 'Firmware Security', icon: '💾', view: 'firmwareSecurity', description: 'Firmware & microcode scanner', worldFirst: true },
        { id: 'identity-drift', label: 'Identity Drift', icon: '🪪', view: 'identityDrift', description: 'AI identity integrity engine', worldFirst: true },
        { id: 'architecture-drift', label: 'Architecture Drift', icon: '🏗️', view: 'architectureDrift', description: 'Continuous drift detection', worldFirst: true },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // PILLAR 3: INTELLIGENCE & AUTOMATION
    // ─────────────────────────────────────────────────────────────
    {
      category: 'Intelligence & Automation',
      icon: '🧠',
      pillar: '3',
      items: [
        { id: 'threat-intel', label: 'Threat Intelligence', icon: '🔍', view: 'threatIntelligence', description: 'IOC feeds & correlation' },
        { id: 'threat-hunting', label: 'Threat Hunting', icon: '🎯', view: 'threatHunting', description: 'Proactive MITRE ATT&CK hunts' },
        { id: 'dark-web', label: 'Dark Web Monitor', icon: '🕶️', view: 'darkWebMonitor', description: 'Dark web intelligence feeds' },
        { id: 'ai-guard', label: 'AI Security Guard', icon: '🧠', view: 'aiSecurity', description: 'LLM & AI protection controls' },
        { id: 'ai-llm', label: 'LLM Security', icon: '🤖', view: 'aiLLMSecurity', description: 'LLM prompt injection & guardrails' },
        { id: 'soar', label: 'SOAR', icon: '🤖', view: 'soar', description: 'Orchestration & auto-response' },
        { id: 'security-automation', label: 'Automation', icon: '⚡', view: 'securityAutomation', description: 'No-code security workflows' },
        { id: 'autonomous-soc', label: 'Autonomous SOC', icon: '🏛️', view: 'autonomousSOC', description: 'AI-powered 24/7 SOC' },
        { id: 'incident', label: 'Incident Response', icon: '🚨', view: 'incidentResponse', description: 'Automated playbooks' },
        { id: 'ueba', label: 'UEBA', icon: '👤', view: 'ueba', description: 'User behavior analytics' },
        { id: 'insider-threat', label: 'Insider Threats', icon: '🕵️', view: 'insiderThreat', description: 'Insider threat detection' },
        { id: 'malware', label: 'Malware Analysis', icon: '🐞', view: 'malwareAnalysis', description: 'Sandbox & reverse engineering' },
        { id: 'forensics', label: 'Forensics Lab', icon: '🧪', view: 'forensicsLab', description: 'Evidence & analysis' },
        { id: 'forensics-investigation', label: 'Forensics Investigation', icon: '🔬', view: 'forensicsInvestigation', description: 'Deep-dive case investigation' },
        { id: 'supply-ai', label: 'Supply Chain AI', icon: '🔗', view: 'supplyChainAI', description: 'AI supply chain analysis' },
        { id: 'supply-chain', label: 'Supply Chain Attestation', icon: '📋', view: 'supplyChainAttestation', description: 'Provenance verification' },
        { id: 'ai-runtime', label: 'AI Runtime Security', icon: '🤖', view: 'aiRuntimeSecurity', description: 'AI model runtime protection', worldFirst: true },
        { id: 'data-trust', label: 'Data Trust Engine', icon: '🧬', view: 'dataTrustEngine', description: 'Data integrity verification', worldFirst: true },
        { id: 'human-behaviour', label: 'Human Behaviour', icon: '🧠', view: 'humanBehaviour', description: 'Behavioural risk engine', worldFirst: true },
        { id: 'national-telemetry', label: 'National Telemetry', icon: '🌐', view: 'nationalTelemetry', description: 'Sovereign cyber intelligence', worldFirst: true },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // PILLAR 4: OFFENSIVE & SIMULATION
    // ─────────────────────────────────────────────────────────────
    {
      category: 'Offensive & Simulation',
      icon: '⚔️',
      pillar: '4',
      items: [
        { id: 'autonomous-redteam', label: 'Autonomous Red Team', icon: '🔴', view: 'autonomousRedTeam', description: 'Self-attacking security engine', worldFirst: true },
        { id: 'breach-sim', label: 'Breach Simulator', icon: '💥', view: 'breachSimulator', description: 'MITRE ATT&CK simulation' },
        { id: 'digital-twin', label: 'Digital Twin', icon: '🪞', view: 'digitalTwin', description: 'Attack sim on virtual replicas' },
        { id: 'deception', label: 'Deception Technology', icon: '🎭', view: 'deceptionTechnology', description: 'Honeypots & attacker traps' },
        { id: 'attack-surface', label: 'Attack Surface', icon: '🛰️', view: 'attackSurface', description: 'External asset discovery' },
        { id: 'pentest', label: 'Penetration Testing', icon: '🛠️', view: 'penetrationTesting', description: 'Automated pen testing' },
        { id: 'purple-team', label: 'Purple Team', icon: '💜', view: 'purpleTeam', description: 'Adversary emulation exercises' },
        { id: 'phishing', label: 'Phishing Simulator', icon: '✉️', view: 'phishing', description: 'Realistic phishing campaigns' },
        { id: 'threat-modeling', label: 'Threat Modeling', icon: '🗺️', view: 'threatModeling', description: 'STRIDE/DREAD & attack trees' },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // PILLAR 5: GOVERNANCE & COMPLIANCE
    // ─────────────────────────────────────────────────────────────
    {
      category: 'Governance & Compliance',
      icon: '📋',
      pillar: '5',
      items: [
        { id: 'compliance', label: 'Compliance Hub', icon: '✅', view: 'complianceHub', description: 'Unified compliance management' },
        { id: 'reg-intel', label: 'Regulatory Intel', icon: '📚', view: 'regulatoryIntelligence', description: 'Track global regulation changes' },
        { id: 'vendor-risk', label: 'Vendor Risk', icon: '🤝', view: 'vendorRisk', description: 'Third-party risk management' },
        { id: 'cyber-insurance', label: 'Cyber Insurance', icon: '🛡️', view: 'cyberInsurance', description: 'Risk scoring for insurers' },
        { id: 'otics', label: 'OT/ICS Security', icon: '🏭', view: 'oticsSecurity', description: 'Industrial control security' },
        { id: 'critical-infra', label: 'Critical Infrastructure', icon: '🏗️', view: 'criticalInfra', description: 'NERC CIP, 16 sectors' },
        { id: 'national-security', label: 'National Security', icon: '🏛️', view: 'nationalSecurity', description: 'Classified environment mgmt' },
      ],
    },
  ];

  // Flat list for lookups (activeMeta, etc.)
  const navItems = navCategories.flatMap(cat => cat.items);

  const manageItems: Array<{ id: string; label: string; icon: string; view: DashboardView; action?: () => void; description?: string; }> = [
    { id: 'team', label: 'Team', icon: '👥', view: 'team', action: onViewTeam, description: 'Manage people and roles' },
    { id: 'integrations', label: 'Integrations', icon: '🔗', view: 'integrations', action: onViewIntegrations, description: 'Connect tools and platforms' },
    { id: 'billing', label: 'Billing', icon: '💳', view: 'billing', action: onViewBilling, description: 'Subscription and invoicing' },
    { id: 'profile', label: 'My Profile', icon: '⚙️', view: 'profile' as DashboardView, action: onViewProfile, description: 'Personal info and bank details' },
  ];

  // Only show admin for owners/admins
  const isAdmin = user?.role === 'owner' || user?.role === 'admin';

  const activeMeta = [
    ...navItems,
    ...manageItems,
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: '⚙️', view: 'admin', description: 'Platform administration' } as const] : []),
  ].find((item) => item.id === activeNav);

  return (
    <div className="h-screen flex bg-transparent">
      {/* Sidebar - Glass Neon Style */}
      <aside className="w-64 bg-linear-to-b from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-r border-cyan-500/20 overflow-y-auto flex flex-col shadow-[0_0_40px_rgba(53,198,255,0.15)]">
        <div className="p-6 flex-1">
          {/* Search */}
          <div className="mb-8 mt-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1" aria-label="Product pillars navigation">
            {navCategories.map((cat) => (
              <div key={cat.category} className="mb-1">
                <button
                  onClick={() => toggleCategory(cat.category)}
                  className="w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between text-slate-400 hover:text-white hover:bg-slate-800/30 group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">{cat.category}</span>
                    {cat.pillar && (
                      <span className="text-[9px] font-bold bg-slate-700/60 text-cyan-400 px-1.5 py-0.5 rounded-full leading-none">{cat.items.length}</span>
                    )}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedCategories[cat.category] ? '' : 'rotate-90'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {!collapsedCategories[cat.category] && (
                  <div className="mt-0.5 space-y-0.5 ml-2 border-l border-slate-700/40 pl-1">
                    {cat.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveNav(item.id); setDashboardView(item.view); }}
                        aria-current={activeNav === item.id ? 'page' : undefined}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-3 text-sm ${
                          activeNav === item.id
                            ? 'bg-linear-to-r from-[#35c6ff]/20 to-[#ff4fa3]/20 text-[#ff4fa3] border-l-2 border-[#ff4fa3]'
                            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="font-medium flex-1">{item.label}</span>
                        {item.worldFirst && (
                          <span className="text-[10px] font-bold bg-linear-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full leading-none">🏆 1ST</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Manage Section */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 px-3">Manage</p>
            <nav className="space-y-1" aria-label="Management navigation">
              {manageItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveNav(item.id); setDashboardView(item.view); item.action?.(); }}
                  aria-current={activeNav === item.id ? 'page' : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                    activeNav === item.id
                      ? 'bg-linear-to-r from-[#35c6ff]/20 to-[#ff4fa3]/20 text-[#ff4fa3]'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => { setActiveNav('admin'); setDashboardView('admin'); onViewAdmin?.(); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                    activeNav === 'admin'
                      ? 'bg-linear-to-r from-[#35c6ff]/20 to-[#ff4fa3]/20 text-[#ff4fa3]'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <span className="text-lg">⚙️</span>
                  <span className="font-medium">Admin</span>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* User Profile in Sidebar Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-linear-to-r from-cyan-500/5 to-pink-500/5">
          <button
            onClick={() => { setActiveNav('profile'); setDashboardView('profile' as DashboardView); onViewProfile?.(); }}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800/50 transition-colors group"
          >
            <div className="w-10 h-10 bg-linear-to-br from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-pink-500/25">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate group-hover:text-cyan-300">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
            <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={onLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Glass Style */}
        <header className="bg-linear-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-b border-cyan-500/20 px-8 py-4 flex justify-between items-center shadow-[0_4px_30px_rgba(53,198,255,0.1)]">
          <div>
            <h1 className="text-xl font-semibold text-white">{activeMeta?.label || 'Security Dashboard'}</h1>
            {activeMeta?.description && (
              <p className="text-sm text-slate-400 mt-0.5">{activeMeta.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            {/* Demo Mode Indicator */}
            {isDemoMode && <DemoModeIndicator />}

            <button
              onClick={onRepair}
              className="px-4 py-2 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Repair
            </button>
            <button
              onClick={onNewScan}
              className="px-4 py-2 bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all shadow-lg shadow-pink-500/25">
              + New Scan
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View notifications"
                title="Notifications"
                className="relative p-2.5 bg-linear-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm border border-cyan-500/30 hover:border-pink-500/50 rounded-xl transition-all hover:shadow-lg hover:shadow-pink-500/20"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-xl border border-slate-700/50 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-700/50">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                  </div>
                  <div className="px-6 py-8 text-center">
                    <div className="w-12 h-12 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <p className="text-sm text-white font-medium">No notifications</p>
                    <p className="text-xs text-slate-400 mt-1">Security alerts and updates will appear here</p>
                  </div>
                  <div className="px-4 py-2 border-t border-slate-700/50">
                    <button onClick={() => setShowNotifications(false)} className="text-sm text-cyan-400 hover:text-cyan-300">Close</button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700/50 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-700/50">
                    <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-400">{user?.email || ''}</p>
                    {user?.role && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full capitalize">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setActiveNav('profile'); setDashboardView('profile' as DashboardView); onViewProfile?.(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-3"
                    >
                      <span>⚙️</span> Account Settings
                    </button>
                    <button
                      onClick={() => { setActiveNav('team'); onViewTeam?.(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-3"
                    >
                      <span>👥</span> Team Settings
                    </button>
                    <button
                      onClick={() => { setActiveNav('billing'); onViewBilling?.(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-3"
                    >
                      <span>💳</span> Billing
                    </button>
                    <button
                      onClick={() => { setActiveNav('integrations'); onViewIntegrations?.(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-3"
                    >
                      <span>🔗</span> Integrations
                    </button>
                  </div>
                  <div className="border-t border-slate-700/50 py-1">
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50 flex items-center gap-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Global AI Status Widget - Always Visible */}
      <AIStatusWidget 
        onOpenDashboard={() => {
          setActiveNav('ai-evolution');
          setDashboardView('aiEvolution');
        }}
      />
    </div>
  );
};

export default DashboardLayout;
