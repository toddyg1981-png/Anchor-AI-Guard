import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

const AssetInventory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'discovery' | 'classification' | 'compliance'>('inventory');

  const tabs = [
    { key: 'inventory' as const, label: 'Inventory' },
    { key: 'discovery' as const, label: 'Discovery' },
    { key: 'classification' as const, label: 'Classification' },
    { key: 'compliance' as const, label: 'Compliance' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      await backendApi.modules.getDashboard('asset-inventory');
    } catch (err) {
      logger.error('Failed to load asset inventory dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setAnalysisResult(null);
      const res = await backendApi.modules.analyze('asset-inventory', 'Analyze asset inventory for shadow IT, unmanaged devices, and classification gaps');
      setAnalysisResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch (err) {
      setAnalysisResult('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const stats = [
    { label: 'Total Assets', value: '12,842' },
    { label: 'Unmanaged', value: '54' },
    { label: 'Critical Risk', value: '622' },
    { label: 'New (24h)', value: '38' },
  ];

  const assets = [
    { id: 'a-1', name: 'prod-api-01', type: 'Server', ip: '10.0.1.12', os: 'Ubuntu 22.04', owner: 'Platform Team', risk: 'Low', lastScanned: '2 min ago' },
    { id: 'a-2', name: 'win-ws-0184', type: 'Endpoint', ip: '10.0.5.84', os: 'Windows 11', owner: 'J. Martinez', risk: 'Medium', lastScanned: '18 min ago' },
    { id: 'a-3', name: 'iot-hvac-03', type: 'IoT Device', ip: '10.0.9.3', os: 'Embedded Linux', owner: 'Facilities', risk: 'High', lastScanned: '1 hr ago' },
    { id: 'a-4', name: 'aws-lambda-auth', type: 'Cloud Resource', ip: 'N/A', os: 'AWS Lambda', owner: 'Identity Team', risk: 'Low', lastScanned: '5 min ago' },
    { id: 'a-5', name: 'core-switch-02', type: 'Network Gear', ip: '10.0.0.2', os: 'Cisco IOS-XE', owner: 'Network Ops', risk: 'Medium', lastScanned: '32 min ago' },
    { id: 'a-6', name: 'k8s-node-07', type: 'Server', ip: '10.0.2.47', os: 'Container-Optimized OS', owner: 'Platform Team', risk: 'Low', lastScanned: '1 min ago' },
  ];

  const discoveryResults = [
    { id: 'd-1', name: 'unknown-device-10.0.8.44', ip: '10.0.8.44', detectedAt: '12 min ago', method: 'Network Scan', status: 'New' },
    { id: 'd-2', name: 'rogue-ap-lobby', ip: '10.0.11.2', detectedAt: '48 min ago', method: 'Wireless Probe', status: 'New' },
    { id: 'd-3', name: 'personal-nas-drive', ip: '10.0.5.119', detectedAt: '2 hr ago', method: 'ARP Discovery', status: 'Flagged' },
    { id: 'd-4', name: 'staging-db-mirror', ip: '10.0.3.88', detectedAt: '4 hr ago', method: 'Cloud API Sync', status: 'Pending Review' },
  ];

  const classificationData = [
    { id: 'c-1', asset: 'prod-api-01', dataTypes: 'PII, Auth Tokens', classification: 'Confidential', reviewed: true },
    { id: 'c-2', asset: 'win-ws-0184', dataTypes: 'Documents, Email', classification: 'Internal', reviewed: true },
    { id: 'c-3', asset: 'aws-lambda-auth', dataTypes: 'OAuth Secrets', classification: 'Confidential', reviewed: true },
    { id: 'c-4', asset: 'core-switch-02', dataTypes: 'Configs, Logs', classification: 'Internal', reviewed: false },
    { id: 'c-5', asset: 'iot-hvac-03', dataTypes: 'Telemetry', classification: 'Public', reviewed: false },
  ];

  const complianceChecks = [
    { id: 'cm-1', control: 'CIS 1.1 – Hardware Inventory', status: 'Pass', coverage: '98%' },
    { id: 'cm-2', control: 'CIS 1.2 – Unauthorized Assets', status: 'Warning', coverage: '91%' },
    { id: 'cm-3', control: 'CIS 2.1 – Software Inventory', status: 'Pass', coverage: '96%' },
    { id: 'cm-4', control: 'CIS 2.2 – Unauthorized Software', status: 'Fail', coverage: '82%' },
    { id: 'cm-5', control: 'CIS 1.4 – DHCP Logging', status: 'Pass', coverage: '100%' },
  ];

  const riskColor = (r: string) => r === 'High' ? 'text-red-400' : r === 'Medium' ? 'text-yellow-400' : 'text-green-400';
  const statusColor = (s: string) => s === 'Pass' ? 'text-green-400' : s === 'Warning' ? 'text-yellow-400' : 'text-red-400';
  const classColor = (c: string) => c === 'Confidential' ? 'bg-red-500/20 text-red-300' : c === 'Internal' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300';

  if (loading) {
    return (
      <div className="bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-green-400">Asset Inventory</h1>
          <p className="text-slate-400">Unified CMDB with discovery across cloud, endpoints, and network.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={analyzing} className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            {analyzing ? 'Analyzing…' : '🤖 AI Analysis'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Discovery: Continuous</div>
        </div>
      </header>

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
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${activeTab === t.key ? 'bg-slate-800 text-cyan-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">All Assets</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-700">
                <tr><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Type</th><th className="py-2 pr-4">IP</th><th className="py-2 pr-4">OS</th><th className="py-2 pr-4">Owner</th><th className="py-2 pr-4">Risk</th><th className="py-2">Last Scanned</th></tr>
              </thead>
              <tbody>
                {assets.map(a => (
                  <tr key={a.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-2 pr-4 font-medium">{a.name}</td>
                    <td className="py-2 pr-4 text-slate-300">{a.type}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-slate-300">{a.ip}</td>
                    <td className="py-2 pr-4 text-slate-300">{a.os}</td>
                    <td className="py-2 pr-4 text-slate-300">{a.owner}</td>
                    <td className={`py-2 pr-4 font-semibold ${riskColor(a.risk)}`}>{a.risk}</td>
                    <td className="py-2 text-slate-400">{a.lastScanned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discovery Tab */}
      {activeTab === 'discovery' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Auto-Discovery Scan Results</h2>
            <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg">Last scan: 3 min ago</span>
          </div>
          <div className="space-y-3">
            {discoveryResults.map(d => (
              <div key={d.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-slate-500">IP: {d.ip} · Method: {d.method}</div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${d.status === 'New' ? 'bg-blue-500/20 text-blue-300' : d.status === 'Flagged' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{d.status}</span>
                  <div className="text-xs text-slate-400 mt-1">{d.detectedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classification Tab */}
      {activeTab === 'classification' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">Data Classification Labels</h2>
          <div className="space-y-3">
            {classificationData.map(c => (
              <div key={c.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <div className="font-semibold">{c.asset}</div>
                  <div className="text-xs text-slate-500">Data: {c.dataTypes}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${classColor(c.classification)}`}>{c.classification}</span>
                  <span className={`text-xs ${c.reviewed ? 'text-green-400' : 'text-yellow-400'}`}>{c.reviewed ? '✔ Reviewed' : '⏳ Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">CIS Asset Tracking Compliance</h2>
          <div className="space-y-3">
            {complianceChecks.map(cm => (
              <div key={cm.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <div className="font-medium">{cm.control}</div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">Coverage: {cm.coverage}</span>
                  <span className={`text-xs font-semibold ${statusColor(cm.status)}`}>{cm.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Result Panel */}
      {analysisResult && (
        <div className="bg-slate-800 border border-cyan-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-cyan-400">🤖 AI Analysis Result</h2>
            <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕ Close</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default AssetInventory;
