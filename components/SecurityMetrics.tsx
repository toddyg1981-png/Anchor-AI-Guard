import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

const SecurityMetrics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [activeTab, setActiveTab] = useState<'kpis' | 'risks' | 'trends' | 'board'>('kpis');

  const [kpis, setKpis] = useState([
    { id: 'kpi-1', name: 'MTTD', value: '54s', trend: 'improving', target: '<60s', delta: '-12%' },
    { id: 'kpi-2', name: 'MTTR', value: '6m', trend: 'flat', target: '<5m', delta: '+2%' },
    { id: 'kpi-3', name: 'Patch SLA', value: '92%', trend: 'improving', target: '95%', delta: '+3%' },
    { id: 'kpi-4', name: 'Phish click rate', value: '2.1%', trend: 'improving', target: '<3%', delta: '-0.4%' },
    { id: 'kpi-5', name: 'Vuln remediation', value: '88%', trend: 'improving', target: '90%', delta: '+5%' },
    { id: 'kpi-6', name: 'Coverage', value: '96%', trend: 'improving', target: '99%', delta: '+1%' },
  ]);

  const [risks, setRisks] = useState([
    { id: 'r-1', name: 'Identity', score: 18, maxScore: 100, category: 'IAM' },
    { id: 'r-2', name: 'Cloud', score: 22, maxScore: 100, category: 'Infrastructure' },
    { id: 'r-3', name: 'Endpoint', score: 14, maxScore: 100, category: 'Devices' },
    { id: 'r-4', name: 'Third-party', score: 26, maxScore: 100, category: 'Supply Chain' },
    { id: 'r-5', name: 'Application', score: 19, maxScore: 100, category: 'AppSec' },
    { id: 'r-6', name: 'Data', score: 15, maxScore: 100, category: 'DLP' },
  ]);

  const boardMetrics = [
    { label: 'Overall Security Score', value: 'A-', color: 'text-green-400' },
    { label: 'Compliance Coverage', value: '94%', color: 'text-green-400' },
    { label: 'Risk Reduction (QoQ)', value: '-18%', color: 'text-green-400' },
    { label: 'Incidents (Quarter)', value: '3', color: 'text-yellow-400' },
    { label: 'Budget Utilization', value: '87%', color: 'text-cyan-400' },
    { label: 'Security Maturity', value: 'Level 4', color: 'text-green-400' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await backendApi.securityMetrics.getKPIs();
      if ((result as any)?.kpis) setKpis(prev => (result as any).kpis.length > 0 ? (result as any).kpis : prev);
      if ((result as any)?.risks) setRisks(prev => (result as any).risks.length > 0 ? (result as any).risks : prev);
    } catch (err) {
      logger.error('Failed to load security metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setAnalyzing(true);
    try {
      const result = await backendApi.modules.analyze('security-metrics', 
        `Generate an executive board report summarizing: KPIs: ${JSON.stringify(kpis)}, Risk domains: ${JSON.stringify(risks)}`
      );
      if ((result as any)?.analysis) setAnalysisResult((result as any).analysis);
    } catch (err) {
      logger.error('Report generation failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const trendColor = (trend: string) => trend === 'improving' ? 'text-green-400' : trend === 'declining' ? 'text-red-400' : 'text-yellow-400';
  const riskColor = (score: number) => score > 25 ? 'bg-red-500' : score > 15 ? 'bg-yellow-500' : 'bg-green-500';

  if (loading) return (
    <div className="bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
    </div>
  );

  return (
    <div className="bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400">Security Metrics</h1>
          <p className="text-slate-400">KPIs, OKRs, and risk scores for executives and boards.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleGenerateReport} disabled={analyzing}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {analyzing ? 'Generating...' : 'Generate Board Report'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Reporting: Weekly</div>
        </div>
      </header>

      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {(['kpis', 'risks', 'trends', 'board'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-slate-800 text-cyan-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'kpis' ? 'KPIs' : tab === 'risks' ? 'Risk Domains' : tab === 'trends' ? 'Trends' : 'Board View'}
          </button>
        ))}
      </div>

      {activeTab === 'kpis' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {kpis.map(card => (
            <div key={card.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="text-slate-400 text-sm">{card.name}</div>
              <div className="text-2xl font-semibold mt-1">{card.value}</div>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${trendColor(card.trend)}`}>{card.trend} {card.delta}</span>
                <span className="text-xs text-slate-500">Target: {card.target}</span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(parseInt(card.value) || 70, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {risks.map(item => (
              <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{item.name}</div>
                  <span className="text-xs text-slate-400">{item.category}</span>
                </div>
                <div className="text-3xl font-bold">{item.score}<span className="text-sm text-slate-500">/{item.maxScore}</span></div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${riskColor(item.score)}`} style={{ width: `${item.score}%` }} />
                </div>
                <div className="text-xs mt-1 text-slate-400">{item.score <= 15 ? 'Low Risk' : item.score <= 25 ? 'Medium Risk' : 'High Risk'}</div>
              </div>
            ))}
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Aggregate Risk Score</h3>
            <div className="text-4xl font-bold text-green-400">{Math.round(risks.reduce((a, b) => a + b.score, 0) / risks.length)}</div>
            <p className="text-sm text-slate-400 mt-1">Average across {risks.length} risk domains</p>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold mb-3">30-Day Trend Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Vulnerabilities found', current: 142, previous: 189 },
                { label: 'Vulnerabilities fixed', current: 156, previous: 134 },
                { label: 'Incidents', current: 3, previous: 7 },
                { label: 'Mean response time', current: 4.2, previous: 6.8 },
              ].map(t => (
                <div key={t.label} className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                  <div className="text-xs text-slate-400">{t.label}</div>
                  <div className="text-lg font-semibold mt-1">{t.current}</div>
                  <div className={`text-xs mt-1 ${t.current <= t.previous ? 'text-green-400' : 'text-red-400'}`}>
                    {t.current <= t.previous ? '↓' : '↑'} from {t.previous}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Compliance Posture Over Time</h3>
            <div className="grid grid-cols-3 gap-3">
              {[{ fw: 'SOC 2', score: '94%' }, { fw: 'ISO 27001', score: '91%' }, { fw: 'NIST CSF', score: '88%' }].map(c => (
                <div key={c.fw} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-sm text-slate-400">{c.fw}</div>
                  <div className="text-2xl font-bold text-green-400 mt-1">{c.score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'board' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {boardMetrics.map(m => (
              <div key={m.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="text-slate-400 text-sm">{m.label}</div>
                <div className={`text-3xl font-bold mt-2 ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Investment Highlights</h3>
            <div className="space-y-2 text-sm">
              {['Reduced breach risk by 67% through automated remediation', 'Achieved SOC 2 Type II certification', 'Eliminated 94% of manual security reviews with AI', 'Reduced vendor risk assessment time from 3 weeks to 2 days'].map(item => (
                <div key={item} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-cyan-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-cyan-400 mb-2">AI Board Report</h3>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default SecurityMetrics;
