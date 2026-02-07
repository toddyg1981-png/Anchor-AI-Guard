import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

const SecurityTraining: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'paths' | 'leaderboard' | 'compliance'>('courses');

  const [courses, setCourses] = useState([
    { id: 'c-1', name: 'Phishing Defense', completion: '91%', learners: 1842, duration: '45min', difficulty: 'Beginner' },
    { id: 'c-2', name: 'Secure Coding', completion: '78%', learners: 620, duration: '2h', difficulty: 'Intermediate' },
    { id: 'c-3', name: 'Data Handling (Gov)', completion: '86%', learners: 540, duration: '1h', difficulty: 'Beginner' },
    { id: 'c-4', name: 'Incident Response Basics', completion: '72%', learners: 380, duration: '1.5h', difficulty: 'Intermediate' },
    { id: 'c-5', name: 'Cloud Security Fundamentals', completion: '68%', learners: 290, duration: '3h', difficulty: 'Advanced' },
    { id: 'c-6', name: 'Social Engineering Awareness', completion: '94%', learners: 2100, duration: '30min', difficulty: 'Beginner' },
  ]);

  const [stats, setStats] = useState([
    { label: 'Completions (30d)', value: 3120 },
    { label: 'Avg score', value: '92%' },
    { label: 'High-risk users', value: 24 },
    { label: 'Live campaigns', value: 6 },
  ]);

  const learningPaths = [
    { name: 'Security Champion', courses: 8, enrolled: 142, completed: 89, badge: 'Gold' },
    { name: 'Developer Security', courses: 6, enrolled: 312, completed: 201, badge: 'Silver' },
    { name: 'Executive Awareness', courses: 3, enrolled: 48, completed: 44, badge: 'Platinum' },
    { name: 'Compliance Specialist', courses: 5, enrolled: 86, completed: 62, badge: 'Gold' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah Chen', dept: 'Engineering', points: 4850, streak: 42 },
    { rank: 2, name: 'Marcus Rivera', dept: 'Security', points: 4620, streak: 38 },
    { rank: 3, name: 'Aisha Patel', dept: 'Product', points: 4410, streak: 35 },
    { rank: 4, name: 'James Wu', dept: 'Engineering', points: 4200, streak: 30 },
    { rank: 5, name: 'Elena Volkov', dept: 'DevOps', points: 3980, streak: 28 },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await backendApi.modules.getDashboard('security-training');
      if ((result as any)?.stats) setStats(prev => (result as any).stats.length > 0 ? (result as any).stats : prev);
      if ((result as any)?.items) setCourses(prev => (result as any).items.length > 0 ? (result as any).items : prev);
    } catch (err) {
      console.error('Failed to load training dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCurriculum = async () => {
    setAnalyzing(true);
    try {
      const result = await backendApi.modules.analyze('security-training', 'Generate a tailored security training curriculum based on our organization risk profile and role distribution');
      if ((result as any)?.analysis) setAnalysisResult((result as any).analysis);
    } catch (err) {
      console.error('Curriculum generation failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-400 to-blue-400">Security Training</h1>
          <p className="text-slate-400">Gamified awareness, role-based paths, and compliance-ready modules.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleGenerateCurriculum} disabled={analyzing}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {analyzing ? 'Generating...' : 'AI Curriculum'}
          </button>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">New content weekly</div>
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
        {(['courses', 'paths', 'leaderboard', 'compliance'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-slate-800 text-green-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'courses' ? 'Courses' : tab === 'paths' ? 'Learning Paths' : tab === 'leaderboard' ? 'Leaderboard' : 'Compliance'}
          </button>
        ))}
      </div>

      {activeTab === 'courses' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Active Courses</h2>
          {courses.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">{item.duration} | {item.difficulty} | {item.learners} learners</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: item.completion }} />
                </div>
                <span className="text-xs text-green-300 w-10 text-right">{item.completion}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'paths' && (
        <div className="grid md:grid-cols-2 gap-4">
          {learningPaths.map(path => (
            <div key={path.name} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{path.name}</h3>
                <span className="px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-300">{path.badge}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div><div className="text-lg font-bold">{path.courses}</div><div className="text-xs text-slate-400">Courses</div></div>
                <div><div className="text-lg font-bold">{path.enrolled}</div><div className="text-xs text-slate-400">Enrolled</div></div>
                <div><div className="text-lg font-bold text-green-400">{path.completed}</div><div className="text-xs text-slate-400">Completed</div></div>
              </div>
              <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(path.completed / path.enrolled) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
          <h3 className="font-semibold mb-2">Top Security Champions</h3>
          {leaderboard.map(user => (
            <div key={user.rank} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${user.rank <= 3 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'}`}>{user.rank}</span>
                <div>
                  <div className="font-medium text-sm">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.dept}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-400">{user.points.toLocaleString()} pts</div>
                <div className="text-xs text-slate-400">{user.streak}d streak</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold mb-2">Compliance Training Status</h3>
          {[{ name: 'Annual Security Awareness', due: '2026-03-31', completion: 94, required: true },
            { name: 'HIPAA Privacy', due: '2026-06-30', completion: 88, required: true },
            { name: 'PCI DSS Handling', due: '2026-04-15', completion: 91, required: true },
            { name: 'GDPR Data Protection', due: '2026-05-01', completion: 82, required: true },
          ].map(c => (
            <div key={c.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-slate-500">Due: {c.due} {c.required && '• Required'}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.completion >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${c.completion}%` }} />
                </div>
                <span className="text-sm font-medium w-10 text-right">{c.completion}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {analysisResult && (
        <div className="bg-slate-800 border border-green-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-green-400 mb-2">AI Curriculum Recommendation</h3>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default SecurityTraining;
