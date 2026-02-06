import React, { useState } from 'react';
import { AppView, DashboardView } from '../App';
import { useDebouncedSearch } from '../hooks/useSecurityHooks';

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
  onViewAdmin?: () => void;
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
  onViewAdmin,
  onLogout,
  user,
  children,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('dashboard');

  const { value: searchQuery, setValue: setSearchQuery } = useDebouncedSearch((_query) => {
    // Search functionality - implement as needed
  }, 300);

  const navItems: Array<{ id: string; label: string; icon: string; view: DashboardView; description?: string; }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', view: 'overview', description: 'Monitor your security posture in real-time' },
    { id: 'threat-hunting', label: 'Threat Hunting', icon: '🎯', view: 'threatHunting', description: 'Proactive hunts and MITRE ATT&CK coverage' },
    { id: 'attack-surface', label: 'Attack Surface', icon: '🛰️', view: 'attackSurface', description: 'Discover exposed assets and shadow IT' },
    { id: 'vuln-mgmt', label: 'Vulnerability Mgmt', icon: '🛠️', view: 'vulnerability', description: 'CVE tracking, SLAs, remediation' },
    { id: 'phishing', label: 'Phishing Sim', icon: '✉️', view: 'phishing', description: 'Train users with realistic campaigns' },
    { id: 'email-security', label: 'Email Security', icon: '📨', view: 'emailSecurity', description: 'Inbound protection and DMARC' },
    { id: 'edr', label: 'EDR', icon: '🖥️', view: 'edr', description: 'Endpoint detection and response' },
    { id: 'ueba', label: 'UEBA', icon: '👤', view: 'ueba', description: 'User/entity behavior analytics' },
    { id: 'network-traffic', label: 'Network Traffic', icon: '🌐', view: 'networkTraffic', description: 'Flow analytics and anomalies' },
    { id: 'soar', label: 'SOAR', icon: '🤖', view: 'soar', description: 'Orchestration and automated response' },
    { id: 'ai-guard', label: 'AI Security', icon: '🧠', view: 'aiSecurity', description: 'LLM prompt injection and data loss controls' },
    { id: 'dlp', label: 'DLP', icon: '🔒', view: 'dlp', description: 'Data loss prevention and classification' },
    { id: 'browser-isolation', label: 'Browser Isolation', icon: '🛡️', view: 'browserIsolation', description: 'Remote isolation for web threats' },
    { id: 'security-automation', label: 'Automation', icon: '⚡', view: 'securityAutomation', description: 'No-code security workflows' },
    { id: 'identity', label: 'Identity Gov', icon: '🧾', view: 'identityGovernance', description: 'Access reviews and lifecycle' },
    { id: 'password-vault', label: 'Password Vault', icon: '🔑', view: 'passwordVault', description: 'Secrets and credential hygiene' },
    { id: 'crypto', label: 'Cryptography', icon: '📜', view: 'cryptographyManager', description: 'Keys, certs, and HSMs' },
    { id: 'container-security', label: 'Container Security', icon: '🐳', view: 'containerSecurity', description: 'K8s, images, runtime guard' },
    { id: 'network-seg', label: 'Network Segmentation', icon: '🧱', view: 'networkSegmentation', description: 'Micro-segmentation and policies' },
    { id: 'deception', label: 'Deception', icon: '🎭', view: 'deceptionTechnology', description: 'Decoys and attacker misdirection' },
    { id: 'threat-modeling', label: 'Threat Modeling', icon: '🗺️', view: 'threatModeling', description: 'STRIDE/DREAD and attack trees' },
    { id: 'pentest', label: 'Pen Testing', icon: '🛠️', view: 'penetrationTesting', description: 'Automated exploitation and validation' },
    { id: 'purple-team', label: 'Purple Team', icon: '💜', view: 'purpleTeam', description: 'Adversary emulation exercises' },
    { id: 'metrics', label: 'Security Metrics', icon: '📈', view: 'securityMetrics', description: 'KPIs and executive reporting' },
    { id: 'reg-intel', label: 'Regulatory Intel', icon: '📚', view: 'regulatoryIntelligence', description: 'Track global compliance changes' },
    { id: 'vendor-risk', label: 'Vendor Risk', icon: '🤝', view: 'vendorRisk', description: 'Third-party risk and questionnaires' },
    { id: 'asset-inventory', label: 'Asset Inventory', icon: '🗄️', view: 'assetInventory', description: 'CMDB and discovery' },
    { id: 'otics', label: 'OT/ICS Security', icon: '🏭', view: 'oticsSecurity', description: 'Critical infrastructure protection' },
    { id: 'forensics', label: 'Forensics Lab', icon: '🧪', view: 'forensicsLab', description: 'Evidence handling and analysis' },
    { id: 'malware', label: 'Malware Analysis', icon: '🐞', view: 'malwareAnalysis', description: 'Sandbox and reverse engineering' },
    { id: 'security-training', label: 'Security Training', icon: '🎓', view: 'securityTraining', description: 'Awareness and gamified learning' },
    { id: 'autonomous-soc', label: 'Autonomous SOC', icon: '🤖', view: 'autonomousSOC', description: 'AI-powered 24/7 security operations' },
    { id: 'digital-twin', label: 'Digital Twin', icon: '🪞', view: 'digitalTwin', description: 'Attack simulation on virtual replicas' },
    { id: 'cyber-insurance', label: 'Cyber Insurance', icon: '🛡️', view: 'cyberInsurance', description: 'Real-time risk scoring for insurers' },
    { id: 'national-security', label: 'National Security', icon: '🏛️', view: 'nationalSecurity', description: 'Classified environment management' },
    { id: 'critical-infra', label: 'Critical Infra', icon: '🏗️', view: 'criticalInfra', description: '16 sectors, NERC CIP, real-time' },
    { id: 'supply-chain', label: 'Supply Chain', icon: '🔗', view: 'supplyChainAttestation', description: 'Blockchain-verified provenance' },
    { id: 'active-defense', label: 'Active Defense', icon: '⚔️', view: 'activeDefense', description: 'Honeypots and threat deception' },
    { id: 'dark-web', label: 'Dark Web Monitor', icon: '🕶️', view: 'darkWebMonitor', description: 'Dark web intelligence feeds' },
    { id: 'compliance', label: 'Compliance Hub', icon: '✅', view: 'complianceHub', description: 'Regulatory compliance management' },
    { id: 'breach-sim', label: 'Breach Simulator', icon: '💥', view: 'breachSimulator', description: 'Attack simulation exercises' },
    { id: 'cloud-security', label: 'Cloud Security', icon: '☁️', view: 'cloudSecurity', description: 'CSPM and cloud misconfigurations' },
    { id: 'cicd', label: 'CI/CD Security', icon: '🔄', view: 'cicdSecurity', description: 'Pipeline and build security' },
    { id: 'threat-intel', label: 'Threat Intelligence', icon: '🔍', view: 'threatIntelligence', description: 'IOC feeds and threat correlation' },
    { id: 'api-security', label: 'API Security', icon: '🔌', view: 'apiSecurity', description: 'API endpoint scanning' },
    { id: 'executive', label: 'Executive View', icon: '👔', view: 'executiveDashboard', description: 'C-suite security overview' },
    { id: 'insider-threat', label: 'Insider Threats', icon: '🕵️', view: 'insiderThreat', description: 'Insider threat detection' },
    { id: 'zero-trust', label: 'Zero Trust', icon: '🚫', view: 'zeroTrust', description: 'Zero trust architecture' },
    { id: 'soc', label: 'SOC Dashboard', icon: '📺', view: 'socDashboard', description: 'Security operations center' },
    { id: 'quantum', label: 'Quantum Crypto', icon: '⚛️', view: 'quantumCryptography', description: 'Post-quantum readiness' },
    { id: 'incident', label: 'Incident Response', icon: '🚨', view: 'incidentResponse', description: 'Automated incident playbooks' },
    { id: 'secrets', label: 'Secrets Rotation', icon: '🔐', view: 'secretsRotation', description: 'Automated secret lifecycle' },
    { id: 'supply-ai', label: 'Supply Chain AI', icon: '🤖', view: 'supplyChainAI', description: 'AI-powered supply chain analysis' },
    { id: 'rasp', label: 'RASP Agent', icon: '🛡️', view: 'raspAgent', description: 'Runtime application self-protection' },
    { id: 'mobile', label: 'Mobile Security', icon: '📱', view: 'mobileSecurity', description: 'Mobile app and device security' },
    { id: 'backup', label: 'Backup & DR', icon: '💾', view: 'backupRecovery', description: 'Disaster recovery management' },
    { id: 'self-protect', label: 'Self-Protection', icon: '🔰', view: 'selfProtection', description: 'Platform self-defense' },
  ];

  const manageItems: Array<{ id: string; label: string; icon: string; view: DashboardView; action?: () => void; description?: string; }> = [
    { id: 'team', label: 'Team', icon: '👥', view: 'team', action: onViewTeam, description: 'Manage people and roles' },
    { id: 'integrations', label: 'Integrations', icon: '🔗', view: 'integrations', action: onViewIntegrations, description: 'Connect tools and platforms' },
    { id: 'billing', label: 'Billing', icon: '💳', view: 'billing', action: onViewBilling, description: 'Subscription and invoicing' },
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
      <aside className="w-64 bg-gradient-to-b from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-r border-cyan-500/20 overflow-y-auto flex flex-col shadow-[0_0_40px_rgba(53,198,255,0.15)]">
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
          <nav className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 px-3">Security</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveNav(item.id); setDashboardView(item.view); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                  activeNav === item.id
                    ? 'bg-gradient-to-r from-[#35c6ff]/20 to-[#ff4fa3]/20 text-[#ff4fa3] border-l-2 border-[#ff4fa3]'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Manage Section */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 px-3">Manage</p>
            <nav className="space-y-1">
              {manageItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveNav(item.id); setDashboardView(item.view); item.action?.(); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                    activeNav === item.id
                      ? 'bg-gradient-to-r from-[#35c6ff]/20 to-[#ff4fa3]/20 text-[#ff4fa3]'
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
                      ? 'bg-gradient-to-r from-[#35c6ff]/20 to-[#ff4fa3]/20 text-[#ff4fa3]'
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
        <div className="p-4 border-t border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-pink-500/5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-pink-500/25">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Glass Style */}
        <header className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-b border-cyan-500/20 px-8 py-4 flex justify-between items-center shadow-[0_4px_30px_rgba(53,198,255,0.1)]">
          <div>
            <h1 className="text-xl font-semibold text-white">{activeMeta?.label || 'Security Dashboard'}</h1>
            {activeMeta?.description && (
              <p className="text-sm text-slate-400 mt-0.5">{activeMeta.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <button className="px-4 py-2 bg-gradient-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all shadow-lg shadow-pink-500/25">
              + New Scan
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View notifications"
                title="Notifications"
                className="relative p-2.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm border border-cyan-500/30 hover:border-pink-500/50 rounded-xl transition-all hover:shadow-lg hover:shadow-pink-500/20"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-xl border border-slate-700/50 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-700/50">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-slate-700/50 border-l-2 border-red-500">
                      <p className="text-sm text-white">Critical vulnerability found</p>
                      <p className="text-xs text-slate-400 mt-1">SQL Injection in auth module • 5 min ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-700/50 border-l-2 border-yellow-500">
                      <p className="text-sm text-white">Scan completed</p>
                      <p className="text-xs text-slate-400 mt-1">Project &quot;API Gateway&quot; • 1 hour ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-700/50 border-l-2 border-cyan-500">
                      <p className="text-sm text-white">New team member joined</p>
                      <p className="text-xs text-slate-400 mt-1">john@example.com • 2 hours ago</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-slate-700/50">
                    <button className="text-sm text-cyan-400 hover:text-cyan-300">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
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
    </div>
  );
};

export default DashboardLayout;
