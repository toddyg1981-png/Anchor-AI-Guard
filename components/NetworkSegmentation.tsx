import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

const NetworkSegmentation: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'zones' | 'policies' | 'violations' | 'topology'>('zones');

  const tabs = [
    { key: 'zones' as const, label: 'Zones' },
    { key: 'policies' as const, label: 'Policies' },
    { key: 'violations' as const, label: 'Violations' },
    { key: 'topology' as const, label: 'Topology' },
  ];

  const zones = [
    { name: 'DMZ', trustLevel: 'Low', hosts: 18, vlanId: 10, compliance: 'Compliant', color: 'text-red-400' },
    { name: 'Corporate', trustLevel: 'Medium', hosts: 245, vlanId: 20, compliance: 'Compliant', color: 'text-yellow-400' },
    { name: 'Production', trustLevel: 'High', hosts: 112, vlanId: 30, compliance: 'Compliant', color: 'text-green-400' },
    { name: 'PCI', trustLevel: 'Restricted', hosts: 34, vlanId: 40, compliance: 'Audit Pending', color: 'text-orange-400' },
    { name: 'IoT / OT', trustLevel: 'Untrusted', hosts: 67, vlanId: 50, compliance: 'Non-Compliant', color: 'text-red-500' },
  ];

  const policies = [
    { id: 'pol-1', source: 'Corporate', dest: 'Production', action: 'Allow', protocol: 'HTTPS/443', status: 'Enforced' },
    { id: 'pol-2', source: 'DMZ', dest: 'Corporate', action: 'Deny', protocol: 'ALL', status: 'Enforced' },
    { id: 'pol-3', source: 'Production', dest: 'PCI', action: 'Allow', protocol: 'TCP/5432', status: 'Enforced' },
    { id: 'pol-4', source: 'IoT / OT', dest: 'Corporate', action: 'Deny', protocol: 'ALL', status: 'Enforced' },
    { id: 'pol-5', source: 'Corporate', dest: 'DMZ', action: 'Allow', protocol: 'SSH/22', status: 'Review' },
    { id: 'pol-6', source: 'PCI', dest: 'Production', action: 'Allow', protocol: 'TLS/8443', status: 'Enforced' },
  ];

  const violations = [
    { id: 'v-1', timestamp: '2026-02-07 14:32:08', source: '10.50.3.21', dest: '10.20.1.5', zone: 'IoT → Corporate', severity: 'Critical', detail: 'Unauthorized lateral movement attempt' },
    { id: 'v-2', timestamp: '2026-02-07 13:18:44', source: '10.10.0.88', dest: '10.30.2.12', zone: 'DMZ → Production', severity: 'High', detail: 'Blocked east-west traffic on port 3389' },
    { id: 'v-3', timestamp: '2026-02-07 11:05:19', source: '10.20.4.100', dest: '10.40.1.3', zone: 'Corporate → PCI', severity: 'Medium', detail: 'Non-encrypted connection to PCI segment' },
    { id: 'v-4', timestamp: '2026-02-07 09:47:33', source: '10.50.1.9', dest: '10.30.0.7', zone: 'IoT → Production', severity: 'Critical', detail: 'SCADA device probing production VLAN' },
    { id: 'v-5', timestamp: '2026-02-06 22:11:01', source: '10.20.2.55', dest: '10.10.0.2', zone: 'Corporate → DMZ', severity: 'Low', detail: 'Excessive DNS queries to DMZ resolver' },
  ];

  const topologyLinks = [
    { from: 'DMZ', to: 'Corporate', direction: '→', status: 'Blocked', note: 'Inbound denied' },
    { from: 'Corporate', to: 'Production', direction: '→', status: 'Restricted', note: 'HTTPS only' },
    { from: 'Production', to: 'PCI', direction: '↔', status: 'Restricted', note: 'mTLS + TCP/5432' },
    { from: 'IoT / OT', to: 'Corporate', direction: '→', status: 'Blocked', note: 'Full isolation' },
    { from: 'IoT / OT', to: 'Production', direction: '→', status: 'Blocked', note: 'Full isolation' },
    { from: 'Corporate', to: 'DMZ', direction: '→', status: 'Restricted', note: 'SSH/22 only' },
  ];

  const stats = [
    { label: 'Segments', value: 42 },
    { label: 'Policies', value: 186 },
    { label: 'Violations (24h)', value: 9 },
    { label: 'Auto Blocks', value: 7 },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      await backendApi.modules.getDashboard('network-segmentation');
    } catch {
      // use local data
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setAnalysisResult(null);
      const res = await backendApi.modules.analyze(
        'network-segmentation',
        'Analyze network segmentation gaps and micro-segmentation opportunities'
      );
      setAnalysisResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch {
      setAnalysisResult('AI analysis unavailable — check backend connectivity.');
    } finally {
      setAnalyzing(false);
    }
  };

  const severityColor = (s: string) => {
    switch (s) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-rose-400 to-orange-400">Network Segmentation</h1>
          <p className="text-slate-400">Micro-segmentation, zero trust policies, and lateral movement prevention.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={analyzing} className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
            {analyzing ? 'Analyzing…' : '🤖 AI Analysis'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Enforcement: Inline</div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-white border border-slate-700 border-b-0' : 'text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Zones Tab */}
      {activeTab === 'zones' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold mb-2">Network Zones</h2>
          {zones.map(z => (
            <div key={z.name} className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${z.color}`}>{z.name}</span>
                <span className="text-xs text-slate-500">VLAN {z.vlanId}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center"><div className="text-slate-500 text-xs">Trust</div><div className={z.color}>{z.trustLevel}</div></div>
                <div className="text-center"><div className="text-slate-500 text-xs">Hosts</div><div>{z.hosts}</div></div>
                <div className="text-center"><div className="text-slate-500 text-xs">Compliance</div><div className={z.compliance === 'Compliant' ? 'text-green-400' : z.compliance === 'Audit Pending' ? 'text-yellow-400' : 'text-red-400'}>{z.compliance}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Firewall & Micro-Segmentation Policies</h2>
            <span className="text-xs text-slate-400">{policies.length} rules</span>
          </div>
          {policies.map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{p.source}</span>
                <span className="text-slate-500">→</span>
                <span className="font-semibold text-slate-200">{p.dest}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400">{p.protocol}</span>
                <span className={p.action === 'Allow' ? 'text-green-400' : 'text-red-400'}>{p.action}</span>
                <span className={p.status === 'Enforced' ? 'text-green-300' : 'text-yellow-400'}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold mb-2">Recent Policy Violations</h2>
          {violations.map(v => (
            <div key={v.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${severityColor(v.severity)}`}>{v.severity}</span>
                <span className="text-xs text-slate-500">{v.timestamp}</span>
              </div>
              <div className="text-slate-300">{v.detail}</div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{v.source} → {v.dest}</span>
                <span className="text-slate-600">|</span>
                <span>{v.zone}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Topology Tab */}
      {activeTab === 'topology' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold mb-2">Zone Interconnections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topologyLinks.map((link, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-cyan-400">{link.from}</span>
                  <span className="text-slate-500">{link.direction}</span>
                  <span className="font-semibold text-cyan-400">{link.to}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={link.status === 'Blocked' ? 'text-red-400' : 'text-yellow-400'}>{link.status}</span>
                  <span className="text-slate-500">{link.note}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center text-slate-500 text-sm">
            <p className="mb-1 font-medium text-slate-300">Topology Summary</p>
            <p>5 zones &middot; 6 inter-zone links &middot; 3 fully isolated paths &middot; mTLS on all restricted channels</p>
          </div>
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="bg-slate-800 border border-cyan-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-cyan-400">🤖 AI Analysis</h2>
            <button onClick={() => setAnalysisResult(null)} className="text-xs text-slate-500 hover:text-slate-300">Dismiss</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default NetworkSegmentation;
