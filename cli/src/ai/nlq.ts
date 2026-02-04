/**
 * Natural Language Security Query - WORLD FIRST
 * Ask security questions in plain English
 */

import Anthropic from '@anthropic-ai/sdk';
import { Finding, ScanResult, Severity } from '../types';

export interface QueryResult {
  answer: string;
  findings: Finding[];
  suggestions: string[];
  visualizations?: {
    type: 'chart' | 'table' | 'graph';
    data: any;
  }[];
}

export interface QueryContext {
  scanResults: ScanResult[];
  projectInfo: {
    name: string;
    languages: string[];
    frameworks: string[];
    files: string[];
  };
}

const EXAMPLE_QUERIES = [
  "Show me all SQL injection vulnerabilities",
  "What are the critical issues in the auth module?",
  "Find hardcoded secrets in environment files",
  "Which files have the most security issues?",
  "Explain CVE-2024-1234 and if we're affected",
  "What's our security posture compared to last week?",
  "Show vulnerabilities that could be chained together",
  "Find all API endpoints without authentication",
  "List outdated dependencies with known CVEs",
  "What should I fix first based on risk?",
];

export class NaturalLanguageQuery {
  private anthropic: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Process a natural language security query
   */
  async query(question: string, context: QueryContext): Promise<QueryResult> {
    // First, understand the query intent
    const intent = await this.classifyIntent(question);
    
    // Execute the appropriate handler
    switch (intent.type) {
      case 'filter':
        return this.handleFilterQuery(question, intent, context);
      case 'explain':
        return this.handleExplainQuery(question, intent, context);
      case 'compare':
        return this.handleCompareQuery(question, intent, context);
      case 'prioritize':
        return this.handlePrioritizeQuery(question, intent, context);
      case 'analyze':
        return this.handleAnalyzeQuery(question, intent, context);
      default:
        return this.handleGeneralQuery(question, context);
    }
  }

  /**
   * Get query suggestions based on current context
   */
  getSuggestions(context: QueryContext): string[] {
    const suggestions: string[] = [];
    
    const allFindings = context.scanResults.flatMap(r => r.findings);
    const criticalCount = allFindings.filter(f => f.severity === 'critical').length;
    const highCount = allFindings.filter(f => f.severity === 'high').length;
    
    if (criticalCount > 0) {
      suggestions.push(`Show me the ${criticalCount} critical vulnerabilities`);
    }
    
    if (highCount > 0) {
      suggestions.push(`What high-severity issues should I fix first?`);
    }

    // Add language-specific suggestions
    if (context.projectInfo.languages.includes('javascript') || 
        context.projectInfo.languages.includes('typescript')) {
      suggestions.push("Find XSS vulnerabilities in React components");
      suggestions.push("Show prototype pollution risks");
    }

    if (context.projectInfo.frameworks.includes('express') ||
        context.projectInfo.frameworks.includes('fastify')) {
      suggestions.push("Find API endpoints without input validation");
    }

    suggestions.push("Which files have the most security issues?");
    suggestions.push("Explain the attack path for the critical issues");
    
    return suggestions.slice(0, 5);
  }

  /**
   * Interactive conversation mode
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: QueryContext
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  private async classifyIntent(question: string): Promise<{
    type: 'filter' | 'explain' | 'compare' | 'prioritize' | 'analyze' | 'general';
    entities: {
      severity?: Severity[];
      vulnerabilityTypes?: string[];
      files?: string[];
      timeRange?: string;
    };
  }> {
    // Simple rule-based classification (could be enhanced with AI)
    const q = question.toLowerCase();
    
    let type: 'filter' | 'explain' | 'compare' | 'prioritize' | 'analyze' | 'general' = 'general';
    
    if (q.includes('show') || q.includes('find') || q.includes('list') || q.includes('what are')) {
      type = 'filter';
    } else if (q.includes('explain') || q.includes('why') || q.includes('how does')) {
      type = 'explain';
    } else if (q.includes('compare') || q.includes('vs') || q.includes('difference')) {
      type = 'compare';
    } else if (q.includes('priority') || q.includes('first') || q.includes('important') || q.includes('risk')) {
      type = 'prioritize';
    } else if (q.includes('analyze') || q.includes('attack') || q.includes('chain') || q.includes('path')) {
      type = 'analyze';
    }

    // Extract entities
    const entities: any = {};
    
    if (q.includes('critical')) entities.severity = ['critical'];
    if (q.includes('high')) entities.severity = [...(entities.severity || []), 'high'];
    if (q.includes('sql injection')) entities.vulnerabilityTypes = ['sql-injection'];
    if (q.includes('xss')) entities.vulnerabilityTypes = [...(entities.vulnerabilityTypes || []), 'xss'];
    if (q.includes('secret')) entities.vulnerabilityTypes = [...(entities.vulnerabilityTypes || []), 'hardcoded-secret'];

    return { type, entities };
  }

  private async handleFilterQuery(
    question: string,
    intent: any,
    context: QueryContext
  ): Promise<QueryResult> {
    const allFindings = context.scanResults.flatMap(r => r.findings);
    let filtered = [...allFindings];

    // Apply severity filter
    if (intent.entities.severity?.length) {
      filtered = filtered.filter(f => intent.entities.severity.includes(f.severity));
    }

    // Apply vulnerability type filter
    if (intent.entities.vulnerabilityTypes?.length) {
      filtered = filtered.filter(f => 
        intent.entities.vulnerabilityTypes.some((type: string) => 
          f.rule.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // Generate natural language response
    const answer = this.generateFilterAnswer(question, filtered);

    return {
      answer,
      findings: filtered,
      suggestions: this.getSuggestions(context),
    };
  }

  private async handleExplainQuery(
    question: string,
    _intent: any,
    context: QueryContext
  ): Promise<QueryResult> {
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: `You are a security expert explaining vulnerabilities to developers.
Be concise but thorough. Use examples when helpful.`,
      messages: [
        {
          role: 'user',
          content: `Based on this security scan context, answer the question.

Context:
- Project: ${context.projectInfo.name}
- Languages: ${context.projectInfo.languages.join(', ')}
- Total findings: ${context.scanResults.flatMap(r => r.findings).length}

Question: ${question}`,
        },
      ],
    });

    return {
      answer: response.content[0].type === 'text' ? response.content[0].text : '',
      findings: [],
      suggestions: this.getSuggestions(context),
    };
  }

  private async handleCompareQuery(
    _question: string,
    _intent: any,
    context: QueryContext
  ): Promise<QueryResult> {
    // Compare scan results over time
    const results = context.scanResults;
    
    if (results.length < 2) {
      return {
        answer: "I need at least two scan results to make a comparison. Run another scan to compare.",
        findings: [],
        suggestions: this.getSuggestions(context),
      };
    }

    const latest = results[results.length - 1];
    const previous = results[results.length - 2];

    const newFindings = latest.findings.filter(
      f => !previous.findings.some(pf => pf.rule === f.rule && pf.file === f.file && pf.line === f.line)
    );
    
    const fixedFindings = previous.findings.filter(
      f => !latest.findings.some(lf => lf.rule === f.rule && lf.file === f.file && lf.line === f.line)
    );

    const answer = `
## Security Trend Comparison

**New vulnerabilities:** ${newFindings.length}
**Fixed vulnerabilities:** ${fixedFindings.length}
**Net change:** ${newFindings.length - fixedFindings.length > 0 ? '+' : ''}${newFindings.length - fixedFindings.length}

${newFindings.length > 0 ? `### New Issues\n${newFindings.slice(0, 5).map(f => `- ${f.severity.toUpperCase()}: ${f.rule} in ${f.file}`).join('\n')}` : ''}

${fixedFindings.length > 0 ? `### Fixed Issues ✅\n${fixedFindings.slice(0, 5).map(f => `- ${f.rule} in ${f.file}`).join('\n')}` : ''}
`;

    return {
      answer,
      findings: newFindings,
      suggestions: this.getSuggestions(context),
      visualizations: [{
        type: 'chart',
        data: {
          labels: ['Previous', 'Current'],
          datasets: [{
            label: 'Vulnerabilities',
            data: [previous.findings.length, latest.findings.length],
          }],
        },
      }],
    };
  }

  private async handlePrioritizeQuery(
    _question: string,
    _intent: any,
    context: QueryContext
  ): Promise<QueryResult> {
    const allFindings = context.scanResults.flatMap(r => r.findings);
    
    // Score and rank findings
    const scored = allFindings.map(f => ({
      finding: f,
      score: this.calculateRiskScore(f),
    })).sort((a, b) => b.score - a.score);

    const top5 = scored.slice(0, 5);

    const answer = `
## Priority Fix Order

Based on severity, exploitability, and impact, here's what to fix first:

${top5.map((s, i) => `
### ${i + 1}. ${s.finding.rule} (Risk Score: ${s.score}/100)
- **File:** ${s.finding.file}${s.finding.line ? `:${s.finding.line}` : ''}
- **Severity:** ${s.finding.severity.toUpperCase()}
- **Why:** ${s.finding.message}
${s.finding.fix ? `- **Fix:** ${s.finding.fix}` : ''}
`).join('\n')}

💡 **Tip:** Focus on critical and high severity issues first. They pose the greatest risk.
`;

    return {
      answer,
      findings: top5.map(s => s.finding),
      suggestions: [
        "Generate auto-fixes for these issues",
        "Explain the attack scenarios",
        "Show me similar issues in the codebase",
      ],
    };
  }

  private async handleAnalyzeQuery(
    question: string,
    _intent: any,
    context: QueryContext
  ): Promise<QueryResult> {
    const allFindings = context.scanResults.flatMap(r => r.findings);
    
    // Use AI to analyze attack paths
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: `You are a penetration testing expert analyzing vulnerabilities for attack chains.
Identify how vulnerabilities could be combined for maximum impact.`,
      messages: [
        {
          role: 'user',
          content: `Analyze these security findings and identify potential attack paths:

${allFindings.slice(0, 20).map(f => `- ${f.severity}: ${f.rule} in ${f.file}:${f.line || '?'} - ${f.message}`).join('\n')}

Question: ${question}

Provide:
1. Potential attack chains
2. Most critical entry points
3. Recommended remediation order`,
        },
      ],
    });

    return {
      answer: response.content[0].type === 'text' ? response.content[0].text : '',
      findings: allFindings.filter(f => f.severity === 'critical' || f.severity === 'high'),
      suggestions: [
        "Generate fixes for the attack chain",
        "Show entry points in detail",
        "Explain each vulnerability in the chain",
      ],
    };
  }

  private async handleGeneralQuery(
    question: string,
    context: QueryContext
  ): Promise<QueryResult> {
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: this.buildSystemPrompt(context),
      messages: [{ role: 'user', content: question }],
    });

    return {
      answer: response.content[0].type === 'text' ? response.content[0].text : '',
      findings: [],
      suggestions: this.getSuggestions(context),
    };
  }

  private buildSystemPrompt(context: QueryContext): string {
    const allFindings = context.scanResults.flatMap(r => r.findings);
    const summary = {
      total: allFindings.length,
      critical: allFindings.filter(f => f.severity === 'critical').length,
      high: allFindings.filter(f => f.severity === 'high').length,
      medium: allFindings.filter(f => f.severity === 'medium').length,
      low: allFindings.filter(f => f.severity === 'low').length,
    };

    return `You are Anchor Security AI, an expert security assistant.

Project Context:
- Name: ${context.projectInfo.name}
- Languages: ${context.projectInfo.languages.join(', ')}
- Frameworks: ${context.projectInfo.frameworks.join(', ') || 'Unknown'}
- Files scanned: ${context.projectInfo.files.length}

Security Summary:
- Total vulnerabilities: ${summary.total}
- Critical: ${summary.critical}
- High: ${summary.high}
- Medium: ${summary.medium}
- Low: ${summary.low}

Top issues:
${allFindings.slice(0, 10).map(f => `- ${f.severity}: ${f.rule} in ${f.file}`).join('\n')}

Help the user understand and fix security issues. Be concise and actionable.`;
  }

  private generateFilterAnswer(question: string, findings: Finding[]): string {
    if (findings.length === 0) {
      return `✅ Good news! No vulnerabilities matching "${question}" were found.`;
    }

    const bySeverity = {
      critical: findings.filter(f => f.severity === 'critical'),
      high: findings.filter(f => f.severity === 'high'),
      medium: findings.filter(f => f.severity === 'medium'),
      low: findings.filter(f => f.severity === 'low'),
    };

    return `
## Found ${findings.length} matching vulnerabilities

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${bySeverity.critical.length} |
| 🟠 High | ${bySeverity.high.length} |
| 🟡 Medium | ${bySeverity.medium.length} |
| 🟢 Low | ${bySeverity.low.length} |

### Top Results
${findings.slice(0, 5).map(f => `- **${f.severity.toUpperCase()}**: ${f.rule} in \`${f.file}\`${f.line ? `:${f.line}` : ''}`).join('\n')}

${findings.length > 5 ? `\n*...and ${findings.length - 5} more*` : ''}
`;
  }

  private calculateRiskScore(finding: Finding): number {
    let score = 0;
    
    // Base severity score
    const severityScores: Record<Severity, number> = {
      critical: 50,
      high: 35,
      medium: 20,
      low: 10,
      info: 5,
    };
    score += severityScores[finding.severity];

    // Exploitability factors
    if (finding.cwe?.includes('CWE-89')) score += 20; // SQL injection
    if (finding.cwe?.includes('CWE-79')) score += 15; // XSS
    if (finding.cwe?.includes('CWE-78')) score += 25; // Command injection
    if (finding.cwe?.includes('CWE-798')) score += 15; // Hardcoded credentials

    // File sensitivity
    if (finding.file.includes('auth')) score += 10;
    if (finding.file.includes('admin')) score += 10;
    if (finding.file.includes('payment')) score += 15;
    if (finding.file.includes('config')) score += 5;

    return Math.min(100, score);
  }
}

export { EXAMPLE_QUERIES };
