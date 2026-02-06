import React from 'react';

const SecurityTraining: React.FC = () => {
  const courses = [
    { id: 'c-1', name: 'Phishing Defense', completion: '91%', learners: 1842 },
    { id: 'c-2', name: 'Secure Coding', completion: '78%', learners: 620 },
    { id: 'c-3', name: 'Data Handling (Gov)', completion: '86%', learners: 540 },
  ];

  const stats = [
    { label: 'Completions (30d)', value: 3120 },
    { label: 'Avg score', value: '92%' },
    { label: 'High-risk users', value: 24 },
    { label: 'Live campaigns', value: 6 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-400 to-blue-400">Security Training</h1>
          <p className="text-slate-400">Gamified awareness, role-based paths, and compliance-ready modules.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">New content weekly</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Courses</h2>
          <span className="text-xs text-slate-400">Engagement</span>
        </div>
        <div className="space-y-3">
          {courses.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Learners: {item.learners}</div>
              </div>
              <div className="text-right text-xs text-green-300">{item.completion}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityTraining;
