/**
 * Predictive Vulnerability AI - WORLD FIRST
 * Predicts vulnerabilities before they become CVEs
 */

import Anthropic from '@anthropic-ai/sdk';
import { Severity } from '../types';

export interface PredictedVulnerability {
  id: string;
  confidence: number; // 0-1
  predictedSeverity: Severity;
  category: string;
  description: string;
  affectedCode: {
    file: string;
    lines?: [number, number];
    pattern: string;
  };
  reasoning: string;
  timeToExploit: 'days' | 'weeks' | 'months';
  recommendation: string;
  relatedCVEs: string[];
}

export interface PredictionContext {
  dependencies: Record<string, string>;
  codePatterns: string[];
  technology: string[];
  recentCVEs: CVEInfo[];
}

interface CVEInfo {
  id: string;
  description: string;
  severity: string;
  affected: string[];
  published: string;
}

// Known vulnerability patterns that often precede CVEs
const VULNERABILITY_SIGNALS: Array<{
  pattern: RegExp;
  category: string;
  risk: string;
  examples: string[];
}> = [
  {
    pattern: /JSON\.parse\s*\([^)]*\)/g,
    category: 'prototype-pollution',
    risk: 'Libraries with unsafe JSON parsing often get CVEs',
    examples: ['CVE-2020-8203 (lodash)', 'CVE-2021-23337 (lodash)'],
  },
  {
    pattern: /new\s+Function\s*\(/g,
    category: 'code-injection',
    risk: 'Dynamic function creation is a frequent CVE source',
    examples: ['CVE-2021-23369 (handlebars)', 'CVE-2021-23383 (handlebars)'],
  },
  {
    pattern: /\.merge\s*\(|Object\.assign\s*\([^,]+,\s*[^)]*\)/g,
    category: 'prototype-pollution',
    risk: 'Deep merge operations commonly lead to prototype pollution CVEs',
    examples: ['CVE-2020-28499 (merge-deep)', 'CVE-2021-25944 (deep-extend)'],
  },
  {
    pattern: /yaml\.load\s*\(|YAML\.parse\s*\(/g,
    category: 'arbitrary-code-execution',
    risk: 'YAML parsing with unsafe options frequently causes RCE CVEs',
    examples: ['CVE-2021-21366 (xmldom)', 'CVE-2020-14343 (pyyaml)'],
  },
  {
    pattern: /serialize|deserialize|unserialize/gi,
    category: 'insecure-deserialization',
    risk: 'Deserialization is a top source of critical CVEs',
    examples: ['CVE-2017-5941 (node-serialize)', 'CVE-2019-18371'],
  },
  {
    pattern: /jwt\.(?:sign|verify)\s*\([^)]*(?:algorithm|algorithms)/gi,
    category: 'jwt-bypass',
    risk: 'JWT libraries often have algorithm confusion CVEs',
    examples: ['CVE-2022-23539 (jsonwebtoken)', 'CVE-2022-23540'],
  },
  {
    pattern: /xml\.parse|parseXML|DOMParser/gi,
    category: 'xxe',
    risk: 'XML parsing without proper configuration leads to XXE CVEs',
    examples: ['CVE-2021-21366 (xmldom)', 'CVE-2022-39353'],
  },
  {
    pattern: /tar\.extract|unzip|decompress/gi,
    category: 'path-traversal',
    risk: 'Archive extraction commonly has path traversal CVEs',
    examples: ['CVE-2024-28863 (tar)', 'CVE-2021-32803 (tar)'],
  },
  {
    pattern: /\.template\s*\(|mustache|handlebars|ejs/gi,
    category: 'ssti',
    risk: 'Template engines are frequent sources of RCE CVEs',
    examples: ['CVE-2022-29078 (ejs)', 'CVE-2021-23369 (handlebars)'],
  },
  {
    pattern: /require\s*\(\s*[`'"]\s*\+|import\s*\(\s*[^'"]/g,
    category: 'code-injection',
    risk: 'Dynamic imports can lead to code injection CVEs',
    examples: ['CVE-2021-3807 (ansi-regex)', 'CVE-2022-24785 (moment)'],
  },
];

// High-risk dependency patterns
const HIGH_RISK_DEPS = [
  { name: 'lodash', reason: 'Frequent prototype pollution CVEs', latestSafe: '4.17.21' },
  { name: 'moment', reason: 'Abandoned, has known ReDoS issues', latestSafe: 'use dayjs' },
  { name: 'request', reason: 'Deprecated, security issues unfixed', latestSafe: 'use axios' },
  { name: 'serialize-javascript', reason: 'History of RCE vulnerabilities', latestSafe: '6.0.0' },
  { name: 'node-fetch', reason: 'Header leak and SSRF issues', latestSafe: '3.3.2' },
  { name: 'tar', reason: 'Recurring path traversal CVEs', latestSafe: '6.2.1' },
  { name: 'minimist', reason: 'Prototype pollution history', latestSafe: '1.2.8' },
  { name: 'qs', reason: 'Prototype pollution issues', latestSafe: '6.11.0' },
  { name: 'handlebars', reason: 'RCE vulnerability history', latestSafe: '4.7.8' },
  { name: 'express', reason: 'Open redirect and security headers', latestSafe: '4.19.2' },
];

export class PredictiveVulnerabilityAI {
  private anthropic: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Predict potential vulnerabilities before they become CVEs
   */
  async predict(
    code: Map<string, string>,
    context: PredictionContext
  ): Promise<PredictedVulnerability[]> {
    const predictions: PredictedVulnerability[] = [];

    // 1. Pattern-based predictions
    for (const [file, content] of code.entries()) {
      for (const signal of VULNERABILITY_SIGNALS) {
        const matches = content.match(signal.pattern);
        if (matches) {
          predictions.push({
            id: `pred-${signal.category}-${predictions.length}`,
            confidence: 0.6,
            predictedSeverity: 'medium',
            category: signal.category,
            description: `Code pattern detected that historically leads to CVEs`,
            affectedCode: {
              file,
              pattern: matches[0],
            },
            reasoning: signal.risk,
            timeToExploit: 'weeks',
            recommendation: `Review usage of ${signal.pattern.source} - similar patterns have caused ${signal.examples.join(', ')}`,
            relatedCVEs: signal.examples,
          });
        }
      }
    }

    // 2. Dependency-based predictions
    for (const [dep, version] of Object.entries(context.dependencies)) {
      const highRisk = HIGH_RISK_DEPS.find(d => dep.includes(d.name));
      if (highRisk) {
        predictions.push({
          id: `pred-dep-${dep}`,
          confidence: 0.7,
          predictedSeverity: 'high',
          category: 'vulnerable-dependency',
          description: `${dep}@${version} has a history of security issues`,
          affectedCode: {
            file: 'package.json',
            pattern: `"${dep}": "${version}"`,
          },
          reasoning: highRisk.reason,
          timeToExploit: 'days',
          recommendation: `Consider ${highRisk.latestSafe.startsWith('use') ? highRisk.latestSafe : `upgrading to ${highRisk.latestSafe}`}`,
          relatedCVEs: [],
        });
      }
    }

    // 3. AI-powered deep analysis for high-confidence predictions
    const aiPredictions = await this.aiDeepAnalysis(code, context);
    predictions.push(...aiPredictions);

    // Sort by confidence * severity weight
    const severityWeight: Record<Severity, number> = {
      critical: 5, high: 4, medium: 3, low: 2, info: 1
    };
    
    predictions.sort((a, b) => 
      (b.confidence * severityWeight[b.predictedSeverity]) -
      (a.confidence * severityWeight[a.predictedSeverity])
    );

    return predictions;
  }

  /**
   * AI deep analysis for emerging vulnerability patterns
   */
  private async aiDeepAnalysis(
    code: Map<string, string>,
    context: PredictionContext
  ): Promise<PredictedVulnerability[]> {
    // Sample code for analysis
    const codeSamples = Array.from(code.entries())
      .slice(0, 5)
      .map(([file, content]) => `// ${file}\n${content.slice(0, 2000)}`)
      .join('\n\n---\n\n');

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: `You are a security researcher specializing in predicting future CVEs.
Analyze code patterns and dependencies to identify potential vulnerabilities that haven't been publicly disclosed yet.

Focus on:
1. Patterns similar to recent CVEs
2. Deprecated or risky library usage
3. Security anti-patterns that often lead to vulnerabilities
4. Missing security controls that could be exploited

Respond with JSON array of predictions.`,
      messages: [
        {
          role: 'user',
          content: `Analyze this code for potential future vulnerabilities:

Technologies: ${context.technology.join(', ')}
Recent related CVEs: ${context.recentCVEs.map(c => c.id).join(', ')}

Code samples:
${codeSamples}

Dependencies:
${Object.entries(context.dependencies).slice(0, 20).map(([k, v]) => `${k}: ${v}`).join('\n')}

Provide predictions in this JSON format:
[{
  "confidence": 0.75,
  "predictedSeverity": "high",
  "category": "prototype-pollution",
  "description": "Description of the predicted vulnerability",
  "file": "path/to/file.js",
  "pattern": "code pattern found",
  "reasoning": "Why this is likely to become a CVE",
  "timeToExploit": "weeks",
  "recommendation": "How to prevent it",
  "relatedCVEs": ["CVE-XXXX-XXXX"]
}]`,
        },
      ],
    });

    try {
      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((p: any, i: number) => ({
          id: `pred-ai-${i}`,
          confidence: p.confidence || 0.5,
          predictedSeverity: p.predictedSeverity || 'medium',
          category: p.category || 'unknown',
          description: p.description || '',
          affectedCode: {
            file: p.file || 'unknown',
            pattern: p.pattern || '',
          },
          reasoning: p.reasoning || '',
          timeToExploit: p.timeToExploit || 'weeks',
          recommendation: p.recommendation || '',
          relatedCVEs: p.relatedCVEs || [],
        }));
      }
    } catch {
      // AI parsing failed
    }

    return [];
  }

  /**
   * Get trending CVE patterns
   */
  async getTrendingThreats(): Promise<{
    trends: Array<{
      category: string;
      count: number;
      trend: 'rising' | 'stable' | 'declining';
      description: string;
    }>;
    recommendations: string[];
  }> {
    // In production, this would fetch from NVD, GitHub Security Advisories, etc.
    return {
      trends: [
        {
          category: 'Prototype Pollution',
          count: 47,
          trend: 'rising',
          description: 'NPM packages continue to have prototype pollution issues',
        },
        {
          category: 'ReDoS',
          count: 35,
          trend: 'stable',
          description: 'Regular expression denial of service in input validation',
        },
        {
          category: 'Supply Chain',
          count: 89,
          trend: 'rising',
          description: 'Malicious packages and dependency confusion attacks',
        },
        {
          category: 'JWT Issues',
          count: 23,
          trend: 'stable',
          description: 'Algorithm confusion and signature bypass vulnerabilities',
        },
        {
          category: 'SSRF',
          count: 31,
          trend: 'rising',
          description: 'Server-side request forgery in cloud environments',
        },
      ],
      recommendations: [
        'Enable npm audit in CI/CD pipelines',
        'Use lockfiles and verify checksums',
        'Implement strict Content-Security-Policy headers',
        'Validate all user input with allowlists',
        'Use parameterized queries for all database operations',
      ],
    };
  }

  /**
   * Generate early warning report
   */
  generateReport(predictions: PredictedVulnerability[]): string {
    const critical = predictions.filter(p => p.predictedSeverity === 'critical');
    const high = predictions.filter(p => p.predictedSeverity === 'high');

    return `
# 🔮 Predictive Security Report

## Executive Summary

Anchor's AI has identified **${predictions.length} potential vulnerabilities** that may become exploitable in the near future.

| Risk Level | Count | Immediate Action |
|------------|-------|------------------|
| 🔴 Critical | ${critical.length} | Fix within 24 hours |
| 🟠 High | ${high.length} | Fix within 7 days |
| 🟡 Medium | ${predictions.filter(p => p.predictedSeverity === 'medium').length} | Fix within 30 days |

## Top Predictions

${predictions.slice(0, 5).map((p, i) => `
### ${i + 1}. ${p.category} (${Math.round(p.confidence * 100)}% confidence)

**Severity:** ${p.predictedSeverity.toUpperCase()}  
**Time to Exploit:** ${p.timeToExploit}  
**File:** \`${p.affectedCode.file}\`

${p.description}

**Why we predict this:**  
${p.reasoning}

**Recommendation:**  
${p.recommendation}

${p.relatedCVEs.length > 0 ? `**Similar CVEs:** ${p.relatedCVEs.join(', ')}` : ''}
`).join('\n---\n')}

## How to Stay Protected

1. **Run Anchor scans daily** - Catch issues before they're exploited
2. **Enable auto-fix** - Let AI remediate issues automatically
3. **Update dependencies weekly** - Stay ahead of disclosed CVEs
4. **Review predictions monthly** - Plan proactive security improvements

---

*Generated by Anchor Security Predictive AI*
*Predictions are based on code patterns, dependency analysis, and CVE trend data*
`;
  }
}
