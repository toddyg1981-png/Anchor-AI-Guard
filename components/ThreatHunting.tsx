import React, { useState } from 'react';

// ============================================================================
// THREAT HUNTING
// ============================================================================
// Proactive threat detection - don't wait for alerts, HUNT threats
// Hypothesis-driven investigation, IOC searches, behavioral analysis
// ============================================================================

interface ThreatHunt {
  id: string;
  name: string;
  hypothesis: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  hunter: string;
  framework: 'mitre_attck' | 'diamond' | 'kill_chain' | 'custom';
  techniques: string[];
  findings: number;
  criticalFindings: number;
  dataSources: string[];
}

interface IOCSearch {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'email' | 'url' | 'file_path' | 'registry';
  value: string;
  source: string;
  status: 'searching' | 'found' | 'not_found';
  hits: number;
  lastSeen?: string;
  associatedThreat?: string;
}

interface HuntingQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  dataSource: string;
  lastRun: string;
  results: number;
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly';
}

interface BehavioralAnomaly {
  id: string;
  timestamp: string;
  entity: string;
  entityType: 'user' | 'host' | 'process' | 'network';
  behavior: string;
  baseline: string;
  deviation: number;
  riskScore: number;
  investigated: boolean;
}

export const ThreatHunting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hunts' | 'ioc' | 'queries' | 'anomalies'>('hunts');
  const [searchIOC, setSearchIOC] = useState('');

  const hunts: ThreatHunt[] = [
    { id: 'h-1', name: 'Lateral Movement Detection', hypothesis: 'Attackers may be using compromised credentials to move laterally via SMB/WMI', status: 'active', startDate: '2026-02-01', hunter: 'Sarah Chen', framework: 'mitre_attck', techniques: ['T1021', 'T1047', 'T1550'], findings: 5, criticalFindings: 1, dataSources: ['EDR', 'Network', 'AD Logs'] },
    { id: 'h-2', name: 'Persistence Mechanisms', hypothesis: 'APT may have established persistence via scheduled tasks or registry run keys', status: 'active', startDate: '2026-02-02', hunter: 'Mike Johnson', framework: 'mitre_attck', techniques: ['T1053', 'T1547', 'T1543'], findings: 3, criticalFindings: 0, dataSources: ['EDR', 'Windows Events'] },
    { id: 'h-3', name: 'Data Staging & Exfiltration', hypothesis: 'Sensitive data may be staged and exfiltrated via encrypted channels', status: 'completed', startDate: '2026-01-15', endDate: '2026-01-25', hunter: 'Lisa Anderson', framework: 'kill_chain', techniques: ['T1074', 'T1048', 'T1567'], findings: 8, criticalFindings: 2, dataSources: ['DLP', 'Network', 'Proxy'] },
    { id: 'h-4', name: 'Supply Chain Compromise', hypothesis: 'Third-party software updates may contain malicious code', status: 'planning', startDate: '2026-02-05', hunter: 'David Kim', framework: 'mitre_attck', techniques: ['T1195', 'T1199'], findings: 0, criticalFindings: 0, dataSources: ['SBOM', 'EDR', 'Network'] },
  ];

  const iocSearches: IOCSearch[] = [
    { id: 'ioc-1', type: 'ip', value: '185.234.72.19', source: 'Threat Intel Feed', status: 'found', hits: 3, lastSeen: '2026-02-04T10:30:00Z', associatedThreat: 'APT29' },
    { id: 'ioc-2', type: 'hash', value: 'e99a18c428cb38d5f260853678922e03', source: 'VirusTotal', status: 'not_found', hits: 0 },
    { id: 'ioc-3', type: 'domain', value: 'malware-c2.evil.com', source: 'CISA Alert', status: 'found', hits: 15, lastSeen: '2026-02-04T08:15:00Z', associatedThreat: 'Cobalt Strike' },
    { id: 'ioc-4', type: 'email', value: 'attacker@phishing-domain.com', source: 'Phishing Report', status: 'found', hits: 8, lastSeen: '2026-02-03T14:20:00Z', associatedThreat: 'BEC Campaign' },
    { id: 'ioc-5', type: 'file_path', value: 'C:\\Windows\\Temp\\malware.exe', source: 'EDR Alert', status: 'searching', hits: 0 },
  ];

  const queries: HuntingQuery[] = [
    { id: 'q-1', name: 'Suspicious PowerShell Commands', description: 'Detect encoded/obfuscated PowerShell execution', query: 'process.name:powershell.exe AND (command_line:*-enc* OR command_line:*-encoded*)', dataSource: 'EDR', lastRun: '2026-02-04T11:00:00Z', results: 12, schedule: 'hourly' },
    { id: 'q-2', name: 'Unusual Outbound Connections', description: 'Connections to rare external IPs or unusual ports', query: 'network.direction:outbound AND NOT network.destination.ip IN known_good_list', dataSource: 'Firewall', lastRun: '2026-02-04T11:00:00Z', results: 45, schedule: 'hourly' },
    { id: 'q-3', name: 'Service Account Anomalies', description: 'Service accounts logging in interactively or from unusual locations', query: 'user.name:svc-* AND event.type:authentication AND authentication.interactive:true', dataSource: 'AD Logs', lastRun: '2026-02-04T10:00:00Z', results: 3, schedule: 'daily' },
    { id: 'q-4', name: 'LOLBins Execution', description: 'Living-off-the-land binary execution (certutil, mshta, etc.)', query: 'process.name IN (certutil.exe, mshta.exe, regsvr32.exe, rundll32.exe) AND process.args:*http*', dataSource: 'EDR', lastRun: '2026-02-04T11:00:00Z', results: 7, schedule: 'hourly' },
    { id: 'q-5', name: 'Data Archive Creation', description: 'Large archive files created that may indicate data staging', query: 'file.extension IN (zip, 7z, rar) AND file.size > 100MB', dataSource: 'EDR', lastRun: '2026-02-04T06:00:00Z', results: 2, schedule: 'daily' },
  ];

  const anomalies: BehavioralAnomaly[] = [
    { id: 'a-1', timestamp: '2026-02-04T11:30:00Z', entity: 'john.smith', entityType: 'user', behavior: 'Accessed 150 files in 5 minutes', baseline: 'Average 10 files/hour', deviation: 85, riskScore: 92, investigated: false },
    { id: 'a-2', timestamp: '2026-02-04T10:45:00Z', entity: 'WORKSTATION-042', entityType: 'host', behavior: 'Outbound traffic to 45 unique IPs', baseline: 'Average 8 unique IPs/day', deviation: 78, riskScore: 85, investigated: true },
    { id: 'a-3', timestamp: '2026-02-04T09:15:00Z', entity: 'svc-backup', entityType: 'user', behavior: 'Interactive login at 2:00 AM', baseline: 'No interactive logins', deviation: 100, riskScore: 95, investigated: false },
    { id: 'a-4', timestamp: '2026-02-04T08:00:00Z', entity: 'chrome.exe', entityType: 'process', behavior: 'Spawned cmd.exe child process', baseline: 'Browser rarely spawns shells', deviation: 72, riskScore: 78, investigated: true },
    { id: 'a-5', timestamp: '2026-02-03T23:30:00Z', entity: '192.168.1.50', entityType: 'network', behavior: 'DNS queries to DGA-like domains', baseline: 'No DGA patterns observed', deviation: 95, riskScore: 98, investigated: false },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'searching': return 'bg-cyan-500/20 text-cyan-400 animate-pulse';
      case 'completed': case 'found': return 'bg-green-500/20 text-green-400';
      case 'paused': case 'not_found': return 'bg-yellow-500/20 text-yellow-400';
      case 'planning': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getIOCIcon = (type: string) => {
    switch (type) {
      case 'ip': return '🌐';
      case 'domain': return '🔗';
      case 'hash': return '#️⃣';
      case 'email': return '📧';
      case 'url': return '🔗';
      case 'file_path': return '📁';
      case 'registry': return '🗄️';
      default: return '❓';
    }
  };

  const activeHunts = hunts.filter(h => h.status === 'active').length;
  const totalFindings = hunts.reduce((sum, h) => sum + h.findings, 0);
  const criticalFindings = hunts.reduce((sum, h) => sum + h.criticalFindings, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🎯 Threat Hunting</h1>
          <p className="text-gray-400">Proactive threat detection - hunt before they strike</p>
        </div>
        <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold">
          + New Hunt
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{activeHunts}</div>
          <div className="text-sm text-gray-400">Active Hunts</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{totalFindings}</div>
          <div className="text-sm text-gray-400">Total Findings</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{criticalFindings}</div>
          <div className="text-sm text-gray-400">Critical</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-400">{iocSearches.filter(i => i.status === 'found').length}</div>
          <div className="text-sm text-gray-400">IOCs Found</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{queries.length}</div>
          <div className="text-sm text-gray-400">Hunt Queries</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{anomalies.filter(a => !a.investigated).length}</div>
          <div className="text-sm text-gray-400">Anomalies</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'hunts', label: '🎯 Active Hunts' },
          { id: 'ioc', label: '🔍 IOC Search' },
          { id: 'queries', label: '📝 Hunt Queries' },
          { id: 'anomalies', label: '📊 Anomalies' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hunts Tab */}
      {activeTab === 'hunts' && (
        <div className="space-y-4">
          {hunts.map(hunt => (
            <div key={hunt.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{hunt.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(hunt.status)}`}>
                      {hunt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{hunt.hypothesis}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Hunter: {hunt.hunter}</div>
                  <div className="text-xs text-gray-600">Started: {hunt.startDate}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-500">MITRE ATT&CK:</span>
                <div className="flex gap-2">
                  {hunt.techniques.map((tech, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-cyan-400">{hunt.findings}</div>
                  <div className="text-xs text-gray-500">Findings</div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-red-400">{hunt.criticalFindings}</div>
                  <div className="text-xs text-gray-500">Critical</div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-purple-400">{hunt.dataSources.length}</div>
                  <div className="text-xs text-gray-500">Data Sources</div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-400">{hunt.techniques.length}</div>
                  <div className="text-xs text-gray-500">Techniques</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IOC Tab */}
      {activeTab === 'ioc' && (
        <div>
          <div className="mb-6 flex gap-4">
            <input
              type="text"
              value={searchIOC}
              onChange={(e) => setSearchIOC(e.target.value)}
              placeholder="Enter IOC to search (IP, domain, hash, email...)"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
            />
            <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold">
              🔍 Search
            </button>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                  <th className="p-4">Type</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Hits</th>
                  <th className="p-4">Associated Threat</th>
                  <th className="p-4">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {iocSearches.map(ioc => (
                  <tr key={ioc.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="p-4">
                      <span className="flex items-center gap-2">
                        {getIOCIcon(ioc.type)}
                        <span className="text-sm">{ioc.type}</span>
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm">{ioc.value}</td>
                    <td className="p-4 text-sm text-gray-400">{ioc.source}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ioc.status)}`}>
                        {ioc.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${ioc.hits > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {ioc.hits}
                      </span>
                    </td>
                    <td className="p-4">
                      {ioc.associatedThreat ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                          {ioc.associatedThreat}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {ioc.lastSeen ? new Date(ioc.lastSeen).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Queries Tab */}
      {activeTab === 'queries' && (
        <div className="space-y-4">
          {queries.map(query => (
            <div key={query.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{query.name}</h3>
                  <p className="text-sm text-gray-400">{query.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                    {query.schedule}
                  </span>
                  <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                    {query.dataSource}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg font-mono text-sm text-cyan-400 mb-3 overflow-x-auto">
                {query.query}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Last run: {new Date(query.lastRun).toLocaleString()}</span>
                <span className={`font-bold ${query.results > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                  {query.results} results
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          {anomalies.sort((a, b) => b.riskScore - a.riskScore).map(anomaly => (
            <div key={anomaly.id} className={`p-6 rounded-xl border ${
              anomaly.riskScore >= 90 ? 'border-red-500/30 bg-red-500/5' :
              anomaly.riskScore >= 75 ? 'border-orange-500/30 bg-orange-500/5' :
              'border-yellow-500/30 bg-yellow-500/5'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{anomaly.entity}</span>
                    <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">{anomaly.entityType}</span>
                    {anomaly.investigated && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Investigated</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{anomaly.behavior}</p>
                </div>
                <div className={`text-3xl font-bold ${
                  anomaly.riskScore >= 90 ? 'text-red-400' :
                  anomaly.riskScore >= 75 ? 'text-orange-400' : 'text-yellow-400'
                }`}>
                  {anomaly.riskScore}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Baseline:</span>
                  <span className="ml-2">{anomaly.baseline}</span>
                </div>
                <div>
                  <span className="text-gray-500">Deviation:</span>
                  <span className="ml-2 font-bold text-orange-400">{anomaly.deviation}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Detected:</span>
                  <span className="ml-2">{new Date(anomaly.timestamp).toLocaleString()}</span>
                </div>
              </div>
              {!anomaly.investigated && (
                <button className="mt-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500 rounded text-sm text-cyan-400">
                  Investigate
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreatHunting;
