// ============================================================================
// NATIONAL-SCALE TELEMETRY — WORLD-FIRST SOVEREIGN CYBER INTELLIGENCE
// Anchor is the first platform to offer built-in national-scale telemetry
// with cross-industry threat correlation, early-warning signals, attack-wave
// prediction, and national cyber-risk scoring — sovereign-grade intelligence
// that no other vendor provides as a built-in module.
// ============================================================================

import React, { useState, useEffect } from 'react';

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

interface SectorHealth {
  id: string;
  name: string;
  riskScore: number;
  activeThreats: number;
  incidents24h: number;
  status: 'critical' | 'elevated' | 'guarded' | 'low';
  trend: 'rising' | 'stable' | 'declining';
  icon: string;
}

interface CrossIndustryCorrelation {
  id: string;
  sourceSector: string;
  targetSector: string;
  threatType: string;
  correlationStrength: number;
  description: string;
  firstSeen: string;
  status: 'active' | 'monitoring' | 'resolved';
}

interface EarlyWarningSignal {
  id: string;
  title: string;
  threatActor: string;
  confidence: number;
  sectorsTargeted: string[];
  predictedWindow: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  indicatorCount: number;
  lastUpdated: string;
}

interface AttackWavePrediction {
  id: string;
  campaignName: string;
  predictedStart: string;
  predictedPeak: string;
  targetSectors: string[];
  confidence: number;
  threatType: string;
  countryOrigin: string;
  estimatedImpact: string;
  ttps: string[];
  status: 'imminent' | 'developing' | 'potential' | 'historical';
}

interface SectorRiskScore {
  id: string;
  sector: string;
  overallScore: number;
  trendData: number[];
  region: string;
  primaryThreat: string;
  change7d: number;
  change30d: number;
  vulnerabilityIndex: number;
  readinessScore: number;
}

interface NationalOverviewStats {
  nationalRiskScore: number;
  riskTrend: number[];
  totalActiveThreats: number;
  totalIncidents24h: number;
  sectorsAtCritical: number;
  sectorsElevated: number;
  activeCorrelations: number;
  earlyWarnings: number;
  predictedCampaigns: number;
  lastUpdated: string;
}

type TabId = 'overview' | 'correlation' | 'earlyWarning' | 'attackWave' | 'riskScoring';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const SECTOR_HEALTH_DATA: SectorHealth[] = [
  { id: 's1', name: 'Energy & Utilities', riskScore: 78, activeThreats: 14, incidents24h: 3, status: 'critical', trend: 'rising', icon: '⚡' },
  { id: 's2', name: 'Financial Services', riskScore: 72, activeThreats: 22, incidents24h: 7, status: 'elevated', trend: 'rising', icon: '🏦' },
  { id: 's3', name: 'Healthcare', riskScore: 81, activeThreats: 18, incidents24h: 5, status: 'critical', trend: 'rising', icon: '🏥' },
  { id: 's4', name: 'Defence & Military', riskScore: 45, activeThreats: 8, incidents24h: 1, status: 'guarded', trend: 'stable', icon: '🛡️' },
  { id: 's5', name: 'Telecommunications', riskScore: 69, activeThreats: 11, incidents24h: 4, status: 'elevated', trend: 'stable', icon: '📡' },
  { id: 's6', name: 'Transportation', riskScore: 63, activeThreats: 9, incidents24h: 2, status: 'elevated', trend: 'declining', icon: '✈️' },
  { id: 's7', name: 'Water Systems', riskScore: 74, activeThreats: 6, incidents24h: 2, status: 'elevated', trend: 'rising', icon: '💧' },
  { id: 's8', name: 'Government Services', riskScore: 58, activeThreats: 15, incidents24h: 3, status: 'elevated', trend: 'stable', icon: '🏛️' },
  { id: 's9', name: 'Education', riskScore: 52, activeThreats: 7, incidents24h: 2, status: 'guarded', trend: 'stable', icon: '🎓' },
  { id: 's10', name: 'Manufacturing', riskScore: 66, activeThreats: 10, incidents24h: 3, status: 'elevated', trend: 'rising', icon: '🏭' },
  { id: 's11', name: 'Food & Agriculture', riskScore: 41, activeThreats: 4, incidents24h: 1, status: 'guarded', trend: 'declining', icon: '🌾' },
  { id: 's12', name: 'Chemical Facilities', riskScore: 70, activeThreats: 5, incidents24h: 1, status: 'elevated', trend: 'stable', icon: '⚗️' },
  { id: 's13', name: 'Nuclear Facilities', riskScore: 38, activeThreats: 2, incidents24h: 0, status: 'low', trend: 'stable', icon: '☢️' },
  { id: 's14', name: 'Space Systems', riskScore: 55, activeThreats: 3, incidents24h: 1, status: 'guarded', trend: 'rising', icon: '🚀' },
  { id: 's15', name: 'Media & Broadcasting', riskScore: 49, activeThreats: 6, incidents24h: 2, status: 'guarded', trend: 'stable', icon: '📺' },
  { id: 's16', name: 'Emergency Services', riskScore: 61, activeThreats: 5, incidents24h: 1, status: 'elevated', trend: 'declining', icon: '🚨' },
];

const CROSS_INDUSTRY_CORRELATIONS: CrossIndustryCorrelation[] = [
  {
    id: 'c1', sourceSector: 'Energy & Utilities', targetSector: 'Water Systems',
    threatType: 'ICS/SCADA Exploitation', correlationStrength: 94,
    description: 'Shared SCADA vulnerabilities exploited by same threat actor group across energy grids and water treatment facilities. Identical C2 infrastructure observed.',
    firstSeen: '2026-01-14', status: 'active',
  },
  {
    id: 'c2', sourceSector: 'Financial Services', targetSector: 'Telecommunications',
    threatType: 'Supply Chain Compromise', correlationStrength: 87,
    description: 'Compromised telecom API gateway used as pivot point into banking transaction networks. Same malware family detected in both sectors.',
    firstSeen: '2026-01-22', status: 'active',
  },
  {
    id: 'c3', sourceSector: 'Healthcare', targetSector: 'Government Services',
    threatType: 'Ransomware-as-a-Service', correlationStrength: 79,
    description: 'LockBit 4.0 variant simultaneously targeting NHS digital infrastructure and local government portals using identical initial access vectors.',
    firstSeen: '2026-02-01', status: 'active',
  },
  {
    id: 'c4', sourceSector: 'Defence & Military', targetSector: 'Space Systems',
    threatType: 'APT Espionage', correlationStrength: 91,
    description: 'Nation-state actor conducting parallel espionage campaigns against satellite communication providers and defence contractors. Shared zero-day exploit chain.',
    firstSeen: '2025-12-18', status: 'monitoring',
  },
  {
    id: 'c5', sourceSector: 'Manufacturing', targetSector: 'Transportation',
    threatType: 'Firmware Implant', correlationStrength: 73,
    description: 'Malicious firmware discovered in industrial PLCs shared between automotive manufacturing lines and rail signalling systems.',
    firstSeen: '2026-01-30', status: 'active',
  },
  {
    id: 'c6', sourceSector: 'Education', targetSector: 'Healthcare',
    threatType: 'Data Exfiltration', correlationStrength: 68,
    description: 'University research networks used as staging ground for exfiltrating clinical trial data from partnered hospitals. Common credential harvesting methodology.',
    firstSeen: '2026-02-05', status: 'monitoring',
  },
  {
    id: 'c7', sourceSector: 'Chemical Facilities', targetSector: 'Energy & Utilities',
    threatType: 'Destructive Malware', correlationStrength: 82,
    description: 'Wiper malware targeting industrial safety systems found in both petrochemical plants and power generation facilities. Likely coordinated attack preparation.',
    firstSeen: '2026-02-03', status: 'active',
  },
  {
    id: 'c8', sourceSector: 'Financial Services', targetSector: 'Government Services',
    threatType: 'Credential Harvesting', correlationStrength: 76,
    description: 'Phishing infrastructure targeting government employees reuses domain patterns and SSL certificates seen in banking sector attacks.',
    firstSeen: '2026-01-28', status: 'monitoring',
  },
];

const EARLY_WARNING_SIGNALS: EarlyWarningSignal[] = [
  {
    id: 'ew1', title: 'Coordinated ICS Attack Campaign — Energy Sector',
    threatActor: 'VOLT TYPHOON', confidence: 92,
    sectorsTargeted: ['Energy & Utilities', 'Water Systems', 'Chemical Facilities'],
    predictedWindow: '48–72 hours', severity: 'critical',
    description: 'Intelligence suggests imminent coordinated attack on Western energy infrastructure using novel living-off-the-land techniques.',
    indicatorCount: 347, lastUpdated: '12 min ago',
  },
  {
    id: 'ew2', title: 'Ransomware Wave Targeting Healthcare',
    threatActor: 'SCATTERED SPIDER', confidence: 85,
    sectorsTargeted: ['Healthcare', 'Education'],
    predictedWindow: '3–5 days', severity: 'high',
    description: 'Dark web chatter and infrastructure buildup indicate upcoming ransomware campaign against hospital networks.',
    indicatorCount: 218, lastUpdated: '34 min ago',
  },
  {
    id: 'ew3', title: 'Financial Sector DDoS Preparation',
    threatActor: 'ANONYMOUS SUDAN', confidence: 78,
    sectorsTargeted: ['Financial Services', 'Telecommunications'],
    predictedWindow: '1–2 weeks', severity: 'high',
    description: 'Botnet expansion detected with configuration targeting major banking endpoints and payment processing gateways.',
    indicatorCount: 156, lastUpdated: '1 hour ago',
  },
  {
    id: 'ew4', title: 'Satellite Communication Disruption Threat',
    threatActor: 'SANDWORM', confidence: 71,
    sectorsTargeted: ['Space Systems', 'Defence & Military', 'Telecommunications'],
    predictedWindow: '1–3 weeks', severity: 'medium',
    description: 'Reconnaissance activity against ground station infrastructure. Pattern matches pre-attack behaviour from 2024 campaigns.',
    indicatorCount: 89, lastUpdated: '2 hours ago',
  },
  {
    id: 'ew5', title: 'Supply Chain Poisoning — NPM Ecosystem',
    threatActor: 'LAZARUS GROUP', confidence: 88,
    sectorsTargeted: ['Financial Services', 'Government Services', 'Manufacturing'],
    predictedWindow: '24–48 hours', severity: 'critical',
    description: 'Compromised maintainer accounts detected. Malicious packages staged for publication targeting CI/CD pipelines.',
    indicatorCount: 412, lastUpdated: '8 min ago',
  },
  {
    id: 'ew6', title: 'Election Infrastructure Reconnaissance',
    threatActor: 'APT28 (FANCY BEAR)', confidence: 67,
    sectorsTargeted: ['Government Services', 'Media & Broadcasting'],
    predictedWindow: '2–4 weeks', severity: 'medium',
    description: 'Scanning activity detected against voter registration databases and media outlet CMS platforms.',
    indicatorCount: 73, lastUpdated: '4 hours ago',
  },
  {
    id: 'ew7', title: 'Zero-Day Broker Activity — Critical Infrastructure',
    threatActor: 'UNKNOWN (Broker Network)', confidence: 74,
    sectorsTargeted: ['Energy & Utilities', 'Nuclear Facilities', 'Water Systems'],
    predictedWindow: '1–2 weeks', severity: 'high',
    description: 'Underground marketplace activity suggests sale of unpatched vulnerabilities affecting Siemens and Schneider Electric SCADA systems.',
    indicatorCount: 64, lastUpdated: '3 hours ago',
  },
];

const ATTACK_WAVE_PREDICTIONS: AttackWavePrediction[] = [
  {
    id: 'aw1', campaignName: 'Operation Blackout', predictedStart: '2026-02-11', predictedPeak: '2026-02-14',
    targetSectors: ['Energy & Utilities', 'Water Systems'], confidence: 89,
    threatType: 'Destructive / Wiper', countryOrigin: 'Russia',
    estimatedImpact: 'Potential cascading infrastructure failures across 3+ regions',
    ttps: ['T1495 — Firmware Corruption', 'T1485 — Data Destruction', 'T1562 — Impair Defences'],
    status: 'imminent',
  },
  {
    id: 'aw2', campaignName: 'Silent Ledger', predictedStart: '2026-02-13', predictedPeak: '2026-02-18',
    targetSectors: ['Financial Services', 'Telecommunications'], confidence: 82,
    threatType: 'Espionage / Data Theft', countryOrigin: 'China',
    estimatedImpact: 'Exfiltration of trading algorithms and customer PII from tier-1 banks',
    ttps: ['T1190 — Exploit Public-Facing App', 'T1059 — Command Scripting', 'T1048 — Exfiltration Over Alt Protocol'],
    status: 'developing',
  },
  {
    id: 'aw3', campaignName: 'MedusaLock 3.0', predictedStart: '2026-02-15', predictedPeak: '2026-02-20',
    targetSectors: ['Healthcare', 'Education', 'Government Services'], confidence: 76,
    threatType: 'Ransomware', countryOrigin: 'Multi-origin (RaaS)',
    estimatedImpact: 'Estimated 200+ hospitals and universities targeted simultaneously',
    ttps: ['T1566 — Phishing', 'T1486 — Data Encrypted for Impact', 'T1490 — Inhibit System Recovery'],
    status: 'developing',
  },
  {
    id: 'aw4', campaignName: 'Orbital Strike', predictedStart: '2026-02-20', predictedPeak: '2026-03-01',
    targetSectors: ['Space Systems', 'Defence & Military'], confidence: 64,
    threatType: 'APT / Sabotage', countryOrigin: 'Russia',
    estimatedImpact: 'Disruption of GPS augmentation and military satellite communications',
    ttps: ['T1498 — Network DoS', 'T1583 — Acquire Infrastructure', 'T1195 — Supply Chain Compromise'],
    status: 'potential',
  },
  {
    id: 'aw5', campaignName: 'PackagePhantom', predictedStart: '2026-02-10', predictedPeak: '2026-02-12',
    targetSectors: ['Financial Services', 'Manufacturing', 'Government Services'], confidence: 91,
    threatType: 'Supply Chain', countryOrigin: 'North Korea',
    estimatedImpact: 'Backdoor implantation via compromised open-source dependencies in production systems',
    ttps: ['T1195.002 — Compromise Software Supply Chain', 'T1059.007 — JavaScript', 'T1071 — Application Layer Protocol'],
    status: 'imminent',
  },
  {
    id: 'aw6', campaignName: 'Iron Veil', predictedStart: '2026-03-01', predictedPeak: '2026-03-10',
    targetSectors: ['Telecommunications', 'Media & Broadcasting'], confidence: 58,
    threatType: 'Information Warfare', countryOrigin: 'Iran',
    estimatedImpact: 'Coordinated disinformation campaign paired with DDoS on news outlets',
    ttps: ['T1498 — Network DoS', 'T1583 — Acquire Infrastructure', 'T1566 — Phishing'],
    status: 'potential',
  },
  {
    id: 'aw7', campaignName: 'GridFall', predictedStart: '2026-02-25', predictedPeak: '2026-03-05',
    targetSectors: ['Energy & Utilities', 'Transportation', 'Manufacturing'], confidence: 71,
    threatType: 'ICS/OT Attack', countryOrigin: 'China',
    estimatedImpact: 'Targeted disruption of industrial control systems in manufacturing corridors',
    ttps: ['T1071 — Application Layer Protocol', 'T1105 — Ingress Tool Transfer', 'T1562 — Impair Defences'],
    status: 'developing',
  },
];

const SECTOR_RISK_SCORES: SectorRiskScore[] = [
  { id: 'sr1', sector: 'Energy & Utilities', overallScore: 78, trendData: [62, 65, 68, 71, 74, 76, 78], region: 'National', primaryThreat: 'ICS Exploitation', change7d: 4, change30d: 12, vulnerabilityIndex: 82, readinessScore: 61 },
  { id: 'sr2', sector: 'Financial Services', overallScore: 72, trendData: [68, 67, 69, 70, 71, 73, 72], region: 'National', primaryThreat: 'Supply Chain', change7d: 1, change30d: 5, vulnerabilityIndex: 68, readinessScore: 79 },
  { id: 'sr3', sector: 'Healthcare', overallScore: 81, trendData: [59, 63, 67, 72, 75, 78, 81], region: 'National', primaryThreat: 'Ransomware', change7d: 6, change30d: 19, vulnerabilityIndex: 88, readinessScore: 44 },
  { id: 'sr4', sector: 'Defence & Military', overallScore: 45, trendData: [48, 47, 46, 46, 45, 45, 45], region: 'National', primaryThreat: 'APT Espionage', change7d: 0, change30d: -3, vulnerabilityIndex: 35, readinessScore: 92 },
  { id: 'sr5', sector: 'Telecommunications', overallScore: 69, trendData: [64, 65, 66, 67, 68, 69, 69], region: 'National', primaryThreat: 'DDoS / Interception', change7d: 1, change30d: 4, vulnerabilityIndex: 71, readinessScore: 72 },
  { id: 'sr6', sector: 'Water Systems', overallScore: 74, trendData: [58, 61, 64, 67, 70, 72, 74], region: 'National', primaryThreat: 'SCADA Tampering', change7d: 3, change30d: 13, vulnerabilityIndex: 79, readinessScore: 48 },
  { id: 'sr7', sector: 'Government Services', overallScore: 58, trendData: [55, 56, 56, 57, 57, 58, 58], region: 'National', primaryThreat: 'Credential Theft', change7d: 0, change30d: 2, vulnerabilityIndex: 62, readinessScore: 69 },
  { id: 'sr8', sector: 'Manufacturing', overallScore: 66, trendData: [60, 61, 63, 64, 65, 65, 66], region: 'National', primaryThreat: 'Firmware Implant', change7d: 1, change30d: 5, vulnerabilityIndex: 70, readinessScore: 55 },
];

const INITIAL_OVERVIEW: NationalOverviewStats = {
  nationalRiskScore: 67,
  riskTrend: [52, 55, 58, 60, 62, 64, 67],
  totalActiveThreats: 143,
  totalIncidents24h: 37,
  sectorsAtCritical: 2,
  sectorsElevated: 7,
  activeCorrelations: 5,
  earlyWarnings: 7,
  predictedCampaigns: 7,
  lastUpdated: new Date().toLocaleTimeString(),
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

const getRiskColor = (score: number): string => {
  if (score >= 80) return 'text-red-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-green-400';
};

const getRiskBg = (score: number): string => {
  if (score >= 80) return 'bg-red-500/20 border-red-500/40';
  if (score >= 60) return 'bg-orange-500/20 border-orange-500/40';
  if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/40';
  return 'bg-green-500/20 border-green-500/40';
};

const getStatusBadge = (status: string): string => {
  switch (status) {
    case 'critical': return 'bg-red-500/20 text-red-400 border border-red-500/40';
    case 'elevated': return 'bg-orange-500/20 text-orange-400 border border-orange-500/40';
    case 'guarded': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40';
    case 'low': return 'bg-green-500/20 text-green-400 border border-green-500/40';
    case 'active': return 'bg-red-500/20 text-red-400 border border-red-500/40';
    case 'monitoring': return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
    case 'resolved': return 'bg-green-500/20 text-green-400 border border-green-500/40';
    case 'imminent': return 'bg-red-500/20 text-red-300 border border-red-500/50';
    case 'developing': return 'bg-orange-500/20 text-orange-300 border border-orange-500/50';
    case 'potential': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50';
    case 'historical': return 'bg-slate-500/20 text-slate-400 border border-slate-500/40';
    default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/40';
  }
};

const getSeverityBadge = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'bg-red-600/30 text-red-300 border border-red-500/50';
    case 'high': return 'bg-orange-600/30 text-orange-300 border border-orange-500/50';
    case 'medium': return 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/50';
    case 'low': return 'bg-green-600/30 text-green-300 border border-green-500/50';
    default: return 'bg-slate-600/30 text-slate-300 border border-slate-500/50';
  }
};

const getTrendArrow = (trend: string): string => {
  if (trend === 'rising') return '▲';
  if (trend === 'declining') return '▼';
  return '—';
};

const getTrendColor = (trend: string): string => {
  if (trend === 'rising') return 'text-red-400';
  if (trend === 'declining') return 'text-green-400';
  return 'text-slate-400';
};

const renderMiniSparkline = (data: number[]): string => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const bars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  return data.map(v => bars[Math.round(((v - min) / range) * 7)]).join('');
};

const getOriginFlag = (country: string): string => {
  switch (country) {
    case 'Russia': return '🇷🇺';
    case 'China': return '🇨🇳';
    case 'North Korea': return '🇰🇵';
    case 'Iran': return '🇮🇷';
    default: return '🌐';
  }
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const NationalTelemetryLayer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [overview, setOverview] = useState<NationalOverviewStats>(INITIAL_OVERVIEW);
  const [sectors, setSectors] = useState<SectorHealth[]>(SECTOR_HEALTH_DATA);
  const [pulseKey, setPulseKey] = useState(0);

  // Simulated real-time updating
  useEffect(() => {
    const interval = setInterval(() => {
      setOverview(prev => {
        const jitter = (base: number, range: number) => Math.max(0, base + Math.floor(Math.random() * range * 2) - range);
        const newScore = Math.min(100, Math.max(0, prev.nationalRiskScore + (Math.random() > 0.5 ? 1 : -1)));
        return {
          ...prev,
          nationalRiskScore: newScore,
          riskTrend: [...prev.riskTrend.slice(1), newScore],
          totalActiveThreats: jitter(prev.totalActiveThreats, 3),
          totalIncidents24h: jitter(prev.totalIncidents24h, 2),
          lastUpdated: new Date().toLocaleTimeString(),
        };
      });

      setSectors(prev =>
        prev.map(s => ({
          ...s,
          riskScore: Math.min(100, Math.max(0, s.riskScore + (Math.random() > 0.6 ? 1 : Math.random() < 0.3 ? -1 : 0))),
          activeThreats: Math.max(0, s.activeThreats + (Math.random() > 0.7 ? 1 : Math.random() < 0.2 ? -1 : 0)),
        }))
      );

      setPulseKey(k => k + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // -------------------------------------------------------------------------
  // Tab definitions
  // -------------------------------------------------------------------------
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'National Overview', icon: '🌐' },
    { id: 'correlation', label: 'Cross-Industry Correlation', icon: '🔗' },
    { id: 'earlyWarning', label: 'Early Warning System', icon: '⚠️' },
    { id: 'attackWave', label: 'Attack Wave Prediction', icon: '🌊' },
    { id: 'riskScoring', label: 'National Risk Scoring', icon: '📊' },
  ];

  // -------------------------------------------------------------------------
  // Render: National Overview
  // -------------------------------------------------------------------------
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* National Risk Score — Large */}
        <div className={`col-span-1 md:col-span-2 rounded-xl border p-6 ${getRiskBg(overview.nationalRiskScore)} relative overflow-hidden`}>
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-widest">
              SOVEREIGN GRADE
            </span>
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">National Cyber Risk Score</p>
          <div className="flex items-end gap-4">
            <span className={`text-7xl font-black tabular-nums ${getRiskColor(overview.nationalRiskScore)}`}>
              {overview.nationalRiskScore}
            </span>
            <span className="text-2xl text-slate-500 mb-2">/100</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-slate-500">7-day trend</span>
            <span className="text-sm font-mono text-cyan-400 tracking-wider">
              {renderMiniSparkline(overview.riskTrend)}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${overview.nationalRiskScore}%`,
                background: overview.nationalRiskScore >= 80 ? 'linear-gradient(90deg, #f87171, #dc2626)' :
                  overview.nationalRiskScore >= 60 ? 'linear-gradient(90deg, #fbbf24, #f97316)' :
                  overview.nationalRiskScore >= 40 ? 'linear-gradient(90deg, #4ade80, #facc15)' :
                  'linear-gradient(90deg, #22d3ee, #4ade80)',
              }}
            />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Active Threats</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{overview.totalActiveThreats}</p>
          <p className="text-xs text-slate-500 mt-1">across all sectors</p>
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Incidents (24h)</p>
          <p className="text-3xl font-bold text-orange-400 mt-1">{overview.totalIncidents24h}</p>
          <p className="text-xs text-slate-500 mt-1">national total</p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Sectors Critical', value: overview.sectorsAtCritical, color: 'text-red-400' },
          { label: 'Sectors Elevated', value: overview.sectorsElevated, color: 'text-orange-400' },
          { label: 'Active Correlations', value: overview.activeCorrelations, color: 'text-purple-400' },
          { label: 'Early Warnings', value: overview.earlyWarnings, color: 'text-yellow-400' },
          { label: 'Predicted Campaigns', value: overview.predictedCampaigns, color: 'text-cyan-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-lg border border-slate-700/40 bg-slate-800/40 p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sector Health Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Critical Infrastructure Sector Health — 16 Sectors
          </h3>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-widest">
            WORLD FIRST
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {sectors.map(sector => (
            <div
              key={sector.id}
              className={`rounded-lg border p-3 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                sector.status === 'critical' ? 'border-red-500/40 bg-red-500/5' :
                sector.status === 'elevated' ? 'border-orange-500/30 bg-orange-500/5' :
                'border-slate-700/40 bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{sector.icon}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusBadge(sector.status)}`}>
                  {sector.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-300 truncate">{sector.name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xl font-bold ${getRiskColor(sector.riskScore)}`}>{sector.riskScore}</span>
                <div className="text-right">
                  <span className={`text-xs ${getTrendColor(sector.trend)}`}>
                    {getTrendArrow(sector.trend)} {sector.trend}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  {sector.activeThreats > 10 && (
                    <span key={pulseKey} className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                  {sector.activeThreats} threats
                </span>
                <span>{sector.incidents24h} incidents</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-slate-600 text-right">Last updated: {overview.lastUpdated} · Live telemetry feed</p>
    </div>
  );

  // -------------------------------------------------------------------------
  // Render: Cross-Industry Correlation
  // -------------------------------------------------------------------------
  const renderCorrelation = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Cross-Industry Threat Correlations</h3>
          <p className="text-xs text-slate-500 mt-0.5">AI-driven detection of threats that span multiple critical infrastructure sectors</p>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-widest">
          WORLD FIRST
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CROSS_INDUSTRY_CORRELATIONS.map(corr => (
          <div
            key={corr.id}
            className={`rounded-xl border p-4 transition-all duration-300 hover:border-cyan-500/40 ${
              corr.status === 'active' ? 'border-red-500/30 bg-slate-800/70' : 'border-slate-700/40 bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusBadge(corr.status)}`}>
                  {corr.status.toUpperCase()}
                </span>
                {corr.status === 'active' && (
                  <span key={pulseKey} className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <span className="text-xs text-slate-500">First seen: {corr.firstSeen}</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{corr.sourceSector}</span>
              <span className="text-slate-500">→</span>
              <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{corr.targetSector}</span>
            </div>

            <p className="text-xs font-medium text-slate-300 mb-1">{corr.threatType}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{corr.description}</p>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase">Correlation Strength</span>
                <div className="w-24 bg-slate-700/50 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-linear-to-r from-cyan-500 to-purple-500 transition-all"
                    style={{ width: `${corr.correlationStrength}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${corr.correlationStrength >= 80 ? 'text-red-400' : 'text-orange-400'}`}>
                  {corr.correlationStrength}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // Render: Early Warning System
  // -------------------------------------------------------------------------
  const renderEarlyWarning = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">National Early Warning System</h3>
          <p className="text-xs text-slate-500 mt-0.5">Predictive intelligence on imminent and emerging cyber threats</p>
        </div>
        <div className="flex items-center gap-2">
          <span key={pulseKey} className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-400 font-medium">{EARLY_WARNING_SIGNALS.filter(w => w.severity === 'critical').length} Critical Alerts</span>
        </div>
      </div>

      <div className="space-y-3">
        {EARLY_WARNING_SIGNALS.map(signal => (
          <div
            key={signal.id}
            className={`rounded-xl border p-4 transition-all duration-300 hover:border-cyan-500/30 ${
              signal.severity === 'critical' ? 'border-red-500/40 bg-red-500/5' :
              signal.severity === 'high' ? 'border-orange-500/30 bg-orange-500/5' :
              'border-slate-700/40 bg-slate-800/40'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${getSeverityBadge(signal.severity)}`}>
                    {signal.severity}
                  </span>
                  {signal.severity === 'critical' && (
                    <span key={pulseKey} className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <span className="text-[10px] text-slate-500">Updated {signal.lastUpdated}</span>
                </div>

                <h4 className="text-sm font-semibold text-slate-200 mb-1">{signal.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{signal.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {signal.sectorsTargeted.map((sector, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/40">
                      {sector}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Threat Actor</p>
                    <p className="text-xs font-medium text-red-400">{signal.threatActor}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
                    <p className={`text-xs font-bold ${signal.confidence >= 85 ? 'text-red-400' : signal.confidence >= 70 ? 'text-orange-400' : 'text-yellow-400'}`}>
                      {signal.confidence}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Predicted Window</p>
                    <p className="text-xs font-medium text-cyan-400">{signal.predictedWindow}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Indicators</p>
                    <p className="text-xs font-medium text-purple-400">{signal.indicatorCount} IoCs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // Render: Attack Wave Prediction
  // -------------------------------------------------------------------------
  const renderAttackWave = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Attack Wave Prediction Engine</h3>
          <p className="text-xs text-slate-500 mt-0.5">AI-driven campaign forecasting with MITRE ATT&CK mapping</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-widest">
            SOVEREIGN GRADE
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-widest">
            WORLD FIRST
          </span>
        </div>
      </div>

      {/* Imminent banner */}
      {ATTACK_WAVE_PREDICTIONS.filter(p => p.status === 'imminent').length > 0 && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 flex items-center gap-3">
          <span key={pulseKey} className="inline-block h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-bold text-red-300">
            {ATTACK_WAVE_PREDICTIONS.filter(p => p.status === 'imminent').length} IMMINENT ATTACK CAMPAIGN(S) DETECTED
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700/50 text-left">
              <th className="px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider">Campaign</th>
              <th className="px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider">Origin</th>
              <th className="px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider">Predicted Start</th>
              <th className="px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider">Peak</th>
              <th className="px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider">Confidence</th>
              <th className="px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider">Targets</th>
            </tr>
          </thead>
          <tbody>
            {ATTACK_WAVE_PREDICTIONS.sort((a, b) => {
              const order = { imminent: 0, developing: 1, potential: 2, historical: 3 };
              return order[a.status] - order[b.status];
            }).map(pred => (
              <tr key={pred.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                <td className="px-3 py-3">
                  <span className="flex items-center gap-1.5">
                    {pred.status === 'imminent' && (
                      <span key={pulseKey} className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadge(pred.status)}`}>
                      {pred.status}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3 font-semibold text-slate-200">{pred.campaignName}</td>
                <td className="px-3 py-3">
                  <span className="flex items-center gap-1">
                    <span>{getOriginFlag(pred.countryOrigin)}</span>
                    <span className="text-slate-400">{pred.countryOrigin}</span>
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-400">{pred.threatType}</td>
                <td className="px-3 py-3 text-cyan-400 font-mono">{pred.predictedStart}</td>
                <td className="px-3 py-3 text-orange-400 font-mono">{pred.predictedPeak}</td>
                <td className="px-3 py-3">
                  <span className={`font-bold ${pred.confidence >= 85 ? 'text-red-400' : pred.confidence >= 70 ? 'text-orange-400' : 'text-yellow-400'}`}>
                    {pred.confidence}%
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {pred.targetSectors.map((s, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-600/30">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Campaign Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {ATTACK_WAVE_PREDICTIONS.filter(p => p.status === 'imminent' || p.status === 'developing').map(pred => (
          <div
            key={pred.id}
            className={`rounded-xl border p-4 ${
              pred.status === 'imminent' ? 'border-red-500/40 bg-red-500/5' : 'border-orange-500/30 bg-orange-500/5'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-200">{pred.campaignName}</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadge(pred.status)}`}>
                {pred.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{pred.estimatedImpact}</p>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">MITRE ATT&CK TTPs</p>
              <div className="flex flex-wrap gap-1">
                {pred.ttps.map((ttp, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono">
                    {ttp}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-slate-500">Origin</p>
                <p className="text-xs text-slate-300">{getOriginFlag(pred.countryOrigin)} {pred.countryOrigin}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Window</p>
                <p className="text-xs text-cyan-400 font-mono">{pred.predictedStart} → {pred.predictedPeak}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Confidence</p>
                <p className={`text-xs font-bold ${pred.confidence >= 85 ? 'text-red-400' : 'text-orange-400'}`}>{pred.confidence}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // Render: National Risk Scoring
  // -------------------------------------------------------------------------
  const renderRiskScoring = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">National Risk Scoring by Sector</h3>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive risk quantification with trend analysis and readiness assessment</p>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-widest">
          WORLD FIRST
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{SECTOR_RISK_SCORES.filter(s => s.overallScore >= 75).length}</p>
          <p className="text-[10px] text-slate-500 uppercase">High-Risk Sectors</p>
        </div>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 text-center">
          <p className="text-2xl font-bold text-orange-400">
            {Math.round(SECTOR_RISK_SCORES.reduce((a, b) => a + b.overallScore, 0) / SECTOR_RISK_SCORES.length)}
          </p>
          <p className="text-[10px] text-slate-500 uppercase">Avg Risk Score</p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-center">
          <p className="text-2xl font-bold text-green-400">
            {Math.round(SECTOR_RISK_SCORES.reduce((a, b) => a + b.readinessScore, 0) / SECTOR_RISK_SCORES.length)}%
          </p>
          <p className="text-[10px] text-slate-500 uppercase">Avg Readiness</p>
        </div>
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 text-center">
          <p className="text-2xl font-bold text-cyan-400">{SECTOR_RISK_SCORES.filter(s => s.change7d > 0).length}</p>
          <p className="text-[10px] text-slate-500 uppercase">Sectors Rising</p>
        </div>
      </div>

      {/* Risk Table */}
      <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/60">
              <th className="px-4 py-3 text-left text-[10px] text-slate-500 uppercase tracking-wider">Sector</th>
              <th className="px-4 py-3 text-center text-[10px] text-slate-500 uppercase tracking-wider">Risk Score</th>
              <th className="px-4 py-3 text-center text-[10px] text-slate-500 uppercase tracking-wider">7-Day Trend</th>
              <th className="px-4 py-3 text-center text-[10px] text-slate-500 uppercase tracking-wider">Δ 7d</th>
              <th className="px-4 py-3 text-center text-[10px] text-slate-500 uppercase tracking-wider">Δ 30d</th>
              <th className="px-4 py-3 text-left text-[10px] text-slate-500 uppercase tracking-wider">Primary Threat</th>
              <th className="px-4 py-3 text-center text-[10px] text-slate-500 uppercase tracking-wider">Vulnerability</th>
              <th className="px-4 py-3 text-center text-[10px] text-slate-500 uppercase tracking-wider">Readiness</th>
            </tr>
          </thead>
          <tbody>
            {SECTOR_RISK_SCORES.sort((a, b) => b.overallScore - a.overallScore).map(score => (
              <tr key={score.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-200">{score.sector}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-bold ${getRiskColor(score.overallScore)}`}>{score.overallScore}</span>
                  <div className="w-full bg-slate-700/50 rounded-full h-1 mt-1">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        score.overallScore >= 75 ? 'bg-red-500' : score.overallScore >= 60 ? 'bg-orange-500' : score.overallScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${score.overallScore}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-mono text-cyan-400 tracking-wider text-sm">{renderMiniSparkline(score.trendData)}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${score.change7d > 0 ? 'text-red-400' : score.change7d < 0 ? 'text-green-400' : 'text-slate-500'}`}>
                    {score.change7d > 0 ? '+' : ''}{score.change7d}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${score.change30d > 0 ? 'text-red-400' : score.change30d < 0 ? 'text-green-400' : 'text-slate-500'}`}>
                    {score.change30d > 0 ? '+' : ''}{score.change30d}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{score.primaryThreat}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${getRiskColor(score.vulnerabilityIndex)}`}>{score.vulnerabilityIndex}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${score.readinessScore >= 70 ? 'text-green-400' : score.readinessScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {score.readinessScore}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Risk vs Readiness Visual */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Risk vs Readiness Gap Analysis</h4>
        <div className="space-y-2">
          {SECTOR_RISK_SCORES.sort((a, b) => (b.overallScore - b.readinessScore) - (a.overallScore - a.readinessScore)).map(score => {
            const gap = score.overallScore - score.readinessScore;
            return (
              <div key={score.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-40 truncate">{score.sector}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-slate-700/30 rounded h-3 relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-red-500/40 rounded-l"
                      style={{ width: `${score.overallScore}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-green-500/60 rounded-l"
                      style={{ width: `${score.readinessScore}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold w-14 text-right ${gap > 20 ? 'text-red-400' : gap > 10 ? 'text-orange-400' : 'text-green-400'}`}>
                    Gap: {gap > 0 ? '+' : ''}{gap}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-red-500/40" /> Risk Score</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-green-500/60" /> Readiness Score</span>
          <span>Larger gap = higher exposure</span>
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // Tab Content Router
  // -------------------------------------------------------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'correlation': return renderCorrelation();
      case 'earlyWarning': return renderEarlyWarning();
      case 'attackWave': return renderAttackWave();
      case 'riskScoring': return renderRiskScoring();
      default: return null;
    }
  };

  // -------------------------------------------------------------------------
  // Main Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">National-Scale Telemetry Layer</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-widest">
                SOVEREIGN GRADE
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-widest">
                WORLD FIRST
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cross-industry threat correlation · Early-warning signals · Attack-wave prediction · National cyber-risk scoring
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span key={pulseKey} className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Live Feed Active</span>
            <span className="text-slate-600">|</span>
            <span>Updated: {overview.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-700/50 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-slate-700/60 text-cyan-400 border border-slate-600/50 border-b-transparent -mb-0.75'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-400 mx-auto">
        {renderTabContent()}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-700/30 flex items-center justify-between text-[10px] text-slate-600">
        <span>Anchor National-Scale Telemetry Layer · Sovereign-Grade Intelligence · Classification: UNCLASSIFIED // FOUO</span>
        <span>© 2026 Anchor Security Platform. All rights reserved.</span>
      </div>
    </div>
  );
};

export default NationalTelemetryLayer;
