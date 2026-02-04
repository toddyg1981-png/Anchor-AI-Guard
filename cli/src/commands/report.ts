/**
 * Report Command - Generate security reports
 */

import fs from 'fs';
import chalk from 'chalk';
import { ScanResult } from '../types';

interface ReportOptions {
  input?: string;
  output?: string;
  format?: 'html' | 'pdf' | 'markdown';
  template?: string;
}

export async function reportCommand(options: ReportOptions): Promise<void> {
  if (!options.input) {
    console.error(chalk.red('Error: Input file required. Use -i <file>'));
    process.exit(1);
  }

  if (!fs.existsSync(options.input)) {
    console.error(chalk.red(`Error: Input file not found: ${options.input}`));
    process.exit(1);
  }

  const result: ScanResult = JSON.parse(fs.readFileSync(options.input, 'utf-8'));
  const format = options.format || 'html';
  const outputFile = options.output || `anchor-report.${format}`;

  let report: string;

  switch (format) {
    case 'html':
      report = generateHTMLReport(result);
      break;
    case 'markdown':
      report = generateMarkdownReport(result);
      break;
    default:
      console.error(chalk.red(`Error: Unsupported format: ${format}`));
      process.exit(1);
  }

  fs.writeFileSync(outputFile, report);
  console.log(chalk.green(`✓ Report generated: ${outputFile}`));
}

function generateHTMLReport(result: ScanResult): string {
  const { summary, findings } = result;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anchor Security Report</title>
  <style>
    :root {
      --bg-dark: #0a0f14;
      --bg-card: #111827;
      --cyan: #06b6d4;
      --red: #ef4444;
      --yellow: #f59e0b;
      --purple: #a855f7;
      --blue: #3b82f6;
      --gray: #6b7280;
      --text: #e5e7eb;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: var(--bg-dark);
      color: var(--text);
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    header {
      text-align: center;
      padding: 3rem 0;
      border-bottom: 1px solid var(--cyan);
      margin-bottom: 2rem;
    }
    h1 { color: var(--cyan); font-size: 2.5rem; }
    .subtitle { color: var(--gray); margin-top: 0.5rem; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--bg-card);
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      border: 1px solid #374151;
    }
    .stat-card.critical { border-color: var(--red); }
    .stat-card.high { border-color: var(--yellow); }
    .stat-card.medium { border-color: var(--purple); }
    .stat-card.low { border-color: var(--blue); }
    .stat-number { font-size: 2.5rem; font-weight: bold; }
    .stat-label { color: var(--gray); text-transform: uppercase; font-size: 0.75rem; }
    .findings { margin-top: 2rem; }
    .finding {
      background: var(--bg-card);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border-left: 4px solid var(--gray);
    }
    .finding.critical { border-left-color: var(--red); }
    .finding.high { border-left-color: var(--yellow); }
    .finding.medium { border-left-color: var(--purple); }
    .finding.low { border-left-color: var(--blue); }
    .finding-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
    }
    .badge.critical { background: var(--red); }
    .badge.high { background: var(--yellow); color: #000; }
    .badge.medium { background: var(--purple); }
    .badge.low { background: var(--blue); }
    .badge.info { background: var(--gray); }
    .finding-file { color: var(--cyan); font-family: monospace; }
    .finding-message { margin-top: 0.5rem; }
    code {
      background: #1f2937;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
    }
    footer {
      text-align: center;
      padding: 2rem 0;
      color: var(--gray);
      border-top: 1px solid #374151;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>⚓ Anchor Security Report</h1>
      <p class="subtitle">Generated: ${result.scanTime}</p>
    </header>

    <section class="summary">
      <div class="stat-card">
        <div class="stat-number">${summary.total}</div>
        <div class="stat-label">Total Findings</div>
      </div>
      <div class="stat-card critical">
        <div class="stat-number" style="color: var(--red)">${summary.critical}</div>
        <div class="stat-label">Critical</div>
      </div>
      <div class="stat-card high">
        <div class="stat-number" style="color: var(--yellow)">${summary.high}</div>
        <div class="stat-label">High</div>
      </div>
      <div class="stat-card medium">
        <div class="stat-number" style="color: var(--purple)">${summary.medium}</div>
        <div class="stat-label">Medium</div>
      </div>
      <div class="stat-card low">
        <div class="stat-number" style="color: var(--blue)">${summary.low}</div>
        <div class="stat-label">Low</div>
      </div>
    </section>

    <section class="findings">
      <h2>Findings</h2>
      ${findings.map(f => `
        <div class="finding ${f.severity}">
          <div class="finding-header">
            <span class="badge ${f.severity}">${f.severity}</span>
            <span class="finding-file">${f.file}:${f.line || '?'}</span>
          </div>
          <strong>${f.rule}</strong>
          <p class="finding-message">${f.message}</p>
        </div>
      `).join('')}
    </section>

    <footer>
      <p>Generated by Anchor Security CLI v1.0.0</p>
      <p>© ${new Date().getFullYear()} Anchor Security</p>
    </footer>
  </div>
</body>
</html>`;
}

function generateMarkdownReport(result: ScanResult): string {
  const { summary, findings } = result;
  
  return `# ⚓ Anchor Security Report

**Generated:** ${result.scanTime}  
**Target:** ${result.target}  
**Files Scanned:** ${result.filesScanned}

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${summary.critical} |
| 🟠 High | ${summary.high} |
| 🟣 Medium | ${summary.medium} |
| 🔵 Low | ${summary.low} |
| ⚪ Info | ${summary.info} |
| **Total** | **${summary.total}** |

## Findings

${findings.map(f => `
### ${severityEmoji(f.severity)} ${f.rule}

- **Severity:** ${f.severity.toUpperCase()}
- **File:** \`${f.file}:${f.line || '?'}\`
- **Message:** ${f.message}
${f.cwe ? `- **CWE:** ${f.cwe}` : ''}

---
`).join('\n')}

---
*Generated by Anchor Security CLI v1.0.0*
`;
}

function severityEmoji(severity: string): string {
  switch (severity) {
    case 'critical': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟣';
    case 'low': return '🔵';
    default: return '⚪';
  }
}
