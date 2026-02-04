import React, { useState } from 'react';

interface ClassificationLevel {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface SecureEnclave {
  id: string;
  name: string;
  classification: string;
  status: 'operational' | 'maintenance' | 'alert';
  lastAudit: string;
  personnelCleared: number;
  activeConnections: number;
}

interface ThreatBriefing {
  id: string;
  classification: string;
  title: string;
  source: string;
  timestamp: string;
  priority: 'flash' | 'immediate' | 'priority' | 'routine';
  summary: string;
}

const NationalSecurityModule: React.FC = () => {
  const [_classificationLevels] = useState<ClassificationLevel[]>([
    { id: 'ts-sci', name: 'TS/SCI', color: 'yellow', description: 'Top Secret / Sensitive Compartmented Information' },
    { id: 'ts', name: 'TOP SECRET', color: 'orange', description: 'Top Secret' },
    { id: 'secret', name: 'SECRET', color: 'red', description: 'Secret' },
    { id: 'cui', name: 'CUI', color: 'green', description: 'Controlled Unclassified Information' },
  ]);

  const [enclaves] = useState<SecureEnclave[]>([
    {
      id: 'enc-1',
      name: 'JWICS Enclave',
      classification: 'TS/SCI',
      status: 'operational',
      lastAudit: '2026-01-15',
      personnelCleared: 47,
      activeConnections: 12,
    },
    {
      id: 'enc-2',
      name: 'SIPRNet Gateway',
      classification: 'SECRET',
      status: 'operational',
      lastAudit: '2026-01-20',
      personnelCleared: 234,
      activeConnections: 89,
    },
    {
      id: 'enc-3',
      name: 'NIPRNet DMZ',
      classification: 'CUI',
      status: 'operational',
      lastAudit: '2026-01-25',
      personnelCleared: 521,
      activeConnections: 312,
    },
  ]);

  const [threatBriefings] = useState<ThreatBriefing[]>([
    {
      id: 'brief-1',
      classification: 'SECRET',
      title: 'APT Campaign Targeting Defense Industrial Base',
      source: 'NSA/CSS',
      timestamp: new Date().toISOString(),
      priority: 'immediate',
      summary: 'Nation-state actors observed conducting reconnaissance against cleared defense contractors.',
    },
    {
      id: 'brief-2',
      classification: 'CUI',
      title: 'Critical Infrastructure Vulnerability Advisory',
      source: 'CISA',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      priority: 'priority',
      summary: 'Multiple vulnerabilities discovered in industrial control systems affecting energy sector.',
    },
    {
      id: 'brief-3',
      classification: 'TS/SCI',
      title: 'Foreign Intelligence Service Tactics Update',
      source: 'CIA/DI',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      priority: 'routine',
      summary: 'Updated assessment of adversary cyber capabilities and targeting priorities.',
    },
  ]);

  const [complianceStatus] = useState({
    nistSp80053: { score: 94, controls: 1189, implemented: 1118 },
    fisma: { score: 97, status: 'Authorized' },
    fedrampHigh: { score: 92, status: 'In Process' },
    itar: { compliant: true, lastReview: '2026-01-10' },
    cmmc: { level: 3, certified: true, expiry: '2027-06-15' },
  });

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'TS/SCI': return 'bg-yellow-500 text-black';
      case 'TOP SECRET': return 'bg-orange-500 text-black';
      case 'SECRET': return 'bg-red-600 text-white';
      case 'CUI': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'flash': return 'text-red-400 bg-red-500/20 animate-pulse';
      case 'immediate': return 'text-orange-400 bg-orange-500/20';
      case 'priority': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Classification Banner */}
      <div className="bg-green-600 text-white text-center py-2 rounded-t-lg font-bold tracking-wider">
        UNCLASSIFIED // FOR OFFICIAL USE ONLY // DEMONSTRATION SYSTEM
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🏛️ National Security Module</h1>
          <p className="text-gray-400 mt-1">Classified environment management — SCIF-ready security operations</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-green-600 text-white rounded text-sm font-bold">JWICS READY</span>
          <span className="px-3 py-1 bg-red-600 text-white rounded text-sm font-bold">SIPRNet READY</span>
        </div>
      </div>

      {/* Secure Enclaves */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🔐</span> Secure Enclaves
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {enclaves.map((enclave) => (
            <div
              key={enclave.id}
              className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">{enclave.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getClassificationColor(enclave.classification)}`}>
                  {enclave.classification}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${
                  enclave.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className={`text-sm ${
                  enclave.status === 'operational' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {enclave.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Cleared Personnel</span>
                  <div className="text-white font-semibold">{enclave.personnelCleared}</div>
                </div>
                <div>
                  <span className="text-gray-500">Active Sessions</span>
                  <div className="text-cyan-400 font-semibold">{enclave.activeConnections}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-3">Last Audit: {enclave.lastAudit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Threat Intelligence Briefings */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📡</span> Threat Intelligence Briefings
        </h2>
        <div className="space-y-3">
          {threatBriefings.map((brief) => (
            <div
              key={brief.id}
              className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getClassificationColor(brief.classification)}`}>
                    {brief.classification}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(brief.priority)}`}>
                    {brief.priority.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{brief.source}</span>
              </div>
              <h3 className="text-white font-medium mb-1">{brief.title}</h3>
              <p className="text-sm text-gray-400">{brief.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Dashboard */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">✅</span> Federal Compliance Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">NIST SP 800-53</div>
            <div className="text-2xl font-bold text-green-400">{complianceStatus.nistSp80053.score}%</div>
            <div className="text-xs text-gray-500">{complianceStatus.nistSp80053.implemented}/{complianceStatus.nistSp80053.controls} controls</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">FISMA</div>
            <div className="text-2xl font-bold text-green-400">{complianceStatus.fisma.score}%</div>
            <div className="text-xs text-green-400">{complianceStatus.fisma.status}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">FedRAMP High</div>
            <div className="text-2xl font-bold text-yellow-400">{complianceStatus.fedrampHigh.score}%</div>
            <div className="text-xs text-yellow-400">{complianceStatus.fedrampHigh.status}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">ITAR</div>
            <div className="text-2xl font-bold text-green-400">✓</div>
            <div className="text-xs text-gray-500">Compliant</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">CMMC</div>
            <div className="text-2xl font-bold text-cyan-400">Level {complianceStatus.cmmc.level}</div>
            <div className="text-xs text-green-400">Certified</div>
          </div>
        </div>
      </div>

      {/* Air-Gap Deployment */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">🔌 Air-Gap Deployment Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-cyan-400 font-semibold mb-2">On-Premise Deployment</h3>
            <p className="text-sm text-gray-400">Full platform deployment within classified networks with no external connectivity.</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-purple-400 font-semibold mb-2">Secure Update Channel</h3>
            <p className="text-sm text-gray-400">Manual update packages with cryptographic verification for disconnected environments.</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">Cross-Domain Solutions</h3>
            <p className="text-sm text-gray-400">Integration with approved CDS for controlled data transfer between classification levels.</p>
          </div>
        </div>
      </div>

      {/* Classification Banner Footer */}
      <div className="bg-green-600 text-white text-center py-2 rounded-b-lg font-bold tracking-wider">
        UNCLASSIFIED // FOR OFFICIAL USE ONLY // DEMONSTRATION SYSTEM
      </div>
    </div>
  );
};

export default NationalSecurityModule;
