import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const SecureCodeReview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'checklist' | 'metrics' | 'policies'>('reviews');

  const tabs = [
    { key: 'reviews' as const, label: 'Active Reviews' },
    { key: 'checklist' as const, label: 'Security Checklist' },
    { key: 'metrics' as const, label: 'Metrics' },
    { key: 'policies' as const, label: 'Policies' },
  ];

  const reviews = [
    { id: 'pr-142', title: 'feat: implement OAuth2 PKCE flow', author: 'dev-1@anchor.ai', repo: 'anchor-api', securityFindings: 3, severity: 'High', autoFixApplied: 1, status: 'Security Review Required', approvals: 1, required: 2, reviewers: ['security-bot', 'sec-lead@anchor.ai'], submitted: '2h ago' },
    { id: 'pr-139', title: 'fix: sanitize user input in search', author: 'dev-3@anchor.ai', repo: 'anchor-web', securityFindings: 0, severity: 'None', autoFixApplied: 0, status: 'Approved', approvals: 2, required: 2, reviewers: ['security-bot', 'dev-lead@anchor.ai'], submitted: '4h ago' },
    { id: 'pr-138', title: 'chore: upgrade dependencies', author: 'dependabot', repo: 'anchor-api', securityFindings: 2, severity: 'Medium', autoFixApplied: 2, status: 'Auto-Approved (all fixes applied)', approvals: 2, required: 2, reviewers: ['security-bot', 'auto-merge'], submitted: '6h ago' },
    { id: 'pr-135', title: 'feat: admin bulk export API', author: 'dev-5@anchor.ai', repo: 'anchor-api', securityFindings: 5, severity: 'Critical', autoFixApplied: 2, status: 'Changes Requested', approvals: 0, required: 2, reviewers: ['security-bot', 'sec-lead@anchor.ai', 'cto@anchor.ai'], submitted: '1d ago' },
    { id: 'pr-131', title: 'feat: webhook retry with exponential backoff', author: 'dev-2@anchor.ai', repo: 'anchor-workers', securityFindings: 1, severity: 'Low', autoFixApplied: 1, status: 'Approved', approvals: 2, required: 2, reviewers: ['security-bot', 'dev-lead@anchor.ai'], submitted: '2d ago' },
  ];

  const securityChecklist = [
    { category: 'Input Validation', items: ['SQL injection (parameterized queries)', 'XSS (output encoding)', 'Path traversal (sanitize paths)', 'Command injection (avoid exec)', 'SSRF (validate URLs)'], critical: true },
    { category: 'Authentication & Authorization', items: ['Auth check on every endpoint', 'Role-based access control', 'JWT validation (signature + expiry)', 'Rate limiting on auth endpoints', 'Password hashing (bcrypt/argon2)'], critical: true },
    { category: 'Data Protection', items: ['PII encrypted at rest', 'Secrets not in code/logs', 'Sensitive data masked in responses', 'Data retention policy applied'], critical: true },
    { category: 'Error Handling', items: ['No stack traces in production', 'Generic error messages to users', 'Structured logging (no PII)', 'Graceful degradation'], critical: false },
    { category: 'Dependency Security', items: ['No known CVEs in deps', 'Lock file up to date', 'No deprecated packages', 'License compliance'], critical: false },
    { category: 'API Security', items: ['Rate limiting enforced', 'Request size limits', 'CORS configured correctly', 'API versioning', 'Input schema validation'], critical: true },
  ];

  const metrics = {
    reviewsThisMonth: 142,
    avgReviewTime: '3.2 hours',
    securityFindingsPerPR: 1.4,
    autoFixRate: '68%',
    criticalBlockedMerges: 8,
    securityApprovalRate: '94%',
    topFindings: [
      { type: 'Missing input validation', count: 34, pct: 28 },
      { type: 'Hardcoded secrets', count: 18, pct: 15 },
      { type: 'Missing auth checks', count: 15, pct: 12 },
      { type: 'SQL injection risk', count: 12, pct: 10 },
      { type: 'Insecure dependencies', count: 42, pct: 35 },
    ],
  };

  const policies = [
    { name: 'Security bot review on every PR', scope: 'All repositories', status: 'Enforced' },
    { name: 'Critical findings block merge', scope: 'All repositories', status: 'Enforced' },
    { name: '2 approvals required (1 must be security)', scope: 'Production branches', status: 'Enforced' },
    { name: 'Auto-fix applied before human review', scope: 'All repositories', status: 'Enforced' },
    { name: 'Dependency scan on every PR', scope: 'All repositories', status: 'Enforced' },
    { name: 'No self-approval for security-sensitive code', scope: 'Auth, payments, admin', status: 'Enforced' },
    { name: 'CTO approval for admin/export APIs', scope: 'admin/* routes', status: 'Enforced' },
  ];

  const stats = [
    { label: 'Active Reviews', value: reviews.filter(r => !r.status.includes('Approved')).length },
    { label: 'Findings This Month', value: '198' },
    { label: 'Auto-Fix Rate', value: metrics.autoFixRate },
    { label: 'Avg Review Time', value: metrics.avgReviewTime },
  ];

  const { loading, analyzing, analysisResult, runAnalysis } = useSecurityModule('secure-code-review', {
    activeReviews, findings, securityChecklist, metrics, stats,
  });

  const sevColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; case 'Low': return 'text-slate-400'; default: return 'text-green-400'; } };

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">Secure Code Review</h1>
          <p className="text-slate-400">AI-powered peer review workflow with security checklists, auto-fix, and approval gates.</p>
        </div>
        <button onClick={runAnalysis} disabled={analyzing} className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-sky-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'reviews' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Pull Request Security Reviews</h2>
          {reviews.map(r => (
            <div key={r.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-center justify-between"><span className="font-semibold">#{r.id}: {r.title}</span><span className={`text-xs font-medium ${sevColor(r.severity)}`}>{r.severity === 'None' ? 'Clean' : `${r.securityFindings} findings (${r.severity})`}</span></div>
              <div className="text-xs text-slate-400">{r.author} · {r.repo} · {r.submitted}</div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={r.status.includes('Approved') || r.status.includes('Auto-Approved') ? 'text-green-400' : r.status.includes('Changes') ? 'text-red-400' : 'text-yellow-400'}>{r.status}</span>
                  {r.autoFixApplied > 0 && <span className="bg-blue-900 text-blue-300 px-2 py-0.5 rounded">{r.autoFixApplied} auto-fixed</span>}
                </div>
                <span className="text-slate-500">{r.approvals}/{r.required} approvals</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold">Security Review Checklist</h2>
          {securityChecklist.map(c => (
            <div key={c.category} className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2"><span className="font-semibold">{c.category}</span>{c.critical && <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded">Critical</span>}</div>
              <div className="grid gap-1">{c.items.map(item => (<div key={item} className="text-xs text-slate-300 flex items-center gap-2"><span className="text-green-400">✓</span>{item}</div>))}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[{ l: 'Reviews (30d)', v: metrics.reviewsThisMonth }, { l: 'Findings/PR', v: metrics.securityFindingsPerPR }, { l: 'Blocked Merges', v: metrics.criticalBlockedMerges }].map(s => (
              <div key={s.l} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.l}</div><div className="text-2xl font-semibold mt-1">{s.v}</div></div>
            ))}
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Top Security Findings</h2>
            {metrics.topFindings.map(f => (
              <div key={f.type} className="flex items-center justify-between text-sm"><span className="text-slate-300">{f.type}</span><div className="flex items-center gap-2"><div className="w-28 bg-slate-700 rounded-full h-2"><div className="bg-sky-400 h-2 rounded-full" style={{ width: `${f.pct}%` }} /></div><span className="text-slate-400 text-xs w-8 text-right">{f.count}</span></div></div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Code Review Policies</h2>
          {policies.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div><span className="text-slate-200">{p.name}</span><span className="ml-2 text-xs text-slate-500">[{p.scope}]</span></div>
              <span className="text-xs text-green-400">{p.status}</span>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-sky-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-sky-400">🤖 AI Analysis</h2><button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default SecureCodeReview;
