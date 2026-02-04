/**
 * CI Command - CI/CD Integration Helpers
 */

import fs from 'fs';
import chalk from 'chalk';

interface CIOptions {
  output?: string;
}

export async function ciCommand(action: string, options: CIOptions): Promise<void> {
  switch (action) {
    case 'setup':
      showSetupInstructions();
      break;
    case 'github-action':
      generateGitHubAction(options);
      break;
    case 'gitlab-ci':
      generateGitLabCI(options);
      break;
    case 'jenkins':
      generateJenkinsfile(options);
      break;
    default:
      console.error(chalk.red(`Error: Unknown action: ${action}`));
      console.log(chalk.gray('Valid actions: setup, github-action, gitlab-ci, jenkins'));
      process.exit(1);
  }
}

function showSetupInstructions(): void {
  console.log(chalk.cyan.bold('⚓ Anchor CI/CD Setup'));
  console.log('');
  console.log('Choose your CI platform:');
  console.log('');
  console.log(chalk.bold('  GitHub Actions:'));
  console.log(chalk.gray('    anchor ci github-action'));
  console.log('');
  console.log(chalk.bold('  GitLab CI:'));
  console.log(chalk.gray('    anchor ci gitlab-ci'));
  console.log('');
  console.log(chalk.bold('  Jenkins:'));
  console.log(chalk.gray('    anchor ci jenkins'));
  console.log('');
  console.log(chalk.cyan('Documentation:'), chalk.underline('https://anchor.security/docs/ci'));
}

function generateGitHubAction(options: CIOptions): void {
  const content = `# Anchor Security Scan
# This workflow runs on every push and pull request

name: Anchor Security

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

permissions:
  contents: read
  security-events: write
  pull-requests: write

jobs:
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Anchor CLI
        run: npm install -g @anchor-security/cli

      - name: Run Security Scan
        run: anchor scan --ci --sarif -o results.sarif --fail-on high
        continue-on-error: true

      - name: Upload SARIF to GitHub
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
        if: always()

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('results.sarif', 'utf-8'));
            const findings = results.runs?.[0]?.results?.length || 0;
            
            const body = findings > 0 
              ? \`## ⚓ Anchor Security Report\\n\\n⚠️ Found **\${findings}** security issues. Please review the Security tab for details.\`
              : \`## ⚓ Anchor Security Report\\n\\n✅ No security issues found!\`;
            
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body
            });

      - name: Check Results
        run: |
          if [ -f results.sarif ]; then
            FINDINGS=$(jq '.runs[0].results | length' results.sarif)
            if [ "$FINDINGS" -gt 0 ]; then
              echo "::warning::Found $FINDINGS security issues"
            fi
          fi
`;

  const output = options.output || '.github/workflows/anchor.yml';
  writeFile(output, content);
  console.log(chalk.green(`✓ Generated GitHub Action: ${output}`));
  console.log('');
  console.log(chalk.cyan('Next steps:'));
  console.log(chalk.gray('  1. Commit and push the workflow file'));
  console.log(chalk.gray('  2. The scan will run on every push and PR'));
  console.log(chalk.gray('  3. Results appear in the Security tab'));
}

function generateGitLabCI(options: CIOptions): void {
  const content = `# Anchor Security Scan for GitLab CI

stages:
  - security

anchor-security:
  stage: security
  image: node:20-alpine
  before_script:
    - npm install -g @anchor-security/cli
  script:
    - anchor scan --ci --format json -o gl-sast-report.json --fail-on high
  artifacts:
    reports:
      sast: gl-sast-report.json
    paths:
      - gl-sast-report.json
    when: always
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  allow_failure: true
`;

  const output = options.output || '.gitlab-ci-anchor.yml';
  writeFile(output, content);
  console.log(chalk.green(`✓ Generated GitLab CI: ${output}`));
  console.log('');
  console.log(chalk.cyan('Next steps:'));
  console.log(chalk.gray('  1. Include in your .gitlab-ci.yml:'));
  console.log(chalk.gray(`     include: '${output}'`));
  console.log(chalk.gray('  2. Results appear in Security Dashboard'));
}

function generateJenkinsfile(options: CIOptions): void {
  const content = `// Anchor Security Scan for Jenkins

pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS 20'
    }
    
    stages {
        stage('Install Anchor') {
            steps {
                sh 'npm install -g @anchor-security/cli'
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'anchor scan --ci --format json -o anchor-results.json --fail-on high || true'
            }
        }
        
        stage('Publish Results') {
            steps {
                archiveArtifacts artifacts: 'anchor-results.json', allowEmptyArchive: true
                
                script {
                    def results = readJSON file: 'anchor-results.json'
                    def total = results.summary?.total ?: 0
                    def critical = results.summary?.critical ?: 0
                    def high = results.summary?.high ?: 0
                    
                    if (critical > 0 || high > 0) {
                        currentBuild.result = 'UNSTABLE'
                        echo "⚠️ Found \${critical} critical and \${high} high severity issues"
                    } else {
                        echo "✅ No critical or high severity issues found"
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
`;

  const output = options.output || 'Jenkinsfile.anchor';
  writeFile(output, content);
  console.log(chalk.green(`✓ Generated Jenkinsfile: ${output}`));
  console.log('');
  console.log(chalk.cyan('Next steps:'));
  console.log(chalk.gray('  1. Add to your Jenkins pipeline'));
  console.log(chalk.gray('  2. Ensure NodeJS tool is configured'));
}

function writeFile(filePath: string, content: string): void {
  const dir = filePath.split('/').slice(0, -1).join('/');
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
}
