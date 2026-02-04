#!/usr/bin/env node
/**
 * Anchor Security CLI
 * Enterprise-grade security scanning from the command line
 */

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { scanCommand } from './commands/scan';
import { initCommand } from './commands/init';
import { reportCommand } from './commands/report';
import { configCommand } from './commands/config';
import { authCommand } from './commands/auth';
import { ciCommand } from './commands/ci';

const VERSION = '1.0.0';

const banner = `
   ⚓ ${chalk.cyan.bold('ANCHOR')} ${chalk.gray('Security Scanner')}
   ${chalk.gray('v' + VERSION)}
`;

const program = new Command();

program
  .name('anchor')
  .description(chalk.cyan('⚓ Anchor Security CLI - Scan your code for vulnerabilities'))
  .version(VERSION, '-v, --version', 'Output the current version')
  .hook('preAction', () => {
    console.log(boxen(banner, {
      padding: 0,
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
      borderStyle: 'none',
    }));
  });

// Main scan command
program
  .command('scan [path]')
  .description('Scan a directory or file for security vulnerabilities')
  .option('-o, --output <file>', 'Output results to a file')
  .option('-f, --format <format>', 'Output format: json, sarif, table, markdown', 'table')
  .option('--severity <level>', 'Minimum severity to report: critical, high, medium, low, info', 'low')
  .option('--ignore <patterns>', 'Comma-separated patterns to ignore')
  .option('--config <file>', 'Path to config file')
  .option('--no-secrets', 'Skip secrets scanning')
  .option('--no-sast', 'Skip static analysis')
  .option('--no-deps', 'Skip dependency scanning')
  .option('--no-iac', 'Skip infrastructure-as-code scanning')
  .option('--no-docker', 'Skip Dockerfile scanning')
  .option('--fix', 'Automatically fix security issues where possible')
  .option('--fix-dry-run', 'Show what fixes would be applied without making changes')
  .option('--ci', 'CI mode: exit with code 1 if findings above threshold')
  .option('--fail-on <severity>', 'Fail if findings at or above severity: critical, high, medium, low', 'high')
  .option('--json', 'Shorthand for --format json')
  .option('--sarif', 'Shorthand for --format sarif')
  .option('-q, --quiet', 'Minimal output')
  .option('--verbose', 'Verbose output')
  .action(scanCommand);

// Initialize config
program
  .command('init')
  .description('Initialize Anchor configuration in your project')
  .option('-f, --force', 'Overwrite existing config')
  .option('--preset <preset>', 'Use a preset: strict, moderate, relaxed', 'moderate')
  .action(initCommand);

// Generate reports
program
  .command('report')
  .description('Generate security reports from scan results')
  .option('-i, --input <file>', 'Input scan results file (JSON)')
  .option('-o, --output <file>', 'Output report file')
  .option('-f, --format <format>', 'Report format: html, pdf, markdown', 'html')
  .option('--template <template>', 'Custom report template')
  .action(reportCommand);

// Configuration management
program
  .command('config')
  .description('Manage Anchor configuration')
  .argument('<action>', 'Action: show, set, get, reset')
  .argument('[key]', 'Configuration key')
  .argument('[value]', 'Configuration value')
  .action(configCommand);

// Authentication
program
  .command('auth')
  .description('Authenticate with Anchor Cloud')
  .argument('<action>', 'Action: login, logout, status, token')
  .option('--token <token>', 'API token for non-interactive login')
  .action(authCommand);

// CI/CD helpers
program
  .command('ci')
  .description('CI/CD integration commands')
  .argument('<action>', 'Action: setup, github-action, gitlab-ci, jenkins')
  .option('--output <file>', 'Output file for generated config')
  .action(ciCommand);

// Custom help
program.addHelpText('after', `
${chalk.cyan('Examples:')}
  ${chalk.gray('# Scan current directory')}
  $ anchor scan

  ${chalk.gray('# Scan with SARIF output for GitHub')}
  $ anchor scan --sarif -o results.sarif

  ${chalk.gray('# Scan in CI mode, fail on high severity')}
  $ anchor scan --ci --fail-on high

  ${chalk.gray('# Initialize config with strict preset')}
  $ anchor init --preset strict

  ${chalk.gray('# Generate HTML report')}
  $ anchor report -i results.json -o report.html

${chalk.cyan('Documentation:')} ${chalk.underline('https://anchor.security/docs/cli')}
`);

// Parse and run
program.parse();
