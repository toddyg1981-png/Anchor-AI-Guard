import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

const PenetrationTesting: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [activeTab, setActiveTab] = useState<'engagements' | 'findings' | 'methodology' | 'retests'>('engagements');

  const [tests, setTests] = useState([
    { id: 'p-1', name: 'External App Test', status: 'Running', findings: 5, severity: 'High', tester: 'Red Team Alpha', scope: 'Web Application' },
    { id: 'p-2', name: 'Internal Network', status: 'Scheduled', findings: 0, severity: 'N/A', tester: 'Red Team Beta', scope: 'Corporate Network' },
    { id: 'p-3', name: 'API Security', status: 'Completed', findings: 9, severity: 'Critical', tester: 'Red Team Alpha', scope: 'REST/GraphQL APIs' },
    { id: 'p-4', name: 'Cloud Infrastructure', status: 'Running', findings: 3, severity: 'High', tester: 'Red Team Gamma', scope: 'AWS/GCP' },
    { id: 'p-5', name: 'Mobile App (iOS/Android)', status: 'Completed', findings: 6, severity: 'Medium', tester: 'Red Team Beta', scope: 'Mobile' },
  ]);

  const [stats, setStats] = useState([
    { label: 'Engagements (Q1)', value: 14 },
    { label: 'Exploits validated', value: 22 },
    { label: 'Retests completed', value: 9 },
    { label: 'Mean time to fix', value: '9d' },
  ]);

  const topFindings = [
    { title: 'SQL Injection in search endpoint', severity: 'Critical', cvss: 9.8, status: 'Fixed', engagement: 'API Security' },
    { title: 'Broken access control on admin panel', severity: 'Critical', cvss: 9.1, status: 'In Progress', engagement: 'External App' },
    { title: 'SSRF via webhook URL parameter', severity: 'High', cvss: 8.6, status: 'Fixed', engagement: 'API Security' },
    { title: 'JWT algorithm confusion', severity: 'High', cvss: 8.2, status: 'Open', engagement: 'API Security' },
    { title: 'Insecure direct object reference', severity: 'High', cvss: 7.5, status: 'Fixed', engagement: 'External App' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await backendApi.modules.getDashboard('penetration-testing');
      if ((result as any)?.stats) setStats(prev => (result as any).stats.length > 0 ? (result as any).stats : prev);
      if ((result as any)?.items) setTests(prev => (result as any).items.length > 0 ? (result as any).items : prev);
    } catch (err) {
      logger.error('Failed to load pentest dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScopeAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await backendApi.modules.analyze('penetration-testing', 'Analyze our attack surface and recommend the next penetration test scope, methodology, and focus areas');
      if ((result as any)?.analysis) setAnalysisResult((result as any).analysis);
    } catch (err) {
      logger.error('Scope analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400" />
    </div>
  );

  return (
    <div className="bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-red-400 to-amber-400">Penetration Testing</h1>
          <p className="text-slate-400">Adversarial testing, exploit validation, and remediation verification.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleScopeAnalysis} disabled={analyzing}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {analyzing ? 'Analyzing...' : 'AI Scope Planner'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Scoped & approved</div>
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
        {(['engagements', 'findings', 'methodology', 'retests'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-slate-800 text-red-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'engagements' ? 'Engagements' : tab === 'findings' ? 'Top Findings' : tab === 'methodology' ? 'Methodology' : 'Retests'}
          </button>
        ))}
      </div>

      {activeTab === 'engagements' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Engagement Pipeline</h2>
          {tests.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Scope: {item.scope} | Team: {item.tester} | Findings: {item.findings}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${item.status === 'Completed' ? 'bg-green-500/20 text-green-300' : item.status === 'Running' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-500/20 text-slate-300'}`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'findings' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Critical & High Findings</h2>
          {topFindings.map((f, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{f.title}</div>
                <div className="text-xs text-slate-500">CVSS: {f.cvss} | From: {f.engagement}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${f.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'}`}>{f.severity}</span>
                <span className={`text-xs ${f.status === 'Fixed' ? 'text-green-400' : f.status === 'In Progress' ? 'text-yellow-400' : 'text-red-400'}`}>{f.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'methodology' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[{ name: 'OWASP Testing Guide', steps: ['Recon & Mapping', 'Auth Testing', 'Session Mgmt', 'Input Validation', 'Logic Flaws', 'Cryptography'] },
            { name: 'PTES Standard', steps: ['Pre-engagement', 'Intelligence Gathering', 'Threat Modeling', 'Vulnerability Analysis', 'Exploitation', 'Post-Exploitation', 'Reporting'] }
          ].map(m => (
            <div key={m.name} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="font-semibold mb-3">{m.name}</h3>
              <div className="space-y-1">
                {m.steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">{i + 1}</span>
                    <span className="text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'retests' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Retest Queue</h2>
          {[{ finding: 'SQL Injection in search', originalDate: '2026-01-05', retestDate: '2026-01-20', result: 'Passed' },
            { finding: 'SSRF via webhook URL', originalDate: '2026-01-08', retestDate: '2026-01-22', result: 'Passed' },
            { finding: 'Broken access control', originalDate: '2026-01-10', retestDate: 'Pending', result: 'Awaiting fix' },
          ].map((r, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{r.finding}</div>
                <div className="text-xs text-slate-500">Found: {r.originalDate} | Retest: {r.retestDate}</div>
              </div>
              <span className={`text-xs ${r.result === 'Passed' ? 'text-green-400' : 'text-yellow-400'}`}>{r.result}</span>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-red-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-red-400 mb-2">AI Scope Analysis</h3>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default PenetrationTesting;
