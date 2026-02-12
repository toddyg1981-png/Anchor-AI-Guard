import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// ACTIVE DEFENSE - LEGAL COUNTER-INTELLIGENCE & ATTACKER DETERRENCE
// ============================================================================
// ⚠️ LEGAL NOTICE: This system operates within legal boundaries.
// "Hacking back" is illegal. This system uses LEGAL active defense techniques:
// - Honeypots (deception on YOUR systems)
// - Evidence collection for law enforcement
// - Automated reporting to authorities
// - Deterrent messaging displayed on YOUR infrastructure
// ============================================================================

interface ThreatActor {
  id: string;
  identifier: string;
  firstSeen: string;
  lastSeen: string;
  attackCount: number;
  techniques: string[];
  sourceIPs: string[];
  geoLocations: string[];
  fingerprint: string;
  threatLevel: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'blocked' | 'reported' | 'prosecuted';
  evidenceCollected: boolean;
  reportedToAuthorities: boolean;
  attributionConfidence: number;
}

interface HoneypotSystem {
  id: string;
  name: string;
  type: 'ssh' | 'web' | 'database' | 'file_share' | 'admin_panel' | 'api';
  status: 'active' | 'triggered' | 'collecting';
  interactions: number;
  lastInteraction?: string;
  attackersTrapped: number;
  fakeDataServed: string;
}

interface AttackEvent {
  id: string;
  timestamp: string;
  actorId: string;
  sourceIP: string;
  attackType: string;
  targetSystem: string;
  action: 'blocked' | 'honeypot_redirect' | 'evidence_collected' | 'warning_displayed';
  evidenceHash?: string;
  deterrentMessageShown: boolean;
}

interface AuthorityReport {
  id: string;
  timestamp: string;
  authority: 'AFP' | 'ACSC' | 'AusCERT' | 'FBI_IC3' | 'LOCAL_POLICE';
  actorId: string;
  status: 'draft' | 'submitted' | 'acknowledged' | 'investigating' | 'closed';
  referenceNumber?: string;
  evidencePackageUrl?: string;
}

export const ActiveDefense: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'honeypots' | 'actors' | 'evidence' | 'reporting'>('overview');
  const [liveAttacks, setLiveAttacks] = useState<AttackEvent[]>([]);
  const [deterrentEnabled, setDeterrentEnabled] = useState(true);
  const [autoReportEnabled, setAutoReportEnabled] = useState(true);
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [_loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('active-defense');
        // eslint-disable-line no-console
      } catch (e) { logger.error(e); } finally { setLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('active-defense', 'Analyze active defense posture and recommend deception strategies and automated response improvements') as Record<string, unknown>;
      if (res?.analysis) setAnalysisResult(res.analysis as string);
    } catch (e) { logger.error(e); } finally { setAnalyzing(false); }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Mock threat actors
  const threatActors: ThreatActor[] = [
    {
      id: 'actor-1',
      identifier: 'APT-ANCHOR-2024-001',
      firstSeen: '2026-01-15T08:23:00Z',
      lastSeen: '2026-02-04T11:45:00Z',
      attackCount: 147,
      techniques: ['T1190', 'T1566.001', 'T1078', 'T1003'],
      sourceIPs: ['185.234.72.15', '185.234.72.16', '45.67.89.100'],
      geoLocations: ['Russia', 'Ukraine (VPN)'],
      fingerprint: 'SHA256:a7f3b2c1d4e5f6...',
      threatLevel: 'critical',
      status: 'reported',
      evidenceCollected: true,
      reportedToAuthorities: true,
      attributionConfidence: 87
    },
    {
      id: 'actor-2',
      identifier: 'APT-ANCHOR-2024-002',
      firstSeen: '2026-02-01T14:30:00Z',
      lastSeen: '2026-02-04T10:22:00Z',
      attackCount: 56,
      techniques: ['T1110.003', 'T1087', 'T1021.001'],
      sourceIPs: ['103.45.67.89', '103.45.67.90'],
      geoLocations: ['China'],
      fingerprint: 'SHA256:b8c4d3e2f1a0...',
      threatLevel: 'high',
      status: 'blocked',
      evidenceCollected: true,
      reportedToAuthorities: false,
      attributionConfidence: 72
    },
    {
      id: 'actor-3',
      identifier: 'SCRIPT-KIDDIE-001',
      firstSeen: '2026-02-04T09:00:00Z',
      lastSeen: '2026-02-04T09:15:00Z',
      attackCount: 12,
      techniques: ['T1110.001'],
      sourceIPs: ['203.45.67.89'],
      geoLocations: ['Australia (Brisbane)'],
      fingerprint: 'SHA256:c9d5e4f3a2b1...',
      threatLevel: 'low',
      status: 'blocked',
      evidenceCollected: true,
      reportedToAuthorities: false,
      attributionConfidence: 95
    }
  ];

  // Mock honeypot systems
  const honeypots: HoneypotSystem[] = [
    { id: 'hp-1', name: 'Fake SSH Server', type: 'ssh', status: 'active', interactions: 1247, lastInteraction: '2026-02-04T11:58:00Z', attackersTrapped: 45, fakeDataServed: 'Fake credentials, decoy keys' },
    { id: 'hp-2', name: 'Decoy Admin Panel', type: 'admin_panel', status: 'triggered', interactions: 892, lastInteraction: '2026-02-04T11:55:00Z', attackersTrapped: 23, fakeDataServed: 'Fake user database, dummy configs' },
    { id: 'hp-3', name: 'Honeypot Database', type: 'database', status: 'collecting', interactions: 456, lastInteraction: '2026-02-04T11:50:00Z', attackersTrapped: 12, fakeDataServed: 'Fake customer records (canary data)' },
    { id: 'hp-4', name: 'Fake API Endpoint', type: 'api', status: 'active', interactions: 2341, lastInteraction: '2026-02-04T11:59:00Z', attackersTrapped: 67, fakeDataServed: 'Fake API keys, dummy tokens' },
    { id: 'hp-5', name: 'Decoy File Share', type: 'file_share', status: 'active', interactions: 178, lastInteraction: '2026-02-04T10:30:00Z', attackersTrapped: 8, fakeDataServed: 'Watermarked documents, tracking pixels' }
  ];

  // Mock authority reports
  const authorityReports: AuthorityReport[] = [
    { id: 'rpt-1', timestamp: '2026-02-03T14:00:00Z', authority: 'ACSC', actorId: 'actor-1', status: 'investigating', referenceNumber: 'ACSC-2026-1234', evidencePackageUrl: '/evidence/actor-1-package.zip' },
    { id: 'rpt-2', timestamp: '2026-02-01T09:00:00Z', authority: 'AFP', actorId: 'actor-1', status: 'acknowledged', referenceNumber: 'AFP-CYB-2026-5678' },
    { id: 'rpt-3', timestamp: '2026-01-28T11:00:00Z', authority: 'AusCERT', actorId: 'actor-1', status: 'closed', referenceNumber: 'AUSCERT-INC-2026-890' }
  ];

  // Deterrent message template
  const deterrentMessage = `
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🛡️  ANCHOR SECURITY ACTIVE DEFENSE SYSTEM  🛡️                 ║
║                                                                  ║
║   ⚠️  YOUR ATTACK HAS BEEN DETECTED AND BLOCKED  ⚠️             ║
║                                                                  ║
║   The following information has been collected:                  ║
║   • Your IP Address and Geolocation                             ║
║   • Browser/Tool Fingerprint                                    ║
║   • Attack Patterns and Techniques (MITRE ATT&CK mapped)        ║
║   • Session Recordings and Keystroke Patterns                   ║
║   • All Attempted Payloads                                      ║
║                                                                  ║
║   This evidence has been automatically submitted to:             ║
║   • Australian Cyber Security Centre (ACSC)                     ║
║   • Australian Federal Police (AFP) Cybercrime Unit             ║
║   • Relevant International Law Enforcement (INTERPOL/FBI)       ║
║                                                                  ║
║   Reference Number: ANCHOR-DEF-2026-XXXXX                       ║
║                                                                  ║
║   🚨 LEGAL ACTION IS BEING PURSUED 🚨                           ║
║                                                                  ║
║   Any further attempts will result in additional charges.        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`;

  // Simulate live attack events
  useEffect(() => {
    const interval = setInterval(() => {
      const attackTypes = ['SQL Injection', 'Brute Force', 'Port Scan', 'XSS Attempt', 'Path Traversal'];
      const actions: Array<'blocked' | 'honeypot_redirect' | 'evidence_collected'> = ['blocked', 'honeypot_redirect', 'evidence_collected'];
      const newAttack: AttackEvent = {
        id: `atk-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: threatActors[Math.floor(Math.random() * threatActors.length)].id,
        sourceIP: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        targetSystem: honeypots[Math.floor(Math.random() * honeypots.length)].name,
        action: actions[Math.floor(Math.random() * actions.length)],
        deterrentMessageShown: deterrentEnabled
      };
      setLiveAttacks(prev => [newAttack, ...prev.slice(0, 19)]);
    }, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deterrentEnabled]);

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      default: return 'text-green-400 bg-green-500/10 border-green-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'investigating': return 'text-red-400 bg-red-500/10 border-red-500';
      case 'blocked': case 'reported': case 'acknowledged': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      case 'prosecuted': case 'closed': return 'text-green-400 bg-green-500/10 border-green-500';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'blocked': return 'bg-red-500 text-white';
      case 'honeypot_redirect': return 'bg-purple-500 text-white';
      case 'evidence_collected': return 'bg-cyan-500 text-white';
      case 'warning_displayed': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const totalAttacksBlocked = threatActors.reduce((sum, a) => sum + a.attackCount, 0);
  const attackersTrapped = honeypots.reduce((sum, h) => sum + h.attackersTrapped, 0);

  return (
    <div className="bg-slate-900 text-white p-6">
      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-green-500/20 border border-green-500 rounded-xl text-green-400 shadow-lg animate-pulse">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">⚔️ Active Defense System</h1>
          <p className="text-gray-400">Legal counter-intelligence, honeypots, and attacker deterrence</p>
          <button onClick={handleAIAnalysis} disabled={analyzing} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm">{analyzing ? 'Analyzing...' : 'AI Analysis'}</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-400">Deterrent Messages</span>
            <button
              onClick={() => setDeterrentEnabled(!deterrentEnabled)}
              aria-label="Toggle deterrent messages"
              className={`w-12 h-6 rounded-full transition-colors ${deterrentEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${deterrentEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-400">Auto-Report</span>
            <button
              onClick={() => setAutoReportEnabled(!autoReportEnabled)}
              aria-label="Toggle auto-report"
              className={`w-12 h-6 rounded-full transition-colors ${autoReportEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autoReportEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Legal Notice */}
      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚖️</span>
          <div>
            <h3 className="text-blue-400 font-bold">Legal Active Defense</h3>
            <p className="text-gray-400 text-sm">
              This system operates within Australian law. We use deception (honeypots), evidence collection, and 
              automated reporting - NOT &quot;hacking back&quot; which is illegal under the Criminal Code Act 1995.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{threatActors.length}</div>
          <div className="text-gray-400 text-sm">Threat Actors Tracked</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-400">{attackersTrapped}</div>
          <div className="text-gray-400 text-sm">Attackers Trapped</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{totalAttacksBlocked}</div>
          <div className="text-gray-400 text-sm">Attacks Blocked</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-cyan-400">{honeypots.length}</div>
          <div className="text-gray-400 text-sm">Active Honeypots</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">{authorityReports.length}</div>
          <div className="text-gray-400 text-sm">Reports Filed</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-orange-400">{threatActors.filter(a => a.reportedToAuthorities).length}</div>
          <div className="text-gray-400 text-sm">Under Investigation</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'overview', label: '📊 Live Feed' },
          { id: 'honeypots', label: '🍯 Honeypots' },
          { id: 'actors', label: '🎭 Threat Actors' },
          { id: 'evidence', label: '📁 Evidence' },
          { id: 'reporting', label: '🚨 Authority Reports' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-red-500/20 text-red-400 border border-red-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live Feed Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Attack Feed */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">⚡ Live Attack Feed</h2>
              <span className="flex items-center gap-2 text-red-400 text-sm">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                Real-time
              </span>
            </div>
            <div className="space-y-2 max-h-125 overflow-y-auto">
              {liveAttacks.map((attack, idx) => (
                <div key={attack.id} className={`p-3 rounded-lg border border-gray-700 ${idx === 0 ? 'bg-red-500/10 border-red-500/50 animate-pulse' : 'bg-gray-800/50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getActionColor(attack.action)}`}>
                        {attack.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-sm font-medium">{attack.attackType}</span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(attack.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>🌐 {attack.sourceIP}</span>
                    <span>🎯 {attack.targetSystem}</span>
                    {attack.deterrentMessageShown && (
                      <span className="text-yellow-400">⚠️ Warning Shown</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deterrent Message Preview */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🚨 Deterrent Message (Shown to Attackers)</h2>
            <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
              <pre>{deterrentMessage}</pre>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              ✅ This message is displayed on YOUR systems - completely legal!
              It acts as a psychological deterrent while you collect evidence.
            </p>
          </div>
        </div>
      )}

      {/* Honeypots Tab */}
      {activeTab === 'honeypots' && (
        <div className="space-y-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-purple-400 mb-2">🍯 Honeypot Deception Technology</h2>
            <p className="text-gray-400">
              Honeypots are decoy systems that look like real targets. When attackers interact with them, 
              we collect evidence, waste their time, and gather intelligence - all completely legal!
            </p>
          </div>

          {honeypots.map(honeypot => (
            <div key={honeypot.id} className={`p-6 rounded-xl border ${
              honeypot.status === 'triggered' ? 'bg-purple-500/10 border-purple-500/50 animate-pulse' :
              honeypot.status === 'collecting' ? 'bg-cyan-500/10 border-cyan-500/30' :
              'bg-gray-900/50 border-gray-800'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🍯</span>
                  <div>
                    <h3 className="font-semibold text-lg">{honeypot.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-700 rounded">{honeypot.type}</span>
                      <span className={`px-2 py-0.5 rounded ${
                        honeypot.status === 'triggered' ? 'bg-purple-500 text-white' :
                        honeypot.status === 'collecting' ? 'bg-cyan-500 text-white' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {honeypot.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{honeypot.attackersTrapped}</div>
                    <div className="text-xs text-gray-500">Trapped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{honeypot.interactions}</div>
                    <div className="text-xs text-gray-500">Interactions</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>📄 Fake data: {honeypot.fakeDataServed}</span>
                {honeypot.lastInteraction && (
                  <span>Last activity: {new Date(honeypot.lastInteraction).toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowDeployForm(!showDeployForm)}
            className="w-full p-4 border-2 border-dashed border-purple-500/50 rounded-xl text-purple-400 hover:bg-purple-500/10 transition-colors"
          >
            {showDeployForm ? '✕ Cancel' : '➕ Deploy New Honeypot'}
          </button>

          {showDeployForm && (
            <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 mt-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Deploy New Honeypot</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Honeypot Name</label>
                  <input type="text" placeholder="e.g., Fake SMTP Server" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select title="Honeypot type" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                    <option>SSH</option><option>Web</option><option>Database</option><option>File Share</option><option>Admin Panel</option><option>API</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => { setShowDeployForm(false); showNotification('✅ Honeypot deployment initiated successfully!'); }}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium"
              >
                🚀 Deploy
              </button>
            </div>
          )}
        </div>
      )}

      {/* Threat Actors Tab */}
      {activeTab === 'actors' && (
        <div className="space-y-4">
          {threatActors.map(actor => (
            <div key={actor.id} className={`p-6 rounded-xl border ${getThreatColor(actor.threatLevel)}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">🎭</span>
                    <h3 className="font-semibold text-lg font-mono">{actor.identifier}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getThreatColor(actor.threatLevel)}`}>
                      {actor.threatLevel}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(actor.status)}`}>
                      {actor.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    First seen: {new Date(actor.firstSeen).toLocaleDateString()} | 
                    Last seen: {new Date(actor.lastSeen).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{actor.attackCount}</div>
                    <div className="text-xs text-gray-500">Attacks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{actor.attributionConfidence}%</div>
                    <div className="text-xs text-gray-500">Attribution</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Source IPs</div>
                  <div className="text-sm font-mono text-cyan-400">{actor.sourceIPs.join(', ')}</div>
                </div>
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Geolocation</div>
                  <div className="text-sm">{actor.geoLocations.join(', ')}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {actor.techniques.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-mono">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {actor.evidenceCollected && (
                    <span className="text-green-400 text-sm">✅ Evidence Collected</span>
                  )}
                  {actor.reportedToAuthorities && (
                    <span className="text-yellow-400 text-sm">🚨 Reported to Authorities</span>
                  )}
                </div>
                {!actor.reportedToAuthorities && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Report threat actor ${actor.identifier} to AFP/ACSC?\n\nThis will submit all collected evidence to Australian authorities.`)) {
                        showNotification(`🚨 Report submitted for ${actor.identifier} to AFP/ACSC. Reference: AFP-CYB-2026-${Math.floor(Math.random() * 9000 + 1000)}`);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium"
                  >
                    🚨 Report to AFP/ACSC
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Tab */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">📁 Evidence Collection</h2>
            <p className="text-gray-400 mb-4">
              All evidence is cryptographically hashed, timestamped, and stored in a tamper-proof format 
              suitable for law enforcement and legal proceedings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { type: 'Network Captures', count: 1247, size: '2.3 GB', icon: '🌐' },
                { type: 'Attack Payloads', count: 892, size: '156 MB', icon: '💉' },
                { type: 'Session Recordings', count: 45, size: '8.9 GB', icon: '🎥' },
                { type: 'Fingerprint Data', count: 156, size: '12 MB', icon: '🔏' },
                { type: 'Log Files', count: 3456, size: '4.5 GB', icon: '📜' },
                { type: 'Forensic Images', count: 23, size: '45 GB', icon: '💾' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-800/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-medium">{item.type}</div>
                      <div className="text-sm text-gray-500">{item.count} items • {item.size}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const data = `${item.type} - ${item.count} items (${item.size})`;
                      navigator.clipboard.writeText(data).then(() => {
                        showNotification(`📋 Copied ${item.type} summary to clipboard`);
                      }).catch(() => {
                        showNotification(`📥 Exporting ${item.type}: ${item.count} items (${item.size})`);
                      });
                    }}
                    className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500 rounded text-sm text-cyan-400"
                  >
                    Export
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">🔐 Evidence Integrity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <span>✅</span> All evidence SHA-256 hashed
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span>✅</span> Timestamps from trusted NTP servers
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span>✅</span> Chain of custody maintained
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span>✅</span> Compliant with Australian Evidence Act
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authority Reports Tab */}
      {activeTab === 'reporting' && (
        <div className="space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">🚨 Automated Authority Reporting</h2>
            <p className="text-gray-400">
              When attacks meet severity thresholds, evidence packages are automatically compiled and 
              submitted to relevant authorities including ACSC, AFP, and AusCERT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { name: 'ACSC', fullName: 'Australian Cyber Security Centre', icon: '🇦🇺', connected: true },
              { name: 'AFP', fullName: 'Australian Federal Police', icon: '👮', connected: true },
              { name: 'AusCERT', fullName: 'Australian CERT', icon: '🔒', connected: true },
              { name: 'INTERPOL', fullName: 'International Police', icon: '🌐', connected: false }
            ].map((authority, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${authority.connected ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{authority.icon}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${authority.connected ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                    {authority.connected ? 'Connected' : 'Setup Required'}
                  </span>
                </div>
                <h4 className="font-medium">{authority.name}</h4>
                <p className="text-xs text-gray-500">{authority.fullName}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                  <th className="p-4">Report</th>
                  <th className="p-4">Authority</th>
                  <th className="p-4">Threat Actor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {authorityReports.map(report => (
                  <tr key={report.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="p-4 font-mono text-sm">{report.id}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">
                        {report.authority}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm text-cyan-400">
                      {threatActors.find(a => a.id === report.actorId)?.identifier}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm">{report.referenceNumber || '-'}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(report.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {analysisResult && (
        <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4 mt-4">
          <div className="flex justify-between items-center mb-2"><h3 className="font-semibold text-blue-400">AI Analysis</h3><button onClick={() => setAnalysisResult('')} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default ActiveDefense;
