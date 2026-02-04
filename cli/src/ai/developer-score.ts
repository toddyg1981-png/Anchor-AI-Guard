/**
 * Developer Security Score - WORLD FIRST
 * Personal security credit score for developers (0-850)
 */

import { Finding, ScanResult, Severity } from '../types';

export interface DeveloperScore {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    codeQuality: number;
    securityAwareness: number;
    remediationSpeed: number;
    preventionRate: number;
    learningProgress: number;
  };
  history: ScoreHistory[];
  badges: Badge[];
  recommendations: string[];
  rank: {
    team?: number;
    global?: number;
    percentile: number;
  };
}

export interface ScoreHistory {
  date: string;
  score: number;
  findings: number;
  fixed: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
  progress?: number;
}

export interface DeveloperActivity {
  commits: CommitActivity[];
  fixes: FixActivity[];
  scanResults: ScanResult[];
}

interface CommitActivity {
  sha: string;
  date: string;
  files: string[];
  findings: Finding[];
}

interface FixActivity {
  date: string;
  finding: Finding;
  timeToFix: number; // hours
}

const BADGES: Badge[] = [
  {
    id: 'first-fix',
    name: 'First Fix',
    icon: '🔧',
    description: 'Fixed your first security vulnerability',
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Fixed a critical vulnerability within 1 hour',
  },
  {
    id: 'clean-streak',
    name: 'Clean Streak',
    icon: '✨',
    description: '10 consecutive commits with no new vulnerabilities',
  },
  {
    id: 'security-champion',
    name: 'Security Champion',
    icon: '🏆',
    description: 'Fixed 100+ vulnerabilities',
  },
  {
    id: 'zero-day-hero',
    name: 'Zero Day Hero',
    icon: '🦸',
    description: 'Fixed a vulnerability before it was exploited',
  },
  {
    id: 'dependency-master',
    name: 'Dependency Master',
    icon: '📦',
    description: 'Kept all dependencies up-to-date for 30 days',
  },
  {
    id: 'secret-keeper',
    name: 'Secret Keeper',
    icon: '🔐',
    description: 'No hardcoded secrets for 90 days',
  },
  {
    id: 'input-validator',
    name: 'Input Validator',
    icon: '🛡️',
    description: 'Zero injection vulnerabilities for 30 days',
  },
  {
    id: 'team-player',
    name: 'Team Player',
    icon: '👥',
    description: 'Helped fix vulnerabilities in 5+ different repos',
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    icon: '💎',
    description: 'Achieved a security score of 800+',
  },
];

export class DeveloperSecurityScore {
  private history: ScoreHistory[] = [];
  private earnedBadges: Set<string> = new Set();

  /**
   * Calculate developer security score
   */
  calculateScore(activity: DeveloperActivity): DeveloperScore {
    const breakdown = {
      codeQuality: this.calculateCodeQuality(activity),
      securityAwareness: this.calculateSecurityAwareness(activity),
      remediationSpeed: this.calculateRemediationSpeed(activity),
      preventionRate: this.calculatePreventionRate(activity),
      learningProgress: this.calculateLearningProgress(activity),
    };

    // Weighted average
    const weights = {
      codeQuality: 0.25,
      securityAwareness: 0.25,
      remediationSpeed: 0.20,
      preventionRate: 0.20,
      learningProgress: 0.10,
    };

    const score = Math.round(
      breakdown.codeQuality * weights.codeQuality +
      breakdown.securityAwareness * weights.securityAwareness +
      breakdown.remediationSpeed * weights.remediationSpeed +
      breakdown.preventionRate * weights.preventionRate +
      breakdown.learningProgress * weights.learningProgress
    );

    // Update history
    this.history.push({
      date: new Date().toISOString(),
      score,
      findings: activity.scanResults.flatMap(r => r.findings).length,
      fixed: activity.fixes.length,
    });

    // Check for new badges
    const badges = this.checkBadges(activity, score);

    return {
      score,
      grade: this.scoreToGrade(score),
      breakdown,
      history: this.history.slice(-30), // Last 30 entries
      badges,
      recommendations: this.generateRecommendations(breakdown, activity),
      rank: {
        percentile: this.calculatePercentile(score),
      },
    };
  }

  /**
   * Code Quality Score (0-850)
   * Based on ratio of clean commits to total commits
   */
  private calculateCodeQuality(activity: DeveloperActivity): number {
    if (activity.commits.length === 0) return 500; // Neutral starting point

    const cleanCommits = activity.commits.filter(c => c.findings.length === 0).length;
    const ratio = cleanCommits / activity.commits.length;

    // Severity weighting for commits with issues
    const severityPenalties = activity.commits.reduce((sum, commit) => {
      return sum + commit.findings.reduce((p, f) => {
        const penalties: Record<Severity, number> = {
          critical: 50,
          high: 30,
          medium: 15,
          low: 5,
          info: 1,
        };
        return p + (penalties[f.severity] || 0);
      }, 0);
    }, 0);

    const baseScore = 300 + (ratio * 400);
    const adjustedScore = baseScore - Math.min(severityPenalties, 200);
    
    return Math.max(0, Math.min(850, Math.round(adjustedScore)));
  }

  /**
   * Security Awareness Score (0-850)
   * Based on types of vulnerabilities introduced
   */
  private calculateSecurityAwareness(activity: DeveloperActivity): number {
    const allFindings = activity.scanResults.flatMap(r => r.findings);
    
    if (allFindings.length === 0) return 750; // Good score for no issues

    // High-impact vulns indicate lower awareness
    const critical = allFindings.filter(f => f.severity === 'critical').length;
    const high = allFindings.filter(f => f.severity === 'high').length;
    const owaspTop10 = allFindings.filter(f => f.owasp).length;

    const baseScore = 700;
    const penalty = (critical * 100) + (high * 50) + (owaspTop10 * 25);
    
    return Math.max(0, Math.min(850, baseScore - Math.min(penalty, 600)));
  }

  /**
   * Remediation Speed Score (0-850)
   * Based on how quickly vulnerabilities are fixed
   */
  private calculateRemediationSpeed(activity: DeveloperActivity): number {
    if (activity.fixes.length === 0) return 400; // Neutral

    const avgTimeToFix = activity.fixes.reduce((sum, f) => sum + f.timeToFix, 0) / activity.fixes.length;

    // Scoring based on fix time
    // <1 hour = 850, <24 hours = 700, <7 days = 500, >7 days = 300
    if (avgTimeToFix <= 1) return 850;
    if (avgTimeToFix <= 24) return 700;
    if (avgTimeToFix <= 168) return 500; // 7 days
    return Math.max(0, 300 - Math.floor((avgTimeToFix - 168) / 24) * 10);
  }

  /**
   * Prevention Rate Score (0-850)
   * Based on trend of introducing fewer vulnerabilities over time
   */
  private calculatePreventionRate(activity: DeveloperActivity): number {
    if (activity.commits.length < 10) return 500; // Need history

    // Compare first half vs second half
    const mid = Math.floor(activity.commits.length / 2);
    const firstHalf = activity.commits.slice(0, mid);
    const secondHalf = activity.commits.slice(mid);

    const firstHalfFindings = firstHalf.reduce((sum, c) => sum + c.findings.length, 0);
    const secondHalfFindings = secondHalf.reduce((sum, c) => sum + c.findings.length, 0);

    if (firstHalfFindings === 0 && secondHalfFindings === 0) return 800;
    if (firstHalfFindings === 0) return 300; // Getting worse
    
    const improvement = (firstHalfFindings - secondHalfFindings) / firstHalfFindings;
    
    // Map -1 to 1 improvement to 200-850 score
    return Math.round(525 + (improvement * 325));
  }

  /**
   * Learning Progress Score (0-850)
   * Based on fixing same type of vulnerability multiple times (bad) vs learning
   */
  private calculateLearningProgress(activity: DeveloperActivity): number {
    const allFindings = activity.commits.flatMap(c => c.findings);
    
    if (allFindings.length === 0) return 700;

    // Count repeat vulnerability types
    const vulnTypeCounts: Record<string, number> = {};
    allFindings.forEach(f => {
      vulnTypeCounts[f.rule] = (vulnTypeCounts[f.rule] || 0) + 1;
    });

    const repeatOffenses = Object.values(vulnTypeCounts).filter(c => c > 2).length;
    const uniqueVulnTypes = Object.keys(vulnTypeCounts).length;
    
    const baseScore = 700;
    const penalty = repeatOffenses * 50;
    const bonus = Math.min(uniqueVulnTypes * 10, 100); // Diversity bonus

    return Math.max(0, Math.min(850, baseScore - penalty + bonus));
  }

  private scoreToGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 800) return 'A+';
    if (score >= 700) return 'A';
    if (score >= 600) return 'B';
    if (score >= 500) return 'C';
    if (score >= 400) return 'D';
    return 'F';
  }

  private calculatePercentile(score: number): number {
    // Simulated distribution - in production, compare against real data
    if (score >= 800) return 95;
    if (score >= 700) return 80;
    if (score >= 600) return 60;
    if (score >= 500) return 40;
    if (score >= 400) return 20;
    return 10;
  }

  private checkBadges(activity: DeveloperActivity, score: number): Badge[] {
    const badges: Badge[] = [];
    const totalFixes = activity.fixes.length;
    
    // First Fix
    if (totalFixes >= 1 && !this.earnedBadges.has('first-fix')) {
      this.earnedBadges.add('first-fix');
      badges.push({ ...BADGES.find(b => b.id === 'first-fix')!, earnedAt: new Date().toISOString() });
    }

    // Speed Demon
    const fastFix = activity.fixes.find(f => f.timeToFix <= 1 && f.finding.severity === 'critical');
    if (fastFix && !this.earnedBadges.has('speed-demon')) {
      this.earnedBadges.add('speed-demon');
      badges.push({ ...BADGES.find(b => b.id === 'speed-demon')!, earnedAt: new Date().toISOString() });
    }

    // Clean Streak
    const recentCommits = activity.commits.slice(-10);
    if (recentCommits.length >= 10 && recentCommits.every(c => c.findings.length === 0)) {
      if (!this.earnedBadges.has('clean-streak')) {
        this.earnedBadges.add('clean-streak');
        badges.push({ ...BADGES.find(b => b.id === 'clean-streak')!, earnedAt: new Date().toISOString() });
      }
    }

    // Security Champion
    if (totalFixes >= 100 && !this.earnedBadges.has('security-champion')) {
      this.earnedBadges.add('security-champion');
      badges.push({ ...BADGES.find(b => b.id === 'security-champion')!, earnedAt: new Date().toISOString() });
    }

    // Perfectionist
    if (score >= 800 && !this.earnedBadges.has('perfectionist')) {
      this.earnedBadges.add('perfectionist');
      badges.push({ ...BADGES.find(b => b.id === 'perfectionist')!, earnedAt: new Date().toISOString() });
    }

    // Add progress for unearned badges
    const allBadgesWithProgress = BADGES.map(badge => {
      if (this.earnedBadges.has(badge.id)) {
        return { ...badge, earnedAt: 'earned' };
      }
      
      let progress = 0;
      switch (badge.id) {
        case 'first-fix':
          progress = totalFixes > 0 ? 100 : 0;
          break;
        case 'security-champion':
          progress = Math.min(100, (totalFixes / 100) * 100);
          break;
        case 'clean-streak':
          const cleanCommits = activity.commits.slice(-10).filter(c => c.findings.length === 0).length;
          progress = (cleanCommits / 10) * 100;
          break;
        case 'perfectionist':
          progress = Math.min(100, (score / 800) * 100);
          break;
      }
      
      return { ...badge, progress };
    });

    return allBadgesWithProgress;
  }

  private generateRecommendations(
    breakdown: DeveloperScore['breakdown'],
    activity: DeveloperActivity
  ): string[] {
    const recommendations: string[] = [];

    if (breakdown.codeQuality < 600) {
      recommendations.push('Run security scans locally before committing to catch issues early');
    }

    if (breakdown.securityAwareness < 600) {
      recommendations.push('Complete the OWASP Top 10 training module to improve security awareness');
    }

    if (breakdown.remediationSpeed < 500) {
      recommendations.push('Try to fix critical vulnerabilities within 24 hours of detection');
    }

    if (breakdown.preventionRate < 500) {
      recommendations.push('Review your recent vulnerabilities and add pre-commit hooks to prevent similar issues');
    }

    if (breakdown.learningProgress < 500) {
      recommendations.push('You\'re repeating similar mistakes - consider setting up custom linting rules');
    }

    // Specific vulnerability recommendations
    const allFindings = activity.scanResults.flatMap(r => r.findings);
    const vulnTypes = [...new Set(allFindings.map(f => f.rule))];
    
    if (vulnTypes.includes('sql-injection')) {
      recommendations.push('Use parameterized queries consistently to prevent SQL injection');
    }
    
    if (vulnTypes.includes('xss-innerhtml')) {
      recommendations.push('Switch to textContent or use a sanitization library for user content');
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Get leaderboard position
   */
  getLeaderboard(
    allDevelopers: Array<{ id: string; name: string; score: number }>
  ): Array<{ rank: number; name: string; score: number; grade: string }> {
    return allDevelopers
      .sort((a, b) => b.score - a.score)
      .map((dev, i) => ({
        rank: i + 1,
        name: dev.name,
        score: dev.score,
        grade: this.scoreToGrade(dev.score),
      }));
  }

  /**
   * Generate score card HTML
   */
  generateScoreCard(score: DeveloperScore, developerName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
      color: white;
      padding: 20px;
      margin: 0;
    }
    .card {
      max-width: 400px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 20px 60px rgba(0, 255, 157, 0.1);
      border: 1px solid rgba(0, 255, 157, 0.2);
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .score-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: conic-gradient(
        #00ff9d 0deg,
        #00ff9d ${(score.score / 850) * 360}deg,
        #333 ${(score.score / 850) * 360}deg
      );
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .score-inner {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: #1a1a2e;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .score-value {
      font-size: 36px;
      font-weight: bold;
      color: #00ff9d;
    }
    .grade {
      font-size: 24px;
      color: #00ff9d;
    }
    .breakdown {
      margin: 20px 0;
    }
    .metric {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      font-size: 14px;
    }
    .metric-bar {
      width: 60%;
      height: 8px;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
    }
    .metric-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ff9d, #00d4aa);
      border-radius: 4px;
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin-top: 20px;
    }
    .badge {
      font-size: 24px;
      padding: 5px;
      background: rgba(0, 255, 157, 0.1);
      border-radius: 8px;
    }
    .badge.locked {
      opacity: 0.3;
    }
    .percentile {
      text-align: center;
      color: #888;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>🔒 ${developerName}</h2>
      <p>Security Score</p>
    </div>
    
    <div class="score-circle">
      <div class="score-inner">
        <div class="score-value">${score.score}</div>
        <div class="grade">${score.grade}</div>
      </div>
    </div>
    
    <div class="breakdown">
      <div class="metric">
        <span>Code Quality</span>
        <div class="metric-bar">
          <div class="metric-fill" style="width: ${(score.breakdown.codeQuality / 850) * 100}%"></div>
        </div>
        <span>${score.breakdown.codeQuality}</span>
      </div>
      <div class="metric">
        <span>Security Awareness</span>
        <div class="metric-bar">
          <div class="metric-fill" style="width: ${(score.breakdown.securityAwareness / 850) * 100}%"></div>
        </div>
        <span>${score.breakdown.securityAwareness}</span>
      </div>
      <div class="metric">
        <span>Remediation Speed</span>
        <div class="metric-bar">
          <div class="metric-fill" style="width: ${(score.breakdown.remediationSpeed / 850) * 100}%"></div>
        </div>
        <span>${score.breakdown.remediationSpeed}</span>
      </div>
      <div class="metric">
        <span>Prevention Rate</span>
        <div class="metric-bar">
          <div class="metric-fill" style="width: ${(score.breakdown.preventionRate / 850) * 100}%"></div>
        </div>
        <span>${score.breakdown.preventionRate}</span>
      </div>
      <div class="metric">
        <span>Learning Progress</span>
        <div class="metric-bar">
          <div class="metric-fill" style="width: ${(score.breakdown.learningProgress / 850) * 100}%"></div>
        </div>
        <span>${score.breakdown.learningProgress}</span>
      </div>
    </div>
    
    <div class="badges">
      ${score.badges.map(b => `
        <div class="badge ${b.earnedAt ? '' : 'locked'}" title="${b.description}">
          ${b.icon}
        </div>
      `).join('')}
    </div>
    
    <div class="percentile">
      Top ${100 - score.rank.percentile}% of developers
    </div>
  </div>
</body>
</html>`;
  }
}
