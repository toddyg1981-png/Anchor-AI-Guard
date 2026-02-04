/**
 * Output formatters
 */

import { ScanResult, Finding } from './types';

/**
 * Format as JSON
 */
export function formatJSON(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Format as SARIF (Static Analysis Results Interchange Format)
 * Compatible with GitHub Code Scanning, VS Code, etc.
 */
export function formatSARIF(result: ScanResult): string {
  const sarif = {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'Anchor Security',
            version: result.version,
            informationUri: 'https://anchor.security',
            rules: extractRules(result.findings),
          },
        },
        results: result.findings.map(finding => ({
          ruleId: finding.rule,
          level: severityToSARIF(finding.severity),
          message: {
            text: finding.message,
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: finding.file,
                  uriBaseId: '%SRCROOT%',
                },
                region: {
                  startLine: finding.line || 1,
                  startColumn: finding.column || 1,
                  endLine: finding.endLine || finding.line || 1,
                  endColumn: finding.endColumn || finding.column || 1,
                },
              },
            },
          ],
          fingerprints: {
            primaryLocationLineHash: hashFingerprint(finding),
          },
          ...(finding.fix && {
            fixes: [
              {
                description: {
                  text: finding.fix,
                },
              },
            ],
          }),
        })),
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}

/**
 * Format as Markdown
 */
export function formatMarkdown(result: ScanResult): string {
  const { summary, findings } = result;

  let md = `# ⚓ Anchor Security Scan Results

**Scan Time:** ${result.scanTime}  
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

`;

  if (findings.length > 0) {
    md += `## Findings\n\n`;

    for (const f of findings) {
      md += `### ${severityEmoji(f.severity)} [${f.severity.toUpperCase()}] ${f.rule}\n\n`;
      md += `**File:** \`${f.file}:${f.line || '?'}\`\n\n`;
      md += `${f.message}\n\n`;
      if (f.cwe) md += `**CWE:** ${f.cwe}\n`;
      if (f.fix) md += `**Fix:** ${f.fix}\n`;
      md += `---\n\n`;
    }
  } else {
    md += `## ✅ No Issues Found\n\nGreat job! No security issues were detected.\n`;
  }

  return md;
}

function extractRules(findings: Finding[]): any[] {
  const rulesMap = new Map<string, any>();

  for (const f of findings) {
    if (!rulesMap.has(f.rule)) {
      rulesMap.set(f.rule, {
        id: f.rule,
        name: f.rule,
        shortDescription: {
          text: f.rule,
        },
        fullDescription: {
          text: f.message,
        },
        defaultConfiguration: {
          level: severityToSARIF(f.severity),
        },
        properties: {
          ...(f.cwe && { cwe: [f.cwe] }),
          ...(f.owasp && { owasp: [f.owasp] }),
        },
      });
    }
  }

  return Array.from(rulesMap.values());
}

function severityToSARIF(severity: string): string {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
    case 'info':
    default:
      return 'note';
  }
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

function hashFingerprint(finding: Finding): string {
  const str = `${finding.rule}:${finding.file}:${finding.line}:${finding.message}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}
