import React, { useState } from 'react';

interface DigitalTwin {
  id: string;
  name: string;
  type: 'network' | 'application' | 'infrastructure' | 'ot-system';
  syncStatus: 'synced' | 'syncing' | 'stale';
  lastSync: string;
  components: number;
  simulationsRun: number;
  vulnerabilitiesFound: number;
}

interface AttackSimulation {
  id: string;
  name: string;
  twinId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  attackVector: string;
  progress: number;
  pathsExplored: number;
  breachesFound: number;
  duration: string;
  recommendations: string[];
}

const DigitalTwinSecurity: React.FC = () => {
  const [twins] = useState<DigitalTwin[]>([
    {
      id: 'twin-1',
      name: 'Production Network',
      type: 'network',
      syncStatus: 'synced',
      lastSync: '2 minutes ago',
      components: 4521,
      simulationsRun: 847,
      vulnerabilitiesFound: 23,
    },
    {
      id: 'twin-2',
      name: 'Core Banking Application',
      type: 'application',
      syncStatus: 'synced',
      lastSync: '5 minutes ago',
      components: 1289,
      simulationsRun: 312,
      vulnerabilitiesFound: 8,
    },
    {
      id: 'twin-3',
      name: 'AWS Infrastructure',
      type: 'infrastructure',
      syncStatus: 'syncing',
      lastSync: 'In progress...',
      components: 892,
      simulationsRun: 156,
      vulnerabilitiesFound: 15,
    },
    {
      id: 'twin-4',
      name: 'SCADA Control Systems',
      type: 'ot-system',
      syncStatus: 'synced',
      lastSync: '10 minutes ago',
      components: 234,
      simulationsRun: 89,
      vulnerabilitiesFound: 4,
    },
  ]);

  const [simulations] = useState<AttackSimulation[]>([
    {
      id: 'sim-1',
      name: 'APT29 Full Kill Chain',
      twinId: 'twin-1',
      status: 'running',
      attackVector: 'Spear Phishing → Lateral Movement → Data Exfil',
      progress: 67,
      pathsExplored: 12847,
      breachesFound: 3,
      duration: '24 minutes',
      recommendations: [
        'Segment finance VLAN from general network',
        'Implement MFA on all admin accounts',
        'Deploy EDR on legacy Windows servers',
      ],
    },
    {
      id: 'sim-2',
      name: 'Ransomware Propagation',
      twinId: 'twin-1',
      status: 'completed',
      attackVector: 'RDP Brute Force → SMB Spread → Encryption',
      progress: 100,
      pathsExplored: 8921,
      breachesFound: 7,
      duration: '18 minutes',
      recommendations: [
        'Disable SMBv1 across all endpoints',
        'Implement network segmentation',
        'Deploy backup isolation',
      ],
    },
    {
      id: 'sim-3',
      name: 'Supply Chain Compromise',
      twinId: 'twin-2',
      status: 'completed',
      attackVector: 'Malicious Dependency → Build Pipeline → Production',
      progress: 100,
      pathsExplored: 3421,
      breachesFound: 2,
      duration: '12 minutes',
      recommendations: [
        'Implement SBOM verification',
        'Add dependency pinning',
        'Isolate build environment',
      ],
    },
  ]);

  const [selectedTwin, setSelectedTwin] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'network': return '🌐';
      case 'application': return '📱';
      case 'infrastructure': return '☁️';
      case 'ot-system': return '🏭';
      default: return '📦';
    }
  };

  const getSyncColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-400 bg-green-500/20';
      case 'syncing': return 'text-cyan-400 bg-cyan-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🪞 Digital Twin Security</h1>
          <p className="text-gray-400 mt-1">Simulate attacks on virtual replicas — Zero risk to production</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity">
          + Create New Twin
        </button>
      </div>

      {/* Digital Twins Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Active Digital Twins</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {twins.map((twin) => (
            <button
              key={twin.id}
              onClick={() => setSelectedTwin(twin.id === selectedTwin ? null : twin.id)}
              className={`text-left bg-gray-900/60 border rounded-xl p-5 transition-all ${
                selectedTwin === twin.id
                  ? 'border-cyan-500/60 ring-1 ring-cyan-500/30'
                  : 'border-gray-700/50 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{getTypeIcon(twin.type)}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSyncColor(twin.syncStatus)}`}>
                  {twin.syncStatus === 'syncing' && <span className="animate-pulse">●</span>} {twin.syncStatus}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1">{twin.name}</h3>
              <p className="text-xs text-gray-500 mb-3">Last sync: {twin.lastSync}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-cyan-400">{twin.components.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Components</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-400">{twin.simulationsRun}</div>
                  <div className="text-xs text-gray-500">Simulations</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">{twin.vulnerabilitiesFound}</div>
                  <div className="text-xs text-gray-500">Vulns Found</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Attack Simulations */}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">⚔️</span> Attack Simulations
          </h2>
          <button className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-600/30 transition-colors">
            + Launch New Simulation
          </button>
        </div>

        <div className="space-y-4">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{sim.name}</h3>
                  <p className="text-sm text-gray-400">{sim.attackVector}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  sim.status === 'running'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : sim.status === 'completed'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {sim.status === 'running' && <span className="animate-pulse mr-1">●</span>}
                  {sim.status.toUpperCase()}
                </span>
              </div>

              {sim.status === 'running' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{sim.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${sim.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">{sim.pathsExplored.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Paths Explored</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">{sim.breachesFound}</div>
                  <div className="text-xs text-gray-500">Breaches Found</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{sim.duration}</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{sim.recommendations.length}</div>
                  <div className="text-xs text-gray-500">Fixes</div>
                </div>
              </div>

              {sim.status === 'completed' && (
                <div className="border-t border-gray-700/50 pt-3">
                  <div className="text-xs text-gray-500 mb-2">AI Recommendations:</div>
                  <div className="space-y-1">
                    {sim.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-green-400">→</span>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">💎 Digital Twin Value</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-400">Attack Paths Discovered</div>
            <div className="text-2xl font-bold text-cyan-400">25,000+</div>
            <div className="text-xs text-gray-500">Before attackers find them</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Zero Downtime Testing</div>
            <div className="text-2xl font-bold text-green-400">100%</div>
            <div className="text-xs text-gray-500">No production impact</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Pentest Cost Savings</div>
            <div className="text-2xl font-bold text-yellow-400">$500K/yr</div>
            <div className="text-xs text-gray-500">Continuous vs annual</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Breach Prevention</div>
            <div className="text-2xl font-bold text-purple-400">$4.5M</div>
            <div className="text-xs text-gray-500">Avg breach cost avoided</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinSecurity;
