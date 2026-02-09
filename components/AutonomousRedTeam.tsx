// ============================================================================
// AUTONOMOUS RED TEAM — WORLD-FIRST SELF-ATTACKING SECURITY ENGINE
// Anchor is the first platform to include a fully autonomous red team that
// continuously attacks your own infrastructure to find weaknesses before
// real attackers do — exploit simulation, lateral movement, privilege
// escalation, and misconfiguration exploitation — all fully automated.
// ============================================================================

import React, { useState, useEffect } from 'react';

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

interface SeverityDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface Campaign {
  id: string;
  name: string;
  type: 'exploit' | 'lateral' | 'privesc' | 'misconfig' | 'full-spectrum';
  status: 'running' | 'completed' | 'scheduled' | 'paused';
  targetsTotal: number;
  targetsCompromised: number;
  findingsCount: number;
  startTime: string;
  duration: string;
  severityDistribution: SeverityDistribution;
}

interface ExploitSimulation {
  id: string;
  cve: string;
  name: string;
  target: string;
  technique: string;
  result: 'success' | 'failed' | 'partial';
  impactLevel: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
}

interface LateralMovementPath {
  id: string;
  source: string;
  destination: string;
  method: string;
  hopsCount: number;
  timeToCompromise: string;
  blocked: boolean;
  riskScore: number;
}

interface PrivilegeEscalation {
  id: string;
  startPrivilege: string;
  achievedPrivilege: string;
  technique: string;
  target: string;
  success: boolean;
  timeSeconds: number;
  mitigation: string;
}

interface MisconfigExploit {
  id: string;
  service: string;
  misconfiguration: string;
  exploitMethod: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  exploited: boolean;
  remediation: string;
}

type TabKey = 'campaigns' | 'exploits' | 'lateral' | 'privesc' | 'misconfig';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockCampaigns: Campaign[] = [
  {
    id: 'CMP-001',
    name: 'Full Infrastructure Sweep',
    type: 'full-spectrum',
    status: 'running',
    targetsTotal: 248,
    targetsCompromised: 37,
    findingsCount: 84,
    startTime: '2026-02-09T02:00:00Z',
    duration: '4h 32m',
    severityDistribution: { critical: 6, high: 18, medium: 34, low: 26 },
  },
  {
    id: 'CMP-002',
    name: 'Cloud API Exploit Chain',
    type: 'exploit',
    status: 'completed',
    targetsTotal: 64,
    targetsCompromised: 11,
    findingsCount: 29,
    startTime: '2026-02-08T18:00:00Z',
    duration: '2h 15m',
    severityDistribution: { critical: 3, high: 9, medium: 12, low: 5 },
  },
  {
    id: 'CMP-003',
    name: 'East-West Traffic Traversal',
    type: 'lateral',
    status: 'running',
    targetsTotal: 132,
    targetsCompromised: 22,
    findingsCount: 41,
    startTime: '2026-02-09T05:30:00Z',
    duration: '1h 48m',
    severityDistribution: { critical: 2, high: 14, medium: 17, low: 8 },
  },
  {
    id: 'CMP-004',
    name: 'Privilege Boundary Testing',
    type: 'privesc',
    status: 'scheduled',
    targetsTotal: 96,
    targetsCompromised: 0,
    findingsCount: 0,
    startTime: '2026-02-09T12:00:00Z',
    duration: '—',
    severityDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
  },
  {
    id: 'CMP-005',
    name: 'Container Escape Drill',
    type: 'exploit',
    status: 'paused',
    targetsTotal: 48,
    targetsCompromised: 5,
    findingsCount: 13,
    startTime: '2026-02-08T22:00:00Z',
    duration: '0h 52m',
    severityDistribution: { critical: 1, high: 4, medium: 5, low: 3 },
  },
  {
    id: 'CMP-006',
    name: 'Misconfiguration Blitz',
    type: 'misconfig',
    status: 'completed',
    targetsTotal: 310,
    targetsCompromised: 58,
    findingsCount: 112,
    startTime: '2026-02-07T08:00:00Z',
    duration: '6h 10m',
    severityDistribution: { critical: 9, high: 27, medium: 48, low: 28 },
  },
];

const mockExploits: ExploitSimulation[] = [
  {
    id: 'EXP-001',
    cve: 'CVE-2025-21298',
    name: 'Windows OLE Remote Code Execution',
    target: 'DC-PROD-01 (10.0.1.5)',
    technique: 'T1203 — Exploitation for Client Execution',
    result: 'success',
    impactLevel: 'critical',
    timestamp: '2026-02-09T06:12:44Z',
  },
  {
    id: 'EXP-002',
    cve: 'CVE-2025-0282',
    name: 'Ivanti Connect Secure Buffer Overflow',
    target: 'VPN-GW-02 (10.0.0.12)',
    technique: 'T1190 — Exploit Public-Facing Application',
    result: 'success',
    impactLevel: 'critical',
    timestamp: '2026-02-09T05:48:21Z',
  },
  {
    id: 'EXP-003',
    cve: 'CVE-2024-50623',
    name: 'Cleo Harmony File Transfer RCE',
    target: 'FILE-SRV-03 (10.0.4.18)',
    technique: 'T1059 — Command and Scripting Interpreter',
    result: 'partial',
    impactLevel: 'high',
    timestamp: '2026-02-09T05:33:09Z',
  },
  {
    id: 'EXP-004',
    cve: 'CVE-2025-24813',
    name: 'Apache Tomcat Deserialization RCE',
    target: 'APP-WEB-07 (10.0.3.44)',
    technique: 'T1210 — Exploitation of Remote Services',
    result: 'success',
    impactLevel: 'high',
    timestamp: '2026-02-09T04:55:37Z',
  },
  {
    id: 'EXP-005',
    cve: 'CVE-2025-29927',
    name: 'Next.js Middleware Authorization Bypass',
    target: 'PORTAL-01 (10.0.2.30)',
    technique: 'T1548 — Abuse Elevation Control Mechanism',
    result: 'failed',
    impactLevel: 'medium',
    timestamp: '2026-02-09T04:22:58Z',
  },
  {
    id: 'EXP-006',
    cve: 'CVE-2024-3400',
    name: 'PAN-OS GlobalProtect Command Injection',
    target: 'FW-EDGE-01 (10.0.0.1)',
    technique: 'T1190 — Exploit Public-Facing Application',
    result: 'failed',
    impactLevel: 'critical',
    timestamp: '2026-02-09T03:47:12Z',
  },
  {
    id: 'EXP-007',
    cve: 'CVE-2025-22224',
    name: 'VMware ESXi Heap Overflow',
    target: 'ESXI-NODE-04 (10.0.6.10)',
    technique: 'T1611 — Escape to Host',
    result: 'partial',
    impactLevel: 'critical',
    timestamp: '2026-02-09T03:15:40Z',
  },
  {
    id: 'EXP-008',
    cve: 'CVE-2025-1974',
    name: 'Kubernetes Ingress-NGINX RCE',
    target: 'K8S-INGRESS-02 (10.0.8.5)',
    technique: 'T1609 — Container Administration Command',
    result: 'success',
    impactLevel: 'high',
    timestamp: '2026-02-09T02:41:55Z',
  },
];

const mockLateralPaths: LateralMovementPath[] = [
  {
    id: 'LAT-001',
    source: 'Workstation WS-042',
    destination: 'Domain Controller DC-01',
    method: 'Pass-the-Hash (NTLM relay)',
    hopsCount: 3,
    timeToCompromise: '4m 12s',
    blocked: false,
    riskScore: 96,
  },
  {
    id: 'LAT-002',
    source: 'Web Server APP-01',
    destination: 'Database DB-PROD-03',
    method: 'SSH Key Re-use',
    hopsCount: 2,
    timeToCompromise: '1m 47s',
    blocked: false,
    riskScore: 89,
  },
  {
    id: 'LAT-003',
    source: 'VPN Gateway VPN-02',
    destination: 'CI/CD Server JENKINS-01',
    method: 'Stolen Service Account Token',
    hopsCount: 4,
    timeToCompromise: '7m 33s',
    blocked: true,
    riskScore: 72,
  },
  {
    id: 'LAT-004',
    source: 'Container Pod frontend-7b',
    destination: 'Secrets Manager VAULT-01',
    method: 'Kubernetes Service Account Abuse',
    hopsCount: 2,
    timeToCompromise: '2m 05s',
    blocked: false,
    riskScore: 93,
  },
  {
    id: 'LAT-005',
    source: 'Dev Laptop DEV-018',
    destination: 'Production S3 Bucket',
    method: 'Cloud IAM Role Chaining',
    hopsCount: 3,
    timeToCompromise: '5m 58s',
    blocked: true,
    riskScore: 67,
  },
  {
    id: 'LAT-006',
    source: 'Printer IOT-PRN-03',
    destination: 'HR Server HR-DB-01',
    method: 'VLAN Hopping + LLMNR Poisoning',
    hopsCount: 5,
    timeToCompromise: '12m 21s',
    blocked: false,
    riskScore: 78,
  },
];

const mockPrivEsc: PrivilegeEscalation[] = [
  {
    id: 'PE-001',
    startPrivilege: 'Standard User',
    achievedPrivilege: 'Domain Admin',
    technique: 'Kerberoasting → Golden Ticket',
    target: 'DC-PROD-01',
    success: true,
    timeSeconds: 127,
    mitigation: 'Enforce AES-only Kerberos, rotate KRBTGT password',
  },
  {
    id: 'PE-002',
    startPrivilege: 'Container User',
    achievedPrivilege: 'Host Root',
    technique: 'Privileged Container Escape (CAP_SYS_ADMIN)',
    target: 'K8S-NODE-03',
    success: true,
    timeSeconds: 34,
    mitigation: 'Remove privileged flag, enforce PodSecurityStandards',
  },
  {
    id: 'PE-003',
    startPrivilege: 'IAM ReadOnly',
    achievedPrivilege: 'AdministratorAccess',
    technique: 'IAM Role Chain via Lambda',
    target: 'AWS Account 491820',
    success: true,
    timeSeconds: 88,
    mitigation: 'Apply least-privilege IAM policies, restrict iam:PassRole',
  },
  {
    id: 'PE-004',
    startPrivilege: 'Local User',
    achievedPrivilege: 'SYSTEM',
    technique: 'Unquoted Service Path Exploitation',
    target: 'WS-FIN-007',
    success: false,
    timeSeconds: 210,
    mitigation: 'Quote all service binary paths, restrict write access',
  },
  {
    id: 'PE-005',
    startPrivilege: 'App Service Identity',
    achievedPrivilege: 'Subscription Owner',
    technique: 'Azure Managed Identity Token Theft',
    target: 'Azure Sub anchor-prod',
    success: true,
    timeSeconds: 62,
    mitigation: 'Restrict managed identity permissions, use Conditional Access',
  },
  {
    id: 'PE-006',
    startPrivilege: 'Guest',
    achievedPrivilege: 'Root',
    technique: 'Sudo Misconfiguration (NOPASSWD wildcard)',
    target: 'LINUX-WEB-04',
    success: true,
    timeSeconds: 8,
    mitigation: 'Audit sudoers file, remove wildcard NOPASSWD entries',
  },
];

const mockMisconfigs: MisconfigExploit[] = [
  {
    id: 'MC-001',
    service: 'AWS S3',
    misconfiguration: 'Public bucket with sensitive PII data',
    exploitMethod: 'Direct anonymous GET requests to bucket objects',
    severity: 'critical',
    exploited: true,
    remediation: 'Enable Block Public Access, apply bucket policy restricting to VPC endpoint',
  },
  {
    id: 'MC-002',
    service: 'Kubernetes',
    misconfiguration: 'Default ServiceAccount with cluster-admin binding',
    exploitMethod: 'Pod token used to access kube-apiserver with full privileges',
    severity: 'critical',
    exploited: true,
    remediation: 'Remove default SA binding, implement RBAC with least privilege',
  },
  {
    id: 'MC-003',
    service: 'PostgreSQL',
    misconfiguration: 'pg_hba.conf allows trust auth from 0.0.0.0/0',
    exploitMethod: 'Remote connection without credentials from any IP',
    severity: 'critical',
    exploited: true,
    remediation: 'Restrict pg_hba.conf to specific CIDRs, require md5/scram-sha-256',
  },
  {
    id: 'MC-004',
    service: 'Nginx',
    misconfiguration: 'Directory listing enabled on /internal/',
    exploitMethod: 'Browse directory to discover config files with embedded secrets',
    severity: 'high',
    exploited: true,
    remediation: 'Set autoindex off, restrict /internal/ with auth_basic or IP allow-list',
  },
  {
    id: 'MC-005',
    service: 'Azure AD',
    misconfiguration: 'Guest users can enumerate all directory objects',
    exploitMethod: 'Graph API calls with guest token to dump user/group data',
    severity: 'medium',
    exploited: false,
    remediation: 'Set guest user access restrictions to "Most restrictive" in External Collaboration',
  },
  {
    id: 'MC-006',
    service: 'Docker Daemon',
    misconfiguration: 'Docker socket exposed on TCP 2375 without TLS',
    exploitMethod: 'Remote Docker API commands to deploy privileged container',
    severity: 'critical',
    exploited: true,
    remediation: 'Disable TCP socket or enable TLS mutual auth, bind to localhost only',
  },
];

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

const SeverityBadge: React.FC<{ level: string }> = ({ level }) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${colors[level] || colors.low}`}>
      {level.toUpperCase()}
    </span>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    running: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    scheduled: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded border ${colors[status] || ''}`}>
      {status === 'running' && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" /></span>}
      {status.toUpperCase()}
    </span>
  );
};

const ResultBadge: React.FC<{ result: string }> = ({ result }) => {
  const colors: Record<string, string> = {
    success: 'bg-red-500/20 text-red-400 border-red-500/30',
    failed: 'bg-green-500/20 text-green-400 border-green-500/30',
    partial: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };
  const labels: Record<string, string> = {
    success: 'EXPLOITED',
    failed: 'BLOCKED',
    partial: 'PARTIAL',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${colors[result] || ''}`}>
      {labels[result] || result.toUpperCase()}
    </span>
  );
};

const ProgressBar: React.FC<{ current: number; total: number; color?: string }> = ({ current, total, color = 'bg-cyan-500' }) => {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tab Content Components
// ---------------------------------------------------------------------------

interface CampaignDashboardProps {
  campaignRunning: boolean;
  isPaused: boolean;
  reportGenerating: boolean;
  onLaunchCampaign: () => void;
  onPauseAll: () => void;
  onGenerateReport: () => void;
}

const CampaignDashboard: React.FC<CampaignDashboardProps> = ({ campaignRunning, isPaused, reportGenerating, onLaunchCampaign, onPauseAll, onGenerateReport }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-white">Active Red Team Campaigns</h3>
      <div className="flex gap-2">
        <button onClick={onLaunchCampaign} disabled={campaignRunning} className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
          {campaignRunning ? '⏳ Running...' : '▶ Launch Campaign'}
        </button>
        <button onClick={onPauseAll} className="px-4 py-1.5 bg-yellow-600/80 hover:bg-yellow-500 text-white text-sm font-medium rounded-lg transition-colors">
          {isPaused ? '▶ Resume All' : '⏸ Pause All'}
        </button>
        <button onClick={onGenerateReport} disabled={reportGenerating} className="px-4 py-1.5 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
          {reportGenerating ? '⏳ Generating...' : '📄 Generate Report'}
        </button>
      </div>
    </div>
    <div className="overflow-x-auto rounded-xl border border-slate-700/60">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Campaign</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Findings</th>
            <th className="px-4 py-3">Severity Breakdown</th>
            <th className="px-4 py-3">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/40">
          {mockCampaigns.map((c) => (
            <tr key={c.id} className="hover:bg-slate-700/50 transition-colors">
              <td className="px-4 py-3 text-cyan-400 font-mono text-xs">{c.id}</td>
              <td className="px-4 py-3 text-white font-medium">
                <div className="flex items-center gap-2">
                  {c.status === 'running' && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" /></span>}
                  {c.name}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-700 text-slate-300 border border-slate-600">
                  {c.type}
                </span>
              </td>
              <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
              <td className="px-4 py-3 w-40">
                <ProgressBar
                  current={c.targetsCompromised}
                  total={c.targetsTotal}
                  color={c.targetsCompromised / c.targetsTotal > 0.3 ? 'bg-red-500' : 'bg-cyan-500'}
                />
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {c.targetsCompromised}/{c.targetsTotal} targets
                </span>
              </td>
              <td className="px-4 py-3 text-white font-semibold">{c.findingsCount}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5">
                  {c.severityDistribution.critical > 0 && (
                    <span className="text-xs text-red-400 font-mono">{c.severityDistribution.critical}C</span>
                  )}
                  {c.severityDistribution.high > 0 && (
                    <span className="text-xs text-orange-400 font-mono">{c.severityDistribution.high}H</span>
                  )}
                  {c.severityDistribution.medium > 0 && (
                    <span className="text-xs text-yellow-400 font-mono">{c.severityDistribution.medium}M</span>
                  )}
                  {c.severityDistribution.low > 0 && (
                    <span className="text-xs text-green-400 font-mono">{c.severityDistribution.low}L</span>
                  )}
                  {c.findingsCount === 0 && <span className="text-xs text-slate-500">—</span>}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs font-mono">{c.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ExploitSimulationTab: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-white">Exploit Simulation Engine</h3>
      <span className="text-xs text-slate-500">
        {mockExploits.filter((e) => e.result === 'success').length}/{mockExploits.length} exploits succeeded — real-world CVE validation
      </span>
    </div>
    <div className="overflow-x-auto rounded-xl border border-slate-700/60">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">CVE</th>
            <th className="px-4 py-3">Exploit Name</th>
            <th className="px-4 py-3">Target</th>
            <th className="px-4 py-3">MITRE ATT&CK</th>
            <th className="px-4 py-3">Result</th>
            <th className="px-4 py-3">Impact</th>
            <th className="px-4 py-3">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/40">
          {mockExploits.map((e) => (
            <tr key={e.id} className="hover:bg-slate-700/50 transition-colors">
              <td className="px-4 py-3 text-cyan-400 font-mono text-xs">{e.id}</td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-red-300 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                  {e.cve}
                </span>
              </td>
              <td className="px-4 py-3 text-white font-medium max-w-55 truncate">{e.name}</td>
              <td className="px-4 py-3 text-slate-300 font-mono text-xs">{e.target}</td>
              <td className="px-4 py-3 text-slate-400 text-xs max-w-50 truncate">{e.technique}</td>
              <td className="px-4 py-3"><ResultBadge result={e.result} /></td>
              <td className="px-4 py-3"><SeverityBadge level={e.impactLevel} /></td>
              <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                {new Date(e.timestamp).toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const LateralMovementTab: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-white">Lateral Movement Path Analysis</h3>
      <span className="text-xs text-slate-500">
        {mockLateralPaths.filter((p) => !p.blocked).length} unblocked paths — immediate remediation required
      </span>
    </div>
    <div className="overflow-x-auto rounded-xl border border-slate-700/60">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Path</th>
            <th className="px-4 py-3">Destination</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Hops</th>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/40">
          {mockLateralPaths.map((p) => (
            <tr key={p.id} className={`hover:bg-slate-700/50 transition-colors ${!p.blocked ? 'bg-red-500/5' : ''}`}>
              <td className="px-4 py-3 text-cyan-400 font-mono text-xs">{p.id}</td>
              <td className="px-4 py-3 text-slate-300 text-xs">{p.source}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: p.hopsCount }).map((_, i) => (
                    <React.Fragment key={i}>
                      <span className={`h-2 w-2 rounded-full ${p.blocked ? 'bg-green-500' : 'bg-red-500'}`} />
                      {i < p.hopsCount - 1 && <span className="h-px w-3 bg-slate-600" />}
                    </React.Fragment>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-white font-medium text-xs">{p.destination}</td>
              <td className="px-4 py-3 text-slate-400 text-xs">{p.method}</td>
              <td className="px-4 py-3 text-center text-slate-300">{p.hopsCount}</td>
              <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.timeToCompromise}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.riskScore >= 90 ? 'bg-red-500' : p.riskScore >= 70 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                      style={{ width: `${p.riskScore}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${p.riskScore >= 90 ? 'text-red-400' : p.riskScore >= 70 ? 'text-orange-400' : 'text-yellow-400'}`}>
                    {p.riskScore}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                {p.blocked ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-500/20 text-green-400 border border-green-500/30">BLOCKED</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">OPEN</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PrivilegeEscalationTab: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-white">Privilege Escalation Testing</h3>
      <span className="text-xs text-slate-500">
        {mockPrivEsc.filter((p) => p.success).length}/{mockPrivEsc.length} escalation paths succeeded
      </span>
    </div>
    <div className="overflow-x-auto rounded-xl border border-slate-700/60">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Start Privilege</th>
            <th className="px-4 py-3">Escalation</th>
            <th className="px-4 py-3">Achieved</th>
            <th className="px-4 py-3">Technique</th>
            <th className="px-4 py-3">Target</th>
            <th className="px-4 py-3">Result</th>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Mitigation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/40">
          {mockPrivEsc.map((p) => (
            <tr key={p.id} className={`hover:bg-slate-700/50 transition-colors ${p.success ? 'bg-red-500/5' : ''}`}>
              <td className="px-4 py-3 text-cyan-400 font-mono text-xs">{p.id}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 text-xs rounded bg-slate-700 text-slate-300 border border-slate-600">
                  {p.startPrivilege}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-slate-500">
                <span className="text-lg">→</span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${p.success ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
                  {p.achievedPrivilege}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-300 text-xs max-w-50 truncate">{p.technique}</td>
              <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.target}</td>
              <td className="px-4 py-3">
                {p.success ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-500/20 text-red-400 border border-red-500/30">ESCALATED</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-500/20 text-green-400 border border-green-500/30">DENIED</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.timeSeconds}s</td>
              <td className="px-4 py-3 text-slate-500 text-xs max-w-55 truncate" title={p.mitigation}>
                {p.mitigation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MisconfigExploitationTab: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-white">Misconfiguration Exploitation</h3>
      <span className="text-xs text-slate-500">
        {mockMisconfigs.filter((m) => m.exploited).length}/{mockMisconfigs.length} misconfigurations successfully exploited
      </span>
    </div>
    <div className="overflow-x-auto rounded-xl border border-slate-700/60">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Misconfiguration</th>
            <th className="px-4 py-3">Exploit Method</th>
            <th className="px-4 py-3">Severity</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Remediation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/40">
          {mockMisconfigs.map((m) => (
            <tr key={m.id} className={`hover:bg-slate-700/50 transition-colors ${m.exploited ? 'bg-red-500/5' : ''}`}>
              <td className="px-4 py-3 text-cyan-400 font-mono text-xs">{m.id}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-700 text-white border border-slate-600">
                  {m.service}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-300 text-xs max-w-55">{m.misconfiguration}</td>
              <td className="px-4 py-3 text-slate-400 text-xs max-w-55">{m.exploitMethod}</td>
              <td className="px-4 py-3"><SeverityBadge level={m.severity} /></td>
              <td className="px-4 py-3">
                {m.exploited ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">EXPLOITED</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-500/20 text-green-400 border border-green-500/30">RESILIENT</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs max-w-65" title={m.remediation}>
                {m.remediation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const AutonomousRedTeam: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('campaigns');
  const [pulse, setPulse] = useState(true);
  const [campaignRunning, setCampaignRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);

  const handleLaunchCampaign = () => {
    setCampaignRunning(true);
    setIsPaused(false);
    // Simulate campaign execution
    setTimeout(() => setCampaignRunning(false), 30000);
  };

  const handlePauseAll = () => {
    setIsPaused(!isPaused);
    if (campaignRunning && !isPaused) {
      setCampaignRunning(false);
    }
  };

  const handleGenerateReport = () => {
    setReportGenerating(true);
    setTimeout(() => {
      setReportGenerating(false);
      // Could trigger download or show report panel
    }, 3000);
  };

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  // Aggregate stats
  const totalCampaigns = mockCampaigns.length;
  const totalFindings = mockCampaigns.reduce((s, c) => s + c.findingsCount, 0);
  const attackPaths = mockLateralPaths.length + mockPrivEsc.filter((p) => p.success).length;
  const avgTime = '4m 38s';
  const criticalFindings =
    mockCampaigns.reduce((s, c) => s + c.severityDistribution.critical, 0) +
    mockExploits.filter((e) => e.impactLevel === 'critical').length;
  const autoRemediated = 23;

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'campaigns', label: 'Campaign Dashboard', icon: '🎯' },
    { key: 'exploits', label: 'Exploit Simulation', icon: '💥' },
    { key: 'lateral', label: 'Lateral Movement', icon: '🔀' },
    { key: 'privesc', label: 'Privilege Escalation', icon: '⬆' },
    { key: 'misconfig', label: 'Misconfig Exploitation', icon: '⚙' },
  ];

  const stats = [
    { label: 'Total Campaigns', value: totalCampaigns, color: 'text-cyan-400' },
    { label: 'Vulnerabilities Found', value: totalFindings, color: 'text-red-400' },
    { label: 'Attack Paths Discovered', value: attackPaths, color: 'text-orange-400' },
    { label: 'Avg Time to Compromise', value: avgTime, color: 'text-yellow-400' },
    { label: 'Critical Findings', value: criticalFindings, color: 'text-red-500' },
    { label: 'Auto-Remediated', value: autoRemediated, color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Autonomous Red Team</h1>
            <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest rounded-full border ${pulse ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'} transition-all duration-700`}>
              WORLD FIRST
            </span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-xs text-red-400 font-medium">LIVE</span>
          </div>
          <p className="text-sm text-slate-400">
            Continuously attacks your infrastructure to find weaknesses before real adversaries do.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleLaunchCampaign} disabled={campaignRunning} className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-red-900/30">
            {campaignRunning ? '⏳ Running...' : '▶ Launch Campaign'}
          </button>
          <button onClick={handlePauseAll} className="px-4 py-2 bg-yellow-600/80 hover:bg-yellow-500 text-white text-sm font-medium rounded-lg transition-colors">
            {isPaused ? '▶ Resume All' : '⏸ Pause All'}
          </button>
          <button onClick={handleGenerateReport} disabled={reportGenerating} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-600">
            {reportGenerating ? '⏳ Generating...' : '📄 Generate Report'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700/60 mb-6">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'text-cyan-400 border-cyan-400 bg-slate-800/60'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800/40 backdrop-blur border border-slate-700/40 rounded-xl p-6">
        {activeTab === 'campaigns' && <CampaignDashboard campaignRunning={campaignRunning} isPaused={isPaused} reportGenerating={reportGenerating} onLaunchCampaign={handleLaunchCampaign} onPauseAll={handlePauseAll} onGenerateReport={handleGenerateReport} />}
        {activeTab === 'exploits' && <ExploitSimulationTab />}
        {activeTab === 'lateral' && <LateralMovementTab />}
        {activeTab === 'privesc' && <PrivilegeEscalationTab />}
        {activeTab === 'misconfig' && <MisconfigExploitationTab />}
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between text-xs text-slate-600">
        <span>Anchor Autonomous Red Team Engine v3.0 — All attacks are sandboxed and non-destructive</span>
        <span>Last full sweep: 2026-02-09 06:14 UTC • Next scheduled: 2026-02-09 12:00 UTC</span>
      </div>
    </div>
  );
};

export default AutonomousRedTeam;
