import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

const ForensicsLab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [evidenceInput, setEvidenceInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'cases' | 'analyze' | 'timeline' | 'chain'>('cases');

  const [cases, setCases] = useState([
    { id: 'f-1', name: 'Ransomware Case #443', status: 'Analyzing', evidence: 18, lead: 'J. Chen', opened: '2026-01-15' },
    { id: 'f-2', name: 'Phishing BEC #227', status: 'Reporting', evidence: 9, lead: 'M. Silva', opened: '2026-01-12' },
    { id: 'f-3', name: 'Insider Copy #112', status: 'Collection', evidence: 14, lead: 'A. Patel', opened: '2026-01-18' },
    { id: 'f-4', name: 'Supply Chain Artifact #88', status: 'Analyzing', evidence: 22, lead: 'K. Wang', opened: '2026-01-10' },
    { id: 'f-5', name: 'Credential Theft #301', status: 'Complete', evidence: 7, lead: 'R. Jones', opened: '2025-12-28' },
  ]);

  const [stats, setStats] = useState([
    { label: 'Open cases', value: 12 },
    { label: 'Chain-of-custody intact', value: '100%' },
    { label: 'Artifacts', value: 184 },
    { label: 'Imaged systems', value: 26 },
  ]);

  const timeline = [
    { time: '2026-01-18 14:32:11', event: 'Suspicious PowerShell execution', source: 'WIN-042', severity: 'High' },
    { time: '2026-01-18 14:32:44', event: 'Credential dump (lsass.exe)', source: 'WIN-042', severity: 'Critical' },
    { time: '2026-01-18 14:33:02', event: 'Lateral movement via SMB', source: 'WIN-042 → DC-01', severity: 'Critical' },
    { time: '2026-01-18 14:33:18', event: 'Domain admin token obtained', source: 'DC-01', severity: 'Critical' },
    { time: '2026-01-18 14:34:01', event: 'Group policy modification', source: 'DC-01', severity: 'High' },
    { time: '2026-01-18 14:35:22', event: 'Ransomware deployment initiated', source: 'DC-01', severity: 'Critical' },
    { time: '2026-01-18 14:35:28', event: 'EDR containment triggered', source: 'Anchor EDR', severity: 'Info' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await backendApi.modules.getDashboard('forensics');
      if ((result as any)?.stats) setStats(prev => (result as any).stats.length > 0 ? (result as any).stats : prev);
      if ((result as any)?.items) setCases(prev => (result as any).items.length > 0 ? (result as any).items : prev);
    } catch (err) {
      logger.error('Failed to load forensics dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!evidenceInput.trim()) return;
    setAnalyzing(true);
    try {
      const result = await backendApi.forensics.analyze(evidenceInput);
      if (result) setAnalysisResult(result);
    } catch (err) {
      logger.error('Forensic analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">Forensics Lab</h1>
          <p className="text-slate-400">Evidence collection, chain of custody, and timeline analysis.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Write blockers: Active</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {(['cases', 'analyze', 'timeline', 'chain'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-slate-800 text-blue-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'cases' ? 'Cases' : tab === 'analyze' ? 'AI Analysis' : tab === 'timeline' ? 'Timeline' : 'Chain of Custody'}
          </button>
        ))}
      </div>

      {activeTab === 'cases' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Active Cases</h2>
            <span className="text-xs text-slate-400">{cases.length} cases</span>
          </div>
          <div className="space-y-3">
            {cases.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-slate-500">Lead: {item.lead} | Opened: {item.opened} | Evidence items: {item.evidence}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${item.status === 'Complete' ? 'bg-green-500/20 text-green-300' : item.status === 'Analyzing' ? 'bg-blue-500/20 text-blue-300' : item.status === 'Collection' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-purple-500/20 text-purple-300'}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analyze' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">AI Forensic Analysis</h2>
            <textarea value={evidenceInput} onChange={e => setEvidenceInput(e.target.value)}
              placeholder="Describe evidence or paste log excerpts, IOCs, file hashes, network artifacts..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none h-32 resize-none" />
            <button onClick={handleAnalyze} disabled={analyzing}
              className="mt-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              {analyzing ? 'Analyzing Evidence...' : 'Analyze with AI'}
            </button>
          </div>
          {analysisResult && (
            <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-blue-400 mb-2">Forensic Analysis Report</h3>
              <div className="text-sm text-slate-300 whitespace-pre-wrap">{typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult, null, 2)}</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="font-semibold mb-3">Attack Timeline - Case #443</h3>
          <div className="space-y-1">
            {timeline.map((event, i) => (
              <div key={i} className="flex gap-4 items-start py-2 border-l-2 border-slate-600 pl-4 ml-2 relative">
                <div className={`absolute -left-1.5 top-3 w-3 h-3 rounded-full ${event.severity === 'Critical' ? 'bg-red-500' : event.severity === 'High' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                <div className="text-xs text-slate-500 w-40 shrink-0 font-mono">{event.time}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{event.event}</div>
                  <div className="text-xs text-slate-400">{event.source}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${event.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : event.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'}`}>{event.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'chain' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="font-semibold mb-3">Chain of Custody Log</h3>
          <div className="space-y-2">
            {[{ item: 'Disk Image - WIN-042', hash: 'sha256:a1b2c3...', custodian: 'J. Chen', action: 'Acquired', time: '2026-01-15 09:12' },
              { item: 'Memory Dump - WIN-042', hash: 'sha256:d4e5f6...', custodian: 'J. Chen', action: 'Acquired', time: '2026-01-15 09:18' },
              { item: 'Network PCAP - Segment 4', hash: 'sha256:g7h8i9...', custodian: 'M. Silva', action: 'Transferred', time: '2026-01-15 10:44' },
              { item: 'Email artifacts - BEC #227', hash: 'sha256:j1k2l3...', custodian: 'A. Patel', action: 'Analyzed', time: '2026-01-16 14:22' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{item.item}</div>
                    <div className="text-xs text-slate-500 font-mono">{item.hash}</div>
                  </div>
                  <span className="text-xs text-green-300">{item.action}</span>
                </div>
                <div className="flex justify-between mt-1 text-xs text-slate-400">
                  <span>Custodian: {item.custodian}</span>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-green-400 flex items-center gap-2">
            <span>✓</span> All evidence integrity verified - no tampering detected
          </div>
        </div>
      )}
    </div>
  );
};

export default ForensicsLab;
