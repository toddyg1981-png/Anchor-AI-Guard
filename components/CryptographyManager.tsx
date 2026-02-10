import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

const CryptographyManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [activeTab, setActiveTab] = useState<'certs' | 'keys' | 'hsm' | 'audit'>('certs');

  const [certs, setCerts] = useState([
    { id: 'c-1', name: 'api.anchor.ai', status: 'Valid', expires: '2026-06-12', issuer: "Let's Encrypt", type: 'TLS' },
    { id: 'c-2', name: 'vpn.anchor.ai', status: 'Expiring', expires: '2026-02-20', issuer: 'DigiCert', type: 'TLS' },
    { id: 'c-3', name: 'internal-ca', status: 'Root', expires: '2034-01-01', issuer: 'Self-signed', type: 'CA' },
    { id: 'c-4', name: '*.staging.anchor.ai', status: 'Valid', expires: '2026-09-15', issuer: "Let's Encrypt", type: 'Wildcard' },
    { id: 'c-5', name: 'code-signing', status: 'Valid', expires: '2027-02-01', issuer: 'DigiCert', type: 'Code Signing' },
  ]);

  const [stats, setStats] = useState([
    { label: 'Keys managed', value: 1240 },
    { label: 'Certificates', value: 218 },
    { label: 'Expiring <30d', value: 7 },
    { label: 'HSM clusters', value: 3 },
  ]);

  const keys = [
    { id: 'k-1', name: 'master-encryption', algorithm: 'AES-256-GCM', location: 'HSM', rotated: '2026-01-01', status: 'Active' },
    { id: 'k-2', name: 'api-signing', algorithm: 'ECDSA P-256', location: 'HSM', rotated: '2025-12-15', status: 'Active' },
    { id: 'k-3', name: 'backup-encryption', algorithm: 'AES-256-CBC', location: 'KMS', rotated: '2025-11-20', status: 'Active' },
    { id: 'k-4', name: 'jwt-signing', algorithm: 'RS256', location: 'KMS', rotated: '2026-01-10', status: 'Rotating' },
    { id: 'k-5', name: 'db-tde', algorithm: 'AES-256', location: 'HSM', rotated: '2025-10-01', status: 'Active' },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await backendApi.modules.getDashboard('cryptography');
      if ((result as any)?.stats) setStats(prev => (result as any).stats.length > 0 ? (result as any).stats : prev);
      if ((result as any)?.items) setCerts(prev => (result as any).items.length > 0 ? (result as any).items : prev);
    } catch (err) {
      logger.error('Failed to load crypto dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await backendApi.modules.analyze('cryptography', 'Audit our cryptographic posture and recommend improvements');
      if ((result as any)?.analysis) setAnalysisResult((result as any).analysis);
    } catch (err) {
      logger.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const statusColor = (s: string) => s === 'Valid' || s === 'Active' || s === 'Root' ? 'text-green-400' : s === 'Expiring' || s === 'Rotating' ? 'text-yellow-400' : 'text-red-400';

  if (loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-500">Cryptography Manager</h1>
          <p className="text-slate-400">Keys, certificates, and signing with hardware-backed protection.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleAnalyze} disabled={analyzing}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {analyzing ? 'Auditing...' : 'AI Crypto Audit'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">PKI health: Good</div>
        </div>
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
        {(['certs', 'keys', 'hsm', 'audit'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-slate-800 text-green-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'certs' ? 'Certificates' : tab === 'keys' ? 'Keys' : tab === 'hsm' ? 'HSM Clusters' : 'Audit Log'}
          </button>
        ))}
      </div>

      {activeTab === 'certs' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Certificate Lifecycle</h2>
          {certs.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Issuer: {item.issuer} | Type: {item.type} | Expires {item.expires}</div>
              </div>
              <span className={`text-xs font-medium ${statusColor(item.status)}`}>{item.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'keys' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Encryption Keys</h2>
          {keys.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">{item.algorithm} | {item.location} | Rotated: {item.rotated}</div>
              </div>
              <span className={`text-xs font-medium ${statusColor(item.status)}`}>{item.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'hsm' && (
        <div className="grid md:grid-cols-3 gap-4">
          {[{ name: 'HSM-US-EAST', keys: 442, uptime: '99.999%', fips: 'FIPS 140-3 Level 3' },
            { name: 'HSM-EU-WEST', keys: 398, uptime: '99.999%', fips: 'FIPS 140-3 Level 3' },
            { name: 'HSM-AP-SOUTH', keys: 400, uptime: '99.998%', fips: 'FIPS 140-2 Level 3' }
          ].map(h => (
            <div key={h.name} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="font-semibold text-green-400">{h.name}</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Keys</span><span>{h.keys}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Uptime</span><span className="text-green-400">{h.uptime}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Compliance</span><span className="text-xs">{h.fips}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
          <h3 className="font-semibold mb-2">Recent Cryptographic Operations</h3>
          {[{ action: 'Key rotation', target: 'jwt-signing', user: 'system', time: '2h ago' },
            { action: 'Certificate renewed', target: '*.staging.anchor.ai', user: 'certbot', time: '6h ago' },
            { action: 'Key created', target: 'temp-migration-key', user: 'admin', time: '1d ago' },
            { action: 'Key destroyed', target: 'legacy-aes-key', user: 'admin', time: '2d ago' },
            { action: 'HSM backup', target: 'HSM-US-EAST', user: 'system', time: '3d ago' },
          ].map((log, i) => (
            <div key={i} className="bg-slate-900 rounded-lg p-3 text-sm flex justify-between items-center">
              <div><span className="font-medium">{log.action}</span> <span className="text-slate-400">→ {log.target}</span></div>
              <div className="text-xs text-slate-500">{log.user} • {log.time}</div>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-green-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-green-400 mb-2">AI Cryptographic Audit</h3>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default CryptographyManager;
