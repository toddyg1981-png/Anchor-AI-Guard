/**
 * GitHub Action for Anchor Security
 * Reusable workflow for GitHub Actions
 */

export const GITHUB_ACTION_YAML = `
name: 'Anchor Security Scan'
description: 'Run Anchor Security scanning on your codebase'
author: 'Anchor Security'

branding:
  icon: 'shield'
  color: 'green'

inputs:
  api-key:
    description: 'Anchor Security API key (optional for public repos)'
    required: false
  fail-on:
    description: 'Fail build on severity level: critical, high, medium, low, none'
    required: false
    default: 'high'
  scanners:
    description: 'Comma-separated list of scanners: secrets,sast,dependencies,iac,dockerfile'
    required: false
    default: 'all'
  output-format:
    description: 'Output format: sarif, json, table'
    required: false
    default: 'sarif'
  upload-sarif:
    description: 'Upload SARIF to GitHub Code Scanning'
    required: false
    default: 'true'
  comment-on-pr:
    description: 'Post comment on pull request with results'
    required: false
    default: 'true'
  config-file:
    description: 'Path to anchor config file'
    required: false
    default: '.anchor.yml'

outputs:
  findings-count:
    description: 'Total number of findings'
  critical-count:
    description: 'Number of critical findings'
  high-count:
    description: 'Number of high-severity findings'
  sarif-file:
    description: 'Path to SARIF output file'
  exit-code:
    description: 'Exit code (0 for success, 1 for failure)'

runs:
  using: 'composite'
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install Anchor CLI
      shell: bash
      run: npm install -g @anchor-security/cli

    - name: Run Anchor Scan
      id: scan
      shell: bash
      env:
        ANCHOR_API_KEY: \${{ inputs.api-key }}
      run: |
        # Build scan command
        CMD="anchor scan --ci"
        
        if [ "\${{ inputs.scanners }}" != "all" ]; then
          CMD="$CMD --scanners \${{ inputs.scanners }}"
        fi
        
        CMD="$CMD --format \${{ inputs.output-format }}"
        CMD="$CMD --fail-on \${{ inputs.fail-on }}"
        
        if [ -f "\${{ inputs.config-file }}" ]; then
          CMD="$CMD --config \${{ inputs.config-file }}"
        fi
        
        if [ "\${{ inputs.output-format }}" = "sarif" ]; then
          CMD="$CMD --output anchor-results.sarif"
        fi
        
        # Run scan and capture exit code
        set +e
        $CMD
        EXIT_CODE=$?
        set -e
        
        # Parse results for outputs
        if [ -f "anchor-results.sarif" ]; then
          FINDINGS=$(jq '.runs[0].results | length' anchor-results.sarif)
          CRITICAL=$(jq '[.runs[0].results[] | select(.level == "error" and .properties.security-severity >= "9.0")] | length' anchor-results.sarif)
          HIGH=$(jq '[.runs[0].results[] | select(.level == "error" and .properties.security-severity >= "7.0" and .properties.security-severity < "9.0")] | length' anchor-results.sarif)
        else
          FINDINGS=0
          CRITICAL=0
          HIGH=0
        fi
        
        echo "findings-count=$FINDINGS" >> $GITHUB_OUTPUT
        echo "critical-count=$CRITICAL" >> $GITHUB_OUTPUT
        echo "high-count=$HIGH" >> $GITHUB_OUTPUT
        echo "sarif-file=anchor-results.sarif" >> $GITHUB_OUTPUT
        echo "exit-code=$EXIT_CODE" >> $GITHUB_OUTPUT
        
        exit $EXIT_CODE

    - name: Upload SARIF to GitHub
      if: inputs.upload-sarif == 'true' && always()
      uses: github/codeql-action/upload-sarif@v3
      with:
        sarif_file: anchor-results.sarif
        category: anchor-security

    - name: Comment on PR
      if: inputs.comment-on-pr == 'true' && github.event_name == 'pull_request' && always()
      uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          
          // Read SARIF results
          let findings = [];
          let summary = { critical: 0, high: 0, medium: 0, low: 0 };
          
          if (fs.existsSync('anchor-results.sarif')) {
            const sarif = JSON.parse(fs.readFileSync('anchor-results.sarif', 'utf8'));
            findings = sarif.runs[0].results || [];
            
            for (const finding of findings) {
              const severity = finding.properties?.['security-severity'] || '0';
              if (parseFloat(severity) >= 9.0) summary.critical++;
              else if (parseFloat(severity) >= 7.0) summary.high++;
              else if (parseFloat(severity) >= 4.0) summary.medium++;
              else summary.low++;
            }
          }
          
          const total = findings.length;
          const emoji = total === 0 ? '✅' : (summary.critical || summary.high) ? '🚨' : '⚠️';
          
          let body = \`<!-- anchor-security-scan -->
          # \${emoji} Anchor Security Scan Results
          
          | Severity | Count |
          |----------|-------|
          | 🔴 Critical | \${summary.critical} |
          | 🟠 High | \${summary.high} |
          | 🟡 Medium | \${summary.medium} |
          | 🟢 Low | \${summary.low} |
          
          \`;
          
          if (total === 0) {
            body += '\\n🎉 **No security vulnerabilities detected!**\\n';
          } else {
            body += \`\\n📊 **\${total} total findings** - See the Security tab for details.\\n\`;
          }
          
          body += '\\n---\\n*Powered by [Anchor Security](https://anchor.security)*';
          
          // Find existing comment
          const { data: comments } = await github.rest.issues.listComments({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
          });
          
          const existing = comments.find(c => c.body?.includes('<!-- anchor-security-scan -->'));
          
          if (existing) {
            await github.rest.issues.updateComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              comment_id: existing.id,
              body,
            });
          } else {
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body,
            });
          }
`;

export const GITHUB_ACTION_README = `
# Anchor Security GitHub Action

## Quick Start

Add to \`.github/workflows/security.yml\`:

\`\`\`yaml
name: Security Scan
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  security-events: write
  pull-requests: write

jobs:
  anchor-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Anchor Security Scan
        uses: anchor-security/action@v1
        with:
          fail-on: high
          upload-sarif: true
          comment-on-pr: true
\`\`\`

## Inputs

| Input | Description | Default |
|-------|-------------|---------|
| \`api-key\` | Anchor API key (optional for public repos) | - |
| \`fail-on\` | Fail on severity: critical, high, medium, low, none | \`high\` |
| \`scanners\` | Scanners to run (comma-separated) | \`all\` |
| \`output-format\` | Output format: sarif, json, table | \`sarif\` |
| \`upload-sarif\` | Upload SARIF to GitHub Code Scanning | \`true\` |
| \`comment-on-pr\` | Post PR comment with results | \`true\` |
| \`config-file\` | Path to .anchor.yml config | \`.anchor.yml\` |

## Outputs

| Output | Description |
|--------|-------------|
| \`findings-count\` | Total number of findings |
| \`critical-count\` | Number of critical findings |
| \`high-count\` | Number of high-severity findings |
| \`sarif-file\` | Path to SARIF output |
| \`exit-code\` | Exit code (0 = pass, 1 = fail) |

## Examples

### Block PRs with Critical Issues

\`\`\`yaml
- name: Anchor Security Scan
  uses: anchor-security/action@v1
  with:
    fail-on: critical
\`\`\`

### Scan Only Specific Scanners

\`\`\`yaml
- name: Anchor Security Scan
  uses: anchor-security/action@v1
  with:
    scanners: secrets,sast,dependencies
\`\`\`

### Use with Anchor Cloud

\`\`\`yaml
- name: Anchor Security Scan
  uses: anchor-security/action@v1
  with:
    api-key: \${{ secrets.ANCHOR_API_KEY }}
\`\`\`

## SARIF Integration

Results automatically appear in the **Security** tab of your repository.

## Support

- [Documentation](https://docs.anchor.security)
- [GitHub Issues](https://github.com/anchor-security/action/issues)
`;
