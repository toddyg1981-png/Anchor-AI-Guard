/**
 * Developer Security Score Dashboard Widget - WORLD FIRST
 * Visual representation of the 0-850 security score with grade cards
 */

import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';
import { logger } from '../utils/logger';

// Types
export interface SecurityScoreData {
  overall: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    vulnerabilityManagement: number;
    secureCodePractices: number;
    dependencyHealth: number;
    configurationSecurity: number;
    secretsManagement: number;
    responseTime: number;
  };
  trend: 'up' | 'down' | 'stable';
  trendChange: number;
  badges: Badge[];
  percentile: number;
  history: ScoreHistoryPoint[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ScoreHistoryPoint {
  date: string;
  score: number;
}

interface SecurityScoreWidgetProps {
  data?: SecurityScoreData;
  compact?: boolean;
  onViewDetails?: () => void;
}

// Grade color mapping
const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A+': return '#22c55e';
    case 'A': return '#4ade80';
    case 'B': return '#facc15';
    case 'C': return '#fb923c';
    case 'D': return '#f87171';
    case 'F': return '#ef4444';
    default: return '#6b7280';
  }
};

// Rarity color mapping
const getRarityColor = (rarity: Badge['rarity']): string => {
  switch (rarity) {
    case 'legendary': return '#fbbf24';
    case 'epic': return '#a855f7';
    case 'rare': return '#3b82f6';
    default: return '#9ca3af';
  }
};

// Score Ring Component
const ScoreRing: React.FC<{ score: number; size?: number; strokeWidth?: number }> = ({ 
  score, 
  size = 160, 
  strokeWidth = 12 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (score / 850) * 100;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 750) return '#22c55e'; // Green
    if (score >= 650) return '#4ade80'; // Light green
    if (score >= 550) return '#facc15'; // Yellow
    if (score >= 450) return '#fb923c'; // Orange
    if (score >= 350) return '#f87171'; // Light red
    return '#ef4444'; // Red
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Score ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        {/* Glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth={strokeWidth * 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          opacity={0.2}
          filter="blur(8px)"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-sm text-gray-400">/ 850</span>
      </div>
    </div>
  );
};

// Mini Sparkline Chart
const Sparkline: React.FC<{ data: ScoreHistoryPoint[] }> = ({ data }) => {
  if (data.length < 2) return null;

  const width = 100;
  const height = 30;
  const padding = 2;

  const scores = data.map(d => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore || 1;

  const points = data.map((point, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((point.score - minScore) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const trend = scores[scores.length - 1] >= scores[0] ? '#22c55e' : '#ef4444';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={trend}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Breakdown Bar Component
const BreakdownBar: React.FC<{ label: string; value: number; maxValue: number }> = ({ label, value, maxValue }) => {
  const percentage = (value / maxValue) * 100;
  
  const getBarColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor()} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Badge Component
const BadgeDisplay: React.FC<{ badge: Badge }> = ({ badge }) => {
  const rarityColor = getRarityColor(badge.rarity);

  return (
    <div
      className="relative group"
      title={badge.description}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
        style={{ 
          backgroundColor: `${rarityColor}20`,
          border: `2px solid ${rarityColor}`,
          boxShadow: `0 0 10px ${rarityColor}40`
        }}
      >
        {badge.icon}
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <span className="font-medium" style={{ color: rarityColor }}>{badge.name}</span>
        <br />
        <span className="text-gray-400">{badge.description}</span>
      </div>
    </div>
  );
};

// Main Widget Component
export const SecurityScoreWidget: React.FC<SecurityScoreWidgetProps> = ({ 
  data,
  compact = false,
  onViewDetails 
}) => {
  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('security-score');
        } catch (e) { logger.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('security-score', 'Analyze overall security score trends, contributing factors, and improvement recommendations');
      if ((res as any)?.analysis) setAnalysisResult((res as any).analysis);
    } catch (e) { logger.error(e); } finally { setAnalyzing(false); }
  };

  // Mock data for demo
  const [scoreData, _setScoreData] = useState<SecurityScoreData>(data || {
    overall: 724,
    grade: 'A',
    breakdown: {
      vulnerabilityManagement: 135,
      secureCodePractices: 128,
      dependencyHealth: 122,
      configurationSecurity: 118,
      secretsManagement: 132,
      responseTime: 89,
    },
    trend: 'up',
    trendChange: 23,
    percentile: 87,
    badges: [
      { id: '1', name: 'Zero Day Hero', description: 'Fixed critical vulnerability within 24 hours', icon: '🛡️', earnedAt: Date.now(), rarity: 'legendary' },
      { id: '2', name: 'Secret Keeper', description: 'No exposed secrets in 30 days', icon: '🔐', earnedAt: Date.now(), rarity: 'epic' },
      { id: '3', name: 'Patch Master', description: 'Updated 100 dependencies', icon: '⚡', earnedAt: Date.now(), rarity: 'rare' },
      { id: '4', name: 'Code Guardian', description: 'Fixed 50 security issues', icon: '🏆', earnedAt: Date.now(), rarity: 'common' },
    ],
    history: [
      { date: '2024-01-01', score: 650 },
      { date: '2024-01-08', score: 668 },
      { date: '2024-01-15', score: 685 },
      { date: '2024-01-22', score: 692 },
      { date: '2024-01-29', score: 701 },
      { date: '2024-02-05', score: 724 },
    ],
  });

  // Animate score on mount
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    const target = scoreData.overall;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [scoreData.overall]);

  if (compact) {
    return (
      <div 
        className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-cyan-500/50 transition-colors"
        onClick={onViewDetails}
      >
        <div className="flex items-center gap-4">
          <ScoreRing score={displayScore} size={80} strokeWidth={6} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span 
                className="text-2xl font-bold"
                style={{ color: getGradeColor(scoreData.grade) }}
              >
                {scoreData.grade}
              </span>
              <span className={`text-sm ${scoreData.trend === 'up' ? 'text-green-400' : scoreData.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                {scoreData.trend === 'up' ? '↑' : scoreData.trend === 'down' ? '↓' : '→'} {scoreData.trendChange}
              </span>
            </div>
            <p className="text-sm text-gray-400">Top {100 - scoreData.percentile}% of developers</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Developer Security Score</h3>
          <p className="text-sm text-gray-400">Your personal security performance rating</p>
        </div>
        <button
          onClick={handleAIAnalysis}
          disabled={analyzing || backendLoading}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium text-white text-sm flex items-center gap-1 mr-2"
        >
          {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
        </button>
        <div className="flex items-center gap-2">
          <Sparkline data={scoreData.history} />
          <span className={`text-sm font-medium ${scoreData.trend === 'up' ? 'text-green-400' : scoreData.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
            {scoreData.trend === 'up' ? '+' : scoreData.trend === 'down' ? '-' : ''}{scoreData.trendChange}
          </span>
        </div>
      </div>

      {/* Main Score */}
      <div className="p-6 flex items-center gap-8">
        <ScoreRing score={displayScore} />
        
        <div className="flex-1">
          <div className="flex items-baseline gap-3 mb-4">
            <span 
              className="text-5xl font-bold"
              style={{ color: getGradeColor(scoreData.grade) }}
            >
              {scoreData.grade}
            </span>
            <span className="text-gray-400">
              Top <span className="text-white font-medium">{100 - scoreData.percentile}%</span> of developers
            </span>
          </div>
          
          {/* Breakdown */}
          <div className="space-y-3">
            <BreakdownBar label="Vulnerability Management" value={scoreData.breakdown.vulnerabilityManagement} maxValue={150} />
            <BreakdownBar label="Secure Code Practices" value={scoreData.breakdown.secureCodePractices} maxValue={150} />
            <BreakdownBar label="Dependency Health" value={scoreData.breakdown.dependencyHealth} maxValue={150} />
            <BreakdownBar label="Configuration Security" value={scoreData.breakdown.configurationSecurity} maxValue={150} />
            <BreakdownBar label="Secrets Management" value={scoreData.breakdown.secretsManagement} maxValue={150} />
            <BreakdownBar label="Response Time" value={scoreData.breakdown.responseTime} maxValue={100} />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="px-6 py-4 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Earned Badges</h4>
        <div className="flex flex-wrap gap-3">
          {scoreData.badges.map(badge => (
            <BadgeDisplay key={badge.id} badge={badge} />
          ))}
        </div>
      </div>

      {/* Actions */}
      {onViewDetails && (
        <div className="px-6 py-3 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={onViewDetails}
            className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            View Full Report
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      {analysisResult && (
        <div className="mt-4 mx-6 mb-4 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">🤖 AI Analysis Result</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{analysisResult}</p>
          <button onClick={() => setAnalysisResult('')} className="mt-2 text-sm text-purple-400 hover:text-purple-300">Dismiss</button>
        </div>
      )}
    </div>
  );
};

// Leaderboard Component
export const SecurityLeaderboard: React.FC<{ users: Array<{ id: string; name: string; score: number; grade: string; avatar?: string }> }> = ({ users }) => {
  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Team Leaderboard</h3>
        <p className="text-sm text-gray-400">Security scores across your team</p>
      </div>
      <div className="divide-y divide-gray-700">
        {sortedUsers.map((user, index) => (
          <div key={user.id} className="px-6 py-3 flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              index === 0 ? 'bg-yellow-500 text-yellow-900' :
              index === 1 ? 'bg-gray-300 text-gray-800' :
              index === 2 ? 'bg-amber-600 text-amber-100' :
              'bg-gray-700 text-gray-300'
            }`}>
              {index + 1}
            </div>
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">{user.name}</div>
              <div className="text-xs text-gray-500">{user.score} points</div>
            </div>
            <span 
              className="text-lg font-bold"
              style={{ color: getGradeColor(user.grade) }}
            >
              {user.grade}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityScoreWidget;
