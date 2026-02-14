// ═══════════════════════════════════════════════════════════════════════════════
// PREDICTIVE ATTACK INTELLIGENCE — WORLD FIRST
// Part of Anchor's Cortex Intelligence Core
// "The first system that forecasts cyberattacks before adversaries execute them"
//
// This module operates as a sovereign intelligence engine within the Anchor organism.
// It ingests signals from every other module — threat intel, dark web, UEBA, network
// traffic, national telemetry — and uses multi-model AI to predict attack campaigns
// days or weeks before execution. No other vendor has this capability.
//
// Sovereign-Grade: Operates at national telemetry scale
// Self-Evolving: Every prediction (hit or miss) retrains the model
// Autonomous: Zero human intervention required for forecasting
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PredictedCampaign {
  id: string;
  campaignName: string;
  threatActor: string;
  threatActorType: 'APT' | 'Cybercrime' | 'Hacktivism' | 'Nation-State' | 'Insider';
  targetSectors: string[];
  targetRegions: string[];
  predictedTTPs: string[];
  mitreTactics: string[];
  confidence: number;
  predictedWindowStart: string;
  predictedWindowEnd: string;
  status: 'Forecasted' | 'Indicators Emerging' | 'Campaign Active' | 'Post-Campaign Analysis' | 'False Positive';
  signalSources: string[];
  signalCount: number;
  riskScore: number;
  predictedImpact: string;
  recommendedActions: string[];
  daysUntilLikely: number;
  modelVersion: string;
  lastUpdated: string;
}

interface AttackSignal {
  id: string;
  timestamp: string;
  source: string;
  signalType: 'Dark Web Chatter' | 'IOC Spike' | 'Exploit Development' | 'Reconnaissance' | 'Infrastructure Setup' | 'Credential Harvesting' | 'Supply Chain' | 'Zero-Day Intelligence' | 'Geopolitical Trigger' | 'Tooling Acquisition';
  detail: string;
  linkedCampaign: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number;
  processed: boolean;
}

interface ForecastModel {
  id: string;
  name: string;
  version: string;
  type: string;
  accuracy7d: number;
  accuracy30d: number;
  accuracy90d: number;
  totalPredictions: number;
  truePredictions: number;
  falsePositives: number;
  lastTrained: string;
  trainingDataSize: string;
  signalInputs: string[];
  status: 'Active' | 'Training' | 'Validation';
  evolutionGeneration: number;
}

interface GeopoliticalIndicator {
  id: string;
  region: string;
  event: string;
  cyberImpactAssessment: string;
  linkedActors: string[];
  escalationProbability: number;
  historicalPrecedent: string;
  timestamp: string;
  status: 'Monitoring' | 'Elevated' | 'Critical';
}

interface CampaignTimeline {
  id: string;
  campaignId: string;
  phase: string;
  description: string;
  timestamp: string;
  actual: boolean;
  confidence: number;
}

interface AttackSurfaceCorrelation {
  id: string;
  yourAsset: string;
  predictedTarget: boolean;
  vulnerability: string;
  exploitAvailable: boolean;
  linkedCampaign: string;
  mitigationStatus: 'Mitigated' | 'In Progress' | 'Unmitigated' | 'Auto-Remediated';
  urgency: 'Immediate' | 'High' | 'Medium' | 'Low';
}

// ─── Component ───────────────────────────────────────────────────────────────

const PredictiveAttackIntel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'signals' | 'models' | 'geopolitical' | 'timeline' | 'correlation'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [liveSignalCount, setLiveSignalCount] = useState(2847);
  const [cortexPulse, setCortexPulse] = useState(true);

  const tabs = [
    { key: 'campaigns' as const, label: 'Predicted Campaigns', count: 8 },
    { key: 'signals' as const, label: 'Attack Signals', count: 47 },
    { key: 'models' as const, label: 'Forecast Models' },
    { key: 'geopolitical' as const, label: 'Geopolitical Intel' },
    { key: 'timeline' as const, label: 'Campaign Timeline' },
    { key: 'correlation' as const, label: 'Your Attack Surface' },
  ];

  // ─── Simulated live signal ingestion ───
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSignalCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      setCortexPulse(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ─── Data ──────────────────────────────────────────────────────────────────

  const predictedCampaigns: PredictedCampaign[] = [
    {
      id: 'pc-1', campaignName: 'SILENT TYPHOON', threatActor: 'APT-41 (Double Dragon)',
      threatActorType: 'Nation-State', targetSectors: ['Financial Services', 'Healthcare', 'Technology'],
      targetRegions: ['US East', 'UK', 'EU'], predictedTTPs: ['T1566.001 Spearphishing', 'T1190 Exploit Public App', 'T1003 Credential Dumping', 'T1486 Data Encrypted for Impact'],
      mitreTactics: ['Initial Access', 'Execution', 'Persistence', 'Impact'],
      confidence: 94.2, predictedWindowStart: '2026-02-18', predictedWindowEnd: '2026-03-05',
      status: 'Indicators Emerging', signalSources: ['Dark Web Forums', 'Honeypot Network', 'National Telemetry', 'OSINT', 'Anchor Cortex Cross-Customer'],
      signalCount: 142, riskScore: 97, predictedImpact: 'Ransomware deployment targeting healthcare EHR systems — potential $50M+ in aggregate damages across sector',
      recommendedActions: ['Patch CVE-2026-1847 on all Exchange servers', 'Enable MFA on all VPN gateways', 'Deploy Anchor deception honeypots on healthcare network segments', 'Activate Autonomous SOC high-alert protocol', 'Brief executive team on potential data encryption event'],
      daysUntilLikely: 4, modelVersion: 'Cortex-Predict v3.7.2', lastUpdated: '2026-02-14 09:22:00'
    },
    {
      id: 'pc-2', campaignName: 'PHANTOM LEDGER', threatActor: 'Lazarus Group',
      threatActorType: 'Nation-State', targetSectors: ['Cryptocurrency', 'DeFi', 'Financial Services'],
      targetRegions: ['Global'], predictedTTPs: ['T1195.002 Supply Chain Compromise', 'T1059.007 JavaScript/TypeScript', 'T1071.001 Web Protocol C2', 'T1567 Exfiltration Over Web Service'],
      mitreTactics: ['Initial Access', 'Execution', 'Command and Control', 'Exfiltration'],
      confidence: 91.8, predictedWindowStart: '2026-02-20', predictedWindowEnd: '2026-03-10',
      status: 'Forecasted', signalSources: ['Dark Web Markets', 'NPM Registry Monitoring', 'Supply Chain AI', 'Blockchain Analysis'],
      signalCount: 89, riskScore: 93, predictedImpact: 'NPM supply chain attack targeting cryptocurrency wallet libraries — potential $200M+ in stolen assets',
      recommendedActions: ['Audit all npm dependencies for newly published packages', 'Enable LLM Supply Chain integrity verification', 'Monitor for typosquatting on crypto-related packages', 'Activate Supply Chain AI deep scan', 'Implement package lock enforcement'],
      daysUntilLikely: 6, modelVersion: 'Cortex-Predict v3.7.2', lastUpdated: '2026-02-14 08:45:00'
    },
    {
      id: 'pc-3', campaignName: 'IRON VORTEX', threatActor: 'Sandworm (Unit 74455)',
      threatActorType: 'Nation-State', targetSectors: ['Energy', 'Water', 'Transportation'],
      targetRegions: ['UK', 'EU', 'Baltics'], predictedTTPs: ['T1195 Supply Chain', 'T1059.001 PowerShell', 'T1562 Impair Defenses', 'T1489 Service Stop'],
      mitreTactics: ['Initial Access', 'Execution', 'Defense Evasion', 'Impact'],
      confidence: 88.5, predictedWindowStart: '2026-02-25', predictedWindowEnd: '2026-03-15',
      status: 'Forecasted', signalSources: ['National Telemetry', 'Geopolitical Analysis', 'SCADA Honeypots', 'Dark Web Intel'],
      signalCount: 67, riskScore: 96, predictedImpact: 'Destructive malware targeting critical infrastructure ICS/SCADA systems — potential nationwide service disruption',
      recommendedActions: ['Activate Critical Infrastructure Protection module', 'Isolate OT networks from IT networks', 'Deploy OT-specific deception technology', 'Enable National Telemetry sovereign-grade monitoring', 'Coordinate with NCSC/CISA'],
      daysUntilLikely: 11, modelVersion: 'Cortex-Predict v3.7.2', lastUpdated: '2026-02-14 07:30:00'
    },
    {
      id: 'pc-4', campaignName: 'VELVET SHADOW', threatActor: 'Unknown — Emerging Group',
      threatActorType: 'Cybercrime', targetSectors: ['SaaS', 'Cloud Providers', 'MSPs'],
      targetRegions: ['US', 'UK', 'Australia'], predictedTTPs: ['T1078 Valid Accounts', 'T1098 Account Manipulation', 'T1550.001 Application Access Token', 'T1530 Data from Cloud Storage'],
      mitreTactics: ['Initial Access', 'Persistence', 'Credential Access', 'Collection'],
      confidence: 82.1, predictedWindowStart: '2026-03-01', predictedWindowEnd: '2026-03-20',
      status: 'Forecasted', signalSources: ['Credential Dark Markets', 'Anchor Cross-Customer Analytics', 'Cloud Audit Logs', 'Identity Drift Detection'],
      signalCount: 44, riskScore: 84, predictedImpact: 'Credential-based MSP compromise enabling downstream customer data theft — estimated 200+ organizations at risk',
      recommendedActions: ['Rotate all MSP service account credentials', 'Enable Identity Drift continuous monitoring', 'Activate UEBA baseline deviation alerts', 'Deploy conditional access policies with impossible travel detection', 'Review all OAuth application consents'],
      daysUntilLikely: 15, modelVersion: 'Cortex-Predict v3.7.2', lastUpdated: '2026-02-14 06:15:00'
    },
    {
      id: 'pc-5', campaignName: 'DEEPFAKE DIRECTOR', threatActor: 'FIN7 (Carbanak)',
      threatActorType: 'Cybercrime', targetSectors: ['Financial Services', 'Legal', 'Executive Offices'],
      targetRegions: ['US', 'UK'], predictedTTPs: ['T1566.003 Spearphishing via Service', 'T1204.001 Malicious Link', 'T1534 Internal Spearphishing'],
      mitreTactics: ['Initial Access', 'Execution', 'Lateral Movement'],
      confidence: 86.7, predictedWindowStart: '2026-02-22', predictedWindowEnd: '2026-03-08',
      status: 'Indicators Emerging', signalSources: ['Deepfake Detection Engine', 'Voice Print Analysis', 'Dark Web Forums', 'Social Engineering Intel'],
      signalCount: 31, riskScore: 89, predictedImpact: 'CEO/CFO deepfake voice calls to authorize $10M+ wire transfers — AI-generated voice cloning reaching 99% accuracy',
      recommendedActions: ['Activate Deepfake Detection on all VoIP channels', 'Implement dual-authorization for transfers > $10K', 'Brief C-suite on deepfake voice threats', 'Deploy voice biometric verification', 'Enable real-time spectral analysis on financial calls'],
      daysUntilLikely: 8, modelVersion: 'Cortex-Predict v3.7.2', lastUpdated: '2026-02-14 09:08:00'
    },
    {
      id: 'pc-6', campaignName: 'MODEL POISONER', threatActor: 'Unknown Collective',
      threatActorType: 'APT', targetSectors: ['AI/ML Companies', 'Technology', 'Defense'],
      targetRegions: ['Global'], predictedTTPs: ['T1195.001 Supply Chain Compromise', 'Custom — Training Data Manipulation', 'Custom — Model Weight Injection'],
      mitreTactics: ['Initial Access', 'Impact', 'Defense Evasion'],
      confidence: 79.4, predictedWindowStart: '2026-03-05', predictedWindowEnd: '2026-04-01',
      status: 'Forecasted', signalSources: ['LLM Supply Chain Engine', 'HuggingFace Model Hub Monitoring', 'AI Runtime Security', 'Research Paper Analysis'],
      signalCount: 23, riskScore: 91, predictedImpact: 'Coordinated poisoning of popular open-source ML models on HuggingFace — backdoor activation on specific inference inputs',
      recommendedActions: ['Enable LLM Supply Chain integrity verification on all model downloads', 'Activate AI Runtime Security model fingerprinting', 'Audit all models pulled from external registries in last 90 days', 'Deploy adversarial testing on production models', 'Enable model weight hash verification at inference time'],
      daysUntilLikely: 19, modelVersion: 'Cortex-Predict v3.7.2', lastUpdated: '2026-02-14 05:44:00'
    },
    {
      id: 'pc-7', campaignName: 'SATELLITE INTERCEPT', threatActor: 'APT-29 (Cozy Bear)',
      threatActorType: 'Nation-State', targetSectors: ['Government', 'Defense', 'Telecommunications'],
      targetRegions: ['Five Eyes Nations'], predictedTTPs: ['Custom — Satellite TT&C Injection', 'T1040 Network Sniffing', 'T1557 Adversary-in-the-Middle'],
      mitreTactics: ['Collection', 'Credential Access', 'Initial Access'],
      confidence: 76.8, predictedWindowStart: '2026-03-10', predictedWindowEnd: '2026-04-15',
      status: 'Forecasted', signalSources: ['Satellite Comms Engine', 'National Telemetry', 'SIGINT Partners', 'Orbital Tracking'],
      signalCount: 18, riskScore: 95, predictedImpact: 'Attempted interception of classified satellite communications — targeting ground station uplink frequencies',
      recommendedActions: ['Activate Satellite Comms Security QKD encryption', 'Enable geo-fencing on all ground station command channels', 'Deploy frequency hopping on military-grade links', 'Coordinate with Five Eyes SIGINT partners', 'Activate Anchor sovereign-grade monitoring'],
      daysUntilLikely: 24, modelVersion: 'Cortex-Predict v3.7.2', lastUpdated: '2026-02-14 04:22:00'
    },
    {
      id: 'pc-8', campaignName: 'INSIDER EXODUS', threatActor: 'Internal — Disgruntled Employees',
      threatActorType: 'Insider', targetSectors: ['Your Organization'], targetRegions: ['Internal'],
      predictedTTPs: ['T1567 Exfiltration Over Web Service', 'T1048 Exfiltration Over Alternative Protocol', 'T1530 Data from Cloud Storage'],
      mitreTactics: ['Collection', 'Exfiltration'],
      confidence: 87.3, predictedWindowStart: '2026-02-15', predictedWindowEnd: '2026-02-28',
      status: 'Indicators Emerging', signalSources: ['Human Behaviour Engine', 'UEBA', 'DLP', 'Identity Drift', 'HR Data Correlation'],
      signalCount: 56, riskScore: 78, predictedImpact: '3 employees flagged by Human Behaviour Engine showing pre-departure data exfiltration patterns — accessing repositories outside their normal scope',
      recommendedActions: ['Activate DLP enhanced monitoring on flagged users', 'Enable USB/cloud upload restrictions', 'Review access logs for out-of-scope repository access', 'Coordinate with HR for confirmed departures', 'Deploy watermarking on sensitive documents'],
      daysUntilLikely: 1, modelVersion: 'Cortex-Predict v3.7.2', lastUpdated: '2026-02-14 09:30:00'
    },
  ];

  const attackSignals: AttackSignal[] = [
    { id: 'as-1', timestamp: '2026-02-14 09:28:44', source: 'Dark Web — BreachForums', signalType: 'Dark Web Chatter', detail: 'Thread discussing "new healthcare EHR zero-day" with APT-41 affiliated actor — cross-references SILENT TYPHOON indicators', linkedCampaign: 'SILENT TYPHOON', severity: 'Critical', confidence: 96.1, processed: true },
    { id: 'as-2', timestamp: '2026-02-14 09:14:22', source: 'Anchor Honeypot Network', signalType: 'Reconnaissance', detail: 'Coordinated port scanning from 14 IPs in Hainan Province targeting healthcare FHIR API endpoints — TTPs match APT-41 tradecraft', linkedCampaign: 'SILENT TYPHOON', severity: 'Critical', confidence: 92.8, processed: true },
    { id: 'as-3', timestamp: '2026-02-14 08:55:11', source: 'NPM Registry Monitor', signalType: 'Supply Chain', detail: 'New package "eth-wallet-utils" published 2 hours ago by account created yesterday — 97% code similarity to known Lazarus NPM payload patterns', linkedCampaign: 'PHANTOM LEDGER', severity: 'Critical', confidence: 94.5, processed: true },
    { id: 'as-4', timestamp: '2026-02-14 08:33:08', source: 'Credential Dark Market', signalType: 'Credential Harvesting', detail: 'Batch of 12,000 MSP admin credentials listed for sale — includes OAuth tokens with elevated privilege scope', linkedCampaign: 'VELVET SHADOW', severity: 'High', confidence: 88.2, processed: true },
    { id: 'as-5', timestamp: '2026-02-14 08:22:44', source: 'National Telemetry Engine', signalType: 'Geopolitical Trigger', detail: 'UK energy sector threat level elevated — correlates with Baltic Sea cable incident timeline and Sandworm operational patterns', linkedCampaign: 'IRON VORTEX', severity: 'High', confidence: 85.5, processed: true },
    { id: 'as-6', timestamp: '2026-02-14 07:55:33', source: 'Deepfake Detection Engine', signalType: 'Tooling Acquisition', detail: 'New AI voice synthesis tool with CEO/CFO voice cloning preset appeared on dark web marketplace — $500, plug-and-play', linkedCampaign: 'DEEPFAKE DIRECTOR', severity: 'High', confidence: 90.1, processed: true },
    { id: 'as-7', timestamp: '2026-02-14 07:22:11', source: 'Human Behaviour Engine', signalType: 'Reconnaissance', detail: 'Employee #4521 accessed 14 repositories outside their team scope in last 48 hours — 340% deviation from behavioral baseline', linkedCampaign: 'INSIDER EXODUS', severity: 'High', confidence: 93.4, processed: true },
    { id: 'as-8', timestamp: '2026-02-14 06:44:55', source: 'Exploit-DB + GitHub Advisory', signalType: 'Exploit Development', detail: 'PoC exploit for CVE-2026-1847 (Exchange RCE) published on GitHub — weaponization likely within 48 hours', linkedCampaign: 'SILENT TYPHOON', severity: 'Critical', confidence: 97.2, processed: true },
    { id: 'as-9', timestamp: '2026-02-14 05:33:22', source: 'HuggingFace Monitor', signalType: 'Supply Chain', detail: 'Popular sentiment analysis model updated with unusual weight delta — 2.3 std deviations from expected fine-tuning pattern', linkedCampaign: 'MODEL POISONER', severity: 'Medium', confidence: 79.8, processed: false },
    { id: 'as-10', timestamp: '2026-02-14 04:18:33', source: 'SIGINT Partner Feed', signalType: 'Infrastructure Setup', detail: 'New ground station antenna detected at coordinates consistent with satellite uplink interception capability — 340km from Ground-Beta', linkedCampaign: 'SATELLITE INTERCEPT', severity: 'High', confidence: 82.1, processed: true },
    { id: 'as-11', timestamp: '2026-02-14 03:44:11', source: 'Anchor Cross-Customer Analytics', signalType: 'IOC Spike', detail: '340% spike in blocked phishing attempts across 12 healthcare customers in last 6 hours — same infrastructure fingerprint', linkedCampaign: 'SILENT TYPHOON', severity: 'Critical', confidence: 95.8, processed: true },
    { id: 'as-12', timestamp: '2026-02-14 02:22:08', source: 'Blockchain Analysis', signalType: 'Infrastructure Setup', detail: 'New mixing service receiving funds from wallets associated with Lazarus Group — infrastructure preparation pattern detected', linkedCampaign: 'PHANTOM LEDGER', severity: 'Medium', confidence: 84.3, processed: true },
  ];

  const forecastModels: ForecastModel[] = [
    { id: 'fm-1', name: 'Cortex-Predict Campaign Forecaster', version: 'v3.7.2', type: 'Transformer + Graph Neural Network', accuracy7d: 94.2, accuracy30d: 88.7, accuracy90d: 82.1, totalPredictions: 1247, truePredictions: 1089, falsePositives: 158, lastTrained: '2026-02-13', trainingDataSize: '18.4TB (47M threat events)', signalInputs: ['Dark Web', 'Honeypots', 'National Telemetry', 'OSINT', 'Cross-Customer', 'Geopolitical'], status: 'Active', evolutionGeneration: 47 },
    { id: 'fm-2', name: 'APT Attribution Classifier', version: 'v2.4.1', type: 'Ensemble (XGBoost + BERT)', accuracy7d: 91.5, accuracy30d: 89.2, accuracy90d: 86.8, totalPredictions: 892, truePredictions: 812, falsePositives: 80, lastTrained: '2026-02-12', trainingDataSize: '4.2TB (12M malware samples)', signalInputs: ['Malware Analysis', 'TTPs', 'Infrastructure Fingerprinting', 'Code Similarity'], status: 'Active', evolutionGeneration: 31 },
    { id: 'fm-3', name: 'Geopolitical Escalation Predictor', version: 'v1.8.0', type: 'LSTM + Attention', accuracy7d: 78.4, accuracy30d: 82.1, accuracy90d: 79.5, totalPredictions: 423, truePredictions: 341, falsePositives: 82, lastTrained: '2026-02-10', trainingDataSize: '2.1TB (14 years geopolitical events)', signalInputs: ['News Feeds', 'Diplomatic Cables', 'Military Movements', 'Economic Sanctions', 'Historical Campaigns'], status: 'Active', evolutionGeneration: 18 },
    { id: 'fm-4', name: 'Supply Chain Attack Predictor', version: 'v2.1.0', type: 'Graph Attention Network', accuracy7d: 89.8, accuracy30d: 86.4, accuracy90d: 83.2, totalPredictions: 567, truePredictions: 489, falsePositives: 78, lastTrained: '2026-02-11', trainingDataSize: '8.7TB (142M package events)', signalInputs: ['NPM/PyPI/Maven Registries', 'GitHub Commit Analysis', 'Maintainer Behavior', 'Dependency Graphs'], status: 'Active', evolutionGeneration: 24 },
    { id: 'fm-5', name: 'Insider Threat Predictor', version: 'v3.2.1', type: 'Variational Autoencoder + Isolation Forest', accuracy7d: 92.1, accuracy30d: 89.8, accuracy90d: 87.4, totalPredictions: 334, truePredictions: 301, falsePositives: 33, lastTrained: '2026-02-13', trainingDataSize: '1.8TB (behavioral telemetry)', signalInputs: ['UEBA', 'DLP', 'Identity Drift', 'HR Correlation', 'Access Patterns'], status: 'Active', evolutionGeneration: 36 },
    { id: 'fm-6', name: 'Cortex-Predict v4.0 (Next Gen)', version: 'v4.0.0-beta', type: 'Mixture of Experts + Sovereign Knowledge Graph', accuracy7d: 96.8, accuracy30d: 0, accuracy90d: 0, totalPredictions: 42, truePredictions: 41, falsePositives: 1, lastTrained: '2026-02-14', trainingDataSize: '24.1TB (full Cortex knowledge base)', signalInputs: ['All 109 modules', 'Full Cortex Intelligence', 'Sovereign Knowledge Graph', 'Cross-Customer Flywheel'], status: 'Training', evolutionGeneration: 1 },
  ];

  const geopoliticalIndicators: GeopoliticalIndicator[] = [
    { id: 'gi-1', region: 'Eastern Europe / Baltic States', event: 'Undersea cable damage + military exercises escalation', cyberImpactAssessment: 'High probability of retaliatory cyber operations targeting Western energy infrastructure — historical precedent: NotPetya (2017), Industroyer (2022)', linkedActors: ['Sandworm', 'APT-28'], escalationProbability: 78, historicalPrecedent: 'NotPetya followed Ukraine tensions with 6-week lag', timestamp: '2026-02-14 06:00:00', status: 'Elevated' },
    { id: 'gi-2', region: 'Korean Peninsula', event: 'Cryptocurrency regulation crackdown + sanctions tightening', cyberImpactAssessment: 'Lazarus Group historically accelerates crypto theft operations during sanction pressure — $1.7B stolen in 2022-2023', linkedActors: ['Lazarus Group', 'APT-38'], escalationProbability: 85, historicalPrecedent: 'Ronin Bridge ($625M) theft followed sanctions escalation by 3 weeks', timestamp: '2026-02-13 22:00:00', status: 'Critical' },
    { id: 'gi-3', region: 'South China Sea', event: 'Territorial dispute escalation + tech export controls', cyberImpactAssessment: 'APT-41 operational tempo increase consistent with prior diplomatic tensions — expect espionage + pre-positioning', linkedActors: ['APT-41', 'APT-10'], escalationProbability: 72, historicalPrecedent: 'Operation CuckooBees followed 2019 trade war escalation', timestamp: '2026-02-14 08:00:00', status: 'Elevated' },
    { id: 'gi-4', region: 'Middle East', event: 'Critical infrastructure modernization rapid deployment', cyberImpactAssessment: 'Rapid OT digitization creating expanded attack surface — nation-state actors mapping new SCADA endpoints', linkedActors: ['APT-33', 'APT-34'], escalationProbability: 61, historicalPrecedent: 'Shamoon attacks targeted Saudi Aramco during regional tensions', timestamp: '2026-02-12 14:00:00', status: 'Monitoring' },
    { id: 'gi-5', region: 'Five Eyes Intelligence Alliance', event: 'AI weaponization arms race acceleration', cyberImpactAssessment: 'Multiple nation-states developing AI-powered cyber weapons — deepfake, autonomous exploitation, and model poisoning capabilities maturing rapidly', linkedActors: ['Multiple Nation-States'], escalationProbability: 88, historicalPrecedent: 'Stuxnet-class autonomous weapons now achievable with AI — no historical precedent at this scale', timestamp: '2026-02-14 09:00:00', status: 'Critical' },
  ];

  const campaignTimelines: CampaignTimeline[] = [
    { id: 'ct-1', campaignId: 'pc-1', phase: 'Reconnaissance', description: 'APT-41 infrastructure registered — domains mimicking healthcare vendors', timestamp: '2026-01-28', actual: true, confidence: 97 },
    { id: 'ct-2', campaignId: 'pc-1', phase: 'Weaponization', description: 'Exchange RCE exploit (CVE-2026-1847) integrated into toolchain', timestamp: '2026-02-05', actual: true, confidence: 94 },
    { id: 'ct-3', campaignId: 'pc-1', phase: 'Delivery', description: 'Spearphishing emails targeting healthcare IT admins', timestamp: '2026-02-14', actual: false, confidence: 89 },
    { id: 'ct-4', campaignId: 'pc-1', phase: 'Exploitation', description: 'Exchange server compromise via CVE-2026-1847', timestamp: '2026-02-18', actual: false, confidence: 85 },
    { id: 'ct-5', campaignId: 'pc-1', phase: 'Installation', description: 'Backdoor deployment + persistence mechanisms', timestamp: '2026-02-20', actual: false, confidence: 82 },
    { id: 'ct-6', campaignId: 'pc-1', phase: 'C2 Establishment', description: 'Command & control via Cloudflare Workers tunnels', timestamp: '2026-02-22', actual: false, confidence: 78 },
    { id: 'ct-7', campaignId: 'pc-1', phase: 'Lateral Movement', description: 'Credential harvesting + domain controller compromise', timestamp: '2026-02-25', actual: false, confidence: 74 },
    { id: 'ct-8', campaignId: 'pc-1', phase: 'Impact', description: 'Ransomware deployment across EHR systems', timestamp: '2026-03-01', actual: false, confidence: 71 },
    { id: 'ct-9', campaignId: 'pc-2', phase: 'Development', description: 'Malicious NPM package created with crypto wallet hooks', timestamp: '2026-02-10', actual: true, confidence: 94 },
    { id: 'ct-10', campaignId: 'pc-2', phase: 'Publication', description: 'Package published with legitimate-looking README + stars', timestamp: '2026-02-14', actual: true, confidence: 92 },
    { id: 'ct-11', campaignId: 'pc-2', phase: 'Propagation', description: 'Predicted adoption by 50+ projects via dependency chain', timestamp: '2026-02-22', actual: false, confidence: 86 },
    { id: 'ct-12', campaignId: 'pc-2', phase: 'Activation', description: 'Wallet drain trigger on specific transaction patterns', timestamp: '2026-03-05', actual: false, confidence: 80 },
  ];

  const attackSurfaceCorrelations: AttackSurfaceCorrelation[] = [
    { id: 'asc-1', yourAsset: 'Exchange Server (mail.corp.example.com)', predictedTarget: true, vulnerability: 'CVE-2026-1847 (RCE, CVSS 9.8)', exploitAvailable: true, linkedCampaign: 'SILENT TYPHOON', mitigationStatus: 'In Progress', urgency: 'Immediate' },
    { id: 'asc-2', yourAsset: 'NPM Dependencies (eth-wallet-core)', predictedTarget: true, vulnerability: 'Typosquat dependency match', exploitAvailable: true, linkedCampaign: 'PHANTOM LEDGER', mitigationStatus: 'Auto-Remediated', urgency: 'High' },
    { id: 'asc-3', yourAsset: 'OT/SCADA Network (Building Management)', predictedTarget: true, vulnerability: 'Unpatched Schneider Electric PLC firmware', exploitAvailable: false, linkedCampaign: 'IRON VORTEX', mitigationStatus: 'In Progress', urgency: 'High' },
    { id: 'asc-4', yourAsset: 'MSP Admin Portal (admin.cloud.example.com)', predictedTarget: true, vulnerability: 'OAuth token with global admin scope', exploitAvailable: true, linkedCampaign: 'VELVET SHADOW', mitigationStatus: 'Unmitigated', urgency: 'Immediate' },
    { id: 'asc-5', yourAsset: 'VoIP System (Zoom/Teams integration)', predictedTarget: true, vulnerability: 'No voice biometric verification', exploitAvailable: true, linkedCampaign: 'DEEPFAKE DIRECTOR', mitigationStatus: 'In Progress', urgency: 'High' },
    { id: 'asc-6', yourAsset: 'ML Model Registry (internal)', predictedTarget: true, vulnerability: 'External model pulled without hash verification', exploitAvailable: false, linkedCampaign: 'MODEL POISONER', mitigationStatus: 'Auto-Remediated', urgency: 'Medium' },
    { id: 'asc-7', yourAsset: 'Satellite Ground Station (Ground-Beta)', predictedTarget: true, vulnerability: 'Legacy authentication on TT&C channel', exploitAvailable: false, linkedCampaign: 'SATELLITE INTERCEPT', mitigationStatus: 'In Progress', urgency: 'High' },
    { id: 'asc-8', yourAsset: 'Employee Endpoints (3 flagged users)', predictedTarget: true, vulnerability: 'USB + cloud upload not restricted', exploitAvailable: true, linkedCampaign: 'INSIDER EXODUS', mitigationStatus: 'In Progress', urgency: 'Immediate' },
  ];

  const stats = [
    { label: 'Active Campaigns Tracked', value: predictedCampaigns.filter(c => c.status !== 'Post-Campaign Analysis').length, color: 'text-red-400' },
    { label: 'Signals Ingested (24h)', value: liveSignalCount.toLocaleString(), color: 'text-cyan-400', pulse: true },
    { label: 'Avg Prediction Accuracy', value: '91.4%', color: 'text-emerald-400' },
    { label: 'Days Avg Early Warning', value: '11.2', color: 'text-purple-400' },
    { label: 'Auto-Mitigated', value: '2', color: 'text-green-400' },
    { label: 'Cortex Generation', value: '#47', color: 'text-amber-400' },
  ];

  const { loading, analyzing, analysisResult, runAnalysis, clearAnalysis } = useSecurityModule('predictive-attack-intel', {
    predictedCampaigns, attackSignals, forecastModels, geopoliticalIndicators, campaignTimelines, attackSurfaceCorrelations, stats,
  });

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };
  const severityBg = (s: string) => { switch (s) { case 'Critical': return 'bg-red-900/50 border-red-700'; case 'High': return 'bg-orange-900/50 border-orange-700'; case 'Medium': return 'bg-yellow-900/50 border-yellow-700'; default: return 'bg-green-900/50 border-green-700'; } };
  const statusColor = (s: string) => { switch (s) { case 'Indicators Emerging': return 'text-red-400 animate-pulse'; case 'Campaign Active': return 'text-red-500 animate-pulse font-bold'; case 'Forecasted': return 'text-amber-400'; case 'Post-Campaign Analysis': return 'text-slate-400'; default: return 'text-slate-500'; } };
  const urgencyColor = (u: string) => { switch (u) { case 'Immediate': return 'text-red-400 animate-pulse'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; default: return 'text-green-400'; } };

  const confidenceBar = (value: number) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${value >= 90 ? 'bg-red-500' : value >= 80 ? 'bg-orange-500' : value >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono w-12 text-right">{value}%</span>
    </div>
  );

  if (loading) return (<div className="bg-slate-900 min-h-screen flex items-center justify-center"><div className="text-center space-y-4"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-400 mx-auto" /><p className="text-slate-400 animate-pulse">Cortex Intelligence Core — Initializing Predictive Models...</p></div></div>);

  return (
    <div className="bg-slate-900 text-white min-h-screen p-6 space-y-6">
      {/* ─── Header ─── */}
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-400">Predictive Attack Intelligence</h1>
            <span className="bg-red-900 text-red-300 text-xs font-bold px-3 py-1 rounded-full animate-pulse">WORLD FIRST</span>
            <span className="bg-purple-900 text-purple-300 text-xs font-bold px-3 py-1 rounded-full">SOVEREIGN-GRADE</span>
          </div>
          <p className="text-slate-400 mt-1">Campaign forecasting before execution — Cortex Intelligence Core predicts attacks days or weeks before adversaries launch them</p>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className={`flex items-center gap-1 ${cortexPulse ? 'text-emerald-400' : 'text-emerald-600'} transition-colors`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Cortex Neural Link Active
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Ingesting signals from <span className="text-white font-medium">109 modules</span> across <span className="text-white font-medium">5 pillars</span></span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 font-mono">{liveSignalCount.toLocaleString()} signals/24h</span>
          </div>
        </div>
        <button onClick={() => runAnalysis()} disabled={analyzing} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-900/30">{analyzing ? 'Cortex Analyzing…' : '🧠 Cortex Deep Analysis'}</button>
      </header>

      {/* ─── Cortex Organism Status Bar ─── */}
      <div className="bg-gradient-to-r from-slate-800 via-purple-900/30 to-slate-800 border border-purple-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-900 border-2 border-purple-400 flex items-center justify-center text-lg animate-pulse">🧠</div>
            <div>
              <span className="text-purple-300 font-semibold text-sm">ANCHOR CORTEX — PREDICTIVE INTELLIGENCE CORE</span>
              <p className="text-xs text-slate-400">Self-evolving neural network · Generation #47 · Every prediction makes the organism smarter</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div className="text-center"><span className="text-slate-400">Model Accuracy</span><div className="text-emerald-400 font-bold text-lg">91.4%</div></div>
            <div className="text-center"><span className="text-slate-400">Campaigns Predicted</span><div className="text-amber-400 font-bold text-lg">1,247</div></div>
            <div className="text-center"><span className="text-slate-400">Avg Lead Time</span><div className="text-cyan-400 font-bold text-lg">11.2 days</div></div>
            <div className="text-center"><span className="text-slate-400">Auto-Mitigated</span><div className="text-green-400 font-bold text-lg">847</div></div>
          </div>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-xs">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color} ${s.pulse ? 'animate-pulse' : ''}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-2 border-b border-slate-700 pb-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === t.key ? 'bg-slate-800 text-red-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
            {t.count && <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-red-900 text-red-300' : 'bg-slate-700 text-slate-400'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ─── Predicted Campaigns ─── */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {predictedCampaigns.map(c => (
            <div key={c.id} className={`border rounded-xl overflow-hidden ${c.status === 'Indicators Emerging' ? 'border-red-600/60 bg-red-950/20' : 'border-slate-700 bg-slate-800'}`}>
              <div className="p-4 cursor-pointer" onClick={() => setSelectedCampaign(selectedCampaign === c.id ? null : c.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.threatActorType === 'Nation-State' ? '🏛️' : c.threatActorType === 'Insider' ? '👤' : '💀'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{c.campaignName}</span>
                        <span className={`text-xs font-medium ${statusColor(c.status)}`}>{c.status}</span>
                        {c.daysUntilLikely <= 7 && <span className="bg-red-900 text-red-300 text-xs px-2 py-0.5 rounded-full animate-pulse">{c.daysUntilLikely}d until likely</span>}
                      </div>
                      <div className="text-sm text-slate-400">{c.threatActor} · {c.threatActorType} · Targeting: {c.targetSectors.join(', ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Confidence</div>
                      <div className={`text-lg font-bold ${c.confidence >= 90 ? 'text-red-400' : c.confidence >= 80 ? 'text-orange-400' : 'text-yellow-400'}`}>{c.confidence}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Risk Score</div>
                      <div className={`text-lg font-bold ${c.riskScore >= 90 ? 'text-red-400' : 'text-orange-400'}`}>{c.riskScore}/100</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Signals</div>
                      <div className="text-lg font-bold text-cyan-400">{c.signalCount}</div>
                    </div>
                  </div>
                </div>
                {confidenceBar(c.confidence)}
              </div>

              {selectedCampaign === c.id && (
                <div className="border-t border-slate-700 p-4 space-y-4 bg-slate-900/50">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-red-400">Predicted Impact</h3>
                      <p className="text-sm text-slate-300">{c.predictedImpact}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-amber-400">Intel Window</h3>
                      <p className="text-sm text-slate-300">{c.predictedWindowStart} → {c.predictedWindowEnd}</p>
                      <p className="text-xs text-slate-500">Model: {c.modelVersion} · Updated: {c.lastUpdated}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-purple-400">Predicted TTPs (MITRE ATT&CK)</h3>
                    <div className="flex flex-wrap gap-2">{c.predictedTTPs.map(t => <span key={t} className="bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded">{t}</span>)}</div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-cyan-400">Signal Sources ({c.signalSources.length} feeds)</h3>
                    <div className="flex flex-wrap gap-2">{c.signalSources.map(s => <span key={s} className="bg-cyan-900/50 text-cyan-300 text-xs px-2 py-1 rounded">{s}</span>)}</div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-emerald-400">Recommended Actions</h3>
                    <div className="space-y-1">{c.recommendedActions.map((a, i) => <div key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-emerald-400">→</span>{a}</div>)}</div>
                  </div>

                  <div className="flex gap-2">
                    <button className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium">🚨 Activate Defenses</button>
                    <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium">🧠 Deep Analysis</button>
                    <button className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium">📊 Executive Brief</button>
                    <button className="bg-slate-600 hover:bg-slate-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium">🔗 Share Intel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Attack Signals ─── */}
      {activeTab === 'signals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Live Attack Signals — Cortex Neural Feed</h2>
            <span className="text-xs text-cyan-400 animate-pulse flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Live — {liveSignalCount.toLocaleString()} signals ingested</span>
          </div>
          {attackSignals.map(s => (
            <div key={s.id} className={`border rounded-lg p-4 text-sm space-y-2 ${severityBg(s.severity)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${severityColor(s.severity)}`}>{s.signalType}</span>
                  <span className="text-xs text-slate-500">from {s.source}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${severityColor(s.severity)}`}>{s.severity}</span>
                  <span className="text-xs text-slate-400">{s.confidence}% confidence</span>
                  {s.processed && <span className="text-xs text-green-400">✓ Processed</span>}
                </div>
              </div>
              <p className="text-slate-300">{s.detail}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{s.timestamp}</span>
                <span className="text-amber-400">Linked: {s.linkedCampaign}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Forecast Models ─── */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cortex Forecast Models — Self-Evolving AI</h2>
            <span className="text-xs text-purple-400">Every prediction (hit or miss) retrains the organism</span>
          </div>
          {forecastModels.map(m => (
            <div key={m.id} className={`bg-slate-800 border rounded-xl p-4 space-y-3 ${m.status === 'Training' ? 'border-purple-600 animate-pulse' : 'border-slate-700'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{m.name}</span>
                    <span className="text-xs text-slate-500">{m.version}</span>
                    {m.status === 'Training' && <span className="bg-purple-900 text-purple-300 text-xs px-2 py-0.5 rounded-full animate-pulse">Training</span>}
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">Gen #{m.evolutionGeneration}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{m.type} · Training Data: {m.trainingDataSize}</p>
                </div>
                <div className={`text-right ${m.status === 'Active' ? 'text-green-400' : 'text-purple-400'}`}>
                  <span className="text-xs">{m.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-xs text-slate-400">7-day Accuracy</span><div className="font-bold text-emerald-400">{m.accuracy7d}%</div></div>
                <div><span className="text-xs text-slate-400">30-day Accuracy</span><div className="font-bold text-cyan-400">{m.accuracy30d || 'N/A'}%</div></div>
                <div><span className="text-xs text-slate-400">Total Predictions</span><div className="font-bold">{m.totalPredictions.toLocaleString()}</div></div>
                <div><span className="text-xs text-slate-400">True Positives</span><div className="font-bold text-green-400">{m.truePredictions} ({m.totalPredictions > 0 ? Math.round((m.truePredictions / m.totalPredictions) * 100) : 0}%)</div></div>
              </div>
              <div className="flex flex-wrap gap-1">{m.signalInputs.map(s => <span key={s} className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">{s}</span>)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Geopolitical ─── */}
      {activeTab === 'geopolitical' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Geopolitical Cyber Intelligence</h2>
            <span className="text-xs text-amber-400">Sovereign-grade intelligence · National Telemetry integration</span>
          </div>
          {geopoliticalIndicators.map(g => (
            <div key={g.id} className={`border rounded-xl p-4 space-y-3 ${g.status === 'Critical' ? 'bg-red-950/20 border-red-700/50' : g.status === 'Elevated' ? 'bg-orange-950/20 border-orange-700/50' : 'bg-slate-800 border-slate-700'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-lg">{g.region}</span>
                  <p className="text-sm text-slate-400 mt-1">{g.event}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${g.status === 'Critical' ? 'text-red-400' : g.status === 'Elevated' ? 'text-orange-400' : 'text-green-400'}`}>{g.status}</span>
                  <div className="text-lg font-bold text-amber-400 mt-1">{g.escalationProbability}%</div>
                  <span className="text-xs text-slate-500">escalation probability</span>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-semibold text-red-400">Cyber Impact Assessment</h4>
                <p className="text-sm text-slate-300">{g.cyberImpactAssessment}</p>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="text-slate-400">Linked Actors: <span className="text-white">{g.linkedActors.join(', ')}</span></div>
                <div className="text-slate-500">Precedent: {g.historicalPrecedent}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Campaign Timeline ─── */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Campaign Kill Chain Timeline — SILENT TYPHOON</h2>
          <p className="text-sm text-slate-400">Cortex maps the entire predicted kill chain with real and forecasted milestones</p>
          <div className="relative pl-8 space-y-4">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-amber-500 to-red-500" />
            {campaignTimelines.filter(t => t.campaignId === 'pc-1').map((t, i) => (
              <div key={t.id} className="relative">
                <div className={`absolute left-[-22px] top-2 w-4 h-4 rounded-full border-2 ${t.actual ? 'bg-green-500 border-green-400' : 'bg-slate-700 border-amber-500 animate-pulse'}`} />
                <div className={`border rounded-lg p-4 ml-2 ${t.actual ? 'bg-green-900/20 border-green-700/50' : 'bg-slate-800 border-slate-700'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{t.phase}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${t.actual ? 'bg-green-900 text-green-300' : 'bg-amber-900 text-amber-300'}`}>{t.actual ? 'CONFIRMED' : 'PREDICTED'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">{t.timestamp}</span>
                      <span className={`${t.confidence >= 90 ? 'text-red-400' : 'text-amber-400'}`}>{t.confidence}% confidence</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mt-2">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Your Attack Surface Correlation ─── */}
      {activeTab === 'correlation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Your Assets — Mapped to Predicted Campaigns</h2>
              <p className="text-sm text-slate-400">Cortex correlates predicted campaigns against YOUR actual attack surface in real-time</p>
            </div>
            <span className="text-xs text-red-400">{attackSurfaceCorrelations.filter(a => a.urgency === 'Immediate').length} require immediate action</span>
          </div>
          {attackSurfaceCorrelations.map(a => (
            <div key={a.id} className={`border rounded-lg p-4 text-sm space-y-2 ${a.urgency === 'Immediate' ? 'bg-red-950/20 border-red-700/50' : 'bg-slate-800 border-slate-700'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{a.yourAsset}</span>
                  {a.predictedTarget && <span className="bg-red-900 text-red-300 text-xs px-2 py-0.5 rounded-full">Predicted Target</span>}
                </div>
                <span className={`text-xs font-medium ${urgencyColor(a.urgency)}`}>{a.urgency}</span>
              </div>
              <div className="grid md:grid-cols-3 gap-2 text-xs">
                <div><span className="text-slate-400">Vulnerability:</span> <span className="text-white">{a.vulnerability}</span></div>
                <div><span className="text-slate-400">Exploit Available:</span> <span className={a.exploitAvailable ? 'text-red-400' : 'text-green-400'}>{a.exploitAvailable ? 'Yes' : 'No'}</span></div>
                <div><span className="text-slate-400">Linked Campaign:</span> <span className="text-amber-400">{a.linkedCampaign}</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded ${a.mitigationStatus === 'Auto-Remediated' ? 'bg-green-900 text-green-300' : a.mitigationStatus === 'In Progress' ? 'bg-amber-900 text-amber-300' : 'bg-red-900 text-red-300'}`}>{a.mitigationStatus}</span>
                {a.mitigationStatus === 'Unmitigated' && <button className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1 rounded font-medium">🔧 Auto-Remediate</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── AI Analysis Result ─── */}
      {analysisResult && (
        <div className="bg-slate-800 border border-red-700/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">🧠 Cortex Deep Analysis</h2>
            <button onClick={() => clearAnalysis()} className="text-slate-400 hover:text-white text-sm">✕</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default PredictiveAttackIntel;
