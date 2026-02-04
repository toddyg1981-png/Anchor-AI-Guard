/**
 * Auto-Fix Module - Automatically remediate security issues
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Finding, FixResult, FixOptions } from '../types';

export interface FixSummary {
  totalFixed: number;
  totalSkipped: number;
  fixes: FixResult[];
  gitignoreCreated: boolean;
  envExampleCreated: boolean;
  secretsRemoved: number;
  depsUpdated: number;
}

/**
 * Main auto-fix function
 */
export async function autoFix(
  targetPath: string,
  findings: Finding[],
  options: FixOptions = {}
): Promise<FixSummary> {
  const summary: FixSummary = {
    totalFixed: 0,
    totalSkipped: 0,
    fixes: [],
    gitignoreCreated: false,
    envExampleCreated: false,
    secretsRemoved: 0,
    depsUpdated: 0,
  };

  // Group findings by type
  const secretFindings = findings.filter(f => 
    f.rule.includes('secret') || 
    f.rule.includes('api-key') || 
    f.rule.includes('token') ||
    f.rule.includes('password') ||
    f.rule.includes('aws') ||
    f.rule.includes('heroku')
  );

  const envFindings = findings.filter(f => 
    f.file.includes('.env')
  );

  const prototypeFindings = findings.filter(f => 
    f.rule === 'prototype-pollution'
  );

  const dependencyFindings = findings.filter(f => 
    f.rule.includes('vulnerable-dependency') || f.rule.includes('outdated')
  );

  // 1. Create/update .gitignore
  if (secretFindings.length > 0 || envFindings.length > 0) {
    const gitignoreResult = await createGitignore(targetPath);
    if (gitignoreResult.success) {
      summary.gitignoreCreated = true;
      summary.fixes.push(gitignoreResult);
      summary.totalFixed++;
    }
  }

  // 2. Create .env.example from .env files
  const envFiles = [...new Set(envFindings.map(f => f.file))];
  for (const envFile of envFiles) {
    const envExampleResult = await createEnvExample(targetPath, envFile);
    if (envExampleResult.success) {
      summary.envExampleCreated = true;
      summary.fixes.push(envExampleResult);
      summary.totalFixed++;
    }
  }

  // 3. Remove secrets from non-env files (README, docs, etc.)
  const docsWithSecrets = secretFindings.filter(f => 
    !f.file.includes('.env') && 
    (f.file.includes('.md') || f.file.includes('.txt'))
  );

  for (const finding of docsWithSecrets) {
    if (options.removeSecretsFromDocs !== false) {
      const result = await redactSecretFromFile(targetPath, finding);
      if (result.success) {
        summary.secretsRemoved++;
        summary.fixes.push(result);
        summary.totalFixed++;
      } else {
        summary.totalSkipped++;
      }
    }
  }

  // 4. Fix prototype pollution (add Object.freeze suggestions)
  for (const finding of prototypeFindings) {
    const result = createPrototypePollutionFix(finding);
    summary.fixes.push(result);
    summary.totalSkipped++; // These are suggestions, not auto-applied
  }

  // 5. Update vulnerable dependencies
  if (dependencyFindings.length > 0 && options.updateDeps !== false) {
    const depResult = await updateDependencies(targetPath);
    if (depResult.success) {
      summary.depsUpdated++;
      summary.fixes.push(depResult);
      summary.totalFixed++;
    }
  }

  // 6. Remove .env files from git tracking (if git repo)
  if (envFindings.length > 0) {
    const gitResult = await removeEnvFromGit(targetPath);
    if (gitResult.success) {
      summary.fixes.push(gitResult);
    }
  }

  return summary;
}

/**
 * Create or update .gitignore with security-focused entries
 */
async function createGitignore(targetPath: string): Promise<FixResult> {
  const gitignorePath = path.join(targetPath, '.gitignore');
  
  const securityEntries = `
# ========================================
# SECURITY - Added by Anchor Security
# ========================================

# Environment files - NEVER commit secrets
.env
.env.local
.env.*.local
.env.development
.env.production
.env.staging
*.env

# Private keys
*.pem
*.key
*.p12
*.pfx
id_rsa
id_dsa
id_ecdsa
id_ed25519

# Credentials
credentials.json
service-account*.json
*-credentials.json
.netrc
.npmrc
.pypirc

# AWS
.aws/
aws-credentials

# Cloud configs
.gcloud/
.azure/
kubeconfig

# IDE secrets
.idea/workspace.xml
.vscode/settings.json

# OS files
.DS_Store
Thumbs.db

# Dependencies
node_modules/
vendor/
__pycache__/
*.pyc

# Build outputs
dist/
build/
*.log
`;

  try {
    let existingContent = '';
    if (fs.existsSync(gitignorePath)) {
      existingContent = fs.readFileSync(gitignorePath, 'utf-8');
    }

    // Check if already has security entries
    if (existingContent.includes('Added by Anchor Security')) {
      return {
        success: true,
        file: '.gitignore',
        action: 'skipped',
        message: '.gitignore already has security entries',
      };
    }

    // Append security entries
    const newContent = existingContent + '\n' + securityEntries;
    fs.writeFileSync(gitignorePath, newContent, 'utf-8');

    return {
      success: true,
      file: '.gitignore',
      action: 'updated',
      message: 'Added security entries to .gitignore',
    };
  } catch (error) {
    return {
      success: false,
      file: '.gitignore',
      action: 'failed',
      message: `Failed to update .gitignore: ${error}`,
    };
  }
}

/**
 * Create .env.example from .env file (with values removed)
 */
async function createEnvExample(targetPath: string, envFile: string): Promise<FixResult> {
  const envPath = path.join(targetPath, envFile);
  const examplePath = envPath.replace(/\.env.*/, '.env.example');

  try {
    if (!fs.existsSync(envPath)) {
      return {
        success: false,
        file: envFile,
        action: 'skipped',
        message: 'Environment file not found',
      };
    }

    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    
    const exampleLines = lines.map(line => {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) {
        return line;
      }
      
      // Extract key and replace value with placeholder
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
      if (match) {
        const key = match[1];
        return `${key}=your_${key.toLowerCase()}_here`;
      }
      return line;
    });

    const header = `# Environment Variables Template
# Copy this file to .env.local and fill in your values
# NEVER commit .env files with real values!
# Generated by Anchor Security

`;

    fs.writeFileSync(examplePath, header + exampleLines.join('\n'), 'utf-8');

    return {
      success: true,
      file: path.basename(examplePath),
      action: 'created',
      message: `Created ${path.basename(examplePath)} template (safe to commit)`,
    };
  } catch (error) {
    return {
      success: false,
      file: envFile,
      action: 'failed',
      message: `Failed to create .env.example: ${error}`,
    };
  }
}

/**
 * Redact secrets from documentation files
 */
async function redactSecretFromFile(targetPath: string, finding: Finding): Promise<FixResult> {
  const filePath = path.join(targetPath, finding.file);

  try {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        file: finding.file,
        action: 'skipped',
        message: 'File not found',
      };
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Patterns to redact
    const patterns = [
      // AWS keys
      { regex: /AKIA[0-9A-Z]{16}/g, replacement: 'AKIAXXXXXXXXXXXXXXXXX' },
      { regex: /[A-Za-z0-9+/]{40}/g, replacement: 'YOUR_SECRET_KEY_HERE' },
      // UUIDs (API keys, tokens)
      { regex: /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, replacement: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
      // JWT tokens
      { regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, replacement: 'YOUR_JWT_TOKEN_HERE' },
      // Generic API keys (32+ char hex/base64)
      { regex: /['"][A-Za-z0-9+/=_-]{32,}['"]/g, replacement: '"YOUR_API_KEY_HERE"' },
    ];

    let modified = false;
    for (const { regex, replacement } of patterns) {
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return {
        success: true,
        file: finding.file,
        action: 'redacted',
        message: `Redacted secrets from ${finding.file}`,
      };
    }

    return {
      success: false,
      file: finding.file,
      action: 'skipped',
      message: 'No patterns matched for redaction',
    };
  } catch (error) {
    return {
      success: false,
      file: finding.file,
      action: 'failed',
      message: `Failed to redact secrets: ${error}`,
    };
  }
}

/**
 * Create fix suggestion for prototype pollution
 */
function createPrototypePollutionFix(finding: Finding): FixResult {
  const fix = `
// Fix for prototype pollution in ${finding.file}:${finding.line}
// Option 1: Use Object.hasOwn() or hasOwnProperty check
if (Object.hasOwn(obj, key)) {
  // safe to access
}

// Option 2: Use Map instead of plain objects
const safeMap = new Map();

// Option 3: Create null-prototype object
const safeObj = Object.create(null);

// Option 4: Freeze the prototype
Object.freeze(Object.prototype);
`;

  return {
    success: true,
    file: finding.file,
    action: 'suggestion',
    message: 'Prototype pollution fix suggestion (manual review required)',
    suggestion: fix,
  };
}

/**
 * Update vulnerable dependencies
 */
async function updateDependencies(targetPath: string): Promise<FixResult> {
  const packageJsonPath = path.join(targetPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return {
      success: false,
      file: 'package.json',
      action: 'skipped',
      message: 'No package.json found',
    };
  }

  return {
    success: true,
    file: 'package.json',
    action: 'suggestion',
    message: 'Run "npm audit fix" to update vulnerable dependencies',
    suggestion: 'npm audit fix --force',
  };
}

/**
 * Remove .env files from git tracking
 */
async function removeEnvFromGit(targetPath: string): Promise<FixResult> {
  const gitPath = path.join(targetPath, '.git');

  if (!fs.existsSync(gitPath)) {
    return {
      success: false,
      file: '.git',
      action: 'skipped',
      message: 'Not a git repository',
    };
  }

  return {
    success: true,
    file: '.env*',
    action: 'suggestion',
    message: 'Remove .env files from git history',
    suggestion: `git rm --cached .env .env.local
git commit -m "Remove environment files from tracking"

# To remove from entire history (if already pushed):
# git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env*" --prune-empty --tag-name-filter cat -- --all`,
  };
}

/**
 * Print fix summary to console
 */
export function printFixSummary(summary: FixSummary): void {
  console.log('\n' + chalk.cyan.bold('🔧 Auto-Fix Summary'));
  console.log(chalk.gray('─'.repeat(50)));

  if (summary.totalFixed === 0 && summary.totalSkipped === 0) {
    console.log(chalk.green('✓ No issues to fix!'));
    return;
  }

  console.log(chalk.green(`   Fixed: ${summary.totalFixed}`));
  console.log(chalk.yellow(`   Skipped/Manual: ${summary.totalSkipped}`));
  console.log('');

  // Show fixes
  for (const fix of summary.fixes) {
    const icon = fix.success 
      ? (fix.action === 'suggestion' ? chalk.yellow('💡') : chalk.green('✓'))
      : chalk.red('✗');
    
    const actionColor = {
      created: chalk.green,
      updated: chalk.blue,
      redacted: chalk.magenta,
      suggestion: chalk.yellow,
      skipped: chalk.gray,
      failed: chalk.red,
    }[fix.action] || chalk.white;

    console.log(`   ${icon} ${chalk.white(fix.file)} - ${actionColor(fix.message)}`);
    
    if (fix.suggestion && fix.action === 'suggestion') {
      console.log(chalk.gray('      └─ ' + fix.suggestion.split('\n')[0]));
    }
  }

  console.log(chalk.gray('─'.repeat(50)));

  // Important reminders
  console.log(chalk.yellow.bold('\n⚠️  IMPORTANT REMINDERS:'));
  console.log(chalk.yellow('   1. Rotate ALL exposed API keys/secrets in their dashboards'));
  console.log(chalk.yellow('   2. Review changes before committing'));
  console.log(chalk.yellow('   3. Run scan again to verify fixes'));
  if (summary.secretsRemoved > 0) {
    console.log(chalk.yellow('   4. Check git history for previously committed secrets'));
  }
}
