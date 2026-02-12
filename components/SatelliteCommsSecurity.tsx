import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const SatelliteCommsSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'links' | 'threats' | 'encryption' | 'ground-stations'>('links');

  const tabs = [
    { key: 'links' as const, label: 'Satellite Links' },
    { key: 'threats' as const, label: 'Threat Detections' },
    { key: 'encryption' as const, label: 'Encryption Status' },
    { key: 'ground-stations' as const, label: 'Ground Stations' },
  ];

  const satLinks = [
    { id: 'sl-1', satellite: 'ANCHOR-SAT-1 (LEO)', orbit: 'Low Earth Orbit', uplink: '14.2 GHz', downlink: '11.7 GHz', bandwidth: '2.4 Gbps', latency: '25ms', encryption: 'AES-256-GCM + QKD', status: 'Operational', signalStrength: '98%' },
    { id: 'sl-2', satellite: 'ANCHOR-SAT-2 (MEO)', orbit: 'Medium Earth Orbit', uplink: '30 GHz', downlink: '20 GHz', bandwidth: '8.2 Gbps', latency: '120ms', encryption: 'AES-256-GCM', status: 'Operational', signalStrength: '94%' },
    { id: 'sl-3', satellite: 'GOV-MILSAT-7 (GEO)', orbit: 'Geostationary', uplink: '44 GHz', downlink: '20.2 GHz', bandwidth: '1.2 Gbps', latency: '600ms', encryption: 'Suite B (Type 1)', status: 'Operational', signalStrength: '91%' },
    { id: 'sl-4', satellite: 'PARTNER-SAT-3 (LEO)', orbit: 'Low Earth Orbit', uplink: '14.5 GHz', downlink: '12.2 GHz', bandwidth: '800 Mbps', latency: '30ms', encryption: 'AES-256-GCM', status: 'Degraded', signalStrength: '72%' },
  ];

  const threats = [
    { id: 't-1', timestamp: '2026-02-12 08:44:22', type: 'GPS Spoofing', target: 'ANCHOR-SAT-1', severity: 'Critical', detail: 'L1 C/A signal anomaly detected — spoofed navigation data from unknown source', status: 'Mitigated (switched to L5 + inertial nav)' },
    { id: 't-2', timestamp: '2026-02-11 22:18:33', type: 'Jamming Attempt', target: 'PARTNER-SAT-3', severity: 'High', detail: 'Wideband noise detected on 14.5 GHz uplink — power level 12 dB above normal', status: 'Active (frequency hopping engaged)' },
    { id: 't-3', timestamp: '2026-02-11 14:55:08', type: 'Eavesdropping Probe', target: 'GOV-MILSAT-7', severity: 'Medium', detail: 'Unauthorized ground station attempted downlink interception at 20.2 GHz', status: 'Blocked (geo-fenced + encrypted)' },
    { id: 't-4', timestamp: '2026-02-10 09:22:44', type: 'Orbital Debris Threat', target: 'ANCHOR-SAT-2', severity: 'High', detail: 'Tracked debris object within 2 km approach corridor — maneuver calculated', status: 'Avoidance maneuver executed' },
    { id: 't-5', timestamp: '2026-02-09 16:33:11', type: 'Command Injection', target: 'ANCHOR-SAT-1', severity: 'Critical', detail: 'Unauthorized telemetry command on TT&C channel — spoofed ground station ID', status: 'Blocked (command authentication)' },
  ];

  const encryptionStatus = [
    { link: 'ANCHOR-SAT-1 ↔ Ground-Alpha', cipherSuite: 'AES-256-GCM + QKD', keyRotation: 'Every 60 seconds', pqcReady: true, lastKeyExchange: '2026-02-12 09:14:00', status: 'Active' },
    { link: 'ANCHOR-SAT-2 ↔ Ground-Beta', cipherSuite: 'AES-256-GCM', keyRotation: 'Every 5 minutes', pqcReady: false, lastKeyExchange: '2026-02-12 09:10:00', status: 'Active' },
    { link: 'GOV-MILSAT-7 ↔ Ground-Gamma', cipherSuite: 'NSA Suite B (Type 1)', keyRotation: 'Per session', pqcReady: true, lastKeyExchange: '2026-02-12 08:00:00', status: 'Active' },
    { link: 'TT&C Command Channel', cipherSuite: 'HMAC-SHA512 + RSA-4096', keyRotation: 'Every 24 hours', pqcReady: false, lastKeyExchange: '2026-02-12 00:00:00', status: 'Active' },
  ];

  const groundStations = [
    { name: 'Ground-Alpha (US East)', location: 'Virginia, USA', status: 'Operational', connectedSats: 2, antennas: 4, security: 'SCIF Level', lastAudit: '2026-02-01' },
    { name: 'Ground-Beta (EU)', location: 'Darmstadt, Germany', status: 'Operational', connectedSats: 1, antennas: 3, security: 'NATO RESTRICTED', lastAudit: '2026-01-28' },
    { name: 'Ground-Gamma (UK)', location: 'Cornwall, UK', status: 'Operational', connectedSats: 1, antennas: 2, security: 'UK SECRET', lastAudit: '2026-02-05' },
    { name: 'Ground-Delta (APAC)', location: 'Perth, Australia', status: 'Standby', connectedSats: 0, antennas: 2, security: 'AU PROTECTED', lastAudit: '2026-01-15' },
  ];

  const stats = [
    { label: 'Active Links', value: satLinks.filter(l => l.status === 'Operational').length },
    { label: 'Total Bandwidth', value: '12.6 Gbps' },
    { label: 'Threats (30d)', value: '18' },
    { label: 'QKD Enabled', value: '2 links' },
  ];

  const { loading, analyzing, analysisResult, runAnalysis, clearAnalysis } = useSecurityModule('satellite-comms', {
    satLinks, threats, groundStations, stats,
  });

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Satellite Communications Security</h1><span className="bg-amber-900 text-amber-300 text-xs font-bold px-2 py-1 rounded-full">WORLD FIRST</span></div>
          <p className="text-slate-400">Satellite link encryption, GPS spoofing defense, jamming detection, and ground station security.</p>
        </div>
        <button onClick={() => runAnalysis()} disabled={analyzing} className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-amber-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'links' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Active Satellite Links</h2>
          {satLinks.map(l => (
            <div key={l.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-center justify-between"><span className="font-semibold">{l.satellite}</span><span className={`text-xs font-medium ${l.status === 'Operational' ? 'text-green-400' : 'text-yellow-400'}`}>{l.status}</span></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
                <span>Orbit: <span className="text-white">{l.orbit}</span></span><span>BW: <span className="text-white">{l.bandwidth}</span></span>
                <span>Latency: <span className="text-white">{l.latency}</span></span><span>Signal: <span className="text-white">{l.signalStrength}</span></span>
              </div>
              <div className="text-xs text-slate-500">Encryption: {l.encryption}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'threats' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Satellite Threat Detections</h2>
          {threats.map(t => (
            <div key={t.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between"><span className="font-semibold">{t.type} — {t.target}</span><span className={`text-xs font-medium ${severityColor(t.severity)}`}>{t.severity}</span></div>
              <div className="text-slate-300">{t.detail}</div>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{t.timestamp}</span><span className="text-green-400">{t.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'encryption' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Link Encryption Status</h2>
          {encryptionStatus.map(e => (
            <div key={e.link} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{e.link}</div><div className="text-xs text-slate-400">{e.cipherSuite} · Rotation: {e.keyRotation}</div></div>
              <div className="flex items-center gap-2 text-xs">{e.pqcReady && <span className="bg-blue-900 text-blue-300 px-2 py-0.5 rounded">PQC Ready</span>}<span className="text-green-400">{e.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ground-stations' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Ground Station Network</h2>
          {groundStations.map(g => (
            <div key={g.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{g.name}</div><div className="text-xs text-slate-400">{g.location} · {g.antennas} antennas · Security: {g.security}</div></div>
              <div className="flex items-center gap-3 text-xs"><span className="text-slate-400">{g.connectedSats} sats</span><span className={g.status === 'Operational' ? 'text-green-400' : 'text-yellow-400'}>{g.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-amber-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-amber-400">🤖 AI Analysis</h2><button onClick={() => clearAnalysis()} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default SatelliteCommsSecurity;
