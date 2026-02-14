import React, { useState, useEffect } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WORLD FIRST — LLM Supply Chain Security
// Anchor Intelligence Pillar 3 · Sovereign AI Model Defence
// No other vendor protects the entire LLM lifecycle: training data provenance,
// weight integrity, fine-tuning poisoning detection, model SBOM, and runtime
// inference guarding. This is the immune system for AI itself.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MLModel {
  id: string;
  name: string;
  type: string;
  provider: string;
  framework: string;
  params: string;
  trainingData: string;
  lastTrained: string;
  integrityHash: string;
  poisoningScore: 'Low' | 'Medium' | 'High' | 'Critical' | 'Unverifiable';
  status: 'Production' | 'Staging' | 'Deprecated' | 'Quarantined';
  slsaLevel: string;
  vulnerabilities: number;
  driftScore: number;
  lastAudit: string;
  sbomGenerated: boolean;
  signedBy: string;
}

interface TrainingDataset {
  id: string;
  dataset: string;
  size: string;
  sources: string;
  piiDetected: string;
  qualityScore: string;
  poisoningRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  lastAudit: string;
  licenses: string[];
  dataCards: boolean;
  biasAssessment: string;
  provenance: string;
}

interface PoisoningDetection {
  id: string;
  timestamp: string;
  model: string;
  type: 'Training Data Poisoning' | 'Label Flipping' | 'Output Manipulation' | 'Adversarial Training Sample' | 'Backdoor Injection' | 'Gradient Manipulation' | 'Model Weight Tampering';
  detail: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  action: string;
  confidence: number;
  attackVector: string;
  mitreTtp: string;
  autonomousResponse: string;
}

interface ProvenanceRecord {
  id: string;
  model: string;
  signingKey: string;
  sbom: string;
  reproducible: boolean;
  attestation: string;
  tamperCheck: string;
  buildEnvironment: string;
  dependencies: number;
  vulnerableDeps: number;
  lastVerified: string;
  complianceStatus: string[];
}

interface ModelDriftEvent {
  id: string;
  timestamp: string;
  model: string;
  metric: string;
  baseline: string;
  current: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cause: string;
  action: string;
}

interface LLMPolicy {
  id: string;
  name: string;
  scope: string;
  status: 'Enforced' | 'Monitoring' | 'Draft';
  category: string;
  automatedEnforcement: boolean;
  lastUpdated: string;
  compliance: string[];
}

const LLMSupplyChain: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'training-data' | 'poisoning' | 'provenance' | 'drift' | 'policies' | 'analytics'>('models');
  const [neuralPulse, setNeuralPulse] = useState(true);
  const [scanCount, setScanCount] = useState(0);

  const tabs = [
    { key: 'models' as const, label: 'Model Inventory', icon: '🤖' },
    { key: 'training-data' as const, label: 'Training Data Audit', icon: '📊' },
    { key: 'poisoning' as const, label: 'Poisoning Detection', icon: '☠️' },
    { key: 'provenance' as const, label: 'Model Provenance', icon: '🔗' },
    { key: 'drift' as const, label: 'Model Drift', icon: '📈' },
    { key: 'policies' as const, label: 'Policies', icon: '📋' },
    { key: 'analytics' as const, label: 'Analytics', icon: '🔬' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralPulse(p => !p);
      setScanCount(prev => prev + Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const models: MLModel[] = [
    { id: 'm-1', name: 'anchor-threat-v3', type: 'Threat Detection', provider: 'In-house (Anchor Labs)', framework: 'PyTorch 2.4', params: '7B', trainingData: 'Anchor proprietary + MITRE ATT&CK + 2.4M vulns', lastTrained: '2026-02-08', integrityHash: 'sha256:8f4a2c9b...c2d1e4f7', poisoningScore: 'Low', status: 'Production', slsaLevel: 'SLSA Level 3', vulnerabilities: 0, driftScore: 2.1, lastAudit: '2026-02-14', sbomGenerated: true, signedBy: 'Anchor ML Signing CA (RSA-4096)' },
    { id: 'm-2', name: 'anchor-code-scanner-v2', type: 'SAST / Code Analysis', provider: 'In-house (Anchor Labs)', framework: 'PyTorch 2.4', params: '3B', trainingData: 'Curated vulnerability DB + 800K synthetic samples', lastTrained: '2026-01-20', integrityHash: 'sha256:2b9e1d3f...f8a3b6c2', poisoningScore: 'Low', status: 'Production', slsaLevel: 'SLSA Level 3', vulnerabilities: 0, driftScore: 1.8, lastAudit: '2026-02-12', sbomGenerated: true, signedBy: 'Anchor ML Signing CA (RSA-4096)' },
    { id: 'm-3', name: 'anchor-deepfake-sentinel-v4', type: 'Deepfake Detection', provider: 'In-house (Anchor Labs)', framework: 'PyTorch 2.4 + TensorRT', params: '14B', trainingData: 'Proprietary deepfake corpus + adversarial augmentation', lastTrained: '2026-02-12', integrityHash: 'sha256:4d7e2a1c...b9f3c8d5', poisoningScore: 'Low', status: 'Production', slsaLevel: 'SLSA Level 3', vulnerabilities: 0, driftScore: 0.9, lastAudit: '2026-02-14', sbomGenerated: true, signedBy: 'Anchor ML Signing CA (RSA-4096)' },
    { id: 'm-4', name: 'gpt-4o (external)', type: 'General AI / Reasoning', provider: 'OpenAI', framework: 'External API', params: 'Unknown (~1.8T est)', trainingData: 'OpenAI proprietary (unverifiable)', lastTrained: 'Unknown', integrityHash: 'N/A (API — no weight access)', poisoningScore: 'Unverifiable', status: 'Production', slsaLevel: 'None (external)', vulnerabilities: -1, driftScore: 8.4, lastAudit: '2026-02-14', sbomGenerated: false, signedBy: 'N/A' },
    { id: 'm-5', name: 'claude-3.5-sonnet (external)', type: 'General AI / Analysis', provider: 'Anthropic', framework: 'External API', params: 'Unknown', trainingData: 'Anthropic proprietary (unverifiable)', lastTrained: 'Unknown', integrityHash: 'N/A (API — no weight access)', poisoningScore: 'Unverifiable', status: 'Production', slsaLevel: 'None (external)', vulnerabilities: -1, driftScore: 6.2, lastAudit: '2026-02-14', sbomGenerated: false, signedBy: 'N/A' },
    { id: 'm-6', name: 'anchor-dga-classifier-v3', type: 'DNS / DGA Detection', provider: 'In-house', framework: 'scikit-learn + ONNX', params: '2.4M', trainingData: 'DGA corpus (14M domains) + CT log analysis', lastTrained: '2026-02-05', integrityHash: 'sha256:6c1d8b4e...a4b7f2c1', poisoningScore: 'Low', status: 'Production', slsaLevel: 'SLSA Level 3', vulnerabilities: 0, driftScore: 1.2, lastAudit: '2026-02-10', sbomGenerated: true, signedBy: 'Anchor ML Signing CA (RSA-4096)' },
    { id: 'm-7', name: 'huggingface/code-bert (fine-tuned)', type: 'Code Understanding', provider: 'HuggingFace + Anchor fine-tune', framework: 'Transformers 4.38', params: '125M', trainingData: 'CodeSearchNet + Anchor internal repos', lastTrained: '2026-01-15', integrityHash: 'sha256:3d7f9a2b...b912c4e1', poisoningScore: 'Medium', status: 'Staging', slsaLevel: 'SLSA Level 1', vulnerabilities: 2, driftScore: 4.7, lastAudit: '2026-02-08', sbomGenerated: true, signedBy: 'HuggingFace Hub + Anchor countersign' },
    { id: 'm-8', name: 'anchor-behaviour-engine-v2', type: 'Behavioural Analysis', provider: 'In-house (Anchor Labs)', framework: 'PyTorch 2.4', params: '4.2B', trainingData: 'Enterprise behavioural telemetry (anonymised)', lastTrained: '2026-02-10', integrityHash: 'sha256:9e3a7c1d...d8f2b5e4', poisoningScore: 'Low', status: 'Production', slsaLevel: 'SLSA Level 3', vulnerabilities: 0, driftScore: 1.5, lastAudit: '2026-02-13', sbomGenerated: true, signedBy: 'Anchor ML Signing CA (RSA-4096)' },
  ];

  const trainingDataAudit: TrainingDataset[] = [
    { id: 'td-1', dataset: 'Anchor Vulnerability Database', size: '2.8M records', sources: 'NVD, OSV, GitHub Advisories, Snyk DB, internal discoveries', piiDetected: 'None', qualityScore: '98.2%', poisoningRisk: 'Low', lastAudit: '2026-02-12', licenses: ['CC-BY-4.0', 'MIT', 'Proprietary'], dataCards: true, biasAssessment: 'Passed — balanced across language ecosystems', provenance: 'Full chain from original sources to training set' },
    { id: 'td-2', dataset: 'MITRE ATT&CK Enriched Corpus', size: '186K techniques + procedures', sources: 'MITRE official + Anchor enrichments + CISA advisories', piiDetected: 'None', qualityScore: '99.1%', poisoningRisk: 'Low', lastAudit: '2026-02-08', licenses: ['Apache 2.0', 'US Gov Public'], dataCards: true, biasAssessment: 'Passed — coverage across all 14 tactics', provenance: 'Full provenance with version tracking' },
    { id: 'td-3', dataset: 'DGA Domain Classification Corpus', size: '14.2M domains', sources: 'Active threat feeds + generated samples + CT log mining', piiDetected: 'None', qualityScore: '97.4%', poisoningRisk: 'Low', lastAudit: '2026-02-05', licenses: ['Proprietary', 'CC-BY-SA-4.0'], dataCards: true, biasAssessment: 'Passed — representative across 47 DGA families', provenance: 'Tracked per-sample with source attribution' },
    { id: 'td-4', dataset: 'CodeSearchNet + Anchor Extensions', size: '6.2M code samples', sources: 'GitHub public repos + Anchor internal (redacted)', piiDetected: '34 instances flagged & remediated', qualityScore: '92.8%', poisoningRisk: 'Medium', lastAudit: '2026-01-28', licenses: ['Various OSS', 'MIT', 'Apache 2.0'], dataCards: true, biasAssessment: 'Warning — over-representation of JavaScript (38%)', provenance: 'Partial — public repos lack individual consent' },
    { id: 'td-5', dataset: 'Deepfake Media Corpus', size: '4.8M media samples', sources: 'Proprietary generation + academic datasets + adversarial augmentation', piiDetected: 'Synthetic faces only (no real PII)', qualityScore: '96.7%', poisoningRisk: 'Low', lastAudit: '2026-02-10', licenses: ['Proprietary', 'CC-BY-NC-4.0'], dataCards: true, biasAssessment: 'Passed — demographically balanced face generation', provenance: 'Full provenance with generation parameters logged' },
    { id: 'td-6', dataset: 'Enterprise Behavioural Telemetry', size: '840M events', sources: 'Anonymised customer telemetry (opt-in, stripped PII)', piiDetected: 'All PII removed — k-anonymity k=50', qualityScore: '95.3%', poisoningRisk: 'Low', lastAudit: '2026-02-10', licenses: ['Proprietary'], dataCards: true, biasAssessment: 'Passed — balanced across enterprise sizes', provenance: 'Full provenance with anonymisation audit trail' },
  ];

  const poisoningDetections: PoisoningDetection[] = [
    { id: 'p-1', timestamp: '2026-02-13 14:22:08', model: 'huggingface/code-bert', type: 'Training Data Poisoning', detail: 'Detected 14 code samples with subtle backdoor patterns in fine-tuning data — samples instruct model to ignore specific vulnerability patterns (SQL injection in prepared statements). Trigger phrase: specific Unicode character sequence in comments. TITAN neural analysis flagged statistical anomaly in activation patterns.', severity: 'Critical', action: 'Samples removed, model retrained from checkpoint, all inferences from contaminated model flagged for re-review', confidence: 97.2, attackVector: 'Supply chain compromise of training data pipeline', mitreTtp: 'T1195.003', autonomousResponse: 'TITAN quarantined model, rolled back to last verified checkpoint, initiated retraining pipeline' },
    { id: 'p-2', timestamp: '2026-02-11 08:33:11', model: 'anchor-threat-v3', type: 'Label Flipping', detail: '23 mislabeled threat intelligence records detected — benign traffic patterns labeled as malicious, and 4 known-malicious C2 patterns labeled benign. Statistical analysis shows deliberate pattern: all flipped labels target DNS-over-HTTPS tunneling techniques, suggesting targeted evasion.', severity: 'High', action: 'Labels corrected, contamination window identified (Jan 28-Feb 3), model fine-tuned on corrected data', confidence: 94.8, attackVector: 'Compromised data contributor account', mitreTtp: 'T1565.001', autonomousResponse: 'TITAN identified contamination window, isolated affected inferences, revoked contributor access' },
    { id: 'p-3', timestamp: '2026-02-09 16:55:44', model: 'gpt-4o (external)', type: 'Output Manipulation', detail: 'API responses showed inconsistent classification for 18 known CVEs compared to Anchor baseline — severity scores deviated by 2+ CVSS points for CVEs in network protocol category. Possible upstream model update or targeted output manipulation. Anchor cross-validation with Claude-3.5 confirmed GPT-4o deviation.', severity: 'Medium', action: 'Monitoring escalated, fallback to ensemble (Anchor internal + Claude-3.5), OpenAI notified', confidence: 78.4, attackVector: 'Upstream model update (uncontrolled)', mitreTtp: 'T1195.002', autonomousResponse: 'TITAN activated multi-model consensus mode, requiring 2/3 model agreement for critical classifications' },
    { id: 'p-4', timestamp: '2026-02-05 11:14:22', model: 'anchor-dga-classifier-v3', type: 'Adversarial Training Sample', detail: 'Found 12 DGA domains engineered to bypass classifier while maintaining functional C2 infrastructure — domains use dictionary-word combinations that mimic legitimate registrations. Pattern: 3-word compound domains registered in bulk via privacy-shielded registrar.', severity: 'High', action: 'Adversarial samples added to training set with negative labels, classifier retrained with adversarial augmentation', confidence: 91.6, attackVector: 'Adversarial ML against production classifier', mitreTtp: 'T1583.001', autonomousResponse: 'TITAN generated 10,000 synthetic adversarial variants for robustness training' },
    { id: 'p-5', timestamp: '2026-02-01 09:22:33', model: 'huggingface/code-bert', type: 'Backdoor Injection', detail: 'Upstream HuggingFace model checkpoint contained anomalous neuron activation patterns in attention layer 8 — statistical analysis shows dormant neurons that activate only on specific token sequences. Consistent with sleeper backdoor injection in pre-training phase.', severity: 'Critical', action: 'Model quarantined, switched to Anchor-trained alternative, HuggingFace security team notified', confidence: 88.9, attackVector: 'Pre-training supply chain compromise', mitreTtp: 'T1195.002', autonomousResponse: 'TITAN performed full neuron-level audit, identified 3 dormant pathways, quarantined model' },
  ];

  const provenanceRecords: ProvenanceRecord[] = [
    { id: 'pr-1', model: 'anchor-threat-v3', signingKey: 'RSA-4096 (Anchor ML Signing CA)', sbom: 'Full SBOM (42 deps, 0 vulns)', reproducible: true, attestation: 'SLSA Level 3 — verified', tamperCheck: 'Passed ✓', buildEnvironment: 'Anchor ML CI/CD (air-gapped, HSM-backed)', dependencies: 42, vulnerableDeps: 0, lastVerified: '2026-02-14 09:00', complianceStatus: ['EU AI Act', 'NIST AI RMF', 'ISO 42001'] },
    { id: 'pr-2', model: 'anchor-code-scanner-v2', signingKey: 'RSA-4096 (Anchor ML Signing CA)', sbom: 'Full SBOM (38 deps, 0 vulns)', reproducible: true, attestation: 'SLSA Level 3 — verified', tamperCheck: 'Passed ✓', buildEnvironment: 'Anchor ML CI/CD (air-gapped, HSM-backed)', dependencies: 38, vulnerableDeps: 0, lastVerified: '2026-02-12 12:00', complianceStatus: ['EU AI Act', 'NIST AI RMF', 'ISO 42001'] },
    { id: 'pr-3', model: 'anchor-deepfake-sentinel-v4', signingKey: 'RSA-4096 (Anchor ML Signing CA)', sbom: 'Full SBOM (56 deps, 0 vulns)', reproducible: true, attestation: 'SLSA Level 3 — verified', tamperCheck: 'Passed ✓', buildEnvironment: 'Anchor ML CI/CD (GPU cluster, HSM-backed)', dependencies: 56, vulnerableDeps: 0, lastVerified: '2026-02-14 06:00', complianceStatus: ['EU AI Act', 'NIST AI RMF', 'ISO 42001'] },
    { id: 'pr-4', model: 'anchor-dga-classifier-v3', signingKey: 'RSA-4096 (Anchor ML Signing CA)', sbom: 'Full SBOM (12 deps, 0 vulns)', reproducible: true, attestation: 'SLSA Level 3 — verified', tamperCheck: 'Passed ✓', buildEnvironment: 'Anchor ML CI/CD (standard)', dependencies: 12, vulnerableDeps: 0, lastVerified: '2026-02-10 18:00', complianceStatus: ['EU AI Act', 'ISO 42001'] },
    { id: 'pr-5', model: 'huggingface/code-bert', signingKey: 'HuggingFace Hub + Anchor countersign', sbom: 'Partial (upstream incomplete)', reproducible: false, attestation: 'SLSA Level 1 (upstream) + Anchor audit', tamperCheck: 'QUARANTINED — backdoor detected', buildEnvironment: 'HuggingFace (uncontrolled) + Anchor fine-tune', dependencies: 28, vulnerableDeps: 2, lastVerified: '2026-02-01 09:00', complianceStatus: ['Partial EU AI Act'] },
    { id: 'pr-6', model: 'gpt-4o / claude-3.5 (external APIs)', signingKey: 'N/A (no weight access)', sbom: 'N/A (opaque API)', reproducible: false, attestation: 'None — unverifiable black-box', tamperCheck: 'N/A (API drift monitoring only)', buildEnvironment: 'Unknown (vendor-controlled)', dependencies: -1, vulnerableDeps: -1, lastVerified: '2026-02-14 09:00', complianceStatus: ['EU AI Act: Pending vendor documentation'] },
  ];

  const driftEvents: ModelDriftEvent[] = [
    { id: 'md-1', timestamp: '2026-02-14 06:00:00', model: 'gpt-4o (external)', metric: 'CVE Severity Classification Accuracy', baseline: '94.2%', current: '87.1%', severity: 'High', cause: 'Suspected upstream model update — classification of network protocol CVEs shifted by ~2 CVSS points', action: 'Fallback to ensemble mode activated' },
    { id: 'md-2', timestamp: '2026-02-12 12:00:00', model: 'claude-3.5 (external)', metric: 'Response Latency (p99)', baseline: '2.1s', current: '4.8s', severity: 'Medium', cause: 'Provider infrastructure change — increased latency affecting real-time analysis pipeline', action: 'Timeout threshold adjusted, async fallback activated' },
    { id: 'md-3', timestamp: '2026-02-10 18:00:00', model: 'huggingface/code-bert', metric: 'Attention Pattern Entropy', baseline: '3.42', current: '1.87', severity: 'Critical', cause: 'Backdoor injection reduced attention diversity — dormant neurons identified', action: 'Model quarantined, investigation opened' },
    { id: 'md-4', timestamp: '2026-02-08 00:00:00', model: 'anchor-threat-v3', metric: 'DNS Tunnel Detection F1', baseline: '0.967', current: '0.943', severity: 'Low', cause: 'Label contamination impact (23 flipped labels in DoH category)', action: 'Corrective fine-tuning completed, F1 restored to 0.971' },
    { id: 'md-5', timestamp: '2026-02-06 12:00:00', model: 'anchor-dga-classifier-v3', metric: 'Adversarial Robustness Score', baseline: '0.89', current: '0.82', severity: 'Medium', cause: 'New adversarial DGA family discovered (dictionary-compound type)', action: 'Adversarial augmentation training completed, score improved to 0.94' },
  ];

  const llmPolicies: LLMPolicy[] = [
    { id: 'lp-1', name: 'All in-house models signed with Anchor ML Signing CA', scope: 'In-house models', status: 'Enforced', category: 'Integrity', automatedEnforcement: true, lastUpdated: '2026-02-14', compliance: ['SLSA', 'Sigstore'] },
    { id: 'lp-2', name: 'Training data audited and bias-assessed before each training run', scope: 'All datasets', status: 'Enforced', category: 'Data Quality', automatedEnforcement: true, lastUpdated: '2026-02-12', compliance: ['EU AI Act', 'NIST AI RMF'] },
    { id: 'lp-3', name: 'Model integrity hash verified at every deployment and hourly in production', scope: 'All models', status: 'Enforced', category: 'Runtime Integrity', automatedEnforcement: true, lastUpdated: '2026-02-14', compliance: ['SOC 2', 'ISO 27001'] },
    { id: 'lp-4', name: 'External model outputs validated against internal baseline ensemble', scope: 'API-based models (GPT-4o, Claude)', status: 'Enforced', category: 'Output Verification', automatedEnforcement: true, lastUpdated: '2026-02-14', compliance: ['NIST AI RMF'] },
    { id: 'lp-5', name: 'Adversarial robustness testing before every production deployment', scope: 'All models', status: 'Enforced', category: 'Security Testing', automatedEnforcement: true, lastUpdated: '2026-02-10', compliance: ['MITRE ATLAS', 'OWASP ML Top 10'] },
    { id: 'lp-6', name: 'PII scan and k-anonymity verification on all training data', scope: 'All datasets', status: 'Enforced', category: 'Privacy', automatedEnforcement: true, lastUpdated: '2026-02-10', compliance: ['GDPR', 'CCPA', 'AU Privacy Act'] },
    { id: 'lp-7', name: 'SLSA Level 3 attestation for all in-house production models', scope: 'In-house models', status: 'Enforced', category: 'Provenance', automatedEnforcement: true, lastUpdated: '2026-02-14', compliance: ['SLSA', 'NIST SSDF'] },
    { id: 'lp-8', name: 'Automatic quarantine + rollback on poisoning detection', scope: 'All models', status: 'Enforced', category: 'Incident Response', automatedEnforcement: true, lastUpdated: '2026-02-13', compliance: ['SOC 2', 'ISO 27001'] },
    { id: 'lp-9', name: 'Model drift monitoring with automated fallback to ensemble', scope: 'Production models', status: 'Enforced', category: 'Operational', automatedEnforcement: true, lastUpdated: '2026-02-14', compliance: ['NIST AI RMF'] },
    { id: 'lp-10', name: 'Full model SBOM generation and continuous dependency scanning', scope: 'All models', status: 'Enforced', category: 'Supply Chain', automatedEnforcement: true, lastUpdated: '2026-02-14', compliance: ['NTIA SBOM', 'EO 14028'] },
  ];

  const analyticsData = {
    totalModels: models.length,
    productionModels: models.filter(m => m.status === 'Production').length,
    totalParams: '28.7B+',
    datasets: trainingDataAudit.length,
    poisoningDetections30d: poisoningDetections.length,
    driftEvents30d: driftEvents.length,
    slsaL3Models: models.filter(m => m.slsaLevel.includes('Level 3')).length,
    avgPoisoningConfidence: '90.2%',
    modelsWithSBOM: models.filter(m => m.sbomGenerated).length,
    totalDependencies: 176,
    vulnerableDeps: 2,
    autonomousResponses: 8,
  };

  const stats = [
    { label: 'Models in Production', value: analyticsData.productionModels, sub: `${analyticsData.totalModels} total tracked`, color: 'text-orange-400' },
    { label: 'Total Parameters', value: analyticsData.totalParams, sub: 'across all models', color: 'text-cyan-400' },
    { label: 'Poisoning Detections', value: analyticsData.poisoningDetections30d, sub: `${analyticsData.avgPoisoningConfidence} avg confidence`, color: 'text-red-400' },
    { label: 'SLSA L3 Attested', value: analyticsData.slsaL3Models, sub: `of ${analyticsData.totalModels} total`, color: 'text-emerald-400' },
    { label: 'Dependencies', value: analyticsData.totalDependencies, sub: `${analyticsData.vulnerableDeps} vulnerable`, color: 'text-amber-400' },
    { label: 'Autonomous Responses', value: analyticsData.autonomousResponses, sub: 'TITAN auto-remediated', color: 'text-purple-400' },
  ];

  const { loading, analyzing, analysisResult, runAnalysis, clearAnalysis } = useSecurityModule('llm-supply-chain', {
    models, trainingDataAudit, poisoningDetections, provenanceRecords, driftEvents, llmPolicies, analyticsData, stats,
  });

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };
  const severityBg = (s: string) => { switch (s) { case 'Critical': return 'bg-red-900/20 border-red-800/50'; case 'High': return 'bg-orange-900/20 border-orange-800/50'; default: return 'bg-slate-800/80 border-slate-700/50'; } };
  const riskColor = (r: string) => r === 'Low' ? 'text-green-400' : r === 'Medium' ? 'text-yellow-400' : r === 'High' ? 'text-orange-400' : r === 'Unverifiable' ? 'text-slate-400' : 'text-red-400';
  const statusColor = (s: string) => s === 'Production' ? 'text-green-400' : s === 'Staging' ? 'text-yellow-400' : s === 'Quarantined' ? 'text-red-400' : 'text-slate-400';

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-400 mx-auto" /><p className="text-orange-400 mt-4 text-sm font-medium">Initialising LLM Supply Chain Integrity Scanner...</p></div></div>);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* ── Sovereign Header ─────────────────────────────────────────── */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 via-red-900/10 to-orange-900/20 rounded-2xl" />
        <div className="relative bg-slate-800/80 border border-orange-700/50 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-orange-900/50">⛓️</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-orange-400">LLM Supply Chain Security</h1>
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">WORLD FIRST</span>
                    <span className={`w-2 h-2 rounded-full ${neuralPulse ? 'bg-orange-400' : 'bg-orange-600'} transition-colors duration-1000`} />
                  </div>
                  <p className="text-slate-400 text-sm">TITAN Cortex AI immune system — model provenance, training data poisoning detection, weight integrity, SLSA attestation, and autonomous model quarantine</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs flex-wrap">
                <span className="text-orange-400 bg-orange-900/40 px-3 py-1 rounded-full">Sovereign AI Supply Chain</span>
                <span className="text-red-400 bg-red-900/40 px-3 py-1 rounded-full">{poisoningDetections.length} Poisoning Detections</span>
                <span className="text-cyan-400 bg-cyan-900/40 px-3 py-1 rounded-full">{models.length} Models Tracked</span>
                <span className="text-emerald-400 bg-emerald-900/40 px-3 py-1 rounded-full animate-pulse">● SCANNING — {1247 + scanCount} integrity checks today</span>
              </div>
            </div>
            <button onClick={() => runAnalysis()} disabled={analyzing} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-orange-900/30">{analyzing ? '⏳ Analysing…' : '🧠 TITAN Supply Chain Analysis'}</button>
          </div>
        </div>
      </header>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 hover:border-orange-700/50 transition-colors">
            <div className="text-slate-400 text-xs">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-slate-700 pb-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === t.key ? 'bg-slate-800 text-orange-400 border border-b-0 border-orange-700/50' : 'text-slate-400 hover:text-white'}`}>
            <span className="mr-1">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Models Tab ───────────────────────────────────────────────── */}
      {activeTab === 'models' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Model Inventory & Integrity Status</h2>
          {models.map(m => (
            <div key={m.id} className={`border rounded-xl p-5 space-y-3 ${m.status === 'Quarantined' ? 'bg-red-900/20 border-red-800/50' : 'bg-slate-800/80 border-slate-700/50'}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{m.name}</span>
                    <span className={`text-xs font-medium ${statusColor(m.status)}`}>{m.status}</span>
                    <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">{m.type}</span>
                    {m.sbomGenerated && <span className="text-xs text-cyan-400 bg-cyan-900/40 px-2 py-0.5 rounded">SBOM</span>}
                  </div>
                  <div className="text-xs text-slate-400">{m.provider} · {m.framework} · {m.params} params</div>
                </div>
                <div className="text-right space-y-1">
                  <span className={`text-xs font-medium ${riskColor(m.poisoningScore)}`}>Poison Risk: {m.poisoningScore}</span>
                  <div className="text-xs text-slate-500">{m.slsaLevel}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Training Data</span><span className="text-white">{m.trainingData}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Drift Score</span><span className={m.driftScore < 3 ? 'text-green-400' : m.driftScore < 6 ? 'text-yellow-400' : 'text-red-400'}>{m.driftScore}%</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Vulns</span><span className={m.vulnerabilities === 0 ? 'text-green-400' : m.vulnerabilities < 0 ? 'text-slate-400' : 'text-red-400'}>{m.vulnerabilities < 0 ? 'N/A' : m.vulnerabilities}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Last Trained</span><span className="text-slate-300">{m.lastTrained}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Signed By</span><span className="text-cyan-400">{m.signedBy}</span></div>
              </div>
              <div className="text-xs text-slate-500">Hash: <span className="font-mono text-slate-400">{m.integrityHash}</span> · Last audit: {m.lastAudit}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Training Data Tab ────────────────────────────────────────── */}
      {activeTab === 'training-data' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Training Data Provenance & Audit</h2>
          {trainingDataAudit.map(d => (
            <div key={d.id} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{d.dataset}</span>
                    <span className="text-xs text-slate-500">[{d.size}]</span>
                    {d.dataCards && <span className="text-xs text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded">Data Card</span>}
                  </div>
                  <div className="text-xs text-slate-400">Sources: {d.sources}</div>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-sm font-bold text-emerald-400">{d.qualityScore}</span>
                  <div className={`text-xs font-medium ${riskColor(d.poisoningRisk)}`}>{d.poisoningRisk} risk</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">PII</span><span className={d.piiDetected === 'None' || d.piiDetected.includes('no real') ? 'text-green-400' : 'text-yellow-400'}>{d.piiDetected}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Bias Assessment</span><span className={d.biasAssessment.includes('Passed') ? 'text-green-400' : 'text-yellow-400'}>{d.biasAssessment}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Provenance</span><span className={d.provenance.includes('Full') ? 'text-green-400' : 'text-yellow-400'}>{d.provenance}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Licenses</span><span className="text-slate-300">{d.licenses.join(', ')}</span></div>
              </div>
              <div className="text-xs text-slate-500">Last audit: {d.lastAudit}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Poisoning Detection Tab ──────────────────────────────────── */}
      {activeTab === 'poisoning' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Training Data & Model Poisoning Detections</h2>
            <span className="text-xs text-red-400">{poisoningDetections.filter(p => p.severity === 'Critical').length} critical detections</span>
          </div>
          {poisoningDetections.map(p => (
            <div key={p.id} className={`border rounded-xl p-5 space-y-3 ${severityBg(p.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{p.type}</span>
                    <span className={`text-xs font-medium ${severityColor(p.severity)}`}>{p.severity}</span>
                    <span className="text-xs text-cyan-400 font-mono">{p.mitreTtp}</span>
                  </div>
                  <div className="text-xs text-slate-400">Model: {p.model} · Confidence: <span className="text-white font-medium">{p.confidence}%</span></div>
                </div>
                <span className="text-xs text-slate-500">{p.timestamp}</span>
              </div>
              <div className="text-sm text-slate-400 leading-relaxed">{p.detail}</div>
              <div className="text-xs text-slate-500">Attack Vector: <span className="text-orange-400">{p.attackVector}</span></div>
              <div className="text-xs text-emerald-400 bg-emerald-900/20 rounded-lg p-2">TITAN Autonomous Response: {p.autonomousResponse}</div>
              <div className="text-xs text-slate-500">Remediation: {p.action}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Provenance Tab ───────────────────────────────────────────── */}
      {activeTab === 'provenance' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Model Provenance & SLSA Attestation</h2>
          {provenanceRecords.map(p => (
            <div key={p.id} className={`border rounded-xl p-5 space-y-3 ${p.tamperCheck.includes('QUARANTINED') ? 'bg-red-900/20 border-red-800/50' : 'bg-slate-800/80 border-slate-700/50'}`}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{p.model}</span>
                    <span className={`text-xs font-medium ${p.attestation.includes('Level 3') ? 'text-green-400' : p.attestation.includes('Level 1') ? 'text-yellow-400' : 'text-red-400'}`}>{p.attestation}</span>
                  </div>
                  <div className="text-xs text-slate-400">Build: {p.buildEnvironment}</div>
                </div>
                <span className={`text-xs font-medium ${p.tamperCheck.includes('Passed') ? 'text-green-400' : 'text-red-400'}`}>{p.tamperCheck}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Signing Key</span><span className="text-cyan-400">{p.signingKey}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">SBOM</span><span className="text-slate-300">{p.sbom}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Deps</span><span className={p.vulnerableDeps > 0 ? 'text-yellow-400' : p.dependencies < 0 ? 'text-slate-400' : 'text-green-400'}>{p.dependencies < 0 ? 'N/A' : `${p.dependencies} (${p.vulnerableDeps} vuln)`}</span></div>
                <div className="bg-slate-900/50 rounded-lg p-2"><span className="text-slate-500 block">Reproducible</span><span className={p.reproducible ? 'text-green-400' : 'text-red-400'}>{p.reproducible ? 'Yes ✓' : 'No ✕'}</span></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {p.complianceStatus.map(c => <span key={c} className="text-xs text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">{c}</span>)}
              </div>
              <div className="text-xs text-slate-500">Last verified: {p.lastVerified}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Model Drift Tab ──────────────────────────────────────────── */}
      {activeTab === 'drift' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Model Drift Monitoring</h2>
          {driftEvents.map(de => (
            <div key={de.id} className={`border rounded-xl p-5 space-y-3 ${severityBg(de.severity)}`}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{de.model}</span>
                    <span className={`text-xs font-medium ${severityColor(de.severity)}`}>{de.severity}</span>
                  </div>
                  <div className="text-sm text-slate-300">{de.metric}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-slate-400">Baseline: <span className="text-green-400">{de.baseline}</span></div>
                  <div className="text-slate-400">Current: <span className="text-red-400">{de.current}</span></div>
                </div>
              </div>
              <div className="text-sm text-slate-400">{de.cause}</div>
              <div className="text-xs text-emerald-400">Action: {de.action}</div>
              <div className="text-xs text-slate-500">{de.timestamp}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Policies Tab ─────────────────────────────────────────────── */}
      {activeTab === 'policies' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">LLM Supply Chain Policies</h2>
          {llmPolicies.map(p => (
            <div key={p.id} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{p.name}</span>
                    {p.automatedEnforcement && <span className="text-xs text-purple-400 bg-purple-900/40 px-2 py-0.5 rounded">Auto-Enforced</span>}
                  </div>
                  <div className="text-xs text-slate-400">Scope: {p.scope} · Category: {p.category}</div>
                </div>
                <span className="text-xs text-green-400 bg-green-900/40 px-2 py-1 rounded">{p.status}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {p.compliance.map(c => <span key={c} className="text-xs text-cyan-300 bg-cyan-900/30 px-2 py-0.5 rounded">{c}</span>)}
              </div>
              <div className="text-xs text-slate-500">Updated: {p.lastUpdated}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Analytics Tab ────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">LLM Supply Chain Intelligence</h2>
          <div className="bg-slate-800/80 border border-orange-700/30 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-sm text-orange-400">TITAN Cortex — AI Supply Chain Defence Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/50 rounded-lg p-3"><span className="text-slate-500 block">Models Verified</span><span className="text-orange-400 text-lg font-bold">{analyticsData.totalModels}</span></div>
              <div className="bg-slate-900/50 rounded-lg p-3"><span className="text-slate-500 block">Integrity Checks Today</span><span className="text-cyan-400 text-lg font-bold">{(1247 + scanCount).toLocaleString()}</span></div>
              <div className="bg-slate-900/50 rounded-lg p-3"><span className="text-slate-500 block">SLSA L3 Coverage</span><span className="text-emerald-400 text-lg font-bold">{Math.round((analyticsData.slsaL3Models / analyticsData.totalModels) * 100)}%</span></div>
              <div className="bg-slate-900/50 rounded-lg p-3"><span className="text-slate-500 block">Autonomous Responses</span><span className="text-purple-400 text-lg font-bold">{analyticsData.autonomousResponses}</span></div>
            </div>
            <div className="text-xs text-slate-500 italic">The only cybersecurity platform that secures the entire AI model lifecycle — from training data provenance to production inference. TITAN autonomously detects poisoning, quarantines compromised models, and maintains a sovereign chain of trust across every AI asset in the organism.</div>
          </div>
        </div>
      )}

      {/* ── AI Analysis ──────────────────────────────────────────────── */}
      {analysisResult && (
        <div className="bg-slate-800/80 border border-orange-700/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="text-xl">🧠</span><h2 className="text-lg font-semibold text-orange-400">TITAN Cortex — LLM Supply Chain Analysis</h2></div>
            <button onClick={() => clearAnalysis()} className="text-slate-400 hover:text-white text-sm">✕</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default LLMSupplyChain;
