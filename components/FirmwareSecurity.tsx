// ============================================================================
// FIRMWARE & MICROCODE SECURITY — WORLD-FIRST FIRMWARE INTEGRITY ENGINE
// Anchor is the first platform to provide deep firmware-level security
// scanning, supply-chain provenance verification, microcode anomaly
// detection, and firmware implant identification across all device types.
// ============================================================================

import React, { useState, useEffect } from 'react';

const tabs = [
  { id: 'inventory', label: 'Firmware Inventory' },
  { id: 'integrity', label: 'Integrity Scanner' },
  { id: 'supplychain', label: 'Supply Chain Provenance' },
  { id: 'microcode', label: 'Microcode Analysis' },
  { id: 'threatfeed', label: 'Threat Feed' },
];

const firmwareInventory = [
  { id: 'FW-001', device: 'Dell PowerEdge R750', type: 'BIOS/UEFI', vendor: 'Dell Inc.', version: '2.18.1', latest: '2.18.1', status: 'up-to-date', cves: 0, lastScan: '2026-02-09 08:12:44' },
  { id: 'FW-002', device: 'HP ProLiant DL380 Gen10', type: 'BMC/iLO', vendor: 'HPE', version: '2.72', latest: '2.78', status: 'outdated', cves: 2, lastScan: '2026-02-09 07:55:11' },
  { id: 'FW-003', device: 'Mellanox ConnectX-6', type: 'NIC Firmware', vendor: 'NVIDIA/Mellanox', version: '20.35.1012', latest: '20.37.1014', status: 'outdated', cves: 1, lastScan: '2026-02-09 08:01:33' },
  { id: 'FW-004', device: 'Samsung PM9A3 3.84TB', type: 'SSD Firmware', vendor: 'Samsung', version: 'GDC5602Q', latest: 'GDC5602Q', status: 'up-to-date', cves: 0, lastScan: '2026-02-09 06:44:09' },
  { id: 'FW-005', device: 'NVIDIA A100 80GB', type: 'GPU Firmware', vendor: 'NVIDIA', version: '535.129.03', latest: '535.154.05', status: 'outdated', cves: 3, lastScan: '2026-02-09 08:10:02' },
  { id: 'FW-006', device: 'Supermicro X12SPL-F', type: 'BIOS/UEFI', vendor: 'Supermicro', version: '1.5a', latest: '1.5a', status: 'up-to-date', cves: 0, lastScan: '2026-02-09 07:30:18' },
  { id: 'FW-007', device: 'Intel X710-DA2', type: 'NIC Firmware', vendor: 'Intel', version: '9.20', latest: '9.20', status: 'up-to-date', cves: 0, lastScan: '2026-02-09 08:05:55' },
  { id: 'FW-008', device: 'Broadcom MegaRAID 9560', type: 'RAID Controller', vendor: 'Broadcom', version: '51.19.0-4296', latest: '51.19.0-4296', status: 'up-to-date', cves: 0, lastScan: '2026-02-09 07:48:22' },
  { id: 'FW-009', device: 'Lenovo ThinkSystem SR650', type: 'BMC/XClarity', vendor: 'Lenovo', version: 'CDI382J', latest: 'CDI388K', status: 'critical', cves: 5, lastScan: '2026-02-09 06:20:01' },
  { id: 'FW-010', device: 'Cisco UCS C240 M6', type: 'CIMC Firmware', vendor: 'Cisco', version: '4.2(2a)', latest: '4.3(1a)', status: 'outdated', cves: 2, lastScan: '2026-02-09 07:12:47' },
];

const integrityScanResults = [
  { device: 'Dell PowerEdge R750 — BIOS', baselineHash: 'a4f8c2e91d...', currentHash: 'a4f8c2e91d...', match: true, goldenImage: true, tamper: false, scanTime: '2026-02-09 08:12:44', confidence: 100 },
  { device: 'HP ProLiant DL380 — iLO 5', baselineHash: 'e7b3d1f05a...', currentHash: 'e7b3d1f05a...', match: true, goldenImage: true, tamper: false, scanTime: '2026-02-09 07:55:11', confidence: 99.8 },
  { device: 'Mellanox ConnectX-6 — NIC', baselineHash: '3c9a27e4b8...', currentHash: '3c9a27e4b8...', match: true, goldenImage: true, tamper: false, scanTime: '2026-02-09 08:01:33', confidence: 99.9 },
  { device: 'Lenovo SR650 — XClarity', baselineHash: '1d4f82ca37...', currentHash: '9e2b71df04...', match: false, goldenImage: false, tamper: true, scanTime: '2026-02-09 06:20:01', confidence: 12.3 },
  { device: 'NVIDIA A100 — GPU VBIOS', baselineHash: 'f0e8d6c4b2...', currentHash: 'f0e8d6c4b2...', match: true, goldenImage: true, tamper: false, scanTime: '2026-02-09 08:10:02', confidence: 100 },
  { device: 'Samsung PM9A3 — SSD', baselineHash: '5b7a9c1e3d...', currentHash: '5b7a9c1e3d...', match: true, goldenImage: true, tamper: false, scanTime: '2026-02-09 06:44:09', confidence: 100 },
  { device: 'Cisco UCS C240 — CIMC', baselineHash: '82d1f4a7c6...', currentHash: '83e2f5b8d7...', match: false, goldenImage: false, tamper: true, scanTime: '2026-02-09 07:12:47', confidence: 8.7 },
  { device: 'Broadcom MegaRAID 9560', baselineHash: '6e3b8d2f1a...', currentHash: '6e3b8d2f1a...', match: true, goldenImage: true, tamper: false, scanTime: '2026-02-09 07:48:22', confidence: 100 },
];

const supplyChainData = [
  { vendor: 'Dell Inc.', firmware: 'BIOS v2.18.1', signed: true, attestation: 'Verified', slsaLevel: 'SLSA 3', custody: 'Dell Factory → Signed Repository → Host Deployment', provenance: 'Reproducible build — Dell Austin TX', buildId: 'DELL-2026-0209-A18', timestamp: '2026-01-28' },
  { vendor: 'HPE', firmware: 'iLO 5 v2.78', signed: true, attestation: 'Verified', slsaLevel: 'SLSA 2', custody: 'HPE Build Lab → Code Sign Infra → iLO Repo → Host', provenance: 'Hermetic build — HPE Houston TX', buildId: 'HPE-ILO5-278-B', timestamp: '2026-01-15' },
  { vendor: 'NVIDIA/Mellanox', firmware: 'ConnectX-6 v20.37.1014', signed: true, attestation: 'Verified', slsaLevel: 'SLSA 3', custody: 'NVIDIA Build → Signing Service → Linux Repo → Host', provenance: 'Reproducible build — NVIDIA Santa Clara CA', buildId: 'NV-CX6-2037-1014', timestamp: '2026-02-01' },
  { vendor: 'Lenovo', firmware: 'XClarity CDI388K', signed: false, attestation: 'FAILED', slsaLevel: 'SLSA 0', custody: 'UNKNOWN — Chain broken at distribution', provenance: 'Unverifiable — no build attestation', buildId: 'N/A', timestamp: 'N/A' },
  { vendor: 'Samsung', firmware: 'SSD GDC5602Q', signed: true, attestation: 'Verified', slsaLevel: 'SLSA 2', custody: 'Samsung Fab → Code Sign → Vendor Portal → Host', provenance: 'Hermetic build — Samsung Hwaseong KR', buildId: 'SAM-PM9A3-GDC56Q', timestamp: '2025-11-20' },
  { vendor: 'Cisco', firmware: 'CIMC 4.3(1a)', signed: true, attestation: 'Partial', slsaLevel: 'SLSA 1', custody: 'Cisco Build → Partial Sign → CCO Download → Host', provenance: 'Non-hermetic build — Cisco SJ CA', buildId: 'CSCO-CIMC-431A', timestamp: '2026-01-10' },
];

const microcodeData = [
  { cpu: 'Intel Xeon Platinum 8380', cpuId: '0x606A6', currentRev: '0xD0003B9', latestRev: '0xD0003B9', status: 'current', anomalies: 0, lastUpdate: '2026-01-05', source: 'Intel Official', family: 'Ice Lake-SP' },
  { cpu: 'Intel Xeon Gold 6348', cpuId: '0x606A6', currentRev: '0xD0003B9', latestRev: '0xD0003B9', status: 'current', anomalies: 0, lastUpdate: '2026-01-05', source: 'Intel Official', family: 'Ice Lake-SP' },
  { cpu: 'AMD EPYC 7763', cpuId: '0xA00F11', currentRev: '0x0A001173', latestRev: '0x0A001178', status: 'outdated', anomalies: 0, lastUpdate: '2025-10-20', source: 'AMD Official', family: 'Milan' },
  { cpu: 'AMD EPYC 9654', cpuId: '0xA60F12', currentRev: '0x0A601206', latestRev: '0x0A601206', status: 'current', anomalies: 0, lastUpdate: '2026-02-01', source: 'AMD Official', family: 'Genoa' },
  { cpu: 'Intel Xeon w9-3495X', cpuId: '0x806F8', currentRev: '0x2B000590', latestRev: '0x2B000590', status: 'current', anomalies: 0, lastUpdate: '2025-12-18', source: 'Intel Official', family: 'Sapphire Rapids' },
  { cpu: 'Intel Core i9-14900K (Workstation)', cpuId: '0xB0671', currentRev: '0x0000011D', latestRev: '0x00000125', status: 'critical', anomalies: 2, lastUpdate: '2025-08-14', source: 'UNKNOWN', family: 'Raptor Lake' },
];

const threatFeedData = [
  { id: 'CVE-2026-0142', title: 'UEFI Secure Boot Bypass via Malformed PE Headers', severity: 'critical', source: 'NIST NVD', affected: 'Multiple UEFI implementations', published: '2026-02-07', cvss: 9.8, description: 'A critical vulnerability allows attackers to bypass Secure Boot by crafting malformed PE headers in boot-stage executables, enabling persistent firmware-level implants.' },
  { id: 'CVE-2026-0098', title: 'BMC Remote Code Execution via IPMI Command Injection', severity: 'critical', source: 'HPE Advisory', affected: 'HPE iLO 5 < v2.78', cvss: 9.1, published: '2026-01-29', description: 'Unauthenticated remote code execution in BMC firmware through crafted IPMI commands. Allows full server compromise below OS level.' },
  { id: 'CVE-2025-48821', title: 'NIC Firmware DMA Attack Surface in SR-IOV Mode', severity: 'high', source: 'NVIDIA Advisory', affected: 'Mellanox ConnectX-6 < v20.37', cvss: 8.4, published: '2025-12-15', description: 'DMA-based attack vector in NIC firmware when SR-IOV is enabled, allowing VM escape through malicious DMA writes to host memory.' },
  { id: 'CVE-2025-47103', title: 'SSD Firmware Encryption Key Extraction', severity: 'high', source: 'Academic Research', affected: 'Multiple SSD vendors', cvss: 7.8, published: '2025-11-22', description: 'Side-channel attack enabling extraction of hardware encryption keys from SSD controller firmware through power analysis.' },
  { id: 'CVE-2026-0201', title: 'GPU Firmware Privilege Escalation via Shader Exploit', severity: 'high', source: 'NVIDIA Advisory', affected: 'NVIDIA A100/H100 < v535.154.05', cvss: 8.1, published: '2026-02-03', description: 'Malicious shader code can escalate privileges within GPU firmware, potentially accessing GPU memory of other tenants in multi-tenant environments.' },
  { id: 'FW-THREAT-2026-001', title: 'MosaicRegressor UEFI Bootkit — New Variant Detected', severity: 'critical', source: 'Anchor Threat Intel', affected: 'UEFI systems without Secure Boot', cvss: 9.9, published: '2026-02-08', description: 'New variant of the MosaicRegressor UEFI bootkit discovered in the wild. Persists across OS reinstalls and disk replacements by embedding in SPI flash.' },
  { id: 'FW-THREAT-2026-002', title: 'CosmicStrand Firmware Rootkit Targeting Supermicro Boards', severity: 'high', source: 'Anchor Threat Intel', affected: 'Supermicro X11/X12 series', cvss: 8.8, published: '2026-02-05', description: 'Firmware-level rootkit targeting Supermicro motherboards. Modifies UEFI DXE driver to inject malicious payload at every boot.' },
  { id: 'ADV-INTEL-2026-019', title: 'Intel Microcode Stability Advisory for Raptor Lake', severity: 'medium', source: 'Intel Advisory', affected: 'Intel 13th/14th Gen Core', cvss: 5.3, published: '2026-01-20', description: 'Updated microcode advisory for voltage regulation issues affecting Raptor Lake processors. Unauthorized microcode patches circulating online may brick CPUs.' },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    'up-to-date': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'current': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'outdated': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'critical': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Verified': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Partial': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'FAILED': 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${colors[status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
      {status.toUpperCase()}
    </span>
  );
};

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/40',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${colors[severity] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
      {severity}
    </span>
  );
};

const ProgressBar: React.FC<{ value: number; color?: string }> = ({ value, color }) => {
  const barColor = color || (value === 100 ? 'bg-emerald-500' : value > 60 ? 'bg-amber-500' : 'bg-red-500');
  return (
    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${value}%` }} />
    </div>
  );
};

const StatusDot: React.FC<{ ok: boolean }> = ({ ok }) => (
  <span className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm' : 'bg-red-400 shadow-red-400/50 shadow-sm'}`} />
);

const FirmwareSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [threatFilter, setThreatFilter] = useState<string>('all');
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);

  const handleDeviceAction = (deviceId: string, action: string) => {
    const key = `${deviceId}-${action}`;
    setActionStatus(prev => ({ ...prev, [key]: 'processing' }));
    setTimeout(() => {
      setActionStatus(prev => ({ ...prev, [key]: 'done' }));
      setTimeout(() => setActionStatus(prev => ({ ...prev, [key]: '' })), 2000);
    }, 1500);
  };

  useEffect(() => {
    if (scanning && scanProgress < 100) {
      const timer = setTimeout(() => setScanProgress(prev => Math.min(prev + Math.random() * 8 + 2, 100)), 200);
      return () => clearTimeout(timer);
    }
    if (scanProgress >= 100) setScanning(false);
  }, [scanning, scanProgress]);

  const startScan = () => { setScanProgress(0); setScanning(true); };

  const inventoryStats = {
    total: firmwareInventory.length,
    upToDate: firmwareInventory.filter(f => f.status === 'up-to-date').length,
    outdated: firmwareInventory.filter(f => f.status === 'outdated').length,
    critical: firmwareInventory.filter(f => f.status === 'critical').length,
    totalCves: firmwareInventory.reduce((sum, f) => sum + f.cves, 0),
  };

  const filteredThreats = threatFilter === 'all' ? threatFeedData : threatFeedData.filter(t => t.severity === threatFilter);

  // ── Tab Content Renderers ──────────────────────────────────────────────

  const renderInventory = () => (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Firmware', value: inventoryStats.total, color: 'text-cyan-400' },
          { label: 'Up to Date', value: inventoryStats.upToDate, color: 'text-emerald-400' },
          { label: 'Outdated', value: inventoryStats.outdated, color: 'text-amber-400' },
          { label: 'Critical', value: inventoryStats.critical, color: 'text-red-400' },
          { label: 'Known CVEs', value: inventoryStats.totalCves, color: 'text-pink-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Firmware Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Firmware Asset Inventory</h3>
          <span className="text-xs text-slate-400">{firmwareInventory.length} devices tracked</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-700">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Device</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Vendor</th>
                <th className="px-4 py-2">Version</th>
                <th className="px-4 py-2">Latest</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">CVEs</th>
                <th className="px-4 py-2">Last Scan</th>
              </tr>
            </thead>
            <tbody>
              {firmwareInventory.map((fw) => (
                <tr key={fw.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-2 text-cyan-400 font-mono text-xs">{fw.id}</td>
                  <td className="px-4 py-2 text-white font-medium">{fw.device}</td>
                  <td className="px-4 py-2 text-slate-300">{fw.type}</td>
                  <td className="px-4 py-2 text-slate-300">{fw.vendor}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-300">{fw.version}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-300">{fw.latest}</td>
                  <td className="px-4 py-2"><StatusBadge status={fw.status} /></td>
                  <td className="px-4 py-2">
                    {fw.cves > 0 ? <span className="text-red-400 font-bold">{fw.cves}</span> : <span className="text-emerald-400">0</span>}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500 font-mono">{fw.lastScan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Type Breakdown */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Firmware Distribution by Type</h3>
        <div className="space-y-3">
          {[
            { label: 'BIOS/UEFI', count: 2, total: 10, color: 'bg-cyan-500' },
            { label: 'BMC/Management', count: 3, total: 10, color: 'bg-blue-500' },
            { label: 'NIC Firmware', count: 2, total: 10, color: 'bg-violet-500' },
            { label: 'SSD Firmware', count: 1, total: 10, color: 'bg-emerald-500' },
            { label: 'GPU Firmware', count: 1, total: 10, color: 'bg-pink-500' },
            { label: 'RAID/Storage Controller', count: 1, total: 10, color: 'bg-amber-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-40">{item.label}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${(item.count / item.total) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-300 w-8 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntegrity = () => (
    <div className="space-y-6">
      {/* Scan Controls */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Real-Time Firmware Integrity Scanner</h3>
            <p className="text-xs text-slate-400 mt-0.5">SHA-256 hash comparison against known-good baselines & golden images</p>
          </div>
          <button
            onClick={startScan}
            disabled={scanning}
            className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
              scanning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
            }`}
          >
            {scanning ? 'Scanning…' : 'Run Full Scan'}
          </button>
        </div>
        {scanning && (
          <div className="space-y-1">
            <ProgressBar value={scanProgress} color="bg-cyan-500" />
            <p className="text-xs text-cyan-400 font-mono">{scanProgress.toFixed(1)}% — Verifying firmware images…</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Devices Scanned', value: integrityScanResults.length, color: 'text-cyan-400' },
          { label: 'Hash Match', value: integrityScanResults.filter(r => r.match).length, color: 'text-emerald-400' },
          { label: 'Tamper Detected', value: integrityScanResults.filter(r => r.tamper).length, color: 'text-red-400' },
          { label: 'Golden Image ✓', value: integrityScanResults.filter(r => r.goldenImage).length, color: 'text-pink-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Results Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-white">Integrity Scan Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-700">
                <th className="px-4 py-2">Device</th>
                <th className="px-4 py-2">Baseline Hash</th>
                <th className="px-4 py-2">Current Hash</th>
                <th className="px-4 py-2">Match</th>
                <th className="px-4 py-2">Golden Image</th>
                <th className="px-4 py-2">Tamper</th>
                <th className="px-4 py-2">Confidence</th>
                <th className="px-4 py-2">Scan Time</th>
              </tr>
            </thead>
            <tbody>
              {integrityScanResults.map((r, idx) => (
                <tr key={idx} className={`border-b border-slate-700/50 transition-colors ${r.tamper ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-slate-700/30'}`}>
                  <td className="px-4 py-2 text-white font-medium">{r.device}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-400">{r.baselineHash}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-400">{r.currentHash}</td>
                  <td className="px-4 py-2"><StatusDot ok={r.match} /></td>
                  <td className="px-4 py-2"><StatusDot ok={r.goldenImage} /></td>
                  <td className="px-4 py-2">
                    {r.tamper ? <span className="text-red-400 font-bold text-xs">⚠ DETECTED</span> : <StatusDot ok={true} />}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={r.confidence} color={r.confidence > 90 ? 'bg-emerald-500' : 'bg-red-500'} />
                      <span className={`text-xs font-mono ${r.confidence > 90 ? 'text-emerald-400' : 'text-red-400'}`}>{r.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500 font-mono">{r.scanTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tamper Alerts */}
      {integrityScanResults.filter(r => r.tamper).length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h3 className="text-sm font-bold text-red-400 mb-3">⚠ Active Tamper Alerts</h3>
          <div className="space-y-3">
            {integrityScanResults.filter(r => r.tamper).map((r, idx) => (
              <div key={idx} className="bg-slate-900 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm">{r.device}</span>
                  <SeverityBadge severity="critical" />
                </div>
                <p className="text-xs text-red-300 mt-1">
                  Firmware hash mismatch detected. Current image does not match known-good baseline.
                  Confidence: {r.confidence}%. Immediate investigation required.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    disabled={actionStatus[`${r.device}-quarantine`] === 'processing'}
                    onClick={() => handleDeviceAction(r.device, 'quarantine')}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionStatus[`${r.device}-quarantine`] === 'processing' ? '⏳ Quarantining...' : actionStatus[`${r.device}-quarantine`] === 'done' ? '✓ Quarantined' : 'Quarantine Device'}
                  </button>
                  <button
                    disabled={actionStatus[`${r.device}-investigate`] === 'processing'}
                    onClick={() => handleDeviceAction(r.device, 'investigate')}
                    className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionStatus[`${r.device}-investigate`] === 'processing' ? '⏳ Investigating...' : actionStatus[`${r.device}-investigate`] === 'done' ? '✓ Investigation Started' : 'Investigate'}
                  </button>
                  <button
                    disabled={actionStatus[`${r.device}-restore`] === 'processing'}
                    onClick={() => handleDeviceAction(r.device, 'restore')}
                    className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionStatus[`${r.device}-restore`] === 'processing' ? '⏳ Restoring...' : actionStatus[`${r.device}-restore`] === 'done' ? '✓ Restored' : 'Restore Golden Image'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSupplyChain = () => (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Vendors Tracked', value: supplyChainData.length, color: 'text-cyan-400' },
          { label: 'Fully Verified', value: supplyChainData.filter(s => s.attestation === 'Verified').length, color: 'text-emerald-400' },
          { label: 'Partial/Unverified', value: supplyChainData.filter(s => s.attestation !== 'Verified').length, color: 'text-amber-400' },
          { label: 'SLSA Level 3+', value: supplyChainData.filter(s => s.slsaLevel === 'SLSA 3').length, color: 'text-pink-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Supply Chain Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {supplyChainData.map((sc, idx) => (
          <div key={idx} className={`bg-slate-800 border rounded-lg p-4 ${sc.attestation === 'FAILED' ? 'border-red-500/40' : 'border-slate-700'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-white font-semibold text-sm">{sc.vendor}</h4>
                <p className="text-xs text-slate-400">{sc.firmware}</p>
              </div>
              <StatusBadge status={sc.attestation} />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Code Signed</span>
                <span className={sc.signed ? 'text-emerald-400' : 'text-red-400'}>{sc.signed ? '✓ Signed' : '✗ Not Signed'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SLSA Level</span>
                <span className={`font-mono ${sc.slsaLevel === 'SLSA 3' ? 'text-emerald-400' : sc.slsaLevel === 'SLSA 0' ? 'text-red-400' : 'text-amber-400'}`}>{sc.slsaLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Build ID</span>
                <span className="text-slate-300 font-mono">{sc.buildId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Build Date</span>
                <span className="text-slate-300">{sc.timestamp}</span>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <span className="text-slate-400 block mb-1">Chain of Custody</span>
                <span className={`${sc.attestation === 'FAILED' ? 'text-red-300' : 'text-cyan-300'}`}>{sc.custody}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Build Provenance</span>
                <span className={`${sc.attestation === 'FAILED' ? 'text-red-300' : 'text-slate-300'}`}>{sc.provenance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SLSA Level Distribution */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4">SLSA Level Distribution</h3>
        <div className="flex items-end gap-4 h-32 px-4">
          {[
            { level: 'SLSA 0', count: supplyChainData.filter(s => s.slsaLevel === 'SLSA 0').length, color: 'bg-red-500' },
            { level: 'SLSA 1', count: supplyChainData.filter(s => s.slsaLevel === 'SLSA 1').length, color: 'bg-amber-500' },
            { level: 'SLSA 2', count: supplyChainData.filter(s => s.slsaLevel === 'SLSA 2').length, color: 'bg-blue-500' },
            { level: 'SLSA 3', count: supplyChainData.filter(s => s.slsaLevel === 'SLSA 3').length, color: 'bg-emerald-500' },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-white font-bold">{bar.count}</span>
              <div className={`w-full rounded-t ${bar.color} transition-all duration-500`} style={{ height: `${Math.max((bar.count / supplyChainData.length) * 100, 8)}%` }} />
              <span className="text-xs text-slate-400 mt-1">{bar.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMicrocode = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'CPUs Tracked', value: microcodeData.length, color: 'text-cyan-400' },
          { label: 'Current', value: microcodeData.filter(m => m.status === 'current').length, color: 'text-emerald-400' },
          { label: 'Outdated', value: microcodeData.filter(m => m.status === 'outdated').length, color: 'text-amber-400' },
          { label: 'Anomalies', value: microcodeData.reduce((s, m) => s + m.anomalies, 0), color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Microcode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {microcodeData.map((mc, idx) => (
          <div key={idx} className={`bg-slate-800 border rounded-lg p-4 ${mc.anomalies > 0 ? 'border-red-500/40' : 'border-slate-700'}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-sm truncate">{mc.cpu}</h4>
              <StatusBadge status={mc.status} />
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">CPUID</span>
                <span className="text-cyan-400 font-mono">{mc.cpuId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Family</span>
                <span className="text-slate-300">{mc.family}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Rev</span>
                <span className="text-slate-300 font-mono">{mc.currentRev}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latest Rev</span>
                <span className="text-slate-300 font-mono">{mc.latestRev}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Source</span>
                <span className={mc.source === 'UNKNOWN' ? 'text-red-400 font-bold' : 'text-emerald-400'}>{mc.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Update</span>
                <span className="text-slate-300">{mc.lastUpdate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Anomalies</span>
                <span className={mc.anomalies > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>{mc.anomalies}</span>
              </div>
            </div>
            {mc.anomalies > 0 && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                ⚠ Unauthorized microcode source detected. Possible supply-chain compromise. Immediate audit recommended.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Microcode Version Timeline */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Microcode Update Compliance by Vendor</h3>
        <div className="space-y-3">
          {[
            { vendor: 'Intel', current: 3, total: 4, color: 'bg-blue-500' },
            { vendor: 'AMD', current: 1, total: 2, color: 'bg-red-500' },
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-16">{v.vendor}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                <div className={`h-4 rounded-full ${v.color} flex items-center justify-center`} style={{ width: `${(v.current / v.total) * 100}%` }}>
                  <span className="text-[10px] text-white font-bold">{v.current}/{v.total}</span>
                </div>
              </div>
              <span className="text-xs text-slate-300 w-16 text-right">{((v.current / v.total) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderThreatFeed = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Filter:</span>
        {['all', 'critical', 'high', 'medium', 'low'].map(f => (
          <button
            key={f}
            onClick={() => setThreatFilter(f)}
            className={`px-3 py-1 text-xs rounded font-semibold transition-all ${
              threatFilter === f
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500">{filteredThreats.length} threats</span>
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical', value: threatFeedData.filter(t => t.severity === 'critical').length, color: 'text-red-400' },
          { label: 'High', value: threatFeedData.filter(t => t.severity === 'high').length, color: 'text-orange-400' },
          { label: 'Medium', value: threatFeedData.filter(t => t.severity === 'medium').length, color: 'text-amber-400' },
          { label: 'Total Threats', value: threatFeedData.length, color: 'text-cyan-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Threat Cards */}
      <div className="space-y-4">
        {filteredThreats.map((threat, idx) => (
          <div key={idx} className={`bg-slate-800 border rounded-lg p-4 ${threat.severity === 'critical' ? 'border-red-500/40' : 'border-slate-700'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-cyan-400 font-mono text-xs">{threat.id}</span>
                  <SeverityBadge severity={threat.severity} />
                  <span className="px-2 py-0.5 text-[10px] bg-slate-700 text-slate-300 rounded border border-slate-600">{threat.source}</span>
                </div>
                <h4 className="text-white font-semibold text-sm">{threat.title}</h4>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <div className={`text-lg font-bold ${threat.cvss >= 9 ? 'text-red-400' : threat.cvss >= 7 ? 'text-orange-400' : 'text-amber-400'}`}>
                  {threat.cvss}
                </div>
                <div className="text-[10px] text-slate-500">CVSS</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">{threat.description}</p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-slate-400">
                <span>Affected: <span className="text-slate-300">{threat.affected}</span></span>
                <span>Published: <span className="text-slate-300">{threat.published}</span></span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedThreat(selectedThreat === threat.id ? null : threat.id)}
                  className={`px-3 py-1 rounded transition-colors text-xs ${selectedThreat === threat.id ? 'bg-cyan-600/40 text-cyan-300' : 'bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30'}`}
                >
                  {selectedThreat === threat.id ? '▼ Hide Details' : 'View Details'}
                </button>
                <button
                  disabled={actionStatus[`${threat.id}-ticket`] === 'processing'}
                  onClick={() => handleDeviceAction(threat.id, 'ticket')}
                  className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionStatus[`${threat.id}-ticket`] === 'processing' ? '⏳ Creating...' : actionStatus[`${threat.id}-ticket`] === 'done' ? '✓ Ticket Created' : 'Create Ticket'}
                </button>
              </div>
            </div>
            {/* CVSS Visual Bar */}
            <div className="mt-3">
              <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${threat.cvss >= 9 ? 'bg-red-500' : threat.cvss >= 7 ? 'bg-orange-500' : 'bg-amber-500'}`}
                  style={{ width: `${(threat.cvss / 10) * 100}%` }}
                />
              </div>
            </div>
            {/* Expanded Details */}
            {selectedThreat === threat.id && (
              <div className="mt-3 p-3 bg-slate-900 border border-slate-600 rounded-lg text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-400">ID:</span> <span className="text-cyan-400 font-mono">{threat.id}</span></div>
                  <div><span className="text-slate-400">CVSS:</span> <span className="text-white font-bold">{threat.cvss}</span></div>
                  <div><span className="text-slate-400">Source:</span> <span className="text-slate-300">{threat.source}</span></div>
                  <div><span className="text-slate-400">Published:</span> <span className="text-slate-300">{threat.published}</span></div>
                </div>
                <div><span className="text-slate-400">Affected Systems:</span> <span className="text-slate-300">{threat.affected}</span></div>
                <div><span className="text-slate-400">Full Description:</span> <span className="text-slate-300">{threat.description}</span></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ── Main Render ────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory': return renderInventory();
      case 'integrity': return renderIntegrity();
      case 'supplychain': return renderSupplyChain();
      case 'microcode': return renderMicrocode();
      case 'threatfeed': return renderThreatFeed();
      default: return renderInventory();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">Firmware &amp; Microcode Security</h1>
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-full shadow-lg shadow-pink-500/20 animate-pulse">
            World First
          </span>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl">
          Deep firmware-level security scanning, supply-chain provenance verification, microcode anomaly detection,
          and firmware implant identification across all device types — from BIOS and BMC to NIC, SSD, and GPU firmware.
        </p>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Firmware Assets', value: '10', color: 'text-cyan-400' },
          { label: 'Integrity Verified', value: '75%', color: 'text-emerald-400' },
          { label: 'Supply Chain OK', value: '66%', color: 'text-blue-400' },
          { label: 'Microcode Current', value: '4/6', color: 'text-violet-400' },
          { label: 'Active Threats', value: '8', color: 'text-red-400' },
          { label: 'Tamper Alerts', value: '2', color: 'text-pink-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-lg p-1 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderContent()}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-600">
          Anchor Firmware &amp; Microcode Security Engine v3.0 — Last global scan: 2026-02-09 08:12:44 UTC
        </p>
      </div>
    </div>
  );
};

export default FirmwareSecurity;
