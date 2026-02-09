// ============================================================================
// HARDWARE INTEGRITY LAYER — WORLD-FIRST HARDWARE TRUST VERIFICATION
// Anchor is the first security platform to verify physical hardware trust
// boundaries, detect malicious peripherals, hardware implants, rogue USB
// devices, BIOS/UEFI tampering, and TPM manipulation at the platform level.
// ============================================================================

import React, { useState, useEffect } from 'react';

const TABS = ['Device Trust', 'Peripheral Monitor', 'Implant Detection', 'TPM & Attestation', 'Alerts'] as const;
type Tab = typeof TABS[number];

interface DeviceTrustItem {
  id: string;
  name: string;
  type: string;
  tpmStatus: 'verified' | 'warning' | 'failed';
  secureBoot: boolean;
  biosIntegrity: 'intact' | 'modified' | 'unknown';
  firmwareAttestation: 'passed' | 'pending' | 'failed';
  trustScore: number;
  lastChecked: string;
}

interface PeripheralDevice {
  id: string;
  name: string;
  type: 'USB' | 'Thunderbolt' | 'PCIe' | 'Bluetooth';
  vendor: string;
  serialNumber: string;
  riskScore: number;
  status: 'allowed' | 'blocked' | 'quarantined';
  fingerprint: string;
  connectedSince: string;
  dataTransferred: string;
}

interface ImplantScan {
  id: string;
  target: string;
  method: string;
  result: 'clean' | 'anomaly' | 'critical';
  powerDeviation: number;
  emSignature: string;
  boardIntegrity: 'verified' | 'suspect' | 'compromised';
  lastScan: string;
  confidence: number;
}

interface TPMRecord {
  id: string;
  chipVersion: string;
  manufacturer: string;
  health: 'healthy' | 'degraded' | 'failed';
  attestationResult: 'passed' | 'failed' | 'pending';
  bootChainValid: boolean;
  pcrValues: { register: string; value: string; status: 'match' | 'mismatch' }[];
  lastAttestation: string;
  endorsementKeyHash: string;
}

interface HardwareAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  device: string;
  timestamp: string;
  acknowledged: boolean;
  category: string;
}

const mockDeviceTrust: DeviceTrustItem[] = [
  { id: 'dt-001', name: 'Primary Workstation', type: 'Desktop', tpmStatus: 'verified', secureBoot: true, biosIntegrity: 'intact', firmwareAttestation: 'passed', trustScore: 98, lastChecked: '2026-02-09T14:32:00Z' },
  { id: 'dt-002', name: 'Dev Laptop Alpha', type: 'Laptop', tpmStatus: 'verified', secureBoot: true, biosIntegrity: 'intact', firmwareAttestation: 'passed', trustScore: 95, lastChecked: '2026-02-09T14:28:00Z' },
  { id: 'dt-003', name: 'Server Node R-14', type: 'Server', tpmStatus: 'warning', secureBoot: true, biosIntegrity: 'modified', firmwareAttestation: 'pending', trustScore: 67, lastChecked: '2026-02-09T14:15:00Z' },
  { id: 'dt-004', name: 'Edge Gateway 7B', type: 'IoT Gateway', tpmStatus: 'verified', secureBoot: false, biosIntegrity: 'intact', firmwareAttestation: 'passed', trustScore: 82, lastChecked: '2026-02-09T13:59:00Z' },
  { id: 'dt-005', name: 'Conference Room Display', type: 'Embedded', tpmStatus: 'failed', secureBoot: false, biosIntegrity: 'unknown', firmwareAttestation: 'failed', trustScore: 23, lastChecked: '2026-02-09T12:45:00Z' },
  { id: 'dt-006', name: 'Finance Workstation F3', type: 'Desktop', tpmStatus: 'verified', secureBoot: true, biosIntegrity: 'intact', firmwareAttestation: 'passed', trustScore: 99, lastChecked: '2026-02-09T14:30:00Z' },
];

const mockPeripherals: PeripheralDevice[] = [
  { id: 'p-001', name: 'Logitech MX Master 3S', type: 'USB', vendor: 'Logitech', serialNumber: 'LG-8829-XK41', riskScore: 5, status: 'allowed', fingerprint: 'a3f8c2d1e9b7', connectedSince: '2026-02-09T08:00:00Z', dataTransferred: '12.4 MB' },
  { id: 'p-002', name: 'Samsung T7 SSD', type: 'USB', vendor: 'Samsung', serialNumber: 'SM-T7-992841', riskScore: 35, status: 'allowed', fingerprint: 'b7e1d4f3c8a2', connectedSince: '2026-02-09T10:12:00Z', dataTransferred: '2.1 GB' },
  { id: 'p-003', name: 'Unknown USB Mass Storage', type: 'USB', vendor: 'Unknown', serialNumber: 'N/A', riskScore: 92, status: 'blocked', fingerprint: 'x0x0x0x0x0x0', connectedSince: '2026-02-09T13:47:00Z', dataTransferred: '0 B' },
  { id: 'p-004', name: 'CalDigit TS4 Dock', type: 'Thunderbolt', vendor: 'CalDigit', serialNumber: 'CD-TS4-447291', riskScore: 12, status: 'allowed', fingerprint: 'c9d2e5f4a1b3', connectedSince: '2026-02-09T08:01:00Z', dataTransferred: '48.7 GB' },
  { id: 'p-005', name: 'Suspicious Thunderbolt Adapter', type: 'Thunderbolt', vendor: 'Unregistered', serialNumber: 'FAKE-0001', riskScore: 98, status: 'blocked', fingerprint: 'deadbeef0000', connectedSince: '2026-02-09T14:02:00Z', dataTransferred: '0 B' },
  { id: 'p-006', name: 'Intel AX210 WiFi', type: 'PCIe', vendor: 'Intel', serialNumber: 'INTL-AX210-88421', riskScore: 8, status: 'allowed', fingerprint: 'd4e7f1a2b5c8', connectedSince: '2026-02-08T22:00:00Z', dataTransferred: '14.2 GB' },
  { id: 'p-007', name: 'NVIDIA RTX 4090', type: 'PCIe', vendor: 'NVIDIA', serialNumber: 'NV-4090-X81274', riskScore: 3, status: 'allowed', fingerprint: 'e5f8a1b3c6d9', connectedSince: '2026-01-15T00:00:00Z', dataTransferred: '912 GB' },
  { id: 'p-008', name: 'Apple AirPods Pro', type: 'Bluetooth', vendor: 'Apple', serialNumber: 'AP-PRO2-MQ192', riskScore: 18, status: 'allowed', fingerprint: 'f6a9b2c4d7e0', connectedSince: '2026-02-09T09:30:00Z', dataTransferred: '340 MB' },
];

const mockImplantScans: ImplantScan[] = [
  { id: 'is-001', target: 'Motherboard — Primary Workstation', method: 'Power Consumption Analysis', result: 'clean', powerDeviation: 0.3, emSignature: 'NOMINAL', boardIntegrity: 'verified', lastScan: '2026-02-09T14:00:00Z', confidence: 99.2 },
  { id: 'is-002', target: 'NIC — Server Node R-14', method: 'EM Side-Channel Analysis', result: 'anomaly', powerDeviation: 4.7, emSignature: 'ELEVATED-BAND-3', boardIntegrity: 'suspect', lastScan: '2026-02-09T13:45:00Z', confidence: 78.4 },
  { id: 'is-003', target: 'USB Controller — Dev Laptop Alpha', method: 'Firmware Binary Diff', result: 'clean', powerDeviation: 0.1, emSignature: 'NOMINAL', boardIntegrity: 'verified', lastScan: '2026-02-09T13:30:00Z', confidence: 97.8 },
  { id: 'is-004', target: 'PCIe Slot 2 — Edge Gateway 7B', method: 'Impedance Measurement', result: 'critical', powerDeviation: 12.9, emSignature: 'ROGUE-SIGNAL-DETECTED', boardIntegrity: 'compromised', lastScan: '2026-02-09T14:10:00Z', confidence: 94.1 },
  { id: 'is-005', target: 'Thunderbolt Controller — Finance WS', method: 'DMA Audit & Power Analysis', result: 'clean', powerDeviation: 0.5, emSignature: 'NOMINAL', boardIntegrity: 'verified', lastScan: '2026-02-09T12:00:00Z', confidence: 98.6 },
  { id: 'is-006', target: 'SPI Flash — Conference Display', method: 'Binary Integrity Validation', result: 'anomaly', powerDeviation: 3.2, emSignature: 'MINOR-DEVIATION', boardIntegrity: 'suspect', lastScan: '2026-02-09T11:30:00Z', confidence: 82.0 },
];

const mockTPMRecords: TPMRecord[] = [
  {
    id: 'tpm-001', chipVersion: 'TPM 2.0', manufacturer: 'Infineon SLB9670', health: 'healthy',
    attestationResult: 'passed', bootChainValid: true, lastAttestation: '2026-02-09T14:30:00Z',
    endorsementKeyHash: 'sha256:a4c1d9e8f3b72...8e1f',
    pcrValues: [
      { register: 'PCR-0', value: '0x7A3F...B12E', status: 'match' },
      { register: 'PCR-1', value: '0x1D8C...4F9A', status: 'match' },
      { register: 'PCR-7', value: '0xE4B2...7C31', status: 'match' },
      { register: 'PCR-14', value: '0x92A1...D5E8', status: 'match' },
    ],
  },
  {
    id: 'tpm-002', chipVersion: 'TPM 2.0', manufacturer: 'STMicro ST33TPHF2X', health: 'healthy',
    attestationResult: 'passed', bootChainValid: true, lastAttestation: '2026-02-09T14:25:00Z',
    endorsementKeyHash: 'sha256:b7d2e0f4a1c83...9f2a',
    pcrValues: [
      { register: 'PCR-0', value: '0x3B7E...A91D', status: 'match' },
      { register: 'PCR-1', value: '0x8F2C...61B4', status: 'match' },
      { register: 'PCR-7', value: '0xC5D1...3E8F', status: 'match' },
      { register: 'PCR-14', value: '0x41A9...B2C7', status: 'match' },
    ],
  },
  {
    id: 'tpm-003', chipVersion: 'TPM 2.0', manufacturer: 'Nuvoton NPCT750', health: 'degraded',
    attestationResult: 'failed', bootChainValid: false, lastAttestation: '2026-02-09T14:15:00Z',
    endorsementKeyHash: 'sha256:c8e3f1a5b2d94...0a3b',
    pcrValues: [
      { register: 'PCR-0', value: '0x9C4D...E72F', status: 'mismatch' },
      { register: 'PCR-1', value: '0x2A7F...B831', status: 'match' },
      { register: 'PCR-7', value: '0xD6E3...1A4C', status: 'mismatch' },
      { register: 'PCR-14', value: '0x58B2...C9D4', status: 'match' },
    ],
  },
];

const mockAlerts: HardwareAlert[] = [
  { id: 'ha-001', severity: 'critical', title: 'Rogue Hardware Implant Detected', description: 'Side-channel analysis detected an unauthorized hardware implant on PCIe Slot 2 of Edge Gateway 7B. Immediate physical inspection required.', device: 'Edge Gateway 7B', timestamp: '2026-02-09T14:10:00Z', acknowledged: false, category: 'Implant Detection' },
  { id: 'ha-002', severity: 'critical', title: 'Unauthorized Thunderbolt Device Blocked', description: 'An unregistered Thunderbolt adapter with spoofed vendor ID attempted DMA access. Device has been electrically isolated.', device: 'Dev Laptop Alpha', timestamp: '2026-02-09T14:02:00Z', acknowledged: false, category: 'Peripheral Security' },
  { id: 'ha-003', severity: 'high', title: 'TPM Attestation Failure — PCR Mismatch', description: 'Platform Configuration Registers PCR-0 and PCR-7 do not match expected golden values on Server Node R-14. Possible firmware tampering.', device: 'Server Node R-14', timestamp: '2026-02-09T14:15:00Z', acknowledged: false, category: 'TPM & Attestation' },
  { id: 'ha-004', severity: 'high', title: 'Unknown USB Mass Storage Blocked', description: 'An unrecognized USB mass storage device with no valid serial number was connected and automatically blocked per policy.', device: 'Primary Workstation', timestamp: '2026-02-09T13:47:00Z', acknowledged: true, category: 'Peripheral Security' },
  { id: 'ha-005', severity: 'medium', title: 'BIOS Integrity Modified — Server Node R-14', description: 'BIOS binary hash has changed since last verified baseline. Review firmware update logs or investigate potential tampering.', device: 'Server Node R-14', timestamp: '2026-02-09T12:30:00Z', acknowledged: true, category: 'Device Trust' },
  { id: 'ha-006', severity: 'medium', title: 'EM Anomaly on NIC Side-Channel', description: 'Electromagnetic signature on Server Node R-14 network interface shows elevated Band-3 emissions inconsistent with normal operation.', device: 'Server Node R-14', timestamp: '2026-02-09T13:45:00Z', acknowledged: false, category: 'Implant Detection' },
  { id: 'ha-007', severity: 'low', title: 'Bluetooth Device Re-paired', description: 'Apple AirPods Pro re-paired with new session key. Routine re-authentication completed successfully.', device: 'Dev Laptop Alpha', timestamp: '2026-02-09T09:30:00Z', acknowledged: true, category: 'Peripheral Security' },
  { id: 'ha-008', severity: 'info', title: 'Firmware Attestation Completed', description: 'All scheduled firmware attestation scans completed for 4 of 6 enrolled devices. 2 devices pending verification.', device: 'Fleet', timestamp: '2026-02-09T14:32:00Z', acknowledged: true, category: 'Device Trust' },
];

// Helper components
const StatusDot: React.FC<{ color: 'green' | 'yellow' | 'red' | 'blue' }> = ({ color }) => {
  const colors = {
    green: 'bg-emerald-400 shadow-emerald-400/50',
    yellow: 'bg-amber-400 shadow-amber-400/50',
    red: 'bg-red-400 shadow-red-400/50',
    blue: 'bg-cyan-400 shadow-cyan-400/50',
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full shadow-lg ${colors[color]} animate-pulse`} />;
};

const TrustBar: React.FC<{ score: number }> = ({ score }) => {
  const barColor = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
      <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${score}%` }} />
    </div>
  );
};

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const styles: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/40',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    info: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[severity] || styles.info} uppercase tracking-wider`}>
      {severity}
    </span>
  );
};

const StatusBadge: React.FC<{ label: string; variant: 'success' | 'warning' | 'danger' }> = ({ label, variant }) => {
  const styles = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    danger: 'bg-red-500/20 text-red-400 border-red-500/40',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[variant]}`}>
      {label}
    </span>
  );
};

const formatTimestamp = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const HardwareIntegrity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Device Trust');
  const [liveTimestamp, setLiveTimestamp] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLiveTimestamp(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Stat counters ──
  const totalDevices = mockDeviceTrust.length;
  const trustedDevices = mockDeviceTrust.filter(d => d.trustScore >= 80).length;
  const peripheralsBlocked = mockPeripherals.filter(p => p.status === 'blocked').length;
  const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;

  // ── Device Trust Tab ──
  const renderDeviceTrust = () => (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Devices', value: totalDevices, color: 'text-cyan-400' },
          { label: 'Trusted', value: trustedDevices, color: 'text-emerald-400' },
          { label: 'Warnings', value: mockDeviceTrust.filter(d => d.tpmStatus === 'warning').length, color: 'text-amber-400' },
          { label: 'Failed', value: mockDeviceTrust.filter(d => d.tpmStatus === 'failed').length, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
            <p className="text-slate-400 text-sm mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Device grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockDeviceTrust.map(device => (
          <div key={device.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">{device.name}</h3>
                <p className="text-slate-400 text-sm">{device.type} • {device.id}</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold ${device.trustScore >= 80 ? 'text-emerald-400' : device.trustScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {device.trustScore}%
                </span>
                <p className="text-slate-500 text-xs">Trust Score</p>
              </div>
            </div>
            <TrustBar score={device.trustScore} />
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <StatusDot color={device.tpmStatus === 'verified' ? 'green' : device.tpmStatus === 'warning' ? 'yellow' : 'red'} />
                <span className="text-slate-300">TPM {device.tpmStatus === 'verified' ? 'Verified' : device.tpmStatus === 'warning' ? 'Warning' : 'Failed'}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot color={device.secureBoot ? 'green' : 'red'} />
                <span className="text-slate-300">Secure Boot {device.secureBoot ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot color={device.biosIntegrity === 'intact' ? 'green' : device.biosIntegrity === 'modified' ? 'yellow' : 'red'} />
                <span className="text-slate-300">BIOS {device.biosIntegrity}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot color={device.firmwareAttestation === 'passed' ? 'green' : device.firmwareAttestation === 'pending' ? 'yellow' : 'red'} />
                <span className="text-slate-300">Firmware {device.firmwareAttestation}</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-3">Last checked: {formatTimestamp(device.lastChecked)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Peripheral Monitor Tab ──
  const renderPeripheralMonitor = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Connected Devices', value: mockPeripherals.length, color: 'text-cyan-400' },
          { label: 'Allowed', value: mockPeripherals.filter(p => p.status === 'allowed').length, color: 'text-emerald-400' },
          { label: 'Blocked', value: peripheralsBlocked, color: 'text-red-400' },
          { label: 'High Risk (>70)', value: mockPeripherals.filter(p => p.riskScore > 70).length, color: 'text-pink-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
            <p className="text-slate-400 text-sm mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Peripheral table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left p-4 font-medium">Device</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Vendor</th>
                <th className="text-left p-4 font-medium">Risk</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Fingerprint</th>
                <th className="text-left p-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {mockPeripherals.map(p => (
                <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <p className="text-white font-medium">{p.name}</p>
                    <p className="text-slate-500 text-xs">{p.serialNumber}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs font-mono">{p.type}</span>
                  </td>
                  <td className="p-4 text-slate-300">{p.vendor}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <TrustBar score={100 - p.riskScore} />
                      </div>
                      <span className={`text-xs font-bold ${p.riskScore > 70 ? 'text-red-400' : p.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {p.riskScore}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge
                      label={p.status}
                      variant={p.status === 'allowed' ? 'success' : p.status === 'blocked' ? 'danger' : 'warning'}
                    />
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-400">{p.fingerprint}</td>
                  <td className="p-4 text-slate-300 text-xs">{p.dataTransferred}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device type breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['USB', 'Thunderbolt', 'PCIe', 'Bluetooth'] as const).map(type => {
          const count = mockPeripherals.filter(p => p.type === type).length;
          const blocked = mockPeripherals.filter(p => p.type === type && p.status === 'blocked').length;
          return (
            <div key={type} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-cyan-400 font-semibold text-sm mb-2">{type}</p>
              <p className="text-white text-2xl font-bold">{count}</p>
              <p className="text-slate-400 text-xs">{blocked} blocked</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Implant Detection Tab ──
  const renderImplantDetection = () => (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
          <p className="text-slate-400 text-sm mb-1">Scans Completed</p>
          <p className="text-3xl font-bold text-cyan-400">{mockImplantScans.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
          <p className="text-slate-400 text-sm mb-1">Anomalies Found</p>
          <p className="text-3xl font-bold text-amber-400">{mockImplantScans.filter(s => s.result === 'anomaly').length}</p>
        </div>
        <div className="bg-slate-800 border border-red-500/40 rounded-xl p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
          <p className="text-slate-400 text-sm mb-1 relative">Critical Detections</p>
          <p className="text-3xl font-bold text-red-400 relative">{mockImplantScans.filter(s => s.result === 'critical').length}</p>
        </div>
      </div>

      {/* Scan results */}
      <div className="space-y-4">
        {mockImplantScans.map(scan => (
          <div
            key={scan.id}
            className={`bg-slate-800 border rounded-xl p-5 transition-colors ${
              scan.result === 'critical'
                ? 'border-red-500/60 hover:border-red-400'
                : scan.result === 'anomaly'
                ? 'border-amber-500/40 hover:border-amber-400'
                : 'border-slate-700 hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-semibold">{scan.target}</h3>
                  <SeverityBadge severity={scan.result === 'critical' ? 'critical' : scan.result === 'anomaly' ? 'medium' : 'info'} />
                </div>
                <p className="text-slate-400 text-sm">Method: {scan.method}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${scan.confidence >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {scan.confidence}%
                </p>
                <p className="text-slate-500 text-xs">Confidence</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Power Deviation</p>
                <p className={`font-mono text-sm ${scan.powerDeviation > 5 ? 'text-red-400' : scan.powerDeviation > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {scan.powerDeviation > 0 ? '+' : ''}{scan.powerDeviation}%
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">EM Signature</p>
                <p className={`font-mono text-sm ${scan.emSignature === 'NOMINAL' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {scan.emSignature}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Board Integrity</p>
                <StatusBadge
                  label={scan.boardIntegrity}
                  variant={scan.boardIntegrity === 'verified' ? 'success' : scan.boardIntegrity === 'suspect' ? 'warning' : 'danger'}
                />
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Last Scan</p>
                <p className="text-slate-300 text-sm">{formatTimestamp(scan.lastScan)}</p>
              </div>
            </div>

            {scan.result === 'critical' && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm font-medium">⚠ IMMEDIATE ACTION REQUIRED — Physical inspection recommended. Device has been isolated from the network.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ── TPM & Attestation Tab ──
  const renderTPMAttestation = () => (
    <div className="space-y-6">
      {/* TPM overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
          <p className="text-slate-400 text-sm mb-1">TPM Chips Enrolled</p>
          <p className="text-3xl font-bold text-cyan-400">{mockTPMRecords.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
          <p className="text-slate-400 text-sm mb-1">Attestations Passed</p>
          <p className="text-3xl font-bold text-emerald-400">{mockTPMRecords.filter(t => t.attestationResult === 'passed').length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
          <p className="text-slate-400 text-sm mb-1">Boot Chain Failures</p>
          <p className="text-3xl font-bold text-red-400">{mockTPMRecords.filter(t => !t.bootChainValid).length}</p>
        </div>
      </div>

      {/* TPM cards */}
      {mockTPMRecords.map(tpm => (
        <div key={tpm.id} className={`bg-slate-800 border rounded-xl p-6 ${tpm.health === 'healthy' ? 'border-slate-700' : 'border-amber-500/40'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg flex items-center gap-3">
                {tpm.manufacturer}
                <StatusBadge
                  label={tpm.health}
                  variant={tpm.health === 'healthy' ? 'success' : tpm.health === 'degraded' ? 'warning' : 'danger'}
                />
              </h3>
              <p className="text-slate-400 text-sm">{tpm.chipVersion} • {tpm.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot color={tpm.attestationResult === 'passed' ? 'green' : tpm.attestationResult === 'failed' ? 'red' : 'yellow'} />
              <span className={`font-semibold ${tpm.attestationResult === 'passed' ? 'text-emerald-400' : 'text-red-400'}`}>
                Attestation {tpm.attestationResult.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Boot Chain</p>
              <div className="flex items-center gap-2">
                <StatusDot color={tpm.bootChainValid ? 'green' : 'red'} />
                <span className="text-slate-300">{tpm.bootChainValid ? 'Valid' : 'Broken'}</span>
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Last Attestation</p>
              <p className="text-slate-300">{formatTimestamp(tpm.lastAttestation)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">EK Hash</p>
              <p className="text-slate-400 font-mono text-xs truncate">{tpm.endorsementKeyHash}</p>
            </div>
          </div>

          {/* PCR Values */}
          <div className="mt-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">Platform Configuration Registers</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tpm.pcrValues.map((pcr, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    pcr.status === 'match'
                      ? 'bg-slate-900 border-slate-700'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-mono text-xs font-bold w-14">{pcr.register}</span>
                    <span className="text-slate-300 font-mono text-xs">{pcr.value}</span>
                  </div>
                  <StatusBadge
                    label={pcr.status}
                    variant={pcr.status === 'match' ? 'success' : 'danger'}
                  />
                </div>
              ))}
            </div>
          </div>

          {!tpm.bootChainValid && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-400 text-sm font-medium">⚠ Measured boot chain integrity violation detected. Re-attestation and firmware audit recommended.</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ── Alerts Tab ──
  const renderAlerts = () => (
    <div className="space-y-6">
      {/* Alert stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(['critical', 'high', 'medium', 'low', 'info'] as const).map(sev => {
          const count = mockAlerts.filter(a => a.severity === sev).length;
          const unack = mockAlerts.filter(a => a.severity === sev && !a.acknowledged).length;
          return (
            <div key={sev} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
              <SeverityBadge severity={sev} />
              <p className="text-white text-2xl font-bold mt-2">{count}</p>
              <p className="text-slate-500 text-xs">{unack} unacknowledged</p>
            </div>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {mockAlerts.map(alert => (
          <div
            key={alert.id}
            className={`bg-slate-800 border rounded-xl p-5 transition-colors ${
              alert.severity === 'critical' && !alert.acknowledged
                ? 'border-red-500/50 hover:border-red-400'
                : 'border-slate-700 hover:border-slate-600'
            } ${alert.acknowledged ? 'opacity-70' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <SeverityBadge severity={alert.severity} />
                <h3 className="text-white font-semibold">{alert.title}</h3>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {alert.acknowledged && (
                  <span className="text-slate-500 text-xs border border-slate-600 rounded px-2 py-0.5">ACK</span>
                )}
                <span className="text-slate-500 text-xs whitespace-nowrap">{formatTimestamp(alert.timestamp)}</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-3">{alert.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Device: <span className="text-slate-300">{alert.device}</span></span>
              <span>Category: <span className="text-cyan-400">{alert.category}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Tab renderer map ──
  const tabContent: Record<Tab, () => JSX.Element> = {
    'Device Trust': renderDeviceTrust,
    'Peripheral Monitor': renderPeripheralMonitor,
    'Implant Detection': renderImplantDetection,
    'TPM & Attestation': renderTPMAttestation,
    'Alerts': renderAlerts,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-cyan-400">Hardware</span> Integrity Layer
          </h1>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-pink-500/20 text-pink-400 border border-pink-500/40 animate-pulse">
            World First
          </span>
        </div>
        <p className="text-slate-400 max-w-3xl">
          The industry's first platform-level hardware trust verification engine. Detect malicious peripherals, hardware
          implants, BIOS/UEFI tampering, and TPM manipulation before they compromise your infrastructure.
        </p>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <StatusDot color="green" />
            Live Monitoring Active
          </span>
          <span>Last scan sweep: {liveTimestamp.toLocaleTimeString()}</span>
          <span>{criticalAlerts > 0 ? `${criticalAlerts} critical alert${criticalAlerts > 1 ? 's' : ''} pending` : 'No critical alerts'}</span>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 mb-6 bg-slate-800/50 rounded-xl p-1 border border-slate-700 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50 border border-transparent'
            }`}
          >
            {tab}
            {tab === 'Alerts' && criticalAlerts > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                {criticalAlerts}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div>{tabContent[activeTab]()}</div>
    </div>
  );
};

export default HardwareIntegrity;
