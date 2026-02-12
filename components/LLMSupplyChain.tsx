import React, { useState } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

const LLMSupplyChain: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'training-data' | 'poisoning' | 'provenance' | 'policies'>('models');

  const tabs = [
    { key: 'models' as const, label: 'Model Inventory' },
    { key: 'training-data' as const, label: 'Training Data Audit' },
    { key: 'poisoning' as const, label: 'Poisoning Detection' },
    { key: 'provenance' as const, label: 'Model Provenance' },
    { key: 'policies' as const, label: 'Policies' },
  ];

  const models = [
    { id: 'm-1', name: 'anchor-threat-v3', type: 'Threat Detection', provider: 'In-house', framework: 'PyTorch 2.4', params: '7B', trainingData: 'Anchor proprietary + MITRE', lastTrained: '2026-02-01', integrityHash: 'sha256:8f4a...c2d1', poisoningScore: 'Low', status: 'Production' },
    { id: 'm-2', name: 'anchor-code-scanner-v2', type: 'Code Analysis', provider: 'In-house', framework: 'PyTorch 2.4', params: '3B', trainingData: 'Curated vuln DB + synthetic', lastTrained: '2026-01-20', integrityHash: 'sha256:2b9e...f8a3', poisoningScore: 'Low', status: 'Production' },
    { id: 'm-3', name: 'gpt-4o (external)', type: 'General AI', provider: 'OpenAI', framework: 'External API', params: 'Unknown', trainingData: 'OpenAI proprietary', lastTrained: 'Unknown', integrityHash: 'N/A (API)', poisoningScore: 'Unverifiable', status: 'Production' },
    { id: 'm-4', name: 'claude-3.5 (external)', type: 'General AI', provider: 'Anthropic', framework: 'External API', params: 'Unknown', trainingData: 'Anthropic proprietary', lastTrained: 'Unknown', integrityHash: 'N/A (API)', poisoningScore: 'Unverifiable', status: 'Production' },
    { id: 'm-5', name: 'anchor-dga-classifier', type: 'DNS Security', provider: 'In-house', framework: 'scikit-learn', params: '2M', trainingData: 'DGA corpus (12M domains)', lastTrained: '2026-02-05', integrityHash: 'sha256:6c1d...a4b7', poisoningScore: 'Low', status: 'Production' },
    { id: 'm-6', name: 'huggingface/code-bert (fine-tuned)', type: 'Code Understanding', provider: 'HuggingFace + fine-tune', framework: 'Transformers 4.38', params: '125M', trainingData: 'CodeSearchNet + internal', lastTrained: '2026-01-15', integrityHash: 'sha256:3d7f...b912', poisoningScore: 'Medium', status: 'Staging' },
  ];

  const trainingDataAudit = [
    { dataset: 'Anchor Vuln DB', size: '2.4M records', sources: 'NVD, OSV, GitHub Advisories', piiDetected: 'None', qualityScore: '98%', poisoningRisk: 'Low', lastAudit: '2026-02-08' },
    { dataset: 'MITRE ATT&CK Corpus', size: '142K techniques', sources: 'MITRE official + enrichments', piiDetected: 'None', qualityScore: '99%', poisoningRisk: 'Low', lastAudit: '2026-02-01' },
    { dataset: 'DGA Domain Corpus', size: '12M domains', sources: 'Threat feeds + generated', piiDetected: 'None', qualityScore: '97%', poisoningRisk: 'Low', lastAudit: '2026-02-05' },
    { dataset: 'CodeSearchNet (external)', size: '6M code samples', sources: 'GitHub public repos', piiDetected: '34 instances flagged', qualityScore: '91%', poisoningRisk: 'Medium', lastAudit: '2026-01-15' },
    { dataset: 'Synthetic Vulnerability Data', size: '800K samples', sources: 'AI-generated augmentation', piiDetected: 'None', qualityScore: '94%', poisoningRisk: 'Low', lastAudit: '2026-01-28' },
  ];

  const poisoningDetections = [
    { id: 'p-1', timestamp: '2026-02-11 14:22:08', model: 'huggingface/code-bert', type: 'Training Data Poisoning', detail: 'Detected 12 code samples with subtle backdoor patterns in fine-tuning data — samples instruct model to ignore specific vuln patterns', severity: 'Critical', action: 'Samples removed, model retrained' },
    { id: 'p-2', timestamp: '2026-02-09 08:33:11', model: 'anchor-threat-v3', type: 'Label Flipping', detail: '23 mislabeled threat intelligence records detected — benign traffic labeled as malicious (potential model confusion)', severity: 'High', action: 'Labels corrected, model fine-tuned' },
    { id: 'p-3', timestamp: '2026-02-05 16:55:44', model: 'gpt-4o (external)', type: 'Output Manipulation', detail: 'API responses showed inconsistent classification for known CVEs compared to baseline — possible model update drift', severity: 'Medium', action: 'Monitoring + fallback model activated' },
    { id: 'p-4', timestamp: '2026-01-28 11:14:22', model: 'anchor-dga-classifier', type: 'Adversarial Training Sample', detail: 'Found 8 DGA domains engineered to bypass classifier while maintaining C2 functionality', severity: 'High', action: 'Adversarial samples added to training set' },
  ];

  const provenanceRecords = [
    { model: 'anchor-threat-v3', signingKey: 'RSA-4096 (Anchor ML CA)', sbom: 'Generated (42 deps)', reproducible: true, attestation: 'SLSA Level 3', tamperCheck: 'Passed' },
    { model: 'anchor-code-scanner-v2', signingKey: 'RSA-4096 (Anchor ML CA)', sbom: 'Generated (38 deps)', reproducible: true, attestation: 'SLSA Level 3', tamperCheck: 'Passed' },
    { model: 'anchor-dga-classifier', signingKey: 'RSA-4096 (Anchor ML CA)', sbom: 'Generated (12 deps)', reproducible: true, attestation: 'SLSA Level 3', tamperCheck: 'Passed' },
    { model: 'huggingface/code-bert', signingKey: 'HuggingFace Hub', sbom: 'Partial', reproducible: false, attestation: 'SLSA Level 1', tamperCheck: 'Passed (hash verified)' },
    { model: 'gpt-4o / claude-3.5 (external)', signingKey: 'N/A (API)', sbom: 'N/A', reproducible: false, attestation: 'None (unverifiable)', tamperCheck: 'N/A' },
  ];

  const llmPolicies = [
    { name: 'All models signed with Anchor ML CA', scope: 'In-house models', status: 'Enforced' },
    { name: 'Training data audited before each training run', scope: 'All datasets', status: 'Enforced' },
    { name: 'Model integrity hash verified at deployment', scope: 'All models', status: 'Enforced' },
    { name: 'External model outputs validated against baseline', scope: 'API-based models', status: 'Enforced' },
    { name: 'Adversarial robustness testing before production', scope: 'All models', status: 'Enforced' },
    { name: 'PII scan on all training data', scope: 'All datasets', status: 'Enforced' },
    { name: 'SLSA Level 3 attestation for in-house models', scope: 'In-house models', status: 'Enforced' },
    { name: 'Fallback model activated on drift detection', scope: 'Production models', status: 'Enforced' },
  ];

  const stats = [
    { label: 'Models in Production', value: models.filter(m => m.status === 'Production').length },
    { label: 'Training Datasets', value: trainingDataAudit.length },
    { label: 'Poisoning Detections (30d)', value: poisoningDetections.length },
    { label: 'SLSA L3 Attested', value: provenanceRecords.filter(p => p.attestation.includes('Level 3')).length },
  ];

  const { loading, analyzing, analysisResult, runAnalysis } = useSecurityModule('llm-supply-chain', {
    models, trainingDataAudit, poisoningDetections, provenanceRecords, policies, stats,
  });

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };
  const riskColor = (r: string) => r === 'Low' ? 'text-green-400' : r === 'Medium' ? 'text-yellow-400' : r === 'High' ? 'text-orange-400' : 'text-slate-400';

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">LLM Supply Chain Security</h1><span className="bg-orange-900 text-orange-300 text-xs font-bold px-2 py-1 rounded-full">WORLD FIRST</span></div>
          <p className="text-slate-400">Model provenance, training data poisoning detection, weight integrity verification, and SLSA attestation.</p>
        </div>
        <button onClick={runAnalysis} disabled={analyzing} className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Analyzing…' : '🤖 AI Analysis'}</button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (<div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4"><div className="text-slate-400 text-sm">{s.label}</div><div className="text-2xl font-semibold mt-1">{s.value}</div></div>))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-1">
        {tabs.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-slate-800 text-orange-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>{t.label}</button>))}
      </div>

      {activeTab === 'models' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Model Inventory</h2>
          {models.map(m => (
            <div key={m.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-center justify-between"><span className="font-semibold">{m.name}</span><span className={`text-xs font-medium ${riskColor(m.poisoningScore === 'Unverifiable' ? 'Medium' : m.poisoningScore)}`}>Poison Risk: {m.poisoningScore}</span></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
                <span>Type: <span className="text-white">{m.type}</span></span><span>Provider: <span className="text-white">{m.provider}</span></span>
                <span>Params: <span className="text-white">{m.params}</span></span><span>Status: <span className={m.status === 'Production' ? 'text-green-400' : 'text-yellow-400'}>{m.status}</span></span>
              </div>
              <div className="text-xs text-slate-500">Hash: {m.integrityHash} · Trained: {m.lastTrained}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'training-data' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Training Data Audit</h2>
          {trainingDataAudit.map(d => (
            <div key={d.dataset} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{d.dataset} <span className="text-xs text-slate-500">[{d.size}]</span></div><div className="text-xs text-slate-400">Sources: {d.sources} · PII: {d.piiDetected}</div></div>
              <div className="flex items-center gap-3 text-xs"><span className="text-slate-400">Quality: {d.qualityScore}</span><span className={riskColor(d.poisoningRisk)}>{d.poisoningRisk} risk</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'poisoning' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Poisoning Detections</h2>
          {poisoningDetections.map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1">
              <div className="flex items-center justify-between"><span className="font-semibold">{p.model} — {p.type}</span><span className={`text-xs font-medium ${severityColor(p.severity)}`}>{p.severity}</span></div>
              <div className="text-slate-300 text-xs">{p.detail}</div>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{p.timestamp}</span><span className="text-green-400">{p.action}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'provenance' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Model Provenance & Attestation</h2>
          {provenanceRecords.map(p => (
            <div key={p.model} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div className="space-y-1"><div className="font-semibold">{p.model}</div><div className="text-xs text-slate-400">Signing: {p.signingKey} · SBOM: {p.sbom}</div></div>
              <div className="flex items-center gap-2 text-xs">
                {p.reproducible && <span className="bg-green-900 text-green-300 px-2 py-0.5 rounded">Reproducible</span>}
                <span className={p.attestation.includes('Level 3') ? 'text-green-400' : p.attestation.includes('Level 1') ? 'text-yellow-400' : 'text-red-400'}>{p.attestation}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">LLM Supply Chain Policies</h2>
          {llmPolicies.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div><span className="text-slate-200">{p.name}</span><span className="ml-2 text-xs text-slate-500">[{p.scope}]</span></div>
              <span className="text-xs text-green-400">{p.status}</span>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-orange-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-orange-400">🤖 AI Analysis</h2><button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default LLMSupplyChain;
