import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const IoTSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'devices' | 'vulnerabilities' | 'policies' | 'anomalies' | 'firmware'>('devices');

  const tabs = [
    { key: 'devices' as const, label: 'Device Inventory' },
    { key: 'vulnerabilities' as const, label: 'Vulnerabilities' },
    { key: 'policies' as const, label: 'Policies' },
    { key: 'anomalies' as const, label: 'Anomalies' },
    { key: 'firmware' as const, label: 'Firmware Updates' },
  ];

  const devices = [
    { id: 'd-1', name: 'IP Camera (Lobby)', type: 'Camera', manufacturer: 'Hikvision', firmwareVersion: 'v5.7.12', ip: '10.100.1.10', lastSeen: '2m ago', riskScore: 'High', protocol: 'RTSP/ONVIF', authenticated: false },
    { id: 'd-2', name: 'Smart HVAC Controller', type: 'HVAC', manufacturer: 'Honeywell', firmwareVersion: 'v3.2.1', ip: '10.100.1.22', lastSeen: '1m ago', riskScore: 'Medium', protocol: 'BACnet', authenticated: true },
    { id: 'd-3', name: 'Badge Reader (Floor 3)', type: 'Access Control', manufacturer: 'HID Global', firmwareVersion: 'v8.1.4', ip: '10.100.2.5', lastSeen: '30s ago', riskScore: 'Low', protocol: 'Wiegand/OSDP', authenticated: true },
    { id: 'd-4', name: 'Smart Printer (Eng)', type: 'Printer', manufacturer: 'HP', firmwareVersion: 'v2025.11', ip: '10.100.1.50', lastSeen: '5m ago', riskScore: 'Critical', protocol: 'HTTP/IPP', authenticated: false },
    { id: 'd-5', name: 'IoT Gateway (Building A)', type: 'Gateway', manufacturer: 'Sierra Wireless', firmwareVersion: 'v4.8.2', ip: '10.100.0.1', lastSeen: '10s ago', riskScore: 'Medium', protocol: 'MQTT/CoAP', authenticated: true },
    { id: 'd-6', name: 'Smart Thermostat (Server Room)', type: 'Environmental', manufacturer: 'Nest', firmwareVersion: 'v6.4.1', ip: '10.100.1.88', lastSeen: '3m ago', riskScore: 'High', protocol: 'Weave/Thread', authenticated: false },
    { id: 'd-7', name: 'UPS Monitor', type: 'Power', manufacturer: 'APC', firmwareVersion: 'v1.9.0', ip: '10.100.3.2', lastSeen: '45s ago', riskScore: 'Medium', protocol: 'SNMP v2c', authenticated: true },
  ];

  const vulnerabilities = [
    { id: 'v-1', device: 'IP Camera (Lobby)', cve: 'CVE-2025-8842', severity: 'Critical', description: 'Default credentials allow remote code execution via ONVIF', remediation: 'Update firmware to v5.8.0 + change credentials' },
    { id: 'v-2', device: 'Smart Printer (Eng)', cve: 'CVE-2025-7731', severity: 'Critical', description: 'Unauthenticated admin panel exposed to network', remediation: 'Enable authentication + update firmware' },
    { id: 'v-3', device: 'Smart Thermostat', cve: 'CVE-2026-0112', severity: 'High', description: 'Plaintext API credentials in BLE advertisements', remediation: 'Update to firmware v6.5.0' },
    { id: 'v-4', device: 'UPS Monitor', cve: 'CVE-2025-6644', severity: 'Medium', description: 'SNMP v2c community string "public" — read/write access', remediation: 'Switch to SNMP v3 with auth + encryption' },
    { id: 'v-5', device: 'IoT Gateway', cve: 'CVE-2025-9901', severity: 'Medium', description: 'MQTT broker allows anonymous connections', remediation: 'Enable mTLS for all MQTT clients' },
  ];

  const iotPolicies = [
    { name: 'Isolate IoT VLAN from corporate', status: 'Enforced', compliance: '100%' },
    { name: 'No default credentials on any device', status: 'Enforced', compliance: '71%' },
    { name: 'Firmware updates within 30 days of release', status: 'Enforced', compliance: '58%' },
    { name: 'All device comms encrypted (TLS/DTLS)', status: 'Enforced', compliance: '64%' },
    { name: 'Device certificate rotation every 90 days', status: 'Enforced', compliance: '82%' },
    { name: 'Block IoT → Internet (except whitelisted)', status: 'Enforced', compliance: '100%' },
    { name: 'Disable unused protocols (Telnet, UPnP)', status: 'Enforced', compliance: '86%' },
  ];

  const anomalies = [
    { id: 'a-1', timestamp: '2026-02-12 09:04:22', device: 'IP Camera (Lobby)', type: 'Unusual Traffic', detail: 'Camera sending 48 MB/hr to external IP (normally 2 MB/hr)', severity: 'Critical', status: 'Investigating' },
    { id: 'a-2', timestamp: '2026-02-12 08:41:11', device: 'Smart Printer (Eng)', type: 'Port Scan', detail: 'Printer scanning internal subnet on ports 22, 445, 3389', severity: 'Critical', status: 'Auto-Isolated' },
    { id: 'a-3', timestamp: '2026-02-12 07:55:03', device: 'Smart Thermostat', type: 'Firmware Mismatch', detail: 'Running unsigned firmware — possible tampering', severity: 'High', status: 'Alert Sent' },
    { id: 'a-4', timestamp: '2026-02-11 22:18:44', device: 'IoT Gateway', type: 'Protocol Anomaly', detail: 'MQTT messages with unusual topic patterns — possible C2', severity: 'High', status: 'Quarantined' },
  ];

  const firmwareUpdates = [
    { device: 'IP Camera (Lobby)', current: 'v5.7.12', available: 'v5.8.0', criticality: 'Critical', releaseDate: '2026-02-01', status: 'Pending Approval' },
    { device: 'Smart Thermostat', current: 'v6.4.1', available: 'v6.5.0', criticality: 'High', releaseDate: '2026-02-05', status: 'Scheduled' },
    { device: 'IoT Gateway', current: 'v4.8.2', available: 'v4.9.0', criticality: 'Medium', releaseDate: '2026-01-28', status: 'Up to Date Staging' },
    { device: 'UPS Monitor', current: 'v1.9.0', available: 'v2.0.0', criticality: 'Low', releaseDate: '2026-01-15', status: 'Deferred' },
  ];

  const stats = [
    { label: 'Total Devices', value: '342' },
    { label: 'Critical Vulns', value: '12' },
    { label: 'Anomalies (24h)', value: '4' },
    { label: 'Firmware Overdue', value: '8' },
  ];

  const { loading, analyzing, analysisResult, runAnalysis } = useSecurityModule('iot-security', {
    devices, vulnerabilities, firmwareInventory, networkSegments, policies, stats,
  });

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };
  const riskColor = (r: string) => { switch (r) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">IoT Device Security</h1>
          <p className="text-slate-400">Device discovery, firmware management, anomaly detection, and IoT-specific vulnerability scanning.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runAnalysis} disabled={analyzing} className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-teal-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'devices' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">IoT Device Inventory</h2>
          {devices.map(d => (
            <div key={d.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{d.name} <span className="text-xs text-slate-500">[{d.type}]</span></div><div className="text-xs text-slate-400">{d.manufacturer} · {d.firmwareVersion} · {d.ip}</div></div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">{d.protocol}</span>
                <span className={d.authenticated ? 'text-green-400' : 'text-red-400'}>{d.authenticated ? 'Auth' : 'No Auth'}</span>
                <span className={riskColor(d.riskScore)}>{d.riskScore}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vulnerabilities' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">IoT Vulnerabilities</h2>
          {vulnerabilities.map(v => (
            <div key={v.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between"><span className="font-semibold">{v.device}</span><span className={`text-xs font-medium ${severityColor(v.severity)}`}>{v.severity}</span></div>
              <div className="text-slate-300">{v.description}</div>
              <div className="flex items-center justify-between text-xs text-slate-500"><span className="text-cyan-400">{v.cve}</span><span>{v.remediation}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">IoT Security Policies</h2>
          {iotPolicies.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <span className="text-slate-200">{p.name}</span>
              <div className="flex items-center gap-3 text-xs"><span className="text-green-400">{p.status}</span><span className={parseInt(p.compliance) >= 90 ? 'text-green-400' : parseInt(p.compliance) >= 70 ? 'text-yellow-400' : 'text-red-400'}>{p.compliance}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'anomalies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Device Anomalies</h2>
          {anomalies.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between"><span className="font-semibold">{a.device} — {a.type}</span><span className={`text-xs font-medium ${severityColor(a.severity)}`}>{a.severity}</span></div>
              <div className="text-slate-300">{a.detail}</div>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{a.timestamp}</span><span className={a.status.includes('Isolated') || a.status.includes('Quarantined') ? 'text-red-400' : 'text-yellow-400'}>{a.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'firmware' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Firmware Update Management</h2>
          {firmwareUpdates.map(f => (
            <div key={f.device} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{f.device}</div><div className="text-xs text-slate-400">{f.current} → {f.available} · Released: {f.releaseDate}</div></div>
              <div className="flex items-center gap-3 text-xs"><span className={severityColor(f.criticality)}>{f.criticality}</span><span className="text-slate-400">{f.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-teal-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-teal-400">🤖 AI Analysis</h2><button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default IoTSecurity;
