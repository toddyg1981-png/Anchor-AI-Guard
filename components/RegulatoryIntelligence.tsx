import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

const RegulatoryIntelligence: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [impactResult, setImpactResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await backendApi.regulatoryIntel.getDashboard() as any;
      setDashboardData(data);
    } catch (err) { logger.error('Regulatory intel failed:', err); }
    setLoading(false);
  };

  const analyzeImpact = async (regulationId: string) => {
    setAnalyzing(true);
    try {
      const result = await backendApi.regulatoryIntel.analyzeImpact(regulationId) as any;
      setImpactResult(result);
    } catch { setImpactResult({ error: 'Analysis failed' }); }
    setAnalyzing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const result = await backendApi.regulatoryIntel.search(searchQuery) as any;
      setSearchResults(result);
    } catch { setSearchResults(null); }
  };

  const regulations = dashboardData?.regulations || [
    { id: 'reg-1', name: 'EU NIS2 Directive', jurisdiction: 'European Union', effectiveDate: '2026-10-17', impact: 'High', status: 'Assessing' },
    { id: 'reg-2', name: 'AU SOCI Act Amendments', jurisdiction: 'Australia', effectiveDate: '2026-05-01', impact: 'Medium', status: 'In Progress' },
    { id: 'reg-3', name: 'US Executive Order - Supply Chain', jurisdiction: 'United States', effectiveDate: '2026-07-30', impact: 'High', status: 'Tracking' },
    { id: 'reg-4', name: 'UK Cyber Resilience Act', jurisdiction: 'United Kingdom', effectiveDate: '2026-09-01', impact: 'Medium', status: 'Tracking' },
    { id: 'reg-5', name: 'Singapore Cybersecurity Act 2.0', jurisdiction: 'Singapore', effectiveDate: '2026-06-15', impact: 'Medium', status: 'Assessing' },
    { id: 'reg-6', name: 'Japan Active Cyber Defense', jurisdiction: 'Japan', effectiveDate: '2026-04-01', impact: 'Low', status: 'Monitoring' },
  ];

  const stats = dashboardData?.stats || {
    jurisdictions: 18, frameworksMapped: 26, upcomingDeadlines: regulations.length, ownerAssignment: '100%',
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">📋 Regulatory Intelligence</h1>
          <p className="text-slate-400">Track global regulations, map controls, and stay ahead of compliance deadlines</p>
        </div>
        <div className="flex gap-2">
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search regulations..." className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm w-48" />
          <button onClick={handleSearch} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">🔍</button>
        </div>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-slate-400">Loading regulatory intelligence...</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Jurisdictions', value: stats.jurisdictions, color: 'text-blue-400' },
          { label: 'Frameworks Mapped', value: stats.frameworksMapped, color: 'text-emerald-400' },
          { label: 'Upcoming Deadlines', value: stats.upcomingDeadlines, color: 'text-yellow-400' },
          { label: 'Owner Assignment', value: stats.ownerAssignment, color: 'text-green-400' },
        ].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {searchResults && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="font-bold text-blue-400 mb-2">🔍 Search Results for "{searchQuery}"</div>
          {searchResults.results?.length > 0 ? (
            <div className="space-y-2">
              {searchResults.results.map((r: any, i: number) => (
                <div key={i} className="bg-slate-800 rounded-lg p-3 text-sm">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.jurisdiction} • {r.status}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400">No matching regulations found.</p>}
        </div>
      )}

      {impactResult && !impactResult.error && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="font-bold text-emerald-400 mb-2">🤖 AI Impact Analysis</div>
          <div className="text-sm text-gray-300 whitespace-pre-wrap">
            {typeof impactResult.analysis === 'string' ? impactResult.analysis : JSON.stringify(impactResult, null, 2)}
          </div>
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Upcoming Regulatory Changes</h2>
          <span className="text-xs text-slate-400">Global Compliance</span>
        </div>
        <div className="space-y-3">
          {regulations.map((item: any) => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-base">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.jurisdiction}</div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-0.5 rounded text-xs ${item.impact === 'High' ? 'bg-red-500/20 text-red-400' : item.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {item.impact} Impact
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Due: {item.effectiveDate || item.due}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-xs ${item.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
                  {item.status}
                </span>
                <button onClick={() => analyzeImpact(item.id)} disabled={analyzing}
                  className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50">
                  {analyzing ? '⏳' : '🤖'} AI Impact Analysis
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="font-semibold mb-4">🗺️ Compliance Map by Region</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { region: 'North America', regs: 8, compliance: 85 },
            { region: 'European Union', regs: 12, compliance: 72 },
            { region: 'Asia Pacific', regs: 6, compliance: 68 },
            { region: 'United Kingdom', regs: 4, compliance: 90 },
            { region: 'Middle East', regs: 3, compliance: 55 },
            { region: 'Latin America', regs: 2, compliance: 60 },
          ].map(r => (
            <div key={r.region} className="bg-slate-900 rounded-lg p-4">
              <div className="font-medium text-sm">{r.region}</div>
              <div className="text-xs text-slate-500">{r.regs} applicable regulations</div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Compliance</span><span>{r.compliance}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${r.compliance >= 80 ? 'bg-green-500' : r.compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${r.compliance}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegulatoryIntelligence;
