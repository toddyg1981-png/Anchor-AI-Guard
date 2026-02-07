import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

const VendorRiskManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [vendorInput, setVendorInput] = useState('');
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'vendors' | 'assess' | 'monitoring' | 'questionnaires'>('vendors');

  const [vendors, setVendors] = useState([
    { id: 'v-1', name: 'Cloud Provider (AWS)', tier: 'Critical', status: 'Approved', score: 92, lastReview: '2025-12-01', nextReview: '2026-03-01' },
    { id: 'v-2', name: 'Payments Gateway (Stripe)', tier: 'Critical', status: 'Approved', score: 88, lastReview: '2025-11-15', nextReview: '2026-02-15' },
    { id: 'v-3', name: 'CRM Platform (Salesforce)', tier: 'High', status: 'In Review', score: 78, lastReview: '2025-10-20', nextReview: '2026-01-20' },
    { id: 'v-4', name: 'Email Provider (SendGrid)', tier: 'Medium', status: 'Approved', score: 84, lastReview: '2025-11-01', nextReview: '2026-05-01' },
    { id: 'v-5', name: 'Analytics (Datadog)', tier: 'High', status: 'Questionnaire sent', score: 73, lastReview: '2025-09-15', nextReview: '2026-03-15' },
    { id: 'v-6', name: 'CDN (Cloudflare)', tier: 'Critical', status: 'Approved', score: 95, lastReview: '2025-12-10', nextReview: '2026-06-10' },
  ]);

  const [stats, setStats] = useState([
    { label: 'Vendors', value: 212 },
    { label: 'Critical vendors', value: 17 },
    { label: 'Open assessments', value: 24 },
    { label: 'Auto-monitoring', value: 61 },
  ]);

  const questionnaires = [
    { name: 'SIG Lite', questions: 82, sent: 14, completed: 11 },
    { name: 'CAIQ v4', questions: 261, sent: 8, completed: 5 },
    { name: 'Custom Security', questions: 45, sent: 22, completed: 18 },
    { name: 'SOC 2 Evidence', questions: 36, sent: 6, completed: 4 },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await backendApi.modules.getDashboard('vendor-risk');
      if ((result as any)?.stats) setStats(prev => (result as any).stats.length > 0 ? (result as any).stats : prev);
      if ((result as any)?.items) setVendors(prev => (result as any).items.length > 0 ? (result as any).items : prev);
    } catch (err) {
      console.error('Failed to load vendor risk dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessVendor = async () => {
    if (!vendorInput.trim()) return;
    setAssessing(true);
    try {
      const result = await backendApi.vendorRisk.assess(vendorInput);
      if (result) setAssessmentResult(result);
    } catch (err) {
      console.error('Vendor assessment failed:', err);
    } finally {
      setAssessing(false);
    }
  };

  const tierColor = (tier: string) => tier === 'Critical' ? 'bg-red-500/20 text-red-300' : tier === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-200';
  const scoreColor = (score: number) => score >= 85 ? 'text-green-400' : score >= 70 ? 'text-yellow-400' : 'text-red-400';

  if (loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-pink-400">Vendor Risk Management</h1>
          <p className="text-slate-400">Third-party risk, questionnaires, continuous monitoring, and SLAs.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">SIG/CAIQ templates</div>
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
        {(['vendors', 'assess', 'monitoring', 'questionnaires'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-slate-800 text-orange-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'vendors' ? 'Vendor Registry' : tab === 'assess' ? 'AI Assessment' : tab === 'monitoring' ? 'Continuous Monitoring' : 'Questionnaires'}
          </button>
        ))}
      </div>

      {activeTab === 'vendors' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Vendor Registry</h2>
            <span className="text-xs text-slate-400">{vendors.length} vendors</span>
          </div>
          <div className="space-y-3">
            {vendors.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-slate-500">Last review: {item.lastReview} | Next: {item.nextReview}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs ${tierColor(item.tier)}`}>{item.tier}</span>
                  <span className={`text-lg font-bold ${scoreColor(item.score)}`}>{item.score}</span>
                  <span className="text-xs text-slate-400">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assess' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">AI Vendor Risk Assessment</h2>
            <div className="flex gap-3">
              <input type="text" value={vendorInput} onChange={e => setVendorInput(e.target.value)} placeholder="Enter vendor name (e.g., Datadog, Okta, Snowflake)"
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none" />
              <button onClick={handleAssessVendor} disabled={assessing}
                className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                {assessing ? 'Assessing...' : 'Assess Vendor'}
              </button>
            </div>
          </div>
          {assessmentResult && (
            <div className="bg-slate-800 border border-orange-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-orange-400 mb-2">Assessment: {assessmentResult.vendor || vendorInput}</h3>
              {assessmentResult.riskScore && <div className="text-3xl font-bold mb-2">{assessmentResult.riskScore}/100</div>}
              <div className="text-sm text-slate-300 whitespace-pre-wrap">{assessmentResult.assessment || JSON.stringify(assessmentResult, null, 2)}</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Continuous Vendor Monitoring</h3>
            <div className="space-y-2">
              {[{ vendor: 'AWS', signal: 'SOC 2 Type II renewed', risk: 'Low', time: '2d ago' }, { vendor: 'Stripe', signal: 'PCI DSS v4.0 compliant', risk: 'Low', time: '5d ago' }, { vendor: 'Datadog', signal: 'New sub-processor added', risk: 'Medium', time: '1w ago' }, { vendor: 'SendGrid', signal: 'Security incident disclosed', risk: 'High', time: '2w ago' }].map(m => (
                <div key={m.vendor + m.signal} className="bg-slate-900 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{m.vendor}</div>
                    <div className="text-xs text-slate-400">{m.signal}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs ${m.risk === 'High' ? 'text-red-400' : m.risk === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>{m.risk} risk</span>
                    <div className="text-xs text-slate-500">{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'questionnaires' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="font-semibold mb-3">Security Questionnaires</h3>
          <div className="space-y-3">
            {questionnaires.map(q => (
              <div key={q.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{q.name}</div>
                  <div className="text-xs text-slate-500">{q.questions} questions</div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center"><div className="font-bold">{q.sent}</div><div className="text-xs text-slate-400">Sent</div></div>
                  <div className="text-center"><div className="font-bold text-green-400">{q.completed}</div><div className="text-xs text-slate-400">Done</div></div>
                  <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(q.completed / q.sent) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorRiskManagement;
