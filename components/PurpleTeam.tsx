import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

const PurpleTeam: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [activeTab, setActiveTab] = useState<'exercises' | 'emulation' | 'coverage' | 'gaps'>('exercises');

  const [exercises, setExercises] = useState([
    { id: 'pt-1', name: 'Credential Theft Emulation', result: 'Detected', mttr: '4m', status: 'Closed', technique: 'T1003', date: '2026-01-15' },
    { id: 'pt-2', name: 'Ransomware Kill Chain', result: 'Contained', mttr: '7m', status: 'Closed', technique: 'T1486', date: '2026-01-12' },
    { id: 'pt-3', name: 'Cloud PrivEsc', result: 'Gaps Found', mttr: 'Pending', status: 'Open', technique: 'T1078.004', date: '2026-01-18' },
    { id: 'pt-4', name: 'Lateral Movement via RDP', result: 'Detected', mttr: '2m', status: 'Closed', technique: 'T1021.001', date: '2026-01-10' },
    { id: 'pt-5', name: 'Data Exfiltration via DNS', result: 'Missed', mttr: 'N/A', status: 'Remediation', technique: 'T1048', date: '2026-01-08' },
  ]);

  const [stats, setStats] = useState([
    { label: 'Exercises (Q1)', value: 11 },
    { label: 'Detections improved', value: 18 },
    { label: 'Playbooks tuned', value: 9 },
    { label: 'Residual gaps', value: 3 },
  ]);

  const emulationPlans = [
    { name: 'APT29 (Cozy Bear)', techniques: 14, status: 'Scheduled', date: '2026-02-01' },
    { name: 'FIN7 (Carbanak)', techniques: 11, status: 'Ready', date: '2026-02-15' },
    { name: 'Lazarus Group', techniques: 18, status: 'Draft', date: '2026-03-01' },
    { name: 'ALPHV/BlackCat', techniques: 9, status: 'Ready', date: '2026-02-20' },
  ];

  const coverageGaps = [
    { tactic: 'Exfiltration', technique: 'DNS Tunneling (T1048)', detection: 'None', priority: 'High' },
    { tactic: 'Defense Evasion', technique: 'Process Injection (T1055)', detection: 'Partial', priority: 'Medium' },
    { tactic: 'Persistence', technique: 'Scheduled Task (T1053)', detection: 'Alert Only', priority: 'Low' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await backendApi.modules.getDashboard('purple-team');
      if ((result as any)?.stats) setStats(prev => (result as any).stats.length > 0 ? (result as any).stats : prev);
      if ((result as any)?.items) setExercises(prev => (result as any).items.length > 0 ? (result as any).items : prev);
    } catch (err) {
      logger.error('Failed to load purple team dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanExercise = async () => {
    setAnalyzing(true);
    try {
      const result = await backendApi.modules.analyze('purple-team', 'Plan a purple team exercise targeting our current detection gaps, focusing on MITRE ATT&CK coverage improvement');
      if ((result as any)?.analysis) setAnalysisResult((result as any).analysis);
    } catch (err) {
      logger.error('Exercise planning failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const resultColor = (r: string) => r === 'Detected' || r === 'Contained' ? 'text-green-400' : r === 'Missed' ? 'text-red-400' : 'text-yellow-400';

  if (loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-violet-400">Purple Team</h1>
          <p className="text-slate-400">Red/Blue collaboration, adversary emulation, and control validation.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePlanExercise} disabled={analyzing}
            className="bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {analyzing ? 'Planning...' : 'AI Plan Exercise'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">MITRE mappings ready</div>
        </div>
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
        {(['exercises', 'emulation', 'coverage', 'gaps'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-slate-800 text-fuchsia-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'exercises' ? 'Exercises' : tab === 'emulation' ? 'Adversary Emulation' : tab === 'coverage' ? 'Detection Coverage' : 'Gaps & Remediation'}
          </button>
        ))}
      </div>

      {activeTab === 'exercises' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Recent Exercises</h2>
          {exercises.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">{item.technique} | {item.date} | MTTR: {item.mttr}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${resultColor(item.result)}`}>{item.result}</span>
                <span className={`px-2 py-1 rounded text-xs ${item.status === 'Closed' ? 'bg-green-500/20 text-green-300' : item.status === 'Remediation' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'emulation' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Adversary Emulation Plans</h2>
          {emulationPlans.map(plan => (
            <div key={plan.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{plan.name}</div>
                <div className="text-xs text-slate-500">{plan.techniques} techniques | Scheduled: {plan.date}</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${plan.status === 'Ready' ? 'bg-green-500/20 text-green-300' : plan.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-500/20 text-slate-300'}`}>{plan.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'coverage' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="font-semibold mb-3">MITRE ATT&CK Detection Coverage</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[{ tactic: 'Initial Access', pct: 86 }, { tactic: 'Execution', pct: 92 }, { tactic: 'Persistence', pct: 78 }, { tactic: 'Priv Escalation', pct: 84 },
              { tactic: 'Defense Evasion', pct: 71 }, { tactic: 'Credential Access', pct: 89 }, { tactic: 'Lateral Movement', pct: 88 }, { tactic: 'Exfiltration', pct: 62 },
            ].map(t => (
              <div key={t.tactic} className="bg-slate-900 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-400">{t.tactic}</div>
                <div className={`text-2xl font-bold mt-1 ${t.pct >= 85 ? 'text-green-400' : t.pct >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>{t.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'gaps' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Detection Gaps</h2>
          {coverageGaps.map(gap => (
            <div key={gap.technique} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{gap.technique}</div>
                <div className="text-xs text-slate-500">Tactic: {gap.tactic} | Current: {gap.detection}</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${gap.priority === 'High' ? 'bg-red-500/20 text-red-300' : gap.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>{gap.priority}</span>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-fuchsia-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-fuchsia-400 mb-2">AI Exercise Plan</h3>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default PurpleTeam;
