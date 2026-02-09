// ============================================================================
// ARCHITECTURE DRIFT DETECTION — WORLD-FIRST CONTINUOUS DRIFT ENGINE
// Anchor is the first platform to continuously monitor architecture drift,
// detecting misconfigurations, insecure defaults, forgotten services,
// exposed ports, and dependency drift before attackers exploit them.
// ============================================================================

import React, { useState, useEffect } from 'react';

const tabs = [
  'Drift Overview',
  'Misconfigurations',
  'Exposed Services',
  'Dependency Drift',
  'Baseline Comparison',
];

interface DriftMetric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface Misconfiguration {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  layer: string;
  resource: string;
  currentState: string;
  expectedState: string;
  remediation: string;
  detectedAt: string;
}

interface ExposedService {
  id: string;
  name: string;
  type: 'Forgotten Service' | 'Exposed Port' | 'Shadow API' | 'Unpatched Endpoint' | 'Default Credentials';
  host: string;
  port: number;
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  lastSeen: string;
  details: string;
}

interface DependencyDriftItem {
  id: string;
  package: string;
  currentVersion: string;
  baselineVersion: string;
  latestVersion: string;
  status: 'Outdated' | 'EOL' | 'License Violation' | 'Transitive Risk' | 'Drift';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  ecosystem: string;
}

interface BaselineDeviation {
  id: string;
  component: string;
  attribute: string;
  baseline: string;
  current: string;
  riskScore: number;
  category: string;
}

const driftMetrics: DriftMetric[] = [
  { label: 'Architecture Drift Score', value: '34%', change: '+6% from last week', trend: 'up', color: 'text-pink-400' },
  { label: 'Drifted Configurations', value: 47, change: '+12 new', trend: 'up', color: 'text-orange-400' },
  { label: 'Insecure Defaults Detected', value: 18, change: '+3 since scan', trend: 'up', color: 'text-red-400' },
  { label: 'Forgotten Services', value: 9, change: '2 critical', trend: 'stable', color: 'text-yellow-400' },
  { label: 'Exposed Ports', value: 23, change: '+5 unauthorized', trend: 'up', color: 'text-pink-400' },
  { label: 'Dependency Drift Count', value: 64, change: '11 EOL packages', trend: 'up', color: 'text-cyan-400' },
];

const misconfigurations: Misconfiguration[] = [
  {
    id: 'MC-001', severity: 'Critical', layer: 'Cloud',
    resource: 'aws-s3://prod-data-lake',
    currentState: 'Public read access enabled, no encryption',
    expectedState: 'Private access only, AES-256 encryption',
    remediation: 'Disable public access and enable SSE-S3 encryption on the bucket.',
    detectedAt: '2026-02-09T08:12:00Z',
  },
  {
    id: 'MC-002', severity: 'Critical', layer: 'Network',
    resource: 'firewall-rule/allow-all-inbound',
    currentState: '0.0.0.0/0 allowed on port 22',
    expectedState: 'Restricted to corporate CIDR 10.0.0.0/8',
    remediation: 'Update firewall rule to restrict SSH access to corporate IP ranges.',
    detectedAt: '2026-02-08T23:45:00Z',
  },
  {
    id: 'MC-003', severity: 'High', layer: 'Application',
    resource: 'api-gateway/auth-service',
    currentState: 'Rate limiting disabled, CORS wildcard *',
    expectedState: 'Rate limit 100 req/min, CORS restricted to app domains',
    remediation: 'Enable rate limiting and restrict CORS origins in API gateway config.',
    detectedAt: '2026-02-09T02:30:00Z',
  },
  {
    id: 'MC-004', severity: 'High', layer: 'Cloud',
    resource: 'iam-role/LambdaExecRole',
    currentState: 'AdministratorAccess policy attached',
    expectedState: 'Least-privilege policy with scoped permissions',
    remediation: 'Remove AdministratorAccess and attach a scoped IAM policy.',
    detectedAt: '2026-02-07T14:20:00Z',
  },
  {
    id: 'MC-005', severity: 'Medium', layer: 'Network',
    resource: 'vpc/prod-vpc-01/nacl',
    currentState: 'Outbound rules allow all traffic',
    expectedState: 'Outbound restricted to approved endpoints',
    remediation: 'Update NACL outbound rules to whitelist required destinations.',
    detectedAt: '2026-02-08T11:15:00Z',
  },
  {
    id: 'MC-006', severity: 'Medium', layer: 'Application',
    resource: 'k8s/deployment/billing-api',
    currentState: 'Container running as root, no resource limits',
    expectedState: 'Non-root user, CPU/memory limits defined',
    remediation: 'Set securityContext.runAsNonRoot and define resource limits.',
    detectedAt: '2026-02-09T05:00:00Z',
  },
  {
    id: 'MC-007', severity: 'Low', layer: 'Cloud',
    resource: 'rds/prod-db-cluster',
    currentState: 'Automated backups retention set to 1 day',
    expectedState: 'Minimum 30-day backup retention',
    remediation: 'Increase RDS backup retention period to 30 days.',
    detectedAt: '2026-02-06T09:00:00Z',
  },
];

const exposedServices: ExposedService[] = [
  {
    id: 'ES-001', name: 'Legacy Admin Panel', type: 'Forgotten Service',
    host: '10.2.14.88', port: 8080, risk: 'Critical',
    lastSeen: '2026-02-09T07:55:00Z',
    details: 'Django admin panel from 2023 migration, no authentication enforced.',
  },
  {
    id: 'ES-002', name: 'Debug SMTP Relay', type: 'Exposed Port',
    host: '10.2.14.92', port: 25, risk: 'High',
    lastSeen: '2026-02-09T08:00:00Z',
    details: 'Open SMTP relay on development subnet, reachable from production network.',
  },
  {
    id: 'ES-003', name: '/api/v1/internal/metrics', type: 'Shadow API',
    host: 'api.anchor.io', port: 443, risk: 'High',
    lastSeen: '2026-02-09T06:30:00Z',
    details: 'Undocumented internal metrics endpoint exposed publicly, leaks infra data.',
  },
  {
    id: 'ES-004', name: 'Elasticsearch Cluster', type: 'Unpatched Endpoint',
    host: '10.2.15.20', port: 9200, risk: 'Critical',
    lastSeen: '2026-02-09T08:10:00Z',
    details: 'Elasticsearch 7.10.2 — 4 known CVEs, last patched 18 months ago.',
  },
  {
    id: 'ES-005', name: 'Redis Cache Instance', type: 'Default Credentials',
    host: '10.2.14.101', port: 6379, risk: 'Critical',
    lastSeen: '2026-02-09T07:45:00Z',
    details: 'Redis running without authentication, default config, accessible from VLAN.',
  },
  {
    id: 'ES-006', name: 'Monitoring Grafana', type: 'Forgotten Service',
    host: '10.2.14.60', port: 3000, risk: 'Medium',
    lastSeen: '2026-02-08T22:00:00Z',
    details: 'Grafana v8.3 instance with default admin/admin credentials still active.',
  },
  {
    id: 'ES-007', name: 'Test PostgreSQL', type: 'Exposed Port',
    host: '10.2.16.5', port: 5432, risk: 'High',
    lastSeen: '2026-02-09T04:15:00Z',
    details: 'PostgreSQL test instance reachable from production subnet, pg_hba.conf trust mode.',
  },
];

const dependencyDrift: DependencyDriftItem[] = [
  { id: 'DD-001', package: 'lodash', currentVersion: '4.17.15', baselineVersion: '4.17.21', latestVersion: '4.17.21', status: 'Drift', severity: 'Medium', ecosystem: 'npm' },
  { id: 'DD-002', package: 'openssl', currentVersion: '1.1.1', baselineVersion: '3.0.12', latestVersion: '3.2.1', status: 'EOL', severity: 'Critical', ecosystem: 'system' },
  { id: 'DD-003', package: 'log4j-core', currentVersion: '2.14.1', baselineVersion: '2.23.0', latestVersion: '2.23.0', status: 'Outdated', severity: 'Critical', ecosystem: 'maven' },
  { id: 'DD-004', package: 'flask', currentVersion: '1.1.4', baselineVersion: '3.0.2', latestVersion: '3.0.2', status: 'EOL', severity: 'High', ecosystem: 'pip' },
  { id: 'DD-005', package: 'react', currentVersion: '17.0.2', baselineVersion: '18.2.0', latestVersion: '19.0.0', status: 'Drift', severity: 'Low', ecosystem: 'npm' },
  { id: 'DD-006', package: 'commons-collections', currentVersion: '3.2.1', baselineVersion: '4.4', latestVersion: '4.4', status: 'License Violation', severity: 'High', ecosystem: 'maven' },
  { id: 'DD-007', package: 'event-stream', currentVersion: '4.0.1', baselineVersion: 'REMOVED', latestVersion: 'N/A', status: 'Transitive Risk', severity: 'Critical', ecosystem: 'npm' },
  { id: 'DD-008', package: 'django', currentVersion: '3.2.25', baselineVersion: '5.0.2', latestVersion: '5.0.2', status: 'Outdated', severity: 'Medium', ecosystem: 'pip' },
  { id: 'DD-009', package: 'axios', currentVersion: '0.21.1', baselineVersion: '1.6.7', latestVersion: '1.6.7', status: 'Drift', severity: 'Medium', ecosystem: 'npm' },
];

const baselineDeviations: BaselineDeviation[] = [
  { id: 'BD-001', component: 'API Gateway', attribute: 'TLS Version', baseline: 'TLS 1.3', current: 'TLS 1.2', riskScore: 62, category: 'Encryption' },
  { id: 'BD-002', component: 'Auth Service', attribute: 'MFA Enforcement', baseline: 'Required for all users', current: 'Optional', riskScore: 88, category: 'Access Control' },
  { id: 'BD-003', component: 'Data Pipeline', attribute: 'Encryption at Rest', baseline: 'AES-256-GCM', current: 'None', riskScore: 95, category: 'Encryption' },
  { id: 'BD-004', component: 'Load Balancer', attribute: 'WAF Rules', baseline: 'OWASP Core Rule Set v4', current: 'Custom rules (outdated)', riskScore: 74, category: 'Network' },
  { id: 'BD-005', component: 'Kubernetes Cluster', attribute: 'Pod Security Standards', baseline: 'Restricted', current: 'Baseline', riskScore: 71, category: 'Container' },
  { id: 'BD-006', component: 'CI/CD Pipeline', attribute: 'Image Signing', baseline: 'Cosign with Sigstore', current: 'Disabled', riskScore: 83, category: 'Supply Chain' },
  { id: 'BD-007', component: 'DNS Configuration', attribute: 'DNSSEC', baseline: 'Enabled', current: 'Disabled', riskScore: 58, category: 'Network' },
  { id: 'BD-008', component: 'Logging Service', attribute: 'Log Retention', baseline: '365 days', current: '30 days', riskScore: 67, category: 'Compliance' },
  { id: 'BD-009', component: 'IAM Policy', attribute: 'Role Permissions', baseline: 'Least privilege', current: '14 over-privileged roles', riskScore: 91, category: 'Access Control' },
  { id: 'BD-010', component: 'Database Cluster', attribute: 'Backup Frequency', baseline: 'Every 1 hour', current: 'Every 24 hours', riskScore: 55, category: 'Resilience' },
];

const severityColor = (severity: string) => {
  switch (severity) {
    case 'Critical': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'High': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'Low': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  }
};

const riskScoreColor = (score: number) => {
  if (score >= 85) return 'text-red-400';
  if (score >= 70) return 'text-orange-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-green-400';
};

const riskScoreBarColor = (score: number) => {
  if (score >= 85) return 'bg-red-500';
  if (score >= 70) return 'bg-orange-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

const statusBadge = (status: string) => {
  switch (status) {
    case 'EOL': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'Outdated': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'Drift': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'License Violation': return 'text-pink-400 bg-pink-400/10 border-pink-400/30';
    case 'Transitive Risk': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  }
};

const ArchitectureDrift: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState('2026-02-09T08:14:00Z');

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            setIsScanning(false);
            setLastScan(new Date().toISOString());
            return 0;
          }
          return prev + 2;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleRescan = () => {
    setScanProgress(0);
    setIsScanning(true);
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ---- Drift Overview Tab ----
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {driftMetrics.map((m, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/40 transition-colors">
            <div className="text-sm text-slate-400 mb-1">{m.label}</div>
            <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
            <div className="flex items-center mt-2 text-xs">
              {m.trend === 'up' && <span className="text-red-400 mr-1">▲</span>}
              {m.trend === 'down' && <span className="text-green-400 mr-1">▼</span>}
              {m.trend === 'stable' && <span className="text-slate-400 mr-1">●</span>}
              <span className="text-slate-400">{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Drift Timeline */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Drift Timeline — Last 7 Days</h3>
        <div className="space-y-3">
          {[
            { day: 'Mon', drifts: 38, color: 'bg-yellow-500' },
            { day: 'Tue', drifts: 41, color: 'bg-orange-500' },
            { day: 'Wed', drifts: 35, color: 'bg-yellow-500' },
            { day: 'Thu', drifts: 44, color: 'bg-orange-500' },
            { day: 'Fri', drifts: 39, color: 'bg-yellow-500' },
            { day: 'Sat', drifts: 42, color: 'bg-orange-500' },
            { day: 'Sun', drifts: 47, color: 'bg-red-500' },
          ].map((d) => (
            <div key={d.day} className="flex items-center gap-3">
              <span className="text-slate-400 w-10 text-sm">{d.day}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                <div className={`${d.color} h-full rounded-full transition-all`} style={{ width: `${(d.drifts / 60) * 100}%` }} />
              </div>
              <span className="text-white text-sm w-8 text-right">{d.drifts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Drift by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Drift by Layer</h3>
          {[
            { layer: 'Cloud Infrastructure', count: 19, pct: 40 },
            { layer: 'Network Configuration', count: 12, pct: 26 },
            { layer: 'Application Layer', count: 10, pct: 21 },
            { layer: 'Identity & Access', count: 6, pct: 13 },
          ].map((l) => (
            <div key={l.layer} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{l.layer}</span>
                <span className="text-cyan-400">{l.count} ({l.pct}%)</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${l.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Severity Distribution</h3>
          {[
            { sev: 'Critical', count: 8, color: 'bg-red-500', pct: 17 },
            { sev: 'High', count: 16, color: 'bg-orange-500', pct: 34 },
            { sev: 'Medium', count: 15, color: 'bg-yellow-500', pct: 32 },
            { sev: 'Low', count: 8, color: 'bg-blue-500', pct: 17 },
          ].map((s) => (
            <div key={s.sev} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{s.sev}</span>
                <span className="text-slate-400">{s.count} findings</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className={`${s.color} h-2 rounded-full`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ---- Misconfigurations Tab ----
  const renderMisconfigurations = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Detected Misconfigurations</h3>
        <span className="text-sm text-slate-400">{misconfigurations.length} findings across cloud, network, and application layers</span>
      </div>
      {misconfigurations.map((mc) => (
        <div key={mc.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-pink-500/30 transition-colors">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-white font-mono text-sm">{mc.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${severityColor(mc.severity)}`}>
              {mc.severity}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
              {mc.layer}
            </span>
            <span className="ml-auto text-xs text-slate-500">{formatTimestamp(mc.detectedAt)}</span>
          </div>
          <div className="text-sm text-cyan-400 font-mono mb-3">{mc.resource}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current State</div>
              <div className="text-sm text-red-300 bg-red-400/5 border border-red-400/20 rounded-lg p-3">{mc.currentState}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected State</div>
              <div className="text-sm text-green-300 bg-green-400/5 border border-green-400/20 rounded-lg p-3">{mc.expectedState}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Remediation</div>
            <div className="text-sm text-slate-300">{mc.remediation}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // ---- Exposed Services Tab ----
  const renderExposedServices = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Exposed &amp; Forgotten Services</h3>
        <span className="text-sm text-slate-400">{exposedServices.length} services require attention</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="py-3 px-4 text-slate-400 font-medium">Service</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Type</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Host : Port</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Risk</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {exposedServices.map((es) => (
              <tr key={es.id} className="border-b border-slate-700/50 hover:bg-slate-800/80">
                <td className="py-3 px-4 text-white font-medium">{es.name}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-cyan-300 border border-slate-600">
                    {es.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300 font-mono text-xs">{es.host}:{es.port}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${severityColor(es.risk)}`}>
                    {es.risk}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 text-xs">{formatTimestamp(es.lastSeen)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Details cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {exposedServices.map((es) => (
          <div key={es.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${severityColor(es.risk)}`}>{es.risk}</span>
              <span className="text-white font-medium text-sm">{es.name}</span>
            </div>
            <div className="text-xs text-cyan-400 font-mono mb-2">{es.host}:{es.port}</div>
            <div className="text-sm text-slate-400">{es.details}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ---- Dependency Drift Tab ----
  const renderDependencyDrift = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Dependency Version Drift</h3>
        <span className="text-sm text-slate-400">{dependencyDrift.length} packages drifted from baseline</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="py-3 px-4 text-slate-400 font-medium">Package</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Ecosystem</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Current</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Baseline</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Latest</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Status</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Severity</th>
            </tr>
          </thead>
          <tbody>
            {dependencyDrift.map((dd) => (
              <tr key={dd.id} className="border-b border-slate-700/50 hover:bg-slate-800/80">
                <td className="py-3 px-4 text-cyan-400 font-mono text-xs">{dd.package}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                    {dd.ecosystem}
                  </span>
                </td>
                <td className="py-3 px-4 text-red-300 font-mono text-xs">{dd.currentVersion}</td>
                <td className="py-3 px-4 text-green-300 font-mono text-xs">{dd.baselineVersion}</td>
                <td className="py-3 px-4 text-slate-300 font-mono text-xs">{dd.latestVersion}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(dd.status)}`}>
                    {dd.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${severityColor(dd.severity)}`}>
                    {dd.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {[
          { label: 'Outdated Packages', value: dependencyDrift.filter(d => d.status === 'Outdated').length, color: 'text-orange-400' },
          { label: 'End-of-Life', value: dependencyDrift.filter(d => d.status === 'EOL').length, color: 'text-red-400' },
          { label: 'License Violations', value: dependencyDrift.filter(d => d.status === 'License Violation').length, color: 'text-pink-400' },
          { label: 'Transitive Risks', value: dependencyDrift.filter(d => d.status === 'Transitive Risk').length, color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ---- Baseline Comparison Tab ----
  const renderBaselineComparison = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Baseline vs Current Architecture</h3>
        <span className="text-sm text-slate-400">{baselineDeviations.length} deviations detected</span>
      </div>
      {baselineDeviations.map((bd) => (
        <div key={bd.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/30 transition-colors">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-white font-semibold">{bd.component}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
              {bd.category}
            </span>
            <span className="text-sm text-slate-500 ml-auto">Risk Score:</span>
            <span className={`text-lg font-bold ${riskScoreColor(bd.riskScore)}`}>{bd.riskScore}</span>
          </div>
          <div className="text-sm text-slate-400 mb-3">Attribute: <span className="text-cyan-400">{bd.attribute}</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Approved Baseline</div>
              <div className="text-sm text-green-300 bg-green-400/5 border border-green-400/20 rounded-lg p-3 font-mono">{bd.baseline}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current State</div>
              <div className="text-sm text-red-300 bg-red-400/5 border border-red-400/20 rounded-lg p-3 font-mono">{bd.current}</div>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className={`${riskScoreBarColor(bd.riskScore)} h-2 rounded-full transition-all`} style={{ width: `${bd.riskScore}%` }} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderOverview();
      case 1: return renderMisconfigurations();
      case 2: return renderExposedServices();
      case 3: return renderDependencyDrift();
      case 4: return renderBaselineComparison();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-white">Architecture Drift Detection</h1>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-cyan-500 text-white uppercase tracking-wider animate-pulse">
            WORLD FIRST
          </span>
        </div>
        <p className="text-slate-400 text-sm max-w-3xl">
          Continuously monitors your architecture for configuration drift, insecure defaults,
          forgotten services, exposed ports, and dependency drift — detecting deviations before
          attackers exploit them. The industry's first continuous drift engine.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <button
            onClick={handleRescan}
            disabled={isScanning}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {isScanning ? 'Scanning...' : 'Run Drift Scan'}
          </button>
          <span className="text-xs text-slate-500">Last scan: {formatTimestamp(lastScan)}</span>
          {isScanning && (
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${scanProgress}%` }} />
              </div>
              <span className="text-xs text-cyan-400">{scanProgress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-700 pb-1">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === i
                ? 'bg-slate-800 text-cyan-400 border border-slate-700 border-b-slate-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <span>Anchor Architecture Drift Engine v2.4.0 — Continuous Monitoring Active</span>
        <span>Drift data refreshed every 60 seconds</span>
      </div>
    </div>
  );
};

export default ArchitectureDrift;
