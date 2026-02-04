/**
 * Anchor Security GitHub App
 * Provides automated security scanning for pull requests
 */

import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { Finding, ScanResult, Severity } from '../types';

interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  installationId: number;
}

interface PRContext {
  owner: string;
  repo: string;
  pull_number: number;
  head_sha: string;
}

interface CheckRunResult {
  checkRunId: number;
  conclusion: 'success' | 'failure' | 'neutral';
  annotations: number;
}

export class AnchorGitHubApp {
  private octokit: Octokit;

  constructor(config: GitHubAppConfig) {
    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: config.appId,
        privateKey: config.privateKey,
        installationId: config.installationId,
      },
    });
  }

  /**
   * Create a check run for a PR
   */
  async createCheckRun(
    ctx: PRContext,
    scanResult: ScanResult
  ): Promise<CheckRunResult> {
    // Create check run in "in_progress" state
    const { data: checkRun } = await this.octokit.checks.create({
      owner: ctx.owner,
      repo: ctx.repo,
      name: 'Anchor Security Scan',
      head_sha: ctx.head_sha,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });

    // Generate annotations from findings
    const annotations = this.generateAnnotations(scanResult.findings);
    
    // Determine conclusion
    const conclusion = this.determineConclusion(scanResult);
    
    // Update check run with results
    await this.octokit.checks.update({
      owner: ctx.owner,
      repo: ctx.repo,
      check_run_id: checkRun.id,
      status: 'completed',
      conclusion,
      completed_at: new Date().toISOString(),
      output: {
        title: this.generateTitle(scanResult),
        summary: this.generateSummary(scanResult),
        text: this.generateDetailedReport(scanResult),
        annotations: annotations.slice(0, 50), // GitHub limits to 50 per update
      },
    });

    // If more than 50 annotations, add them in batches
    for (let i = 50; i < annotations.length; i += 50) {
      await this.octokit.checks.update({
        owner: ctx.owner,
        repo: ctx.repo,
        check_run_id: checkRun.id,
        output: {
          title: this.generateTitle(scanResult),
          summary: this.generateSummary(scanResult),
          annotations: annotations.slice(i, i + 50),
        },
      });
    }

    return {
      checkRunId: checkRun.id,
      conclusion,
      annotations: annotations.length,
    };
  }

  /**
   * Post a PR comment with scan results
   */
  async postPRComment(ctx: PRContext, scanResult: ScanResult): Promise<number> {
    const comment = this.generatePRComment(scanResult);
    
    // Check for existing Anchor comment to update
    const { data: comments } = await this.octokit.issues.listComments({
      owner: ctx.owner,
      repo: ctx.repo,
      issue_number: ctx.pull_number,
    });

    const existingComment = comments.find(c => 
      c.body?.includes('<!-- anchor-security-scan -->')
    );

    if (existingComment) {
      // Update existing comment
      const { data } = await this.octokit.issues.updateComment({
        owner: ctx.owner,
        repo: ctx.repo,
        comment_id: existingComment.id,
        body: comment,
      });
      return data.id;
    } else {
      // Create new comment
      const { data } = await this.octokit.issues.createComment({
        owner: ctx.owner,
        repo: ctx.repo,
        issue_number: ctx.pull_number,
        body: comment,
      });
      return data.id;
    }
  }

  /**
   * Upload SARIF results to GitHub Code Scanning
   */
  async uploadSARIF(
    ctx: PRContext,
    sarif: string
  ): Promise<void> {
    const gzipped = await this.gzipBase64(sarif);
    
    await this.octokit.codeScanning.uploadSarif({
      owner: ctx.owner,
      repo: ctx.repo,
      commit_sha: ctx.head_sha,
      ref: `refs/pull/${ctx.pull_number}/head`,
      sarif: gzipped,
    });
  }

  /**
   * Create inline review comments on specific lines
   */
  async createReviewComments(
    ctx: PRContext,
    findings: Finding[]
  ): Promise<number> {
    const reviewComments = findings
      .filter(f => f.line && f.severity !== 'info')
      .slice(0, 20) // Limit to avoid spam
      .map(f => ({
        path: f.file,
        line: f.line!,
        body: this.formatInlineComment(f),
      }));

    if (reviewComments.length === 0) return 0;

    await this.octokit.pulls.createReview({
      owner: ctx.owner,
      repo: ctx.repo,
      pull_number: ctx.pull_number,
      commit_id: ctx.head_sha,
      event: 'COMMENT',
      comments: reviewComments,
    });

    return reviewComments.length;
  }

  /**
   * Set commit status
   */
  async setCommitStatus(
    ctx: PRContext,
    scanResult: ScanResult
  ): Promise<void> {
    const state = this.getStatusState(scanResult);
    
    await this.octokit.repos.createCommitStatus({
      owner: ctx.owner,
      repo: ctx.repo,
      sha: ctx.head_sha,
      state,
      context: 'Anchor Security',
      description: this.getStatusDescription(scanResult),
      target_url: `https://anchor.security/scans/${scanResult.id}`,
    });
  }

  // Helper methods
  private generateAnnotations(findings: Finding[]) {
    return findings
      .filter(f => f.line)
      .map(f => ({
        path: f.file,
        start_line: f.line!,
        end_line: f.line!,
        annotation_level: this.severityToAnnotationLevel(f.severity),
        title: f.rule,
        message: f.message,
        raw_details: f.fix || undefined,
      }));
  }

  private severityToAnnotationLevel(severity: Severity): 'failure' | 'warning' | 'notice' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'failure';
      case 'medium':
        return 'warning';
      default:
        return 'notice';
    }
  }

  private determineConclusion(result: ScanResult): 'success' | 'failure' | 'neutral' {
    const critical = result.summary.critical || 0;
    const high = result.summary.high || 0;
    
    if (critical > 0) return 'failure';
    if (high > 0) return 'failure';
    if (result.findings.length === 0) return 'success';
    return 'neutral';
  }

  private generateTitle(result: ScanResult): string {
    const total = result.findings.length;
    if (total === 0) return '✅ No security issues found';
    
    const critical = result.summary.critical || 0;
    const high = result.summary.high || 0;
    
    if (critical > 0) return `🚨 ${critical} critical security issue${critical > 1 ? 's' : ''} found`;
    if (high > 0) return `⚠️ ${high} high-severity issue${high > 1 ? 's' : ''} found`;
    return `📋 ${total} finding${total > 1 ? 's' : ''} to review`;
  }

  private generateSummary(result: ScanResult): string {
    const { summary } = result;
    
    return `
## Anchor Security Scan Results

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${summary.critical || 0} |
| 🟠 High | ${summary.high || 0} |
| 🟡 Medium | ${summary.medium || 0} |
| 🟢 Low | ${summary.low || 0} |
| ℹ️ Info | ${summary.info || 0} |

**Scanners:** ${result.scannersRun?.join(', ') || 'all'}  
**Duration:** ${result.duration}ms
    `.trim();
  }

  private generateDetailedReport(result: ScanResult): string {
    if (result.findings.length === 0) {
      return 'No security vulnerabilities detected. Great job! 🎉';
    }

    const grouped = this.groupBySeverity(result.findings);
    let report = '';

    for (const [severity, findings] of Object.entries(grouped)) {
      if (findings.length === 0) continue;
      
      report += `\n### ${this.severityEmoji(severity as Severity)} ${severity.toUpperCase()} (${findings.length})\n\n`;
      
      for (const finding of findings.slice(0, 10)) {
        report += `- **${finding.rule}** in \`${finding.file}\``;
        if (finding.line) report += `:${finding.line}`;
        report += `\n  ${finding.message}\n`;
        if (finding.fix) report += `  💡 Fix: ${finding.fix}\n`;
      }
      
      if (findings.length > 10) {
        report += `\n*...and ${findings.length - 10} more ${severity} findings*\n`;
      }
    }

    return report;
  }

  private generatePRComment(result: ScanResult): string {
    const total = result.findings.length;
    const emoji = total === 0 ? '✅' : (result.summary.critical || result.summary.high) ? '🚨' : '⚠️';
    
    let comment = `<!-- anchor-security-scan -->
# ${emoji} Anchor Security Scan

${this.generateSummary(result)}

`;

    if (total > 0) {
      // Top 5 most critical findings
      const topFindings = result.findings
        .sort((a: Finding, b: Finding) => this.severityWeight(b.severity) - this.severityWeight(a.severity))
        .slice(0, 5);

      comment += `\n### Top Findings\n\n`;
      
      for (const finding of topFindings) {
        comment += `<details>
<summary>${this.severityEmoji(finding.severity)} <b>${finding.rule}</b> in <code>${finding.file}</code>${finding.line ? `:${finding.line}` : ''}</summary>

**${finding.message}**

${finding.snippet ? `\`\`\`\n${finding.snippet}\n\`\`\`` : ''}

${finding.cwe ? `**CWE:** ${finding.cwe}` : ''} ${finding.owasp ? `| **OWASP:** ${finding.owasp}` : ''}

${finding.fix ? `💡 **Fix:** ${finding.fix}` : ''}

</details>\n\n`;
      }

      if (total > 5) {
        comment += `\n> 📊 *${total - 5} additional findings not shown. View the full report in the Checks tab.*\n`;
      }
    } else {
      comment += `\n🎉 **No security vulnerabilities detected!**\n`;
    }

    comment += `\n---\n*Powered by [Anchor Security](https://anchor.security) | [Documentation](https://docs.anchor.security)*`;
    
    return comment;
  }

  private formatInlineComment(finding: Finding): string {
    return `${this.severityEmoji(finding.severity)} **${finding.rule}**

${finding.message}

${finding.cwe ? `CWE: ${finding.cwe}` : ''}

${finding.fix ? `💡 ${finding.fix}` : ''}`;
  }

  private getStatusState(result: ScanResult): 'success' | 'failure' | 'pending' | 'error' {
    if ((result.summary.critical || 0) > 0) return 'failure';
    if ((result.summary.high || 0) > 0) return 'failure';
    return 'success';
  }

  private getStatusDescription(result: ScanResult): string {
    const total = result.findings.length;
    if (total === 0) return 'No security issues found';
    
    const critical = result.summary.critical || 0;
    const high = result.summary.high || 0;
    
    if (critical > 0) return `${critical} critical issue${critical > 1 ? 's' : ''} found`;
    if (high > 0) return `${high} high-severity issue${high > 1 ? 's' : ''} found`;
    return `${total} finding${total > 1 ? 's' : ''} to review`;
  }

  private groupBySeverity(findings: Finding[]): Record<Severity, Finding[]> {
    const grouped: Record<Severity, Finding[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: [],
    };
    
    for (const finding of findings) {
      grouped[finding.severity].push(finding);
    }
    
    return grouped;
  }

  private severityEmoji(severity: Severity): string {
    const emojis: Record<Severity, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
      info: 'ℹ️',
    };
    return emojis[severity] || '⚪';
  }

  private severityWeight(severity: Severity): number {
    const weights: Record<Severity, number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      info: 1,
    };
    return weights[severity] || 0;
  }

  private async gzipBase64(content: string): Promise<string> {
    // In a real implementation, use zlib to gzip and base64 encode
    // For now, just return base64 encoded content
    return Buffer.from(content).toString('base64');
  }
}

// Webhook handler for GitHub App
export interface WebhookPayload {
  action: string;
  pull_request?: {
    number: number;
    head: { sha: string };
  };
  repository: {
    owner: { login: string };
    name: string;
  };
  installation?: { id: number };
}

export async function handlePullRequestWebhook(
  payload: WebhookPayload,
  runScan: (owner: string, repo: string, sha: string) => Promise<ScanResult>
): Promise<void> {
  if (!payload.pull_request || !payload.installation) return;
  
  const { pull_request, repository, installation } = payload;
  
  // Only scan on opened, synchronize, reopened
  if (!['opened', 'synchronize', 'reopened'].includes(payload.action)) return;

  const ctx: PRContext = {
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: pull_request.number,
    head_sha: pull_request.head.sha,
  };

  // Run the security scan
  const scanResult = await runScan(ctx.owner, ctx.repo, ctx.head_sha);

  // Create app instance (would need config from database)
  const app = new AnchorGitHubApp({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY!,
    installationId: installation.id,
  });

  // Post results to PR
  await Promise.all([
    app.createCheckRun(ctx, scanResult),
    app.postPRComment(ctx, scanResult),
    app.setCommitStatus(ctx, scanResult),
  ]);
}
