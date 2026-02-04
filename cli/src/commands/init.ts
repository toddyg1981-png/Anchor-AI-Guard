/**
 * Init Command - Initialize Anchor configuration
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import yaml from 'yaml';

interface InitOptions {
  force?: boolean;
  preset?: 'strict' | 'moderate' | 'relaxed';
}

const PRESETS = {
  strict: {
    severity: 'info',
    failOn: 'low',
    scanners: {
      secrets: true,
      sast: true,
      dependencies: true,
      iac: true,
      dockerfile: true,
    },
    rules: {
      'no-hardcoded-secrets': 'error',
      'sql-injection': 'error',
      'xss': 'error',
      'command-injection': 'error',
      'path-traversal': 'error',
      'insecure-crypto': 'error',
      'vulnerable-dependency': 'error',
    },
  },
  moderate: {
    severity: 'low',
    failOn: 'high',
    scanners: {
      secrets: true,
      sast: true,
      dependencies: true,
      iac: true,
      dockerfile: true,
    },
    rules: {
      'no-hardcoded-secrets': 'error',
      'sql-injection': 'error',
      'xss': 'error',
      'command-injection': 'error',
      'path-traversal': 'warning',
      'insecure-crypto': 'warning',
      'vulnerable-dependency': 'warning',
    },
  },
  relaxed: {
    severity: 'medium',
    failOn: 'critical',
    scanners: {
      secrets: true,
      sast: true,
      dependencies: true,
      iac: false,
      dockerfile: false,
    },
    rules: {
      'no-hardcoded-secrets': 'error',
      'sql-injection': 'error',
      'xss': 'warning',
      'command-injection': 'warning',
      'path-traversal': 'off',
      'insecure-crypto': 'off',
      'vulnerable-dependency': 'warning',
    },
  },
};

export async function initCommand(options: InitOptions): Promise<void> {
  const configPath = path.join(process.cwd(), '.anchor.yml');
  
  if (fs.existsSync(configPath) && !options.force) {
    console.log(chalk.yellow('⚠ Configuration file already exists. Use --force to overwrite.'));
    process.exit(1);
  }

  const preset = options.preset || 'moderate';
  const config = {
    version: '1.0',
    ...PRESETS[preset],
    ignore: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/__tests__/**',
    ],
  };

  const yamlContent = `# Anchor Security Configuration
# Generated with preset: ${preset}
# Docs: https://anchor.security/docs/config

${yaml.stringify(config)}`;

  fs.writeFileSync(configPath, yamlContent);

  console.log(chalk.green('✓ Created .anchor.yml'));
  console.log(chalk.gray(`  Preset: ${preset}`));
  console.log('');
  console.log(chalk.cyan('Next steps:'));
  console.log(chalk.gray('  1. Review and customize .anchor.yml'));
  console.log(chalk.gray('  2. Run: anchor scan'));
  console.log(chalk.gray('  3. Set up CI: anchor ci setup'));
}
