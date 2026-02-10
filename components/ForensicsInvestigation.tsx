import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// FORENSICS & INCIDENT INVESTIGATION
// ============================================================================
// Digital forensics capabilities for incident investigation
// Memory analysis, disk imaging, timeline reconstruction, evidence collection
// ============================================================================

interface ForensicCase {
  id: string;
  caseNumber: string;
  title: string;
  type: 'breach' | 'malware' | 'insider_threat' | 'fraud' | 'data_theft' | 'compliance';
  status: 'active' | 'evidence_collection' | 'analysis' | 'reporting' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo: string;
  createdDate: string;
  lastActivity: string;
  evidenceCount: number;
  findings: string[];
}

interface EvidenceItem {
  id: string;
  caseId: string;
  type: 'disk_image' | 'memory_dump' | 'network_capture' | 'logs' | 'file' | 'screenshot' | 'registry';
  name: string;
  hash: string;
  hashType: 'sha256' | 'md5';
  size: string;
  collectedBy: string;
  collectedDate: string;
  chainOfCustody: string[];
  status: 'collected' | 'processing' | 'analyzed' | 'verified';
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  source: string;
  eventType: string;
  description: string;
  artifact: string;
  significance: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
}

interface ArtifactAnalysis {
  id: string;
  name: string;
  category: 'malware' | 'persistence' | 'lateral_movement' | 'exfiltration' | 'credentials' | 'enumeration';
  status: 'malicious' | 'suspicious' | 'benign' | 'unknown';
  details: string;
  iocExtracted: string[];
  mitreMapping: string[];
}

export const ForensicsInvestigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cases' | 'evidence' | 'timeline' | 'artifacts'>('cases');
  const [_selectedCase, _setSelectedCase] = useState<string | null>(null);
  const [showNewCase, setShowNewCase] = useState(false);

  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const _res = await backendApi.modules.getDashboard('forensics');
        } catch (e) { logger.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('forensics', 'Analyze forensics investigation data for evidence chain integrity and recommend examination procedures');
      if ((res as unknown as Record<string, unknown>)?.analysis) setAnalysisResult((res as unknown as Record<string, unknown>).analysis as string);
    } catch (e) { logger.error(e); } finally { setAnalyzing(false); }
  };

  const cases: ForensicCase[] = [
    { id: 'c-1', caseNumber: 'CASE-2026-0042', title: 'Suspected APT Intrusion', type: 'breach', status: 'analysis', priority: 'critical', assignedTo: 'Sarah Chen', createdDate: '2026-02-01', lastActivity: '2026-02-04T11:30:00Z', evidenceCount: 15, findings: ['Cobalt Strike beacon identified', 'Lateral movement via WMI', 'Data staging in temp folder'] },
    { id: 'c-2', caseNumber: 'CASE-2026-0041', title: 'Insider Data Theft', type: 'insider_threat', status: 'evidence_collection', priority: 'high', assignedTo: 'Mike Johnson', createdDate: '2026-02-02', lastActivity: '2026-02-04T10:15:00Z', evidenceCount: 8, findings: ['USB device attached', 'Large file copy operations'] },
    { id: 'c-3', caseNumber: 'CASE-2026-0040', title: 'Ransomware Incident', type: 'malware', status: 'reporting', priority: 'critical', assignedTo: 'Lisa Anderson', createdDate: '2026-01-25', lastActivity: '2026-02-03T16:00:00Z', evidenceCount: 23, findings: ['LockBit 3.0 variant', 'Initial access via phishing', 'Encryption started at 02:00 AM'] },
    { id: 'c-4', caseNumber: 'CASE-2026-0039', title: 'Compliance Investigation', type: 'compliance', status: 'closed', priority: 'medium', assignedTo: 'David Kim', createdDate: '2026-01-15', lastActivity: '2026-01-30T14:00:00Z', evidenceCount: 5, findings: ['Policy violation confirmed', 'No malicious intent'] },
  ];

  const evidence: EvidenceItem[] = [
    { id: 'e-1', caseId: 'c-1', type: 'disk_image', name: 'SRV-WEB-01_disk.E01', hash: 'a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', hashType: 'sha256', size: '512 GB', collectedBy: 'Sarah Chen', collectedDate: '2026-02-02T08:00:00Z', chainOfCustody: ['Sarah Chen', 'Evidence Locker A-1'], status: 'analyzed' },
    { id: 'e-2', caseId: 'c-1', type: 'memory_dump', name: 'SRV-WEB-01_memory.dmp', hash: 'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4', hashType: 'sha256', size: '64 GB', collectedBy: 'Sarah Chen', collectedDate: '2026-02-02T08:30:00Z', chainOfCustody: ['Sarah Chen', 'Evidence Locker A-1'], status: 'analyzed' },
    { id: 'e-3', caseId: 'c-1', type: 'network_capture', name: 'perimeter_traffic_20260201.pcap', hash: 'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', hashType: 'sha256', size: '25 GB', collectedBy: 'Mike Johnson', collectedDate: '2026-02-02T09:00:00Z', chainOfCustody: ['Mike Johnson', 'Evidence Server'], status: 'processing' },
    { id: 'e-4', caseId: 'c-1', type: 'logs', name: 'windows_security_events.evtx', hash: 'd6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', hashType: 'sha256', size: '2.5 GB', collectedBy: 'Sarah Chen', collectedDate: '2026-02-02T09:30:00Z', chainOfCustody: ['Sarah Chen', 'Evidence Server'], status: 'analyzed' },
    { id: 'e-5', caseId: 'c-1', type: 'file', name: 'suspicious_payload.exe', hash: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', hashType: 'sha256', size: '256 KB', collectedBy: 'Lisa Anderson', collectedDate: '2026-02-03T10:00:00Z', chainOfCustody: ['Lisa Anderson', 'Malware Lab'], status: 'verified' },
  ];

  const timeline: TimelineEvent[] = [
    { id: 't-1', timestamp: '2026-02-01T02:15:00Z', source: 'Email Gateway', eventType: 'Phishing Email', description: 'Malicious email received by user@company.com', artifact: 'phishing_email.eml', significance: 'critical', tags: ['initial_access', 'phishing'] },
    { id: 't-2', timestamp: '2026-02-01T02:18:00Z', source: 'EDR', eventType: 'Macro Execution', description: 'Word document executed macro, spawned PowerShell', artifact: 'Invoice_02012026.docm', significance: 'critical', tags: ['execution', 'macro'] },
    { id: 't-3', timestamp: '2026-02-01T02:19:00Z', source: 'EDR', eventType: 'C2 Connection', description: 'PowerShell connected to 185.234.72.19:443', artifact: 'network_connection.log', significance: 'critical', tags: ['c2', 'cobalt_strike'] },
    { id: 't-4', timestamp: '2026-02-01T02:25:00Z', source: 'EDR', eventType: 'Credential Dump', description: 'Mimikatz execution detected, LSASS accessed', artifact: 'process_memory.dmp', significance: 'critical', tags: ['credential_access', 'mimikatz'] },
    { id: 't-5', timestamp: '2026-02-01T02:30:00Z', source: 'AD Logs', eventType: 'Lateral Movement', description: 'Admin account used to access SRV-DB-01 via WMI', artifact: 'security_events.evtx', significance: 'high', tags: ['lateral_movement', 'wmi'] },
    { id: 't-6', timestamp: '2026-02-01T03:00:00Z', source: 'File System', eventType: 'Data Staging', description: 'Large archive created in C:\\Windows\\Temp', artifact: 'data_archive.7z', significance: 'high', tags: ['collection', 'staging'] },
    { id: 't-7', timestamp: '2026-02-01T03:15:00Z', source: 'Network', eventType: 'Data Exfiltration', description: 'HTTPS upload to cloud storage service', artifact: 'network_capture.pcap', significance: 'critical', tags: ['exfiltration', 'https'] },
  ];

  const artifacts: ArtifactAnalysis[] = [
    { id: 'a-1', name: 'suspicious_payload.exe', category: 'malware', status: 'malicious', details: 'Cobalt Strike beacon, packed with custom packer', iocExtracted: ['185.234.72.19', 'beacon_config.bin'], mitreMapping: ['T1059.001', 'T1071.001'] },
    { id: 'a-2', name: 'scheduled_task_persist.xml', category: 'persistence', status: 'malicious', details: 'Scheduled task for persistence, runs at startup', iocExtracted: ['C:\\Windows\\Temp\\update.exe'], mitreMapping: ['T1053.005'] },
    { id: 'a-3', name: 'mimikatz_memory_dump.bin', category: 'credentials', status: 'malicious', details: 'Memory dump containing credential harvesting tool', iocExtracted: ['admin_hash', 'service_account_hash'], mitreMapping: ['T1003.001'] },
    { id: 'a-4', name: 'recon_script.ps1', category: 'enumeration', status: 'suspicious', details: 'PowerShell script for AD enumeration', iocExtracted: ['Get-ADUser', 'Get-ADComputer'], mitreMapping: ['T1087.002'] },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'evidence_collection': return 'bg-cyan-500/20 text-cyan-400';
      case 'analysis': case 'processing': return 'bg-yellow-500/20 text-yellow-400';
      case 'reporting': case 'verified': return 'bg-purple-500/20 text-purple-400';
      case 'closed': case 'analyzed': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'disk_image': return '💿';
      case 'memory_dump': return '🧠';
      case 'network_capture': return '🌐';
      case 'logs': return '📋';
      case 'file': return '📄';
      case 'screenshot': return '📸';
      case 'registry': return '🗄️';
      default: return '❓';
    }
  };

  const getArtifactColor = (status: string) => {
    switch (status) {
      case 'malicious': return 'bg-red-500/20 text-red-400 border-red-500';
      case 'suspicious': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'benign': return 'bg-green-500/20 text-green-400 border-green-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const activeCases = cases.filter(c => c.status !== 'closed').length;
  const totalEvidence = evidence.length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔬 Forensics & Investigation</h1>
          <p className="text-gray-400">Digital forensics and incident investigation platform</p>
        </div>
        <button onClick={() => setShowNewCase(!showNewCase)} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold">
          + New Case
        </button>
        <button
          onClick={handleAIAnalysis}
          disabled={analyzing || backendLoading}
          className="px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
        </button>
      </div>

      {showNewCase && (
        <div className="mt-4 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 mb-6">
          <h4 className="text-white font-medium mb-3">New Forensic Case</h4>
          <div className="space-y-3">
            <input type="text" placeholder="Case title" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
            <select title="Case type" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
              <option>Incident Response</option><option>Malware Analysis</option><option>Data Breach</option><option>Insider Threat</option>
            </select>
            <textarea placeholder="Case description and initial findings..." className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm h-20 resize-none" />
            <div className="flex gap-2">
              <button onClick={() => setShowNewCase(false)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg">Create Case</button>
              <button onClick={() => setShowNewCase(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{activeCases}</div>
          <div className="text-sm text-gray-400">Active Cases</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{cases.filter(c => c.priority === 'critical').length}</div>
          <div className="text-sm text-gray-400">Critical</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{totalEvidence}</div>
          <div className="text-sm text-gray-400">Evidence Items</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{timeline.length}</div>
          <div className="text-sm text-gray-400">Timeline Events</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-400">{artifacts.filter(a => a.status === 'malicious').length}</div>
          <div className="text-sm text-gray-400">Malicious Artifacts</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{cases.filter(c => c.status === 'closed').length}</div>
          <div className="text-sm text-gray-400">Closed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'cases', label: '📁 Cases' },
          { id: 'evidence', label: '🔒 Evidence' },
          { id: 'timeline', label: '📅 Timeline' },
          { id: 'artifacts', label: '🔬 Artifacts' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          {cases.map(caseItem => (
            <div key={caseItem.id} className={`p-6 rounded-xl border ${
              caseItem.priority === 'critical' ? 'border-red-500/30 bg-red-500/5' :
              caseItem.priority === 'high' ? 'border-orange-500/30 bg-orange-500/5' :
              'border-gray-700 bg-gray-900/50'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-cyan-400">{caseItem.caseNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      caseItem.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      caseItem.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      caseItem.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {caseItem.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{caseItem.title}</h3>
                  <p className="text-sm text-gray-500">Type: {caseItem.type.replace('_', ' ')} • Assigned: {caseItem.assignedTo}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Created: {caseItem.createdDate}</div>
                  <div>Evidence: {caseItem.evidenceCount} items</div>
                </div>
              </div>
              
              {caseItem.findings.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">Key Findings:</div>
                  <div className="flex flex-wrap gap-2">
                    {caseItem.findings.map((finding, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800 rounded text-sm">
                        • {finding}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Evidence Tab */}
      {activeTab === 'evidence' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="p-4">Type</th>
                <th className="p-4">Name</th>
                <th className="p-4">Hash (SHA256)</th>
                <th className="p-4">Size</th>
                <th className="p-4">Collected By</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map(item => (
                <tr key={item.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4">
                    <span className="flex items-center gap-2">
                      {getEvidenceIcon(item.type)}
                      <span className="text-sm">{item.type.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm">{item.name}</td>
                  <td className="p-4">
                    <span className="font-mono text-xs text-gray-500">{item.hash.substring(0, 16)}...</span>
                  </td>
                  <td className="p-4">{item.size}</td>
                  <td className="p-4 text-sm text-gray-400">{item.collectedBy}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-700" />
          <div className="space-y-4">
            {timeline.map((event, _idx) => (
              <div key={event.id} className="ml-8 relative">
                <div className={`absolute -left-6 w-3 h-3 rounded-full ${
                  event.significance === 'critical' ? 'bg-red-500' :
                  event.significance === 'high' ? 'bg-orange-500' :
                  event.significance === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className={`p-4 rounded-xl border ${
                  event.significance === 'critical' ? 'border-red-500/30 bg-red-500/5' :
                  event.significance === 'high' ? 'border-orange-500/30 bg-orange-500/5' :
                  'border-gray-700 bg-gray-900/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-cyan-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">{event.source}</span>
                  </div>
                  <div className="font-semibold mb-1">{event.eventType}</div>
                  <p className="text-sm text-gray-400">{event.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Artifact: {event.artifact}</span>
                    <div className="flex gap-1">
                      {event.tags.map((tag, tidx) => (
                        <span key={tidx} className="px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artifacts Tab */}
      {activeTab === 'artifacts' && (
        <div className="space-y-4">
          {artifacts.map(artifact => (
            <div key={artifact.id} className={`p-6 rounded-xl border ${getArtifactColor(artifact.status)}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-semibold">{artifact.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${getArtifactColor(artifact.status)}`}>
                      {artifact.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Category: {artifact.category.replace('_', ' ')}</p>
                </div>
              </div>
              <p className="text-sm mb-4">{artifact.details}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-2">IOCs Extracted:</div>
                  <div className="flex flex-wrap gap-1">
                    {artifact.iocExtracted.map((ioc, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800 rounded text-xs font-mono">
                        {ioc}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-2">MITRE ATT&CK:</div>
                  <div className="flex flex-wrap gap-1">
                    {artifact.mitreMapping.map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-purple-400">🤖 AI Analysis Result</h3>
            <button onClick={() => setAnalysisResult('')} className="text-gray-500 hover:text-white">✕</button>
          </div>
          <div className="text-gray-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default ForensicsInvestigation;
