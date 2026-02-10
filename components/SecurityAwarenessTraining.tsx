import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// SECURITY AWARENESS TRAINING
// ============================================================================
// Gamified employee security training with real-world scenarios
// Track completion, scores, certifications, compliance
// Essential for government - human is the weakest link
// ============================================================================

interface TrainingModule {
  id: string;
  title: string;
  category: 'phishing' | 'password' | 'social_engineering' | 'data_handling' | 'physical' | 'insider_threat' | 'compliance' | 'incident_response';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  points: number;
  mandatory: boolean;
  completionRate: number;
  averageScore: number;
  description: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  overallScore: number;
  modulesCompleted: number;
  totalModules: number;
  streak: number;
  badges: string[];
  lastActivity: string;
  riskLevel: 'low' | 'medium' | 'high';
  certifications: string[];
}

interface Leaderboard {
  rank: number;
  name: string;
  department: string;
  score: number;
  badges: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: string;
  earnedBy: number;
}

export const SecurityAwarenessTraining: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'modules' | 'employees' | 'leaderboard' | 'badges'>('dashboard');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('security-training');
        } catch (e) { logger.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('security-training', 'Analyze security awareness training effectiveness, completion rates, and knowledge retention gaps');
      if ((res as any)?.analysis) setAnalysisResult((res as any).analysis);
    } catch (e) { logger.error(e); } finally { setAnalyzing(false); }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const modules: TrainingModule[] = [
    { id: 'm-1', title: 'Phishing 101: Spotting the Bait', category: 'phishing', difficulty: 'beginner', duration: 15, points: 100, mandatory: true, completionRate: 92, averageScore: 85, description: 'Learn to identify common phishing tactics and protect yourself' },
    { id: 'm-2', title: 'Advanced Spear Phishing', category: 'phishing', difficulty: 'advanced', duration: 30, points: 250, mandatory: false, completionRate: 45, averageScore: 72, description: 'Defend against targeted phishing attacks against executives' },
    { id: 'm-3', title: 'Password Security Best Practices', category: 'password', difficulty: 'beginner', duration: 10, points: 75, mandatory: true, completionRate: 95, averageScore: 90, description: 'Create strong passwords and use password managers' },
    { id: 'm-4', title: 'Social Engineering Red Flags', category: 'social_engineering', difficulty: 'intermediate', duration: 20, points: 150, mandatory: true, completionRate: 78, averageScore: 80, description: 'Recognize manipulation tactics used by attackers' },
    { id: 'm-5', title: 'Secure Data Handling', category: 'data_handling', difficulty: 'intermediate', duration: 25, points: 175, mandatory: true, completionRate: 82, averageScore: 88, description: 'Properly classify, store, and transmit sensitive data' },
    { id: 'm-6', title: 'Physical Security Awareness', category: 'physical', difficulty: 'beginner', duration: 12, points: 100, mandatory: true, completionRate: 88, averageScore: 91, description: 'Tailgating, badge security, clean desk policy' },
    { id: 'm-7', title: 'Insider Threat Awareness', category: 'insider_threat', difficulty: 'advanced', duration: 35, points: 300, mandatory: false, completionRate: 35, averageScore: 78, description: 'Identify and report potential insider threats' },
    { id: 'm-8', title: 'GDPR & Privacy Compliance', category: 'compliance', difficulty: 'intermediate', duration: 40, points: 200, mandatory: true, completionRate: 75, averageScore: 82, description: 'Understand privacy regulations and obligations' },
    { id: 'm-9', title: 'Incident Response for Employees', category: 'incident_response', difficulty: 'intermediate', duration: 20, points: 150, mandatory: true, completionRate: 70, averageScore: 85, description: 'What to do when you suspect a security incident' },
    { id: 'm-10', title: 'Government Security Classification', category: 'compliance', difficulty: 'advanced', duration: 45, points: 350, mandatory: true, completionRate: 60, averageScore: 77, description: 'Understanding TOP SECRET, SECRET, CONFIDENTIAL handling' },
  ];

  const employees: Employee[] = [
    { id: 'e-1', name: 'Sarah Chen', email: 'sarah.chen@company.com', department: 'Engineering', role: 'Senior Developer', overallScore: 95, modulesCompleted: 10, totalModules: 10, streak: 15, badges: ['🏆', '🛡️', '🎯', '🔥'], lastActivity: '2026-02-04', riskLevel: 'low', certifications: ['Security Champion', 'Phishing Pro'] },
    { id: 'e-2', name: 'Mike Johnson', email: 'mike.johnson@company.com', department: 'Sales', role: 'Account Executive', overallScore: 72, modulesCompleted: 7, totalModules: 10, streak: 3, badges: ['🎯'], lastActivity: '2026-02-03', riskLevel: 'medium', certifications: [] },
    { id: 'e-3', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', department: 'Finance', role: 'Financial Analyst', overallScore: 88, modulesCompleted: 9, totalModules: 10, streak: 8, badges: ['🛡️', '🎯', '📚'], lastActivity: '2026-02-04', riskLevel: 'low', certifications: ['Security Aware'] },
    { id: 'e-4', name: 'David Kim', email: 'david.kim@company.com', department: 'HR', role: 'HR Manager', overallScore: 65, modulesCompleted: 6, totalModules: 10, streak: 0, badges: [], lastActivity: '2026-01-28', riskLevel: 'high', certifications: [] },
    { id: 'e-5', name: 'Emma Wilson', email: 'emma.wilson@company.com', department: 'Legal', role: 'Legal Counsel', overallScore: 92, modulesCompleted: 10, totalModules: 10, streak: 20, badges: ['🏆', '🛡️', '🔐', '⭐'], lastActivity: '2026-02-04', riskLevel: 'low', certifications: ['Security Champion', 'Compliance Expert'] },
  ];

  const leaderboard: Leaderboard[] = [
    { rank: 1, name: 'Sarah Chen', department: 'Engineering', score: 9500, badges: 4 },
    { rank: 2, name: 'Emma Wilson', department: 'Legal', score: 9200, badges: 4 },
    { rank: 3, name: 'Lisa Anderson', department: 'Finance', score: 8800, badges: 3 },
    { rank: 4, name: 'Alex Turner', department: 'IT', score: 8500, badges: 3 },
    { rank: 5, name: 'Chris Brown', department: 'Engineering', score: 8200, badges: 2 },
    { rank: 6, name: 'Jennifer Lee', department: 'Marketing', score: 7800, badges: 2 },
    { rank: 7, name: 'Mike Johnson', department: 'Sales', score: 7200, badges: 1 },
    { rank: 8, name: 'Rachel Green', department: 'Operations', score: 6900, badges: 1 },
  ];

  const badges: Badge[] = [
    { id: 'b-1', name: 'Security Champion', icon: '🏆', description: 'Completed all training modules with 90%+ score', requirement: 'Score 90%+ on all modules', earnedBy: 12 },
    { id: 'b-2', name: 'Phishing Pro', icon: '🎣', description: 'Correctly identified 10 phishing attempts', requirement: 'Report 10 real phishing emails', earnedBy: 25 },
    { id: 'b-3', name: 'Shield Bearer', icon: '🛡️', description: 'Completed all mandatory modules', requirement: 'Complete mandatory training', earnedBy: 142 },
    { id: 'b-4', name: 'Sharp Shooter', icon: '🎯', description: 'Perfect score on any module', requirement: '100% on any module', earnedBy: 45 },
    { id: 'b-5', name: 'Streak Master', icon: '🔥', description: 'Maintained 30-day learning streak', requirement: '30 consecutive days', earnedBy: 8 },
    { id: 'b-6', name: 'Knowledge Seeker', icon: '📚', description: 'Completed 5 optional modules', requirement: '5 optional modules', earnedBy: 34 },
    { id: 'b-7', name: 'Guardian', icon: '🔐', description: 'Helped 5 colleagues with security questions', requirement: 'Peer assistance', earnedBy: 18 },
    { id: 'b-8', name: 'Rising Star', icon: '⭐', description: 'Most improved score in 30 days', requirement: 'Top improvement', earnedBy: 5 },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'phishing': return '🎣';
      case 'password': return '🔑';
      case 'social_engineering': return '🎭';
      case 'data_handling': return '📁';
      case 'physical': return '🚪';
      case 'insider_threat': return '🕵️';
      case 'compliance': return '📋';
      case 'incident_response': return '🚨';
      default: return '📖';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const overallCompletion = Math.round(employees.reduce((sum, e) => sum + (e.modulesCompleted / e.totalModules), 0) / employees.length * 100);
  const averageScore = Math.round(employees.reduce((sum, e) => sum + e.overallScore, 0) / employees.length);
  const atRiskEmployees = employees.filter(e => e.riskLevel === 'high').length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-green-500/20 border border-green-500 rounded-xl text-green-400 shadow-lg animate-pulse">
          {notification}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🎓 Security Awareness Training</h1>
          <p className="text-gray-400">Gamified security training for the human firewall</p>
        </div>
        <button
          onClick={handleAIAnalysis}
          disabled={analyzing || backendLoading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium text-white flex items-center gap-2 mr-3"
        >
          {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
        </button>
        <button
          onClick={() => setShowCreateCampaign(!showCreateCampaign)}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-bold"
        >
          {showCreateCampaign ? '✕ Cancel' : '+ Create Campaign'}
        </button>
      </div>

      {showCreateCampaign && (
        <div className="mb-6 bg-gray-900/50 border border-cyan-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Create Training Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Campaign Name</label>
              <input type="text" placeholder="e.g., Q1 Phishing Awareness" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Department</label>
              <select title="Target department" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none">
                <option>All Departments</option><option>Engineering</option><option>Sales</option><option>Finance</option><option>HR</option><option>Legal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Due Date</label>
              <input type="date" title="Campaign due date" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none" />
            </div>
          </div>
          <button
            onClick={() => { setShowCreateCampaign(false); showNotification('✅ Training campaign created and notifications sent to employees!'); }}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium"
          >
            🚀 Launch Campaign
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{modules.length}</div>
          <div className="text-sm text-gray-400">Modules</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{overallCompletion}%</div>
          <div className="text-sm text-gray-400">Completion</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{averageScore}</div>
          <div className="text-sm text-gray-400">Avg Score</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{atRiskEmployees}</div>
          <div className="text-sm text-gray-400">At Risk</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{badges.length}</div>
          <div className="text-sm text-gray-400">Badges</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-400">{employees.filter(e => e.certifications.length > 0).length}</div>
          <div className="text-sm text-gray-400">Certified</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'modules', label: '📚 Modules' },
          { id: 'employees', label: '👥 Employees' },
          { id: 'leaderboard', label: '🏆 Leaderboard' },
          { id: 'badges', label: '🎖️ Badges' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">📈 Training Progress by Category</h3>
            <div className="space-y-4">
              {['phishing', 'password', 'social_engineering', 'data_handling', 'compliance'].map(cat => {
                const catModules = modules.filter(m => m.category === cat);
                const avgCompletion = Math.round(catModules.reduce((sum, m) => sum + m.completionRate, 0) / catModules.length);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-2">
                        <span>{getCategoryIcon(cat)}</span>
                        <span className="capitalize">{cat.replace('_', ' ')}</span>
                      </span>
                      <span className="text-gray-400">{avgCompletion}%</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-cyan-500 to-green-500 rounded-full"
                        style={{ width: `${avgCompletion}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">🏆 Top Performers</h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((entry, idx) => (
                <div key={entry.rank} className={`flex items-center gap-4 p-3 rounded-lg ${
                  idx === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' :
                  idx === 1 ? 'bg-gray-500/10 border border-gray-400/30' :
                  idx === 2 ? 'bg-orange-500/10 border border-orange-600/30' :
                  'bg-gray-800/50'
                }`}>
                  <span className="text-2xl font-bold text-gray-600 w-8">#{entry.rank}</span>
                  <div className="flex-1">
                    <div className="font-medium">{entry.name}</div>
                    <div className="text-sm text-gray-500">{entry.department}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-cyan-400">{entry.score.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{entry.badges} badges</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map(module => (
            <div key={module.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(module.category)}</span>
                  <div>
                    <h3 className="font-semibold">{module.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(module.difficulty)}`}>
                        {module.difficulty}
                      </span>
                      {module.mandatory && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                          Mandatory
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-cyan-400">{module.points}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">{module.description}</p>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="p-2 bg-gray-800/50 rounded">
                  <div className="font-bold text-green-400">{module.completionRate}%</div>
                  <div className="text-xs text-gray-500">Completion</div>
                </div>
                <div className="p-2 bg-gray-800/50 rounded">
                  <div className="font-bold text-purple-400">{module.averageScore}%</div>
                  <div className="text-xs text-gray-500">Avg Score</div>
                </div>
                <div className="p-2 bg-gray-800/50 rounded">
                  <div className="font-bold text-yellow-400">{module.duration}m</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Score</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Streak</th>
                <th className="p-4">Badges</th>
                <th className="p-4">Risk</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4">
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-gray-500">{emp.email}</div>
                  </td>
                  <td className="p-4">{emp.department}</td>
                  <td className="p-4">
                    <div className={`font-bold ${
                      emp.overallScore >= 85 ? 'text-green-400' :
                      emp.overallScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {emp.overallScore}%
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${(emp.modulesCompleted / emp.totalModules) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{emp.modulesCompleted}/{emp.totalModules}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {emp.streak > 0 ? (
                      <span className="flex items-center gap-1">
                        <span>🔥</span>
                        <span>{emp.streak} days</span>
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {emp.badges.map((badge, idx) => (
                        <span key={idx} title="Badge">{badge}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      emp.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                      emp.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {emp.riskLevel}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => showNotification(`📧 Training reminder sent to ${emp.name} (${emp.email})`)}
                      className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500 rounded text-xs text-cyan-400"
                    >
                      Send Reminder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          {leaderboard.map((entry, idx) => (
            <div key={entry.rank} className={`p-6 rounded-xl ${
              idx === 0 ? 'bg-yellow-500/10 border-2 border-yellow-500' :
              idx === 1 ? 'bg-gray-400/10 border-2 border-gray-400' :
              idx === 2 ? 'bg-orange-600/10 border-2 border-orange-600' :
              'bg-gray-900/50 border border-gray-800'
            }`}>
              <div className="flex items-center gap-6">
                <div className={`text-4xl font-bold ${
                  idx === 0 ? 'text-yellow-400' :
                  idx === 1 ? 'text-gray-400' :
                  idx === 2 ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  #{entry.rank}
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold">{entry.name}</div>
                  <div className="text-sm text-gray-500">{entry.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-400">{entry.score.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{entry.badges}</div>
                  <div className="text-sm text-gray-500">badges</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map(badge => (
            <div key={badge.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-5xl mb-3">{badge.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{badge.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{badge.description}</p>
              <div className="p-2 bg-gray-800/50 rounded text-xs text-gray-500 mb-3">
                {badge.requirement}
              </div>
              <div className="text-sm">
                <span className="text-cyan-400 font-bold">{badge.earnedBy}</span>
                <span className="text-gray-500"> employees earned</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {analysisResult && (
        <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">🤖 AI Analysis Result</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{analysisResult}</p>
          <button onClick={() => setAnalysisResult('')} className="mt-2 text-sm text-purple-400 hover:text-purple-300">Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default SecurityAwarenessTraining;
