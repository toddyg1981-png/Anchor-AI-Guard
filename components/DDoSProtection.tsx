import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const DDoSProtection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attacks' | 'mitigation' | 'scrubbing' | 'analytics'>('overview');

  const tabs = [
    { key: 'overview' as const, label: 'Live Status' },
    { key: 'attacks' as const, label: 'Attack Log' },
    { key: 'mitigation' as const, label: 'Mitigation Rules' },
    { key: 'scrubbing' as const, label: 'Traffic Scrubbing' },
    { key: 'analytics' as const, label: 'Analytics' },
  ];

  const liveStatus = {
    mode: 'Active Protection',
    inboundTraffic: '4.2 Gbps',
    cleanTraffic: '3.8 Gbps',
    scrubbedTraffic: '412 Mbps',
    activeAttacks: 0,
    mitigationsActive: 3,
    uptime: '99.998%',
    lastAttack: '2026-02-11 22:14:08',
    protectionCapacity: '10 Tbps',
  };

  const stats = [
    { label: 'Inbound Traffic', value: liveStatus.inboundTraffic },
    { label: 'Clean Traffic', value: liveStatus.cleanTraffic },
    { label: 'Scrubbed', value: liveStatus.scrubbedTraffic },
    { label: 'Protection Capacity', value: liveStatus.protectionCapacity },
  ];

  const attackLog = [
    { id: 'a-1', timestamp: '2026-02-11 22:14:08', type: 'Volumetric (UDP Flood)', peakBandwidth: '38.7 Gbps', peakPPS: '24M pps', duration: '14m 22s', sourceIPs: 142000, mitigated: true, verdict: 'Auto-Mitigated' },
    { id: 'a-2', timestamp: '2026-02-10 15:03:44', type: 'Application Layer (HTTP Flood)', peakBandwidth: '2.1 Gbps', peakPPS: '890K rps', duration: '28m 11s', sourceIPs: 23000, mitigated: true, verdict: 'Auto-Mitigated' },
    { id: 'a-3', timestamp: '2026-02-09 08:45:19', type: 'Protocol (SYN Flood)', peakBandwidth: '12.4 Gbps', peakPPS: '18M pps', duration: '6m 48s', sourceIPs: 67000, mitigated: true, verdict: 'Auto-Mitigated' },
    { id: 'a-4', timestamp: '2026-02-07 03:22:55', type: 'Reflection (DNS Amplification)', peakBandwidth: '84.2 Gbps', peakPPS: '31M pps', duration: '42m 03s', sourceIPs: 8200, mitigated: true, verdict: 'Auto-Mitigated' },
    { id: 'a-5', timestamp: '2026-02-05 11:18:33', type: 'Multi-Vector (SYN + HTTP + DNS)', peakBandwidth: '127 Gbps', peakPPS: '58M pps', duration: '1h 14m 22s', sourceIPs: 312000, mitigated: true, verdict: 'Escalated → Auto-Mitigated' },
  ];

  const mitigationRules = [
    { name: 'SYN Cookie Protection', layer: 'L3/L4', status: 'Always On', action: 'SYN cookies for all SYN floods', threshold: 'Auto' },
    { name: 'UDP Flood Rate Limit', layer: 'L3/L4', status: 'Always On', action: 'Drop UDP > 10M pps per /24', threshold: '10M pps' },
    { name: 'DNS Amplification Filter', layer: 'L3/L4', status: 'Always On', action: 'Block spoofed DNS responses > 512B', threshold: 'Auto' },
    { name: 'HTTP Rate Limiting', layer: 'L7', status: 'Always On', action: 'Challenge → Block at 10K rps per IP', threshold: '10K rps' },
    { name: 'Slowloris Protection', layer: 'L7', status: 'Always On', action: 'Timeout slow connections > 5s', threshold: '5s' },
    { name: 'GeoIP Auto-Block (Under Attack)', layer: 'L3', status: 'Standby', action: 'Block high-risk geos during active attack', threshold: 'Attack detected' },
    { name: 'JavaScript Challenge', layer: 'L7', status: 'Standby', action: 'Proof-of-work challenge for all requests', threshold: 'L7 attack detected' },
    { name: 'BGP Null Route', layer: 'L3', status: 'Emergency Only', action: 'Null route attacked IPs upstream', threshold: '> 5 Tbps' },
  ];

  const scrubbingCenters = [
    { location: 'US East (Virginia)', status: 'Active', capacity: '2 Tbps', currentLoad: '480 Mbps', latency: '1.2ms' },
    { location: 'EU West (Frankfurt)', status: 'Active', capacity: '2 Tbps', currentLoad: '312 Mbps', latency: '1.8ms' },
    { location: 'Asia Pacific (Singapore)', status: 'Active', capacity: '2 Tbps', currentLoad: '198 Mbps', latency: '2.4ms' },
    { location: 'US West (Oregon)', status: 'Standby', capacity: '2 Tbps', currentLoad: '0 Mbps', latency: '-' },
    { location: 'EU North (London)', status: 'Standby', capacity: '2 Tbps', currentLoad: '0 Mbps', latency: '-' },
  ];

  const analyticsData = {
    attacksThisMonth: 12,
    avgDuration: '22m 14s',
    peakAttackSize: '127 Gbps',
    totalScrubbed: '4.2 TB',
    falsePositiveRate: '0.003%',
    attackTypes: [
      { type: 'Volumetric (UDP/ICMP)', pct: 35 },
      { type: 'Protocol (SYN/ACK)', pct: 25 },
      { type: 'Application (HTTP)', pct: 20 },
      { type: 'Reflection/Amplification', pct: 15 },
      { type: 'Multi-Vector', pct: 5 },
    ],
  };

  const { loading, analyzing, analysisResult, runAnalysis, clearAnalysis } = useSecurityModule('ddos-protection', {
    liveStatus, stats, attackLog, mitigationRules, scrubbingCenters,
  });

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">DDoS Protection</h1>
          <p className="text-slate-400">Multi-layer DDoS mitigation — L3/L4 volumetric, L7 application, traffic scrubbing &amp; BGP protection.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => runAnalysis()} disabled={analyzing} className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
          <div className={`bg-slate-800 border rounded-xl px-4 py-2 text-sm font-medium ${liveStatus.activeAttacks > 0 ? 'border-red-500 text-red-400' : 'border-green-700 text-green-400'}`}>
            {liveStatus.activeAttacks > 0 ? `🔴 ${liveStatus.activeAttacks} Active Attack(s)` : '🟢 No Active Attacks'}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-violet-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Protection Status</h2>
            {[{ label: 'Mode', value: liveStatus.mode }, { label: 'Last Attack', value: liveStatus.lastAttack }, { label: 'Active Mitigations', value: liveStatus.mitigationsActive }, { label: 'Uptime', value: liveStatus.uptime }].map(r => (
              <div key={r.label} className="flex items-center justify-between text-sm"><span className="text-slate-400">{r.label}</span><span className="text-white font-medium">{r.value}</span></div>
            ))}
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Traffic Distribution</h2>
            <div className="flex items-center gap-2 text-sm"><span className="text-slate-400 w-32">Clean</span><div className="flex-1 bg-slate-700 rounded h-4"><div className="bg-green-500 h-4 rounded" style={{ width: '90%' }} /></div><span className="text-xs text-slate-400 w-12">90%</span></div>
            <div className="flex items-center gap-2 text-sm"><span className="text-slate-400 w-32">Scrubbed</span><div className="flex-1 bg-slate-700 rounded h-4"><div className="bg-yellow-500 h-4 rounded" style={{ width: '10%' }} /></div><span className="text-xs text-slate-400 w-12">10%</span></div>
            <div className="flex items-center gap-2 text-sm"><span className="text-slate-400 w-32">Dropped</span><div className="flex-1 bg-slate-700 rounded h-4"><div className="bg-red-500 h-4 rounded" style={{ width: '0%' }} /></div><span className="text-xs text-slate-400 w-12">0%</span></div>
          </div>
        </div>
      )}

      {activeTab === 'attacks' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Recent DDoS Attacks</h2>
          {attackLog.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-center justify-between"><span className="font-semibold text-violet-300">{a.type}</span><span className="text-xs text-green-400">{a.verdict}</span></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
                <span>Peak: <span className="text-white">{a.peakBandwidth}</span></span>
                <span>PPS: <span className="text-white">{a.peakPPS}</span></span>
                <span>Duration: <span className="text-white">{a.duration}</span></span>
                <span>Sources: <span className="text-white">{a.sourceIPs.toLocaleString()}</span></span>
              </div>
              <div className="text-xs text-slate-500">{a.timestamp}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'mitigation' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Mitigation Rules</h2>
          {mitigationRules.map(r => (
            <div key={r.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div><span className="text-slate-200">{r.name}</span><span className="ml-2 text-xs text-slate-500">[{r.layer}]</span></div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">{r.threshold}</span>
                <span className={r.status === 'Always On' ? 'text-green-400' : r.status === 'Standby' ? 'text-yellow-400' : 'text-red-400'}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'scrubbing' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Global Scrubbing Centers</h2>
          {scrubbingCenters.map(c => (
            <div key={c.location} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{c.location}</div><div className="text-xs text-slate-500">Capacity: {c.capacity} · Latency: {c.latency}</div></div>
              <div className="text-right space-y-1"><div className="text-sm">{c.currentLoad}</div><span className={`text-xs font-medium ${c.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>{c.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[{ l: 'Attacks (30d)', v: analyticsData.attacksThisMonth }, { l: 'Avg Duration', v: analyticsData.avgDuration }, { l: 'Largest Attack', v: analyticsData.peakAttackSize }, { l: 'Total Scrubbed', v: analyticsData.totalScrubbed }, { l: 'False Positive', v: analyticsData.falsePositiveRate }].map(s => (
              <div key={s.l} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.l}</div><div className="text-2xl font-semibold mt-1">{s.v}</div></div>
            ))}
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Attack Type Breakdown</h2>
            {analyticsData.attackTypes.map(a => (
              <div key={a.type} className="flex items-center justify-between text-sm"><span className="text-slate-300">{a.type}</span><div className="flex items-center gap-2"><div className="w-32 bg-slate-700 rounded-full h-2"><div className="bg-violet-400 h-2 rounded-full" style={{ width: `${a.pct}%` }} /></div><span className="text-slate-400 text-xs w-8 text-right">{a.pct}%</span></div></div>
            ))}
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-violet-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-violet-400">🤖 AI Analysis</h2><button onClick={() => clearAnalysis()} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default DDoSProtection;
