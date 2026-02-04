import React, { useState } from 'react';

interface Attestation {
  id: string;
  packageName: string;
  version: string;
  publisher: string;
  attestationHash: string;
  signatureValid: boolean;
  buildEnvironment: string;
  buildTimestamp: string;
  slsaLevel: number;
  provenance: {
    sourceRepo: string;
    commit: string;
    builder: string;
    buildConfig: string;
  };
  vulnerabilities: number;
  status: 'verified' | 'unverified' | 'suspicious';
}

interface ProvenanceRecord {
  id: string;
  artifact: string;
  chain: {
    step: string;
    actor: string;
    timestamp: string;
    hash: string;
    verified: boolean;
  }[];
}

const SupplyChainAttestation: React.FC = () => {
  const [attestations] = useState<Attestation[]>([
    {
      id: 'att-1',
      packageName: '@anchor/core-sdk',
      version: '2.4.1',
      publisher: 'Anchor Security Inc.',
      attestationHash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      signatureValid: true,
      buildEnvironment: 'GitHub Actions',
      buildTimestamp: '2026-02-04T10:30:00Z',
      slsaLevel: 3,
      provenance: {
        sourceRepo: 'github.com/anchor/core-sdk',
        commit: 'a1b2c3d4e5f6',
        builder: 'GitHub Actions',
        buildConfig: '.github/workflows/release.yml',
      },
      vulnerabilities: 0,
      status: 'verified',
    },
    {
      id: 'att-2',
      packageName: 'lodash',
      version: '4.17.21',
      publisher: 'npm',
      attestationHash: '0x3f2a7c8d9e1b4a5f6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
      signatureValid: true,
      buildEnvironment: 'npm registry',
      buildTimestamp: '2025-06-15T14:22:00Z',
      slsaLevel: 2,
      provenance: {
        sourceRepo: 'github.com/lodash/lodash',
        commit: 'ddfd9b11',
        builder: 'npm publish',
        buildConfig: 'package.json',
      },
      vulnerabilities: 1,
      status: 'verified',
    },
    {
      id: 'att-3',
      packageName: 'unknown-package',
      version: '1.0.0',
      publisher: 'unknown',
      attestationHash: 'N/A',
      signatureValid: false,
      buildEnvironment: 'Unknown',
      buildTimestamp: 'Unknown',
      slsaLevel: 0,
      provenance: {
        sourceRepo: 'Unknown',
        commit: 'Unknown',
        builder: 'Unknown',
        buildConfig: 'Unknown',
      },
      vulnerabilities: 5,
      status: 'suspicious',
    },
  ]);

  const [provenanceRecords] = useState<ProvenanceRecord[]>([
    {
      id: 'prov-1',
      artifact: '@anchor/core-sdk@2.4.1',
      chain: [
        { step: 'Source Code', actor: 'Developer', timestamp: '2026-02-04T09:00:00Z', hash: '0xa1b2c3...', verified: true },
        { step: 'Code Review', actor: 'Security Team', timestamp: '2026-02-04T09:30:00Z', hash: '0xd4e5f6...', verified: true },
        { step: 'CI Build', actor: 'GitHub Actions', timestamp: '2026-02-04T10:00:00Z', hash: '0xg7h8i9...', verified: true },
        { step: 'Security Scan', actor: 'Anchor Scanner', timestamp: '2026-02-04T10:15:00Z', hash: '0xj0k1l2...', verified: true },
        { step: 'Signature', actor: 'Release Key', timestamp: '2026-02-04T10:25:00Z', hash: '0xm3n4o5...', verified: true },
        { step: 'Publication', actor: 'npm Registry', timestamp: '2026-02-04T10:30:00Z', hash: '0xp6q7r8...', verified: true },
      ],
    },
  ]);

  const [sbomStats] = useState({
    totalDependencies: 847,
    directDependencies: 42,
    transitiveDependencies: 805,
    attestedPackages: 812,
    unverifiedPackages: 35,
    suspiciousPackages: 3,
    slsaLevel3: 245,
    slsaLevel2: 412,
    slsaLevel1: 155,
    slsaLevel0: 35,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-500/20';
      case 'unverified': return 'text-yellow-400 bg-yellow-500/20';
      case 'suspicious': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getSlsaColor = (level: number) => {
    switch (level) {
      case 3: return 'text-green-400';
      case 2: return 'text-cyan-400';
      case 1: return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🔗 Supply Chain Attestation</h1>
          <p className="text-gray-400 mt-1">Blockchain-verified software provenance — Trust but verify every dependency</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity">
          Generate SBOM Report
        </button>
      </div>

      {/* SBOM Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Dependencies', value: sbomStats.totalDependencies, color: 'cyan' },
          { label: 'Direct', value: sbomStats.directDependencies, color: 'blue' },
          { label: 'Transitive', value: sbomStats.transitiveDependencies, color: 'purple' },
          { label: 'Attested', value: sbomStats.attestedPackages, color: 'green' },
          { label: 'Unverified', value: sbomStats.unverifiedPackages, color: 'yellow' },
          { label: 'Suspicious', value: sbomStats.suspiciousPackages, color: 'red' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* SLSA Levels Distribution */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🏆</span> SLSA Compliance Distribution
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { level: 3, count: sbomStats.slsaLevel3, label: 'Build L3', desc: 'Hardened builds' },
            { level: 2, count: sbomStats.slsaLevel2, label: 'Build L2', desc: 'Hosted builds' },
            { level: 1, count: sbomStats.slsaLevel1, label: 'Build L1', desc: 'Provenance exists' },
            { level: 0, count: sbomStats.slsaLevel0, label: 'Build L0', desc: 'No provenance' },
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${getSlsaColor(item.level)}`}>{item.count}</div>
              <div className="text-sm text-white mt-1">{item.label}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attestation Records */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📜</span> Attestation Records
        </h2>
        <div className="space-y-4">
          {attestations.map((att) => (
            <div
              key={att.id}
              className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{att.packageName}</h3>
                    <span className="text-cyan-400 text-sm">@{att.version}</span>
                  </div>
                  <p className="text-sm text-gray-500">Publisher: {att.publisher}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSlsaColor(att.slsaLevel)}`}>
                    SLSA L{att.slsaLevel}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(att.status)}`}>
                    {att.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Source Repo</span>
                  <div className="text-cyan-400 text-xs font-mono truncate">{att.provenance.sourceRepo}</div>
                </div>
                <div>
                  <span className="text-gray-500">Commit</span>
                  <div className="text-cyan-400 text-xs font-mono">{att.provenance.commit}</div>
                </div>
                <div>
                  <span className="text-gray-500">Builder</span>
                  <div className="text-white">{att.provenance.builder}</div>
                </div>
                <div>
                  <span className="text-gray-500">Signature</span>
                  <div className={att.signatureValid ? 'text-green-400' : 'text-red-400'}>
                    {att.signatureValid ? '✓ Valid' : '✗ Invalid'}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="text-xs text-gray-500">
                  Attestation Hash: <span className="font-mono text-gray-400">{att.attestationHash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provenance Chain */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">⛓️</span> Provenance Chain
        </h2>
        {provenanceRecords.map((record) => (
          <div key={record.id}>
            <h3 className="text-cyan-400 font-mono mb-4">{record.artifact}</h3>
            <div className="relative">
              {record.chain.map((step, idx) => (
                <div key={idx} className="flex items-start mb-4">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-4 h-4 rounded-full ${step.verified ? 'bg-green-500' : 'bg-red-500'}`} />
                    {idx < record.chain.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-700" />
                    )}
                  </div>
                  <div className="flex-1 bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{step.step}</span>
                      <span className={`text-xs ${step.verified ? 'text-green-400' : 'text-red-400'}`}>
                        {step.verified ? '✓ Verified' : '✗ Unverified'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">{step.actor}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">
                      {step.hash} | {step.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Value Proposition */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">💎 Supply Chain Attestation Value</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-400">Supply Chain Attacks Prevented</div>
            <div className="text-2xl font-bold text-green-400">100%</div>
            <div className="text-xs text-gray-500">With SLSA L3 enforcement</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Avg Supply Chain Breach Cost</div>
            <div className="text-2xl font-bold text-red-400">$8.7M</div>
            <div className="text-xs text-gray-500">SolarWinds-style attacks</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Compliance Coverage</div>
            <div className="text-2xl font-bold text-cyan-400">SBOM</div>
            <div className="text-xs text-gray-500">EO 14028, NIST, FDA</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Detection Time</div>
            <div className="text-2xl font-bold text-purple-400">&lt;1 min</div>
            <div className="text-xs text-gray-500">vs weeks for traditional</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainAttestation;
