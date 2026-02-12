/**
 * AI-Powered Dashboard - WORLD FIRST INTEGRATION
 * Combines all world-first features into unified security command center
 */

import React, { useState } from 'react';
import { SecurityScoreWidget, SecurityLeaderboard } from './SecurityScoreWidget';
import { AttackPathVisualization } from './AttackPathVisualization';
import { AISecurityChat } from './AISecurityChat';
import { PredictiveAlertsPanel } from './PredictiveAlertsPanel';
import { CollaborationPanel } from './CollaborationPanel';

// Tab definitions
type DashboardTab = 'overview' | 'attack-paths' | 'predictions' | 'ai-chat' | 'leaderboard';

interface AIDashboardProps {
  projectId: string;
  userId: string;
  userName: string;
}

export const AIDashboard: React.FC<AIDashboardProps> = ({ projectId, userId, userName }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedFindingId, _setSelectedFindingId] = useState<string | undefined>();
  const [showCollaboration, setShowCollaboration] = useState(true);
  const [findingNotification, setFindingNotification] = useState<string | null>(null);

  const tabs: { id: DashboardTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'attack-paths', label: 'Attack Paths', icon: '🔗' },
    { id: 'predictions', label: 'Predictions', icon: '🔮' },
    { id: 'ai-chat', label: 'AI Assistant', icon: '🤖' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];

  // Mock leaderboard data
  const leaderboardUsers = [
    { id: '1', name: 'Sarah Chen', score: 798, grade: 'A+', avatar: undefined },
    { id: '2', name: 'James Wilson', score: 756, grade: 'A', avatar: undefined },
    { id: '3', name: 'Emily Davis', score: 724, grade: 'A', avatar: undefined },
    { id: '4', name: 'Michael Brown', score: 687, grade: 'B', avatar: undefined },
    { id: '5', name: 'Lisa Anderson', score: 652, grade: 'B', avatar: undefined },
    { id: '6', name: 'David Kim', score: 618, grade: 'C', avatar: undefined },
  ];

  return (
    <div className="bg-transparent text-white">
      {/* Finding Update Notification */}
      {findingNotification && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-cyan-500/20 border border-cyan-500 rounded-xl text-cyan-400 shadow-lg animate-pulse">
          {findingNotification}
        </div>
      )}

      {/* Header - Glass Neon Style */}
      <header className="border-b border-cyan-500/20 bg-linear-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(53,198,255,0.1)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Navigation Tabs */}
              <nav className="flex items-center gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* World First Badge */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
                <span className="text-sm">🌟</span>
                <span className="text-xs text-purple-300 font-medium">World First AI Security</span>
              </div>

              {/* Collaboration Toggle */}
              <button
                onClick={() => setShowCollaboration(!showCollaboration)}
                className={`p-2 rounded-lg transition-colors ${
                  showCollaboration
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
                title="Toggle collaboration panel"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>

              {/* User */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid gap-6 ${showCollaboration ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
          {/* Main Content Area */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* World First Features Banner */}
                <div className="bg-linear-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🚀</div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">World-First AI Security Features</h2>
                      <p className="text-sm text-gray-400">
                        Predictive CVE Detection • Attack Path Analysis • AI Auto-Remediation • Natural Language Queries
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">3</p>
                        <p className="text-xs text-gray-400">Critical Issues</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                        🔮
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">3</p>
                        <p className="text-xs text-gray-400">Predicted CVEs</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400">
                        🔗
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">3</p>
                        <p className="text-xs text-gray-400">Attack Paths</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400">
                        ✅
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">87%</p>
                        <p className="text-xs text-gray-400">Issues Resolved</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Widget */}
                <SecurityScoreWidget onViewDetails={() => setActiveTab('leaderboard')} />

                {/* Mini Attack Path Preview */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Top Attack Paths</h3>
                    <button
                      onClick={() => setActiveTab('attack-paths')}
                      className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'SQL Injection → Data Breach', risk: 9.2, vector: 'Network' },
                      { name: 'Hardcoded Secrets → AWS Takeover', risk: 8.5, vector: 'Repository' },
                      { name: 'XSS → Session Hijacking', risk: 7.4, vector: 'Client' },
                    ].map((path, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🔗</span>
                          <div>
                            <p className="text-sm font-medium text-white">{path.name}</p>
                            <p className="text-xs text-gray-500">{path.vector}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${
                          path.risk >= 8 ? 'text-red-400' : path.risk >= 6 ? 'text-orange-400' : 'text-yellow-400'
                        }`}>
                          {path.risk.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Predictions Preview */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span>🔮</span> Predicted Vulnerabilities
                    </h3>
                    <button
                      onClick={() => setActiveTab('predictions')}
                      className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: 'RCE in express-validator', severity: 'critical', confidence: 87, days: 5 },
                      { title: 'SQL Injection in prisma', severity: 'high', confidence: 72, days: 7 },
                      { title: 'DoS in axios', severity: 'medium', confidence: 65, days: 14 },
                    ].map((pred, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${
                            pred.severity === 'critical' ? 'bg-red-500' :
                            pred.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-white">{pred.title}</p>
                            <p className="text-xs text-gray-500">Est. disclosure in {pred.days} days</p>
                          </div>
                        </div>
                        <span className="text-sm text-cyan-400 font-medium">{pred.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'attack-paths' && (
              <AttackPathVisualization height={600} />
            )}

            {activeTab === 'predictions' && (
              <PredictiveAlertsPanel />
            )}

            {activeTab === 'ai-chat' && (
              <AISecurityChat projectId={projectId} />
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                <SecurityScoreWidget />
                <SecurityLeaderboard users={leaderboardUsers} />
              </div>
            )}
          </div>

          {/* Collaboration Sidebar */}
          {showCollaboration && (
            <div className="lg:sticky lg:top-24 h-fit">
              <CollaborationPanel
                roomId={`${projectId}:default`}
                userId={userId}
                userName={userName}
                currentFindingId={selectedFindingId}
                onFindingUpdate={(findingId, field, value) => {
                  setFindingNotification(`✅ Finding ${findingId} updated: ${field} → ${value}`);
                  setTimeout(() => setFindingNotification(null), 3000);
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm">© 2024 Anchor Security</span>
              <span className="text-gray-700">|</span>
              <span className="text-xs text-purple-400">🌟 World-First AI Security Platform</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <a href="#" className="hover:text-white">Documentation</a>
              <a href="#" className="hover:text-white">API</a>
              <a href="#" className="hover:text-white">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AIDashboard;
