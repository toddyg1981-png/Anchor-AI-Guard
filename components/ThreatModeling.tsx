import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

const ThreatModeling: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [systemInput, setSystemInput] = useState('');
  const [modelResult, setModelResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'models' | 'create' | 'attack-trees' | 'mitre'>('models');

  const [models, setModels] = useState([
    { id: 'tm-1', name: 'Payments Platform', method: 'STRIDE', risks: 12, status: 'In Review', threats: 18, mitigations: 14 },
    { id: 'tm-2', name: 'Mobile App', method: 'LINDDUN', risks: 7, status: 'Approved', threats: 11, mitigations: 11 },
    { id: 'tm-3', name: 'AI Pipeline', method: 'ATT&CK Mapping', risks: 9, status: 'Draft', threats: 15, mitigations: 8 },
    { id: 'tm-4', name: 'API Gateway', method: 'STRIDE', risks: 6, status: 'Approved', threats: 9, mitigations: 9 },
    { id: 'tm-5', name: 'Customer Portal', method: 'DREAD', risks: 11, status: 'In Review', threats: 16, mitigations: 12 },
  ]);

  const [stats, setStats] = useState([
    { label: 'Models', value: 38 },
    { label: 'High risks', value: 14 },
    { label: 'Controls mapped', value: 122 },
    { label: 'Open tasks', value: 26 },
  ]);

  const mitreTactics = [
    { tactic: 'Initial Access', techniques: 14, coverage: '86%' },
    { tactic: 'Execution', techniques: 12, coverage: '92%' },
    { tactic: 'Persistence', techniques: 19, coverage: '78%' },
    { tactic: 'Privilege Escalation', techniques: 13, coverage: '84%' },
    { tactic: 'Defense Evasion', techniques: 42, coverage: '71%' },
    { tactic: 'Credential Access', techniques: 15, coverage: '89%' },
    { tactic: 'Lateral Movement', techniques: 9, coverage: '88%' },
    { tactic: 'Exfiltration', techniques: 9, coverage: '82%' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await backendApi.modules.getDashboard('threat-modeling');
      if ((result as any)?.stats) setStats(prev => (result as any).stats.length > 0 ? (result as any).stats : prev);
      if ((result as any)?.items) setModels(prev => (result as any).items.length > 0 ? (result as any).items : prev);
    } catch (err) {
      logger.error('Failed to load threat modeling dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async () => {
    if (!systemInput.trim()) return;
    setCreating(true);
    try {
      const result = await backendApi.threatModeling.create(systemInput);
      if (result) setModelResult(result);
    } catch (err) {
      logger.error('Threat model creation failed:', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-blue-400">Threat Modeling</h1>
          <p className="text-slate-400">STRIDE/DREAD, attack trees, and MITRE mappings for every system.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Coverage: 82%</div>
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
        {(['models', 'create', 'attack-trees', 'mitre'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-slate-800 text-teal-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'models' ? 'Models' : tab === 'create' ? 'AI Create' : tab === 'attack-trees' ? 'Attack Trees' : 'MITRE Mapping'}
          </button>
        ))}
      </div>

      {activeTab === 'models' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Threat Models</h2>
            <span className="text-xs text-slate-400">{models.length} models</span>
          </div>
          <div className="space-y-3">
            {models.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-slate-500">Method: {item.method} | {item.threats} threats, {item.mitigations} mitigated</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs ${item.status === 'Approved' ? 'bg-green-500/20 text-green-300' : item.status === 'Draft' ? 'bg-slate-500/20 text-slate-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{item.status}</span>
                  <span className="text-orange-400 font-bold">{item.risks} risks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">AI Threat Model Generator</h2>
            <p className="text-sm text-slate-400 mb-3">Describe your system architecture and we&apos;ll auto-generate a STRIDE threat model with attack trees and mitigations.</p>
            <textarea value={systemInput} onChange={e => setSystemInput(e.target.value)}
              placeholder="e.g., REST API with JWT auth, PostgreSQL database, Redis cache, S3 file storage, deployed on AWS ECS with ALB..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:outline-none h-32 resize-none" />
            <button onClick={handleCreateModel} disabled={creating}
              className="mt-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              {creating ? 'Generating Threat Model...' : 'Generate Threat Model'}
            </button>
          </div>
          {modelResult && (
            <div className="bg-slate-800 border border-teal-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-teal-400 mb-2">Generated Threat Model</h3>
              <div className="text-sm text-slate-300 whitespace-pre-wrap">{modelResult.model || JSON.stringify(modelResult, null, 2)}</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'attack-trees' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="font-semibold mb-3">Attack Tree Library</h3>
          <div className="space-y-3">
            {[{ root: 'Steal Customer Data', branches: ['SQL Injection', 'API Auth Bypass', 'Insider Access', 'Supply Chain Compromise'], likelihood: 'Medium' },
              { root: 'Service Disruption', branches: ['DDoS', 'Resource Exhaustion', 'DNS Hijack', 'Dependency Failure'], likelihood: 'Low' },
              { root: 'Account Takeover', branches: ['Credential Stuffing', 'Session Hijack', 'SIM Swap', 'Phishing'], likelihood: 'High' }
            ].map(tree => (
              <div key={tree.root} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{tree.root}</span>
                  <span className={`text-xs ${tree.likelihood === 'High' ? 'text-red-400' : tree.likelihood === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>Likelihood: {tree.likelihood}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tree.branches.map(b => (
                    <span key={b} className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs">{b}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mitre' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="font-semibold mb-3">MITRE ATT&CK Coverage</h3>
          <div className="space-y-2">
            {mitreTactics.map(t => (
              <div key={t.tactic} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{t.tactic}</div>
                  <div className="text-xs text-slate-500">{t.techniques} techniques</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: t.coverage }} />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{t.coverage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatModeling;
