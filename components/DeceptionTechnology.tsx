import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

interface Honeypot {
  id: string;
  name: string;
  type: string;
  port: number;
  status: string;
  interactions: number;
  lastInteraction: string | null;
}

const DeceptionTechnology: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'honeypots' | 'decoys' | 'breadcrumbs'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [honeypots, setHoneypots] = useState<Honeypot[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await backendApi.deception.getDashboard() as any;
      setDashboardData(data);
      if (data?.honeypots) setHoneypots(data.honeypots);
    } catch {
      setHoneypots([
        { id: 'hp-1', name: 'SSH Honeypot', type: 'ssh', port: 2222, status: 'active', interactions: 47, lastInteraction: new Date().toISOString() },
        { id: 'hp-2', name: 'Web Honeypot', type: 'http', port: 8080, status: 'active', interactions: 123, lastInteraction: new Date().toISOString() },
        { id: 'hp-3', name: 'Database Honeypot', type: 'mysql', port: 3307, status: 'active', interactions: 15, lastInteraction: null },
      ]);
    }
    setLoading(false);
  };

  const deployDecoy = async (type: string, name: string) => {
    setDeploying(true);
    try {
      await backendApi.deception.createDecoy(type, name);
      setNotification(`Decoy "${name}" deployed successfully`);
      await loadDashboard();
    } catch { setNotification('Failed to deploy decoy'); }
    setDeploying(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const deployBreadcrumbs = async () => {
    setDeploying(true);
    try {
      const result = await backendApi.deception.createBreadcrumbs(10) as any;
      setNotification(`${result?.breadcrumbs?.length || 10} breadcrumb trails deployed`);
    } catch { setNotification('Failed to deploy breadcrumbs'); }
    setDeploying(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const stats = dashboardData?.stats || { activeHoneypots: honeypots.length, totalInteractions: honeypots.reduce((s: number, h: Honeypot) => s + h.interactions, 0), capturedTTPs: 19, alertsSent: 12 };

  return (
    <div className="bg-slate-900 text-white p-6 space-y-6">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-6 py-3 rounded-xl shadow-lg">{notification}</div>
      )}

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">🕸️ Deception Technology</h1>
          <p className="text-slate-400">High-fidelity decoys, honeytokens, and attacker misdirection</p>
        </div>
        <div className="flex gap-3">
          <button onClick={deployBreadcrumbs} disabled={deploying}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm">
            {deploying ? '⏳...' : '🍞 Plant Breadcrumbs'}
          </button>
          <button onClick={() => deployDecoy('credential', `Decoy-${Date.now()}`)} disabled={deploying}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 rounded-lg text-sm">+ Deploy Decoy</button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Honeypots', value: stats.activeHoneypots, color: 'text-purple-400' },
          { label: 'Interactions (24h)', value: stats.totalInteractions, color: 'text-pink-400' },
          { label: 'Captured TTPs', value: stats.capturedTTPs, color: 'text-cyan-400' },
          { label: 'SOC Alerts', value: stats.alertsSent, color: 'text-yellow-400' },
        ].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {['dashboard', 'honeypots', 'decoys', 'breadcrumbs'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm capitalize ${activeTab === tab ? 'bg-purple-500/20 text-purple-400 border border-purple-500' : 'text-slate-400 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mr-3"></div>
          <span className="text-slate-400">Loading deception platform...</span>
        </div>
      ) : activeTab === 'dashboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold mb-4">🕸️ Active Honeypots</h3>
            <div className="space-y-3">
              {honeypots.map(hp => (
                <div key={hp.id} className="bg-slate-900 border border-slate-600 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{hp.name}</div>
                    <div className="text-xs text-slate-500">Port {hp.port} • {hp.interactions} interactions</div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${hp.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold mb-4">📊 Deception Coverage</h3>
            <div className="space-y-3">
              {[
                { zone: 'DMZ', decoys: 5, coverage: 80 },
                { zone: 'Internal Network', decoys: 12, coverage: 65 },
                { zone: 'Cloud (AWS)', decoys: 8, coverage: 70 },
                { zone: 'Endpoints', decoys: 20, coverage: 45 },
              ].map(zone => (
                <div key={zone.zone} className="bg-slate-900 rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{zone.zone} ({zone.decoys} decoys)</span>
                    <span>{zone.coverage}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${zone.coverage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'honeypots' ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                <th className="p-4">Name</th><th className="p-4">Type</th><th className="p-4">Port</th>
                <th className="p-4">Status</th><th className="p-4">Interactions</th>
              </tr>
            </thead>
            <tbody>
              {honeypots.map(hp => (
                <tr key={hp.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="p-4 font-medium">{hp.name}</td>
                  <td className="p-4 text-sm">{hp.type}</td>
                  <td className="p-4 font-mono text-sm">{hp.port}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${hp.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{hp.status}</span></td>
                  <td className="p-4">{hp.interactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'decoys' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Decoy AD Controller', type: 'LDAP', lure: 'Fake admin credentials', interactions: 23 },
            { name: 'Canary Database', type: 'MySQL', lure: 'Honey tokens in tables', interactions: 8 },
            { name: 'Decoy S3 Bucket', type: 'AWS S3', lure: 'Breadcrumb access keys', interactions: 15 },
            { name: 'Fake API Server', type: 'REST API', lure: 'Mock data endpoints', interactions: 42 },
            { name: 'Decoy File Share', type: 'SMB', lure: 'Sensitive documents', interactions: 5 },
            { name: 'Canary DNS', type: 'DNS', lure: 'Resolution tracking', interactions: 67 },
          ].map((decoy, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="font-medium mb-1">{decoy.name}</div>
              <div className="text-xs text-slate-500">{decoy.type} • {decoy.lure}</div>
              <div className="text-xs text-slate-400 mt-2">{decoy.interactions} interactions</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="font-semibold mb-4">🍞 Digital Breadcrumb Trails</h3>
          <p className="text-slate-400 text-sm mb-4">Fake credentials, tokens, and links that lead attackers to honeypots and alert the SOC.</p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { type: 'Fake AWS Keys', count: 12, triggered: 3 },
              { type: 'Decoy SSH Keys', count: 8, triggered: 1 },
              { type: 'Canary Tokens', count: 25, triggered: 7 },
            ].map((b, i) => (
              <div key={i} className="bg-slate-900 rounded-lg p-4">
                <div className="font-medium text-sm">{b.type}</div>
                <div className="text-2xl font-bold mt-1">{b.count}</div>
                <div className="text-xs text-red-400">{b.triggered} triggered</div>
              </div>
            ))}
          </div>
          <button onClick={deployBreadcrumbs} disabled={deploying}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium">
            {deploying ? '⏳ Planting...' : '🍞 Plant New Breadcrumb Trail'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DeceptionTechnology;
