// ============================================================================
// DATA TRUST ENGINE — WORLD-FIRST DATA INTEGRITY VERIFICATION
// Anchor is the first platform to treat data itself as an attack surface,
// verifying trust across all data flows including datasets, training data,
// logs, backups, and data pipelines with cryptographic integrity proofs.
// ============================================================================

import React, { useState, useEffect } from 'react';

const TABS = [
  'Trust Overview',
  'Dataset Integrity',
  'Log Verification',
  'Backup Trust',
  'Data Flow Map',
] as const;

type Tab = (typeof TABS)[number];

interface TrustScore {
  label: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  delta: number;
}

interface DataFlow {
  id: string;
  source: string;
  destination: string;
  verified: boolean;
  trustScore: number;
  lastChecked: string;
  volume: string;
}

interface DatasetRecord {
  id: string;
  name: string;
  hash: string;
  lineageDepth: number;
  poisonRisk: 'low' | 'medium' | 'high' | 'critical';
  anomalies: number;
  lastVerified: string;
  status: 'verified' | 'suspicious' | 'compromised';
}

interface LogEntry {
  id: string;
  source: string;
  chainIntegrity: boolean;
  missingSegments: number;
  injectionAttempts: number;
  lastBlock: string;
  status: 'intact' | 'tampered' | 'gap-detected';
}

interface BackupRecord {
  id: string;
  name: string;
  integrity: 'verified' | 'corrupted' | 'suspicious';
  ransomwareCheck: 'clean' | 'detected' | 'scanning';
  chainValid: boolean;
  recoveryPoint: string;
  size: string;
}

interface FlowNode {
  id: string;
  label: string;
  type: 'source' | 'transform' | 'sink' | 'storage';
  trustScore: number;
  status: 'trusted' | 'degraded' | 'untrusted';
}

interface FlowEdge {
  from: string;
  to: string;
  trustScore: number;
  encrypted: boolean;
}

// --------------- Mock Data ---------------

const trustScores: TrustScore[] = [
  { label: 'Overall Data Trust', score: 94.2, trend: 'up', delta: 1.3 },
  { label: 'Pipeline Integrity', score: 97.8, trend: 'stable', delta: 0.0 },
  { label: 'Training Data Trust', score: 88.5, trend: 'down', delta: -2.1 },
  { label: 'Log Authenticity', score: 99.1, trend: 'up', delta: 0.4 },
];

const dataFlows: DataFlow[] = [
  { id: 'df-001', source: 'Ingestion Gateway', destination: 'Feature Store', verified: true, trustScore: 98, lastChecked: '2 min ago', volume: '14.2 GB/hr' },
  { id: 'df-002', source: 'Feature Store', destination: 'Model Training', verified: true, trustScore: 91, lastChecked: '5 min ago', volume: '8.7 GB/hr' },
  { id: 'df-003', source: 'External API', destination: 'Data Lake', verified: false, trustScore: 62, lastChecked: '18 min ago', volume: '3.1 GB/hr' },
  { id: 'df-004', source: 'User Telemetry', destination: 'Analytics DB', verified: true, trustScore: 96, lastChecked: '1 min ago', volume: '22.5 GB/hr' },
  { id: 'df-005', source: 'Backup Agent', destination: 'Cold Storage', verified: true, trustScore: 99, lastChecked: '30 sec ago', volume: '5.0 GB/hr' },
  { id: 'df-006', source: 'Third-Party Feed', destination: 'Staging', verified: false, trustScore: 47, lastChecked: '42 min ago', volume: '1.8 GB/hr' },
];

const integrityViolations = [
  { id: 'iv-01', type: 'Hash Mismatch', target: 'training-set-v4.parquet', severity: 'critical', detected: '12 min ago' },
  { id: 'iv-02', type: 'Schema Drift', target: 'user_events table', severity: 'high', detected: '34 min ago' },
  { id: 'iv-03', type: 'Unexpected Mutation', target: 'config/feature_flags.json', severity: 'medium', detected: '1 hr ago' },
  { id: 'iv-04', type: 'Unauthorized Access', target: 'model-weights-prod.bin', severity: 'high', detected: '2 hr ago' },
];

const datasets: DatasetRecord[] = [
  { id: 'ds-001', name: 'threat-intel-corpus-v7', hash: 'sha256:a3f8c1...e92d', lineageDepth: 12, poisonRisk: 'low', anomalies: 0, lastVerified: '3 min ago', status: 'verified' },
  { id: 'ds-002', name: 'network-flow-training', hash: 'sha256:b7d2e4...f10a', lineageDepth: 8, poisonRisk: 'medium', anomalies: 3, lastVerified: '15 min ago', status: 'suspicious' },
  { id: 'ds-003', name: 'malware-signatures-2026', hash: 'sha256:c9e1f7...d83b', lineageDepth: 5, poisonRisk: 'low', anomalies: 0, lastVerified: '1 min ago', status: 'verified' },
  { id: 'ds-004', name: 'user-behavior-baseline', hash: 'sha256:d4a6b2...c45e', lineageDepth: 18, poisonRisk: 'high', anomalies: 14, lastVerified: '47 min ago', status: 'compromised' },
  { id: 'ds-005', name: 'phishing-nlp-embeddings', hash: 'sha256:e2c8d5...a17f', lineageDepth: 9, poisonRisk: 'low', anomalies: 1, lastVerified: '6 min ago', status: 'verified' },
  { id: 'ds-006', name: 'dns-anomaly-features', hash: 'sha256:f1b3a9...b26c', lineageDepth: 14, poisonRisk: 'critical', anomalies: 27, lastVerified: '1 hr ago', status: 'compromised' },
];

const logEntries: LogEntry[] = [
  { id: 'lg-001', source: 'Firewall Cluster A', chainIntegrity: true, missingSegments: 0, injectionAttempts: 0, lastBlock: '#4,891,203', status: 'intact' },
  { id: 'lg-002', source: 'Auth Service', chainIntegrity: true, missingSegments: 0, injectionAttempts: 2, lastBlock: '#12,447,891', status: 'intact' },
  { id: 'lg-003', source: 'DNS Resolver', chainIntegrity: false, missingSegments: 3, injectionAttempts: 0, lastBlock: '#892,104', status: 'gap-detected' },
  { id: 'lg-004', source: 'WAF Edge Nodes', chainIntegrity: true, missingSegments: 0, injectionAttempts: 0, lastBlock: '#7,331,089', status: 'intact' },
  { id: 'lg-005', source: 'SIEM Collector', chainIntegrity: false, missingSegments: 0, injectionAttempts: 5, lastBlock: '#21,009,445', status: 'tampered' },
  { id: 'lg-006', source: 'Endpoint Agent Fleet', chainIntegrity: true, missingSegments: 1, injectionAttempts: 0, lastBlock: '#3,210,778', status: 'gap-detected' },
];

const backups: BackupRecord[] = [
  { id: 'bk-001', name: 'prod-db-daily-20260209', integrity: 'verified', ransomwareCheck: 'clean', chainValid: true, recoveryPoint: '2026-02-09 00:00 UTC', size: '248 GB' },
  { id: 'bk-002', name: 'config-vault-hourly', integrity: 'verified', ransomwareCheck: 'clean', chainValid: true, recoveryPoint: '2026-02-09 06:00 UTC', size: '1.2 GB' },
  { id: 'bk-003', name: 'ml-models-weekly', integrity: 'suspicious', ransomwareCheck: 'scanning', chainValid: false, recoveryPoint: '2026-02-07 12:00 UTC', size: '84 GB' },
  { id: 'bk-004', name: 'log-archive-monthly', integrity: 'verified', ransomwareCheck: 'clean', chainValid: true, recoveryPoint: '2026-02-01 00:00 UTC', size: '1.4 TB' },
  { id: 'bk-005', name: 'disaster-recovery-full', integrity: 'corrupted', ransomwareCheck: 'detected', chainValid: false, recoveryPoint: '2026-02-08 18:00 UTC', size: '3.2 TB' },
];

const flowNodes: FlowNode[] = [
  { id: 'n1', label: 'External APIs', type: 'source', trustScore: 61, status: 'degraded' },
  { id: 'n2', label: 'Ingestion', type: 'transform', trustScore: 95, status: 'trusted' },
  { id: 'n3', label: 'Validation', type: 'transform', trustScore: 99, status: 'trusted' },
  { id: 'n4', label: 'Data Lake', type: 'storage', trustScore: 97, status: 'trusted' },
  { id: 'n5', label: 'Feature Eng.', type: 'transform', trustScore: 92, status: 'trusted' },
  { id: 'n6', label: 'Model Training', type: 'sink', trustScore: 88, status: 'degraded' },
  { id: 'n7', label: 'Inference API', type: 'sink', trustScore: 94, status: 'trusted' },
  { id: 'n8', label: 'Cold Archive', type: 'storage', trustScore: 45, status: 'untrusted' },
];

const flowEdges: FlowEdge[] = [
  { from: 'n1', to: 'n2', trustScore: 61, encrypted: true },
  { from: 'n2', to: 'n3', trustScore: 95, encrypted: true },
  { from: 'n3', to: 'n4', trustScore: 97, encrypted: true },
  { from: 'n4', to: 'n5', trustScore: 94, encrypted: true },
  { from: 'n5', to: 'n6', trustScore: 88, encrypted: true },
  { from: 'n5', to: 'n7', trustScore: 93, encrypted: true },
  { from: 'n4', to: 'n8', trustScore: 45, encrypted: false },
];

// --------------- Helpers ---------------

const trustColor = (score: number): string => {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
};

const trustBg = (score: number): string => {
  if (score >= 90) return 'bg-emerald-500/20 border-emerald-500/40';
  if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/40';
  if (score >= 50) return 'bg-orange-500/20 border-orange-500/40';
  return 'bg-red-500/20 border-red-500/40';
};

const severityBadge = (sev: string) => {
  const map: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border border-red-500/40',
    high: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
    medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    low: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  };
  return map[sev] || 'bg-slate-700 text-slate-300';
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    verified: 'bg-emerald-500/20 text-emerald-400',
    suspicious: 'bg-yellow-500/20 text-yellow-400',
    compromised: 'bg-red-500/20 text-red-400',
    intact: 'bg-emerald-500/20 text-emerald-400',
    tampered: 'bg-red-500/20 text-red-400',
    'gap-detected': 'bg-orange-500/20 text-orange-400',
    clean: 'bg-emerald-500/20 text-emerald-400',
    detected: 'bg-red-500/20 text-red-400',
    scanning: 'bg-cyan-500/20 text-cyan-400',
    corrupted: 'bg-red-500/20 text-red-400',
  };
  return map[status] || 'bg-slate-700 text-slate-300';
};

const trendIcon = (t: 'up' | 'down' | 'stable') => {
  if (t === 'up') return '▲';
  if (t === 'down') return '▼';
  return '—';
};

const trendColor = (t: 'up' | 'down' | 'stable') => {
  if (t === 'up') return 'text-emerald-400';
  if (t === 'down') return 'text-red-400';
  return 'text-slate-400';
};

// --------------- Component ---------------

const DataTrustEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Trust Overview');
  const [overallTrust, setOverallTrust] = useState(0);
  const [verifiedFlows, setVerifiedFlows] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    // Animate the overall trust score on mount
    const target = 94.2;
    let current = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setOverallTrust(parseFloat(current.toFixed(1)));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const verified = dataFlows.filter((f) => f.verified).length;
    setVerifiedFlows(verified);
  }, []);

  useEffect(() => {
    // Simulate a continuous background scan
    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 100 ? 0 : prev + 0.4));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // ---- Tab renderers ----

  const renderTrustOverview = () => (
    <div className="space-y-6">
      {/* Score cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trustScores.map((ts) => (
          <div key={ts.label} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <p className="text-sm text-slate-400 mb-1">{ts.label}</p>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold ${trustColor(ts.score)}`}>{ts.score}%</span>
              <span className={`text-xs font-medium ${trendColor(ts.trend)} mb-1`}>
                {trendIcon(ts.trend)} {ts.delta > 0 ? '+' : ''}{ts.delta}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Data Flows */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Data Flow Trust Status</h3>
          <span className="text-sm text-slate-400">{verifiedFlows}/{dataFlows.length} verified</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-2 pr-4">Source</th>
                <th className="pb-2 pr-4">Destination</th>
                <th className="pb-2 pr-4">Trust</th>
                <th className="pb-2 pr-4">Verified</th>
                <th className="pb-2 pr-4">Volume</th>
                <th className="pb-2">Last Checked</th>
              </tr>
            </thead>
            <tbody>
              {dataFlows.map((flow) => (
                <tr key={flow.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                  <td className="py-3 pr-4 text-white">{flow.source}</td>
                  <td className="py-3 pr-4 text-slate-300">{flow.destination}</td>
                  <td className="py-3 pr-4">
                    <span className={`font-mono font-bold ${trustColor(flow.trustScore)}`}>{flow.trustScore}%</span>
                  </td>
                  <td className="py-3 pr-4">
                    {flow.verified ? (
                      <span className="text-emerald-400 text-xs font-medium bg-emerald-500/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                    ) : (
                      <span className="text-red-400 text-xs font-medium bg-red-500/20 px-2 py-0.5 rounded-full">✗ Unverified</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-slate-300 font-mono text-xs">{flow.volume}</td>
                  <td className="py-3 text-slate-400 text-xs">{flow.lastChecked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrity Violations */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Integrity Violations</h3>
        <div className="space-y-3">
          {integrityViolations.map((v) => (
            <div key={v.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityBadge(v.severity)}`}>{v.severity.toUpperCase()}</span>
                <div>
                  <p className="text-white text-sm font-medium">{v.type}</p>
                  <p className="text-slate-400 text-xs">{v.target}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500">{v.detected}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Chain Visualization */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Trust Chain Visualization</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['Root CA', 'Intermediate', 'Data Origin', 'Transform', 'Validation', 'Storage', 'Delivery'].map((step, i) => (
            <React.Fragment key={step}>
              <div className={`flex-shrink-0 px-4 py-2 rounded-lg border text-xs font-medium ${i < 5 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'}`}>
                {step}
              </div>
              {i < 6 && <span className="text-slate-500 flex-shrink-0">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDatasetIntegrity = () => (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Datasets Monitored</p>
          <p className="text-2xl font-bold text-white mt-1">{datasets.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Verified Clean</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{datasets.filter((d) => d.status === 'verified').length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Suspicious</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{datasets.filter((d) => d.status === 'suspicious').length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Compromised</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{datasets.filter((d) => d.status === 'compromised').length}</p>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Dataset Integrity Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-2 pr-4">Dataset</th>
                <th className="pb-2 pr-4">Hash</th>
                <th className="pb-2 pr-4">Lineage</th>
                <th className="pb-2 pr-4">Poison Risk</th>
                <th className="pb-2 pr-4">Anomalies</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Verified</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((ds) => (
                <tr key={ds.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                  <td className="py-3 pr-4 text-white font-medium">{ds.name}</td>
                  <td className="py-3 pr-4 text-slate-400 font-mono text-xs">{ds.hash}</td>
                  <td className="py-3 pr-4 text-cyan-400 font-mono">{ds.lineageDepth} hops</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityBadge(ds.poisonRisk)}`}>{ds.poisonRisk.toUpperCase()}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={ds.anomalies > 0 ? 'text-pink-400 font-bold' : 'text-slate-400'}>{ds.anomalies}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(ds.status)}`}>{ds.status}</span>
                  </td>
                  <td className="py-3 text-slate-400 text-xs">{ds.lastVerified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anomaly Detection Panel */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-3">Anomaly Detection — Data Patterns</h3>
        <p className="text-sm text-slate-400 mb-4">Statistical deviation analysis across monitored datasets. Patterns exceeding 2σ threshold are flagged.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Distribution Shift', count: 4, color: 'text-orange-400' },
            { label: 'Label Flipping', count: 1, color: 'text-red-400' },
            { label: 'Feature Injection', count: 0, color: 'text-emerald-400' },
          ].map((a) => (
            <div key={a.label} className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">{a.label}</p>
              <p className={`text-2xl font-bold mt-1 ${a.color}`}>{a.count} detected</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLogVerification = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Log Sources</p>
          <p className="text-2xl font-bold text-white mt-1">{logEntries.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Chain Intact</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{logEntries.filter((l) => l.chainIntegrity).length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Missing Segments</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{logEntries.reduce((s, l) => s + l.missingSegments, 0)}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Injection Attempts</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{logEntries.reduce((s, l) => s + l.injectionAttempts, 0)}</p>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Tamper-Proof Log Chain Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-2 pr-4">Source</th>
                <th className="pb-2 pr-4">Chain Integrity</th>
                <th className="pb-2 pr-4">Missing</th>
                <th className="pb-2 pr-4">Injections</th>
                <th className="pb-2 pr-4">Last Block</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {logEntries.map((le) => (
                <tr key={le.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                  <td className="py-3 pr-4 text-white font-medium">{le.source}</td>
                  <td className="py-3 pr-4">
                    {le.chainIntegrity ? (
                      <span className="text-emerald-400">✓ Valid</span>
                    ) : (
                      <span className="text-red-400">✗ Broken</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={le.missingSegments > 0 ? 'text-orange-400 font-bold' : 'text-slate-400'}>{le.missingSegments}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={le.injectionAttempts > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>{le.injectionAttempts}</span>
                  </td>
                  <td className="py-3 pr-4 text-cyan-400 font-mono text-xs">{le.lastBlock}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(le.status)}`}>{le.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Injection Detail */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-3">Log Injection Detection</h3>
        <p className="text-sm text-slate-400 mb-4">Real-time detection of forged, replayed, or injected log entries using cryptographic chain verification and semantic analysis.</p>
        <div className="space-y-3">
          {[
            { source: 'Auth Service', type: 'Replay Attack', detail: 'Duplicate block hash detected at position #12,447,802', time: '14 min ago' },
            { source: 'Auth Service', type: 'Timestamp Manipulation', detail: 'Non-monotonic timestamp at block #12,447,815', time: '11 min ago' },
            { source: 'SIEM Collector', type: 'Payload Injection', detail: 'Unexpected schema fields injected in structured log entry', time: '28 min ago' },
            { source: 'SIEM Collector', type: 'Format String Attack', detail: 'Log entry contains format specifiers %x%n in message field', time: '25 min ago' },
            { source: 'SIEM Collector', type: 'Source Spoofing', detail: 'Origin IP mismatch between log header and transport metadata', time: '19 min ago' },
          ].map((inj, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-900/60 border border-red-500/20 rounded-lg p-3">
              <span className="mt-0.5 text-red-400 text-lg">⚠</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">{inj.type}</span>
                  <span className="text-xs text-slate-500">— {inj.source}</span>
                </div>
                <p className="text-xs text-slate-400">{inj.detail}</p>
              </div>
              <span className="text-xs text-slate-500 mt-0.5">{inj.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBackupTrust = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Total Backups</p>
          <p className="text-2xl font-bold text-white mt-1">{backups.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Integrity Verified</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{backups.filter((b) => b.integrity === 'verified').length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Ransomware Detected</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{backups.filter((b) => b.ransomwareCheck === 'detected').length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">Chain Breaks</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{backups.filter((b) => !b.chainValid).length}</p>
        </div>
      </div>

      {/* Backup Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Backup Integrity Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-2 pr-4">Backup Name</th>
                <th className="pb-2 pr-4">Integrity</th>
                <th className="pb-2 pr-4">Ransomware</th>
                <th className="pb-2 pr-4">Chain Valid</th>
                <th className="pb-2 pr-4">Recovery Point</th>
                <th className="pb-2">Size</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((bk) => (
                <tr key={bk.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                  <td className="py-3 pr-4 text-white font-medium">{bk.name}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(bk.integrity)}`}>{bk.integrity}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(bk.ransomwareCheck)}`}>{bk.ransomwareCheck}</span>
                  </td>
                  <td className="py-3 pr-4">
                    {bk.chainValid ? (
                      <span className="text-emerald-400">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-cyan-400 font-mono text-xs">{bk.recoveryPoint}</td>
                  <td className="py-3 text-slate-300 font-mono text-xs">{bk.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recovery Point Verification */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-3">Recovery Point Verification</h3>
        <p className="text-sm text-slate-400 mb-4">Cryptographic proof that each recovery point can restore to a known-good state. Failed verifications indicate potential ransomware encryption or silent corruption.</p>
        <div className="space-y-3">
          {backups.map((bk) => (
            <div key={bk.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${bk.integrity === 'verified' ? 'bg-emerald-400' : bk.integrity === 'corrupted' ? 'bg-red-400 animate-pulse' : 'bg-yellow-400 animate-pulse'}`} />
                <div>
                  <p className="text-sm text-white font-medium">{bk.name}</p>
                  <p className="text-xs text-slate-400">{bk.recoveryPoint} — {bk.size}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${bk.integrity === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : bk.integrity === 'corrupted' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {bk.integrity === 'verified' ? 'Restore Ready' : bk.integrity === 'corrupted' ? 'Restore Blocked' : 'Requires Review'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataFlowMap = () => (
    <div className="space-y-6">
      {/* Flow Map Visual */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-2">Data Flow Trust Map</h3>
        <p className="text-sm text-slate-400 mb-5">Visual representation of data flows with trust scores at each node. Red indicators show where data trust breaks down.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 py-4">
          {flowNodes.map((node, i) => (
            <React.Fragment key={node.id}>
              <div className={`border rounded-xl p-4 min-w-[130px] text-center ${trustBg(node.trustScore)}`}>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{node.type}</p>
                <p className="text-sm text-white font-semibold">{node.label}</p>
                <p className={`text-lg font-bold mt-1 ${trustColor(node.trustScore)}`}>{node.trustScore}%</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${statusBadge(node.status)}`}>{node.status}</span>
              </div>
              {i < flowNodes.length - 1 && (
                <span className="text-slate-500 text-xl hidden md:inline">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Edge Details */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Flow Edge Trust Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-2 pr-4">From</th>
                <th className="pb-2 pr-4">To</th>
                <th className="pb-2 pr-4">Trust Score</th>
                <th className="pb-2 pr-4">Encrypted</th>
                <th className="pb-2">Risk</th>
              </tr>
            </thead>
            <tbody>
              {flowEdges.map((edge, i) => {
                const fromNode = flowNodes.find((n) => n.id === edge.from);
                const toNode = flowNodes.find((n) => n.id === edge.to);
                return (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                    <td className="py-3 pr-4 text-white">{fromNode?.label}</td>
                    <td className="py-3 pr-4 text-slate-300">{toNode?.label}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${edge.trustScore >= 90 ? 'bg-emerald-400' : edge.trustScore >= 70 ? 'bg-yellow-400' : edge.trustScore >= 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                            style={{ width: `${edge.trustScore}%` }}
                          />
                        </div>
                        <span className={`font-mono font-bold text-xs ${trustColor(edge.trustScore)}`}>{edge.trustScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {edge.encrypted ? (
                        <span className="text-emerald-400 text-xs">🔒 Yes</span>
                      ) : (
                        <span className="text-red-400 text-xs">🔓 No</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${edge.trustScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' : edge.trustScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {edge.trustScore >= 90 ? 'Low' : edge.trustScore >= 70 ? 'Medium' : 'High'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Breakdown Alerts */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-3">Trust Breakdown Alerts</h3>
        <div className="space-y-3">
          {[
            { path: 'External APIs → Ingestion', issue: 'Unvalidated TLS certificates on 2 of 7 external endpoints', severity: 'high' },
            { path: 'Data Lake → Cold Archive', issue: 'Unencrypted transfer channel — data in transit is not protected', severity: 'critical' },
            { path: 'Feature Eng. → Model Training', issue: 'Feature drift detected — 3 features exceed baseline std deviation by 4σ', severity: 'medium' },
          ].map((alert, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-900/60 border border-slate-700/50 rounded-lg p-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${severityBadge(alert.severity)}`}>{alert.severity.toUpperCase()}</span>
              <div>
                <p className="text-sm text-white font-medium">{alert.path}</p>
                <p className="text-xs text-slate-400 mt-0.5">{alert.issue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'Trust Overview':
        return renderTrustOverview();
      case 'Dataset Integrity':
        return renderDatasetIntegrity();
      case 'Log Verification':
        return renderLogVerification();
      case 'Backup Trust':
        return renderBackupTrust();
      case 'Data Flow Map':
        return renderDataFlowMap();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Data Trust Engine</h1>
          <span className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
            World First
          </span>
        </div>
        <p className="text-slate-400 max-w-3xl">
          The first platform to treat data itself as an attack surface — verifying trust across all data flows including
          datasets, training data, logs, backups, and data pipelines with cryptographic integrity proofs.
        </p>

        {/* Live scan bar */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Continuous Scan</span>
          <div className="flex-1 max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-100"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <span className="text-xs text-cyan-400 font-mono">{scanProgress.toFixed(0)}%</span>
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs text-emerald-400">LIVE</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-700 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-slate-800 text-cyan-400 border border-slate-700 border-b-transparent -mb-px'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTab()}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
        <span>Data Trust Engine v2.4.0 — Anchor Security Platform</span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          All systems operational — Last full scan: 47 seconds ago
        </span>
      </div>
    </div>
  );
};

export default DataTrustEngine;
