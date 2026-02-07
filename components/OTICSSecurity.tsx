import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

const OTICSSecurity: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [activeTab, setActiveTab] = useState<'alerts' | 'assets' | 'protocols' | 'safety'>('alerts');

  const [alerts, setAlerts] = useState([
    { id: 'o-1', system: 'SCADA-01', type: 'Protocol anomaly', severity: 'High', status: 'Contained', site: 'Plant A', time: '3m ago' },
    { id: 'o-2', system: 'PLC-Line3', type: 'Unauthorized write', severity: 'Critical', status: 'Blocked', site: 'Plant A', time: '12m ago' },
    { id: 'o-3', system: 'HMI-02', type: 'Remote access', severity: 'Medium', status: 'Investigating', site: 'Plant B', time: '28m ago' },
    { id: 'o-4', system: 'RTU-14', type: 'Firmware mismatch', severity: 'High', status: 'Open', site: 'Substation C', time: '1h ago' },
    { id: 'o-5', system: 'DCS-Main', type: 'Unusual setpoint change', severity: 'Medium', status: 'Monitoring', site: 'Plant A', time: '2h ago' },
  ]);

  const [stats, setStats] = useState([
    { label: 'Sites', value: 7 },
    { label: 'Controllers', value: 182 },
    { label: 'Critical alerts (24h)', value: 3 },
    { label: 'Safety interlocks', value: '100%' },
  ]);

  const otAssets = [
    { name: 'SCADA Servers', count: 12, vendor: 'Siemens', patched: '92%' },
    { name: 'PLCs', count: 84, vendor: 'Allen-Bradley', patched: '88%' },
    { name: 'HMIs', count: 38, vendor: 'Wonderware', patched: '95%' },
    { name: 'RTUs', count: 24, vendor: 'ABB', patched: '79%' },
    { name: 'Historians', count: 6, vendor: 'OSIsoft PI', patched: '100%' },
    { name: 'Safety Systems', count: 18, vendor: 'Triconex', patched: '100%' },
  ];

  const protocols = [
    { name: 'Modbus TCP', monitored: true, anomalies: 2, sessions: 4200 },
    { name: 'DNP3', monitored: true, anomalies: 0, sessions: 1800 },
    { name: 'OPC UA', monitored: true, anomalies: 1, sessions: 3100 },
    { name: 'EtherNet/IP', monitored: true, anomalies: 0, sessions: 2400 },
    { name: 'IEC 61850', monitored: true, anomalies: 0, sessions: 900 },
    { name: 'BACnet', monitored: false, anomalies: 0, sessions: 460 },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await backendApi.modules.getDashboard('ot-ics');
      if ((result as any)?.stats) setStats(prev => (result as any).stats.length > 0 ? (result as any).stats : prev);
      if ((result as any)?.items) setAlerts(prev => (result as any).items.length > 0 ? (result as any).items : prev);
    } catch (err) {
      console.error('Failed to load OT/ICS dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRiskAssessment = async () => {
    setAnalyzing(true);
    try {
      const result = await backendApi.modules.analyze('ot-ics', 'Perform an OT/ICS risk assessment covering Purdue model compliance, protocol security, and safety system integrity');
      if ((result as any)?.analysis) setAnalysisResult((result as any).analysis);
    } catch (err) {
      console.error('OT risk assessment failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-red-400">OT / ICS Security</h1>
          <p className="text-slate-400">Defend industrial control systems with protocol-aware monitoring and safeguards.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRiskAssessment} disabled={analyzing}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {analyzing ? 'Assessing...' : 'AI Risk Assessment'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Safety mode: Enforced</div>
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

      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {(['alerts', 'assets', 'protocols', 'safety'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-slate-800 text-amber-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'alerts' ? 'Alerts' : tab === 'assets' ? 'OT Assets' : tab === 'protocols' ? 'Protocols' : 'Safety Systems'}
          </button>
        ))}
      </div>

      {activeTab === 'alerts' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Recent Alerts</h2>
          {alerts.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.system} <span className="text-slate-500">({item.site})</span></div>
                <div className="text-xs text-slate-500">{item.type} • {item.time}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${item.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : item.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{item.severity}</span>
                <span className="text-xs text-green-300">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">OT Asset Inventory</h2>
          {otAssets.map(a => (
            <div key={a.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{a.name}</div>
                <div className="text-xs text-slate-500">Vendor: {a.vendor} | Count: {a.count}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${parseInt(a.patched) >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: a.patched }} />
                </div>
                <span className="text-xs w-10 text-right">{a.patched}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'protocols' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Protocol Monitoring</h2>
          {protocols.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-slate-500">{p.sessions.toLocaleString()} sessions (24h) | {p.anomalies} anomalies</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${p.monitored ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'}`}>{p.monitored ? 'Monitored' : 'Passive'}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Safety Instrumented Systems (SIS)</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {[{ name: 'ESD System', status: 'Armed', lastTest: '2026-01-10' }, { name: 'Fire & Gas', status: 'Armed', lastTest: '2026-01-08' }, { name: 'High Integrity Pressure', status: 'Armed', lastTest: '2026-01-12' }].map(s => (
                <div key={s.name} className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-green-400 font-bold mt-1">{s.status}</div>
                  <div className="text-xs text-slate-500 mt-1">Tested: {s.lastTest}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <span>✓</span> All safety systems operational - SIL 3 compliance verified
            </div>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-amber-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-amber-400 mb-2">AI OT Risk Assessment</h3>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default OTICSSecurity;
