import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// PHISHING SIMULATOR - SECURITY AWARENESS TRAINING
// ============================================================================
// #1 attack vector is phishing. Train employees with realistic simulations.
// Track who clicks, who reports, measure security culture improvement.
// ============================================================================

interface PhishingCampaign {
  id: string;
  name: string;
  template: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'spear';
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  targetGroup: string;
  targetCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  reportedCount: number;
  credentialsEnteredCount: number;
  scheduledDate?: string;
  completedDate?: string;
}

interface PhishingTemplate {
  id: string;
  name: string;
  category: 'credential_harvest' | 'malware' | 'data_theft' | 'bec' | 'smishing' | 'vishing';
  difficulty: 'easy' | 'medium' | 'hard' | 'spear';
  subject: string;
  preview: string;
  indicators: string[];
}

interface EmployeeRisk {
  id: string;
  name: string;
  email: string;
  department: string;
  riskScore: number;
  campaignsReceived: number;
  timesClicked: number;
  timesReported: number;
  lastTraining?: string;
  status: 'low_risk' | 'medium_risk' | 'high_risk' | 'repeat_offender';
}

export const PhishingSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'users' | 'analytics'>('campaigns');
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignTemplate, setNewCampaignTemplate] = useState('');
  const [newCampaignTarget, setNewCampaignTarget] = useState('All Employees');
  const [localCampaigns, setLocalCampaigns] = useState<PhishingCampaign[]>([]);
  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [trainingStatus, setTrainingStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const _res = await backendApi.modules.getDashboard('phishing-sim');
        } catch (e) { logger.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res: unknown = await backendApi.modules.analyze('phishing-sim', 'Analyze phishing simulation results for click-through trends, repeat offenders, and training effectiveness');
      if ((res as Record<string, unknown>)?.analysis) setAnalysisResult((res as Record<string, unknown>).analysis as string);
    } catch (e) { logger.error(e); } finally { setAnalyzing(false); }
  };

  const campaigns: PhishingCampaign[] = [
    { id: 'pc-1', name: 'Q1 2026 Baseline Test', template: 'Password Reset', difficulty: 'easy', status: 'completed', targetGroup: 'All Employees', targetCount: 150, sentCount: 150, openedCount: 120, clickedCount: 23, reportedCount: 45, credentialsEnteredCount: 8, completedDate: '2026-01-31' },
    { id: 'pc-2', name: 'Executive Spear Phishing', template: 'CEO Wire Transfer', difficulty: 'spear', status: 'completed', targetGroup: 'Finance Team', targetCount: 12, sentCount: 12, openedCount: 10, clickedCount: 2, reportedCount: 6, credentialsEnteredCount: 1, completedDate: '2026-02-01' },
    { id: 'pc-3', name: 'IT Support Impersonation', template: 'Helpdesk Ticket', difficulty: 'medium', status: 'running', targetGroup: 'Engineering', targetCount: 45, sentCount: 45, openedCount: 32, clickedCount: 5, reportedCount: 12, credentialsEnteredCount: 2 },
    { id: 'pc-4', name: 'Tax Season Scam', template: 'ATO Refund', difficulty: 'hard', status: 'scheduled', targetGroup: 'All Employees', targetCount: 150, sentCount: 0, openedCount: 0, clickedCount: 0, reportedCount: 0, credentialsEnteredCount: 0, scheduledDate: '2026-02-15' }
  ];

  const templates: PhishingTemplate[] = [
    { id: 't-1', name: 'Microsoft 365 Password Reset', category: 'credential_harvest', difficulty: 'easy', subject: 'Your password expires in 24 hours', preview: 'Click here to reset your password...', indicators: ['Generic greeting', 'Urgency', 'Suspicious link'] },
    { id: 't-2', name: 'CEO Wire Transfer Request', category: 'bec', difficulty: 'spear', subject: 'Urgent: Wire transfer needed', preview: 'I need you to process this payment...', indicators: ['Unusual request', 'Urgency', 'From CEO'] },
    { id: 't-3', name: 'IT Helpdesk Ticket', category: 'credential_harvest', difficulty: 'medium', subject: 'Ticket #45231 - Action Required', preview: 'Your recent support ticket requires...', indicators: ['Internal impersonation', 'Link to portal'] },
    { id: 't-4', name: 'ATO Tax Refund', category: 'credential_harvest', difficulty: 'hard', subject: 'Your tax refund is ready', preview: 'Australian Taxation Office: You have...', indicators: ['Government impersonation', 'Financial lure'] },
    { id: 't-5', name: 'DocuSign Document', category: 'malware', difficulty: 'medium', subject: 'Please review and sign', preview: 'A document is waiting for your signature...', indicators: ['Attachment', 'Brand impersonation'] },
    { id: 't-6', name: 'LinkedIn Connection', category: 'data_theft', difficulty: 'easy', subject: 'You have a new connection request', preview: 'John Smith wants to connect...', indicators: ['Social media lure', 'External link'] },
    { id: 't-7', name: 'Delivery Notification', category: 'malware', difficulty: 'easy', subject: 'Your package is waiting', preview: 'Australia Post: Your delivery...', indicators: ['Brand impersonation', 'Tracking link'] },
    { id: 't-8', name: 'Voicemail Notification', category: 'credential_harvest', difficulty: 'medium', subject: 'New voicemail from +61...', preview: 'You have 1 new voicemail message...', indicators: ['Urgency', 'Audio file attachment'] }
  ];

  const employees: EmployeeRisk[] = [
    { id: 'e-1', name: 'John Smith', email: 'john@company.com', department: 'Sales', riskScore: 85, campaignsReceived: 5, timesClicked: 3, timesReported: 1, lastTraining: '2026-01-15', status: 'high_risk' },
    { id: 'e-2', name: 'Sarah Johnson', email: 'sarah@company.com', department: 'Engineering', riskScore: 15, campaignsReceived: 5, timesClicked: 0, timesReported: 5, lastTraining: '2026-01-20', status: 'low_risk' },
    { id: 'e-3', name: 'Mike Brown', email: 'mike@company.com', department: 'Finance', riskScore: 45, campaignsReceived: 5, timesClicked: 1, timesReported: 2, lastTraining: '2026-01-10', status: 'medium_risk' },
    { id: 'e-4', name: 'Lisa Chen', email: 'lisa@company.com', department: 'HR', riskScore: 92, campaignsReceived: 5, timesClicked: 4, timesReported: 0, status: 'repeat_offender' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-orange-500/20 text-orange-400';
      case 'spear': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'running': return 'bg-cyan-500/20 text-cyan-400 animate-pulse';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRiskColor = (status: string) => {
    switch (status) {
      case 'low_risk': return 'text-green-400';
      case 'medium_risk': return 'text-yellow-400';
      case 'high_risk': return 'text-orange-400';
      case 'repeat_offender': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + c.clickedCount, 0);
  const totalReported = campaigns.reduce((sum, c) => sum + c.reportedCount, 0);
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';
  const reportRate = totalSent > 0 ? ((totalReported / totalSent) * 100).toFixed(1) : '0';

  const allCampaigns = [...campaigns, ...localCampaigns];

  const handleCreateCampaign = () => {
    if (!newCampaignName.trim()) return;
    const newCampaign: PhishingCampaign = {
      id: `pc-${Date.now()}`,
      name: newCampaignName.trim(),
      template: newCampaignTemplate || 'Custom',
      difficulty: 'medium',
      status: 'scheduled',
      targetGroup: newCampaignTarget,
      targetCount: 0,
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
      reportedCount: 0,
      credentialsEnteredCount: 0,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    };
    setLocalCampaigns(prev => [...prev, newCampaign]);
    setNewCampaignName('');
    setNewCampaignTemplate('');
    setNewCampaignTarget('All Employees');
    setShowNewCampaign(false);
  };

  return (
    <div className="bg-slate-900 text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🎣 Phishing Simulator</h1>
          <p className="text-gray-400">Train employees with realistic phishing simulations</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleAIAnalysis} disabled={analyzing || backendLoading} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500 rounded-lg text-purple-400 font-medium disabled:opacity-50 transition-colors">
            {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
          </button>
          <button
            onClick={() => setShowNewCampaign(true)}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold"
          >
            + New Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{campaigns.length}</div>
          <div className="text-sm text-gray-400">Campaigns</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{totalSent}</div>
          <div className="text-sm text-gray-400">Emails Sent</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{clickRate}%</div>
          <div className="text-sm text-gray-400">Click Rate</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{reportRate}%</div>
          <div className="text-sm text-gray-400">Report Rate</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-400">{employees.filter(e => e.status === 'high_risk' || e.status === 'repeat_offender').length}</div>
          <div className="text-sm text-gray-400">High Risk Users</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{templates.length}</div>
          <div className="text-sm text-gray-400">Templates</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'campaigns', label: '📧 Campaigns' },
          { id: 'templates', label: '📝 Templates' },
          { id: 'users', label: '👥 User Risk' },
          { id: 'analytics', label: '📊 Analytics' }
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

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {allCampaigns.map(campaign => (
            <div key={campaign.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(campaign.difficulty)}`}>
                      {campaign.difficulty}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Template: {campaign.template} • Target: {campaign.targetGroup}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {campaign.completedDate ? `Completed: ${campaign.completedDate}` : 
                     campaign.scheduledDate ? `Scheduled: ${campaign.scheduledDate}` : 'In Progress'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-6 gap-4 text-center">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-gray-300">{campaign.sentCount}</div>
                  <div className="text-xs text-gray-500">Sent</div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-blue-400">{campaign.openedCount}</div>
                  <div className="text-xs text-gray-500">Opened</div>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <div className="text-xl font-bold text-red-400">{campaign.clickedCount}</div>
                  <div className="text-xs text-gray-500">Clicked</div>
                </div>
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <div className="text-xl font-bold text-red-500">{campaign.credentialsEnteredCount}</div>
                  <div className="text-xs text-gray-500">Credentials</div>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <div className="text-xl font-bold text-green-400">{campaign.reportedCount}</div>
                  <div className="text-xs text-gray-500">Reported</div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-400">
                    {campaign.sentCount > 0 ? ((campaign.clickedCount / campaign.sentCount) * 100).toFixed(0) : 0}%
                  </div>
                  <div className="text-xs text-gray-500">Click Rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(template => (
            <div key={template.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{template.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </span>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg mb-3">
                <div className="text-xs text-gray-500 mb-1">Subject:</div>
                <div className="text-sm">{template.subject}</div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {template.indicators.map((indicator, idx) => (
                  <span key={idx} className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                    ⚠️ {indicator}
                  </span>
                ))}
              </div>
              <button onClick={() => { setShowNewCampaign(true); setNewCampaignTemplate(template.name); }} className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500 rounded-lg text-sm text-cyan-400">
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Campaigns</th>
                <th className="p-4">Clicked</th>
                <th className="p-4">Reported</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.sort((a, b) => b.riskScore - a.riskScore).map(emp => (
                <tr key={emp.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4">
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-gray-500">{emp.email}</div>
                  </td>
                  <td className="p-4">{emp.department}</td>
                  <td className="p-4">
                    <div className={`text-xl font-bold ${getRiskColor(emp.status)}`}>{emp.riskScore}</div>
                  </td>
                  <td className="p-4">{emp.campaignsReceived}</td>
                  <td className="p-4 text-red-400">{emp.timesClicked}</td>
                  <td className="p-4 text-green-400">{emp.timesReported}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      emp.status === 'repeat_offender' ? 'bg-red-500/20 text-red-400' :
                      emp.status === 'high_risk' ? 'bg-orange-500/20 text-orange-400' :
                      emp.status === 'medium_risk' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {emp.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => {
                        setTrainingStatus(prev => ({ ...prev, [emp.email]: '⏳ Assigning...' }));
                        setTimeout(() => {
                          setTrainingStatus(prev => ({ ...prev, [emp.email]: '✓ Assigned' }));
                          setTimeout(() => {
                            setTrainingStatus(prev => { const next = { ...prev }; delete next[emp.email]; return next; });
                          }, 2000);
                        }, 1200);
                      }}
                      disabled={!!trainingStatus[emp.email]}
                      className={`px-3 py-1 rounded text-xs border ${
                        trainingStatus[emp.email] === '✓ Assigned'
                          ? 'bg-green-500/20 border-green-500 text-green-400'
                          : trainingStatus[emp.email]
                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500 text-cyan-400'
                      }`}
                    >
                      {trainingStatus[emp.email] || 'Assign Training'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">📈 Click Rate Trend</h3>
            <div className="h-48 flex items-end justify-around gap-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
                const rate = [25, 18, 15, 12, 8, 5][idx];
                return (
                  <div key={month} className="flex flex-col items-center">
                    <div 
                      className="w-12 bg-linear-to-t from-red-500 to-green-500 rounded-t"
                      style={{ height: `${rate * 4}px` }}
                    />
                    <div className="text-xs text-gray-500 mt-2">{month}</div>
                    <div className="text-xs text-gray-400">{rate}%</div>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm text-green-400 mt-4">📉 Click rate decreased by 80%!</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">🎯 Risk by Department</h3>
            <div className="space-y-3">
              {[
                { dept: 'Sales', risk: 65, color: 'bg-red-500' },
                { dept: 'HR', risk: 55, color: 'bg-orange-500' },
                { dept: 'Finance', risk: 35, color: 'bg-yellow-500' },
                { dept: 'Engineering', risk: 15, color: 'bg-green-500' },
                { dept: 'IT', risk: 8, color: 'bg-green-500' }
              ].map(dept => (
                <div key={dept.dept}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{dept.dept}</span>
                    <span>{dept.risk}% click rate</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${dept.color} rounded-full`} style={{ width: `${dept.risk}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowNewCampaign(false)}>
          <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">New Phishing Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Campaign Name</label>
                <input type="text" value={newCampaignName} onChange={e => setNewCampaignName(e.target.value)} placeholder="e.g. Q2 Security Awareness Test" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Template</label>
                <select title="Phishing template" value={newCampaignTemplate} onChange={e => setNewCampaignTemplate(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none">
                  <option value="">Select a template...</option>
                  {templates.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Target Group</label>
                <select title="Target group" value={newCampaignTarget} onChange={e => setNewCampaignTarget(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none">
                  <option value="All Employees">All Employees</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Finance Team">Finance Team</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                  <option value="Executive Team">Executive Team</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNewCampaign(false)} className="flex-1 px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors">Cancel</button>
                <button onClick={handleCreateCampaign} className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-bold">Create Campaign</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-purple-400">🤖 AI Analysis Result</h3>
            <button onClick={() => setAnalysisResult('')} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{analysisResult}</p>
        </div>
      )}
    </div>
  );
};

export default PhishingSimulator;
