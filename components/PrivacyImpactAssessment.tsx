import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const PrivacyImpactAssessment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assessments' | 'templates' | 'dpia' | 'records' | 'automation'>('assessments');

  const tabs = [
    { key: 'assessments' as const, label: 'Active PIAs' },
    { key: 'templates' as const, label: 'Templates' },
    { key: 'dpia' as const, label: 'DPIA (GDPR)' },
    { key: 'records' as const, label: 'Data Mapping' },
    { key: 'automation' as const, label: 'AI Automation' },
  ];

  const assessments = [
    { id: 'pia-1', name: 'Customer Analytics Dashboard v3', status: 'In Progress', framework: 'GDPR Art. 35 DPIA', riskLevel: 'High', owner: 'privacy@anchor.ai', dueDate: '2026-02-20', progress: 65 },
    { id: 'pia-2', name: 'AI-Powered Threat Detection Model', status: 'In Progress', framework: 'EU AI Act + GDPR', riskLevel: 'High', owner: 'ai-ethics@anchor.ai', dueDate: '2026-02-28', progress: 40 },
    { id: 'pia-3', name: 'Employee Monitoring System', status: 'Review', framework: 'GDPR Art. 35 DPIA', riskLevel: 'Critical', owner: 'hr-legal@anchor.ai', dueDate: '2026-02-15', progress: 90 },
    { id: 'pia-4', name: 'New Payment Processing Flow', status: 'Completed', framework: 'PCI DSS + GDPR', riskLevel: 'Medium', owner: 'payments@anchor.ai', dueDate: '2026-02-05', progress: 100 },
    { id: 'pia-5', name: 'Marketing Email Personalization', status: 'Not Started', framework: 'GDPR + CAN-SPAM + CCPA', riskLevel: 'Medium', owner: 'marketing@anchor.ai', dueDate: '2026-03-10', progress: 0 },
  ];

  const templates = [
    { name: 'GDPR Article 35 DPIA', regulation: 'GDPR', sections: 12, lastUpdated: '2026-02-01', usage: 34 },
    { name: 'EU AI Act Impact Assessment', regulation: 'EU AI Act', sections: 15, lastUpdated: '2026-01-28', usage: 8 },
    { name: 'CCPA Privacy Risk Assessment', regulation: 'CCPA/CPRA', sections: 9, lastUpdated: '2026-01-15', usage: 12 },
    { name: 'HIPAA Privacy Impact Analysis', regulation: 'HIPAA', sections: 11, lastUpdated: '2026-01-20', usage: 5 },
    { name: 'Children\'s Data (COPPA) Assessment', regulation: 'COPPA', sections: 8, lastUpdated: '2026-01-10', usage: 2 },
    { name: 'Cross-Border Data Transfer (Adequacy)', regulation: 'GDPR Ch. V', sections: 7, lastUpdated: '2026-02-05', usage: 18 },
    { name: 'Biometric Data Processing Assessment', regulation: 'GDPR + BIPA', sections: 10, lastUpdated: '2026-01-25', usage: 3 },
  ];

  const dpiaSteps = [
    { step: 1, name: 'Description of Processing', description: 'Document nature, scope, context, purposes of processing', status: 'Complete' },
    { step: 2, name: 'Necessity & Proportionality', description: 'Assess lawful basis and data minimization', status: 'Complete' },
    { step: 3, name: 'Risk Identification', description: 'Identify risks to rights and freedoms of data subjects', status: 'Complete' },
    { step: 4, name: 'Risk Assessment', description: 'Evaluate likelihood and severity of each risk', status: 'In Progress' },
    { step: 5, name: 'Mitigation Measures', description: 'Define safeguards, security measures, and mechanisms', status: 'Not Started' },
    { step: 6, name: 'DPO Consultation', description: 'Seek advice from Data Protection Officer', status: 'Not Started' },
    { step: 7, name: 'Supervisory Authority', description: 'Consult authority if residual risk remains high', status: 'Not Started' },
    { step: 8, name: 'Sign-Off & Review Date', description: 'Approve assessment and schedule periodic review', status: 'Not Started' },
  ];

  const dataMapping = [
    { category: 'Customer PII', dataTypes: 'Name, Email, Phone, Address', lawfulBasis: 'Contract (Art. 6(1)(b))', retention: '3 years post-contract', crossBorder: 'EU → US (SCCs)', systems: 'CRM, Analytics, Billing', subjects: '142,000' },
    { category: 'Employee Data', dataTypes: 'Name, SSN, Salary, Performance', lawfulBasis: 'Legitimate Interest (Art. 6(1)(f))', retention: '7 years', crossBorder: 'None', systems: 'HRM, Payroll', subjects: '412' },
    { category: 'Website Cookies', dataTypes: 'IP, Browser, Behavior', lawfulBasis: 'Consent (Art. 6(1)(a))', retention: '12 months', crossBorder: 'EU → US (SCCs)', systems: 'Analytics, Marketing', subjects: '2.4M visitors/mo' },
    { category: 'Security Telemetry', dataTypes: 'IP, User Agent, Scan Results', lawfulBasis: 'Legitimate Interest', retention: '1 year', crossBorder: 'Multi-region', systems: 'SIEM, EDR, SOC', subjects: '50,000 orgs' },
    { category: 'AI Training Data', dataTypes: 'Code snippets, Anonymized findings', lawfulBasis: 'Legitimate Interest', retention: '5 years', crossBorder: 'None (on-prem)', systems: 'ML Pipeline', subjects: 'N/A (anonymized)' },
  ];

  const stats = [
    { label: 'Active PIAs', value: assessments.filter(a => a.status !== 'Completed').length },
    { label: 'Overdue', value: '1' },
    { label: 'Data Categories', value: dataMapping.length },
    { label: 'Templates', value: templates.length },
  ];

  const { loading, analyzing, analysisResult, runAnalysis, clearAnalysis } = useSecurityModule('privacy-impact', {
    assessments, dataMapping, dpiaSteps, templates, stats,
  });

  const statusColor = (s: string) => { switch (s) { case 'Complete': case 'Completed': return 'text-green-400'; case 'In Progress': case 'Review': return 'text-yellow-400'; default: return 'text-slate-400'; } };
  const riskColor = (r: string) => { switch (r) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Privacy Impact Assessment</h1>
          <p className="text-slate-400">GDPR DPIA, EU AI Act assessments, data mapping, and automated privacy compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => runAnalysis()} disabled={analyzing} className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-pink-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'assessments' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Privacy Impact Assessments</h2>
          {assessments.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-center justify-between"><span className="font-semibold">{a.name}</span><span className={`text-xs font-medium ${riskColor(a.riskLevel)}`}>{a.riskLevel} Risk</span></div>
              <div className="text-xs text-slate-400">{a.framework} · Owner: {a.owner} · Due: {a.dueDate}</div>
              <div className="flex items-center gap-2"><div className="flex-1 bg-slate-700 rounded-full h-2"><div className={`h-2 rounded-full ${a.progress === 100 ? 'bg-green-400' : 'bg-pink-400'}`} style={{ width: `${a.progress}%` }} /></div><span className="text-xs text-slate-400 w-8">{a.progress}%</span><span className={`text-xs ${statusColor(a.status)}`}>{a.status}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Assessment Templates</h2>
          {templates.map(t => (
            <div key={t.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div><span className="text-slate-200">{t.name}</span><span className="ml-2 text-xs text-slate-500">[{t.regulation}]</span></div>
              <div className="flex items-center gap-3 text-xs text-slate-400"><span>{t.sections} sections</span><span>Used {t.usage}×</span><span>{t.lastUpdated}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'dpia' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">GDPR Article 35 — DPIA Steps</h2>
          {dpiaSteps.map(s => (
            <div key={s.step} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="bg-slate-800 text-pink-400 font-bold w-8 h-8 rounded-full flex items-center justify-center text-xs">{s.step}</span><div><div className="font-semibold">{s.name}</div><div className="text-xs text-slate-400">{s.description}</div></div></div>
              <span className={`text-xs font-medium ${statusColor(s.status)}`}>{s.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'records' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Data Processing Inventory (Art. 30)</h2>
          {dataMapping.map(d => (
            <div key={d.category} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm space-y-2">
              <div className="font-semibold text-pink-300">{d.category} <span className="text-xs text-slate-400">({d.subjects} subjects)</span></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div><span className="text-slate-500">Data:</span> <span className="text-slate-300">{d.dataTypes}</span></div>
                <div><span className="text-slate-500">Basis:</span> <span className="text-slate-300">{d.lawfulBasis}</span></div>
                <div><span className="text-slate-500">Retention:</span> <span className="text-slate-300">{d.retention}</span></div>
                <div><span className="text-slate-500">Transfer:</span> <span className="text-slate-300">{d.crossBorder}</span></div>
                <div><span className="text-slate-500">Systems:</span> <span className="text-slate-300">{d.systems}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'automation' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold">AI-Powered Privacy Automation</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[{ title: 'Auto Data Discovery', desc: 'AI scans code & databases to automatically find PII and classify data categories', status: 'Active' },
              { title: 'DPIA Auto-Generation', desc: 'Generate DPIA drafts from data processing descriptions using AI', status: 'Active' },
              { title: 'Regulation Change Alerts', desc: 'Monitor GDPR, AI Act, CCPA amendments and flag affected PIAs', status: 'Active' },
              { title: 'Consent Flow Analyzer', desc: 'Verify consent collection meets regulatory requirements', status: 'Active' },
            ].map(f => (
              <div key={f.title} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between"><span className="font-semibold">{f.title}</span><span className="text-xs text-green-400">{f.status}</span></div>
                <div className="text-xs text-slate-400 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-pink-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-pink-400">🤖 AI Analysis</h2><button onClick={() => clearAnalysis()} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default PrivacyImpactAssessment;
