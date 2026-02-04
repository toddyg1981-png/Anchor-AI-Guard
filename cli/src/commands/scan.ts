/**
 * Scan Command - Core scanning functionality
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import chalk from 'chalk';
import ora from 'ora';
import fg from 'fast-glob';
import { table } from 'table';
import { scanSecrets } from '../scanners/secrets';
import { scanSAST } from '../scanners/sast';
import { scanDependencies } from '../scanners/dependencies';
import { scanIaC } from '../scanners/iac';
import { scanDockerfile } from '../scanners/dockerfile';
import { Finding, ScanOptions, ScanResult, Severity } from '../types';
import { formatSARIF, formatJSON, formatMarkdown } from '../formatters';
import { loadConfig } from '../config';
import { autoFix, printFixSummary } from '../fixers';

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

/**
 * Check if user has premium license for auto-fix feature
 */
async function checkPremiumLicense(): Promise<boolean> {
  const configPath = path.join(os.homedir(), '.anchor', 'license.json');
  
  try {
    if (!fs.existsSync(configPath)) {
      return false;
    }
    
    const licenseData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // Check license validity
    if (licenseData.plan === 'pro' || licenseData.plan === 'team' || licenseData.plan === 'enterprise') {
      // Check expiry
      if (licenseData.expiresAt && new Date(licenseData.expiresAt) > new Date()) {
        return true;
      }
    }
    
    // Check for one-time fix purchases
    if (licenseData.oneTimeFixes && Array.isArray(licenseData.oneTimeFixes)) {
      // Allow if they have unused fixes
      return licenseData.oneTimeFixes.some((fix: any) => !fix.used);
    }
    
    return false;
  } catch {
    return false;
  }
}

export async function scanCommand(targetPath: string = '.', options: ScanOptions): Promise<void> {
  const startTime = Date.now();
  const resolvedPath = path.resolve(targetPath);
  
  // Check path exists
  if (!fs.existsSync(resolvedPath)) {
    console.error(chalk.red(`Error: Path not found: ${resolvedPath}`));
    process.exit(1);
  }

  // Load config
  const config = await loadConfig(options.config);
  const mergedOptions = { ...config, ...options };

  // Handle format shortcuts
  if (options.json) mergedOptions.format = 'json';
  if (options.sarif) mergedOptions.format = 'sarif';

  const spinner = ora({
    text: 'Initializing scan...',
    isEnabled: !options.quiet,
  }).start();

  try {
    // Discover files
    spinner.text = 'Discovering files...';
    const ignorePatterns = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.min.js',
      '**/*.map',
      ...(typeof mergedOptions.ignore === 'string' ? mergedOptions.ignore.split(',') : mergedOptions.ignore || []),
      ...(config.ignore || []),
    ];

    const files = await fg(['**/*'], {
      cwd: resolvedPath,
      dot: true,
      onlyFiles: true,
      ignore: ignorePatterns,
    });

    spinner.text = `Found ${files.length} files to scan`;

    const findings: Finding[] = [];
    const scanners: Array<{ name: string; fn: () => Promise<Finding[]>; enabled: boolean }> = [
      {
        name: 'Secrets',
        fn: () => scanSecrets(resolvedPath, files),
        enabled: mergedOptions.secrets !== false,
      },
      {
        name: 'Static Analysis',
        fn: () => scanSAST(resolvedPath, files),
        enabled: mergedOptions.sast !== false,
      },
      {
        name: 'Dependencies',
        fn: () => scanDependencies(resolvedPath),
        enabled: mergedOptions.deps !== false,
      },
      {
        name: 'Infrastructure as Code',
        fn: () => scanIaC(resolvedPath, files),
        enabled: mergedOptions.iac !== false,
      },
      {
        name: 'Dockerfile',
        fn: () => scanDockerfile(resolvedPath, files),
        enabled: mergedOptions.docker !== false,
      },
    ];

    // Run scanners
    for (const scanner of scanners) {
      if (!scanner.enabled) continue;
      
      spinner.text = `Running ${scanner.name} scanner...`;
      try {
        const results = await scanner.fn();
        findings.push(...results);
      } catch (err) {
        if (mergedOptions.verbose) {
          console.warn(chalk.yellow(`\nWarning: ${scanner.name} scanner failed:`, err));
        }
      }
    }

    spinner.succeed(`Scan complete in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

    // Filter by severity
    const minSeverity = SEVERITY_ORDER[mergedOptions.severity as Severity] ?? 3;
    const filteredFindings = findings.filter(
      f => SEVERITY_ORDER[f.severity] <= minSeverity
    );

    // Create result
    const result: ScanResult = {
      version: '1.0.0',
      scanTime: new Date().toISOString(),
      target: resolvedPath,
      filesScanned: files.length,
      findings: filteredFindings,
      summary: {
        total: filteredFindings.length,
        critical: filteredFindings.filter(f => f.severity === 'critical').length,
        high: filteredFindings.filter(f => f.severity === 'high').length,
        medium: filteredFindings.filter(f => f.severity === 'medium').length,
        low: filteredFindings.filter(f => f.severity === 'low').length,
        info: filteredFindings.filter(f => f.severity === 'info').length,
      },
    };

    // Output results
    await outputResults(result, mergedOptions);

    // Auto-fix if requested (PREMIUM FEATURE)
    if (mergedOptions.fix && filteredFindings.length > 0) {
      console.log('');
      
      // Check for premium license
      const hasPremiumLicense = await checkPremiumLicense();
      
      if (!hasPremiumLicense) {
        console.log(chalk.yellow.bold('\n🔒 AUTO-FIX is a Premium Feature'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.white('   Automatically fix security issues with one command.'));
        console.log('');
        console.log(chalk.cyan('   ✓ Create .gitignore with security entries'));
        console.log(chalk.cyan('   ✓ Generate .env.example templates'));
        console.log(chalk.cyan('   ✓ Redact secrets from documentation'));
        console.log(chalk.cyan('   ✓ Fix prototype pollution vulnerabilities'));
        console.log(chalk.cyan('   ✓ Update vulnerable dependencies'));
        console.log('');
        console.log(chalk.yellow('   💰 Pricing:'));
        console.log(chalk.white('      • Pro Plan: $49/mo - Includes Auto-Fix'));
        console.log(chalk.white('      • Team Plan: $149/mo - Auto-Fix + Priority Support'));
        console.log(chalk.white('      • One-time fix: $9.99 per project'));
        console.log('');
        console.log(chalk.cyan('   🔗 Upgrade at: https://anchor.security/pricing'));
        console.log(chalk.cyan('   🔑 Or run: anchor auth login --upgrade'));
        console.log(chalk.gray('─'.repeat(50)));
        return;
      }
      
      const fixSpinner = ora({
        text: 'Applying auto-fixes...',
        isEnabled: !options.quiet,
      }).start();

      try {
        const fixSummary = await autoFix(resolvedPath, filteredFindings, {
          removeSecretsFromDocs: true,
          updateDeps: true,
          createGitignore: true,
          createEnvExample: true,
          dryRun: mergedOptions.fixDryRun,
        });

        fixSpinner.succeed('Auto-fix complete');
        printFixSummary(fixSummary);

        // Re-scan to show updated results
        if (fixSummary.totalFixed > 0 && !mergedOptions.quiet) {
          console.log(chalk.cyan('\n🔄 Run scan again to verify fixes were applied correctly.'));
        }
      } catch (fixError) {
        fixSpinner.fail('Auto-fix encountered errors');
        console.error(chalk.yellow('Some fixes could not be applied:'), fixError);
      }
    }

    // CI mode exit codes
    if (mergedOptions.ci) {
      const failSeverity = SEVERITY_ORDER[mergedOptions.failOn as Severity] ?? 1;
      const hasFailures = filteredFindings.some(
        f => SEVERITY_ORDER[f.severity] <= failSeverity
      );
      if (hasFailures) {
        console.log(chalk.red(`\n✖ Findings at or above "${mergedOptions.failOn}" severity detected`));
        process.exit(1);
      }
    }

  } catch (error) {
    spinner.fail('Scan failed');
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

async function outputResults(result: ScanResult, options: ScanOptions): Promise<void> {
  let output: string;

  switch (options.format) {
    case 'json':
      output = formatJSON(result);
      break;
    case 'sarif':
      output = formatSARIF(result);
      break;
    case 'markdown':
      output = formatMarkdown(result);
      break;
    case 'table':
    default:
      printTableOutput(result, options);
      return;
  }

  // Write to file or stdout
  if (options.output) {
    fs.writeFileSync(options.output, output);
    console.log(chalk.green(`\n✓ Results written to ${options.output}`));
  } else {
    console.log(output);
  }
}

function printTableOutput(result: ScanResult, options: ScanOptions): void {
  console.log('\n' + chalk.cyan.bold('📊 Scan Summary'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`   Target: ${chalk.white(result.target)}`);
  console.log(`   Files:  ${chalk.white(result.filesScanned)}`);
  console.log(`   Time:   ${chalk.white(result.scanTime)}`);
  console.log(chalk.gray('─'.repeat(50)));

  // Summary badges
  const { summary } = result;
  console.log('\n' + chalk.bold('Findings:'));
  const badges = [
    summary.critical > 0 ? chalk.bgRed.white(` CRITICAL ${summary.critical} `) : null,
    summary.high > 0 ? chalk.bgYellow.black(` HIGH ${summary.high} `) : null,
    summary.medium > 0 ? chalk.bgMagenta.white(` MEDIUM ${summary.medium} `) : null,
    summary.low > 0 ? chalk.bgBlue.white(` LOW ${summary.low} `) : null,
    summary.info > 0 ? chalk.bgGray.white(` INFO ${summary.info} `) : null,
  ].filter(Boolean);

  if (badges.length > 0) {
    console.log('   ' + badges.join(' '));
  } else {
    console.log(chalk.green('   ✓ No findings!'));
  }

  // Detailed table
  if (result.findings.length > 0 && !options.quiet) {
    console.log('\n' + chalk.bold('Details:'));
    
    const tableData = [
      [
        chalk.bold('Severity'),
        chalk.bold('Type'),
        chalk.bold('File'),
        chalk.bold('Line'),
        chalk.bold('Message'),
      ],
      ...result.findings.slice(0, 20).map(f => [
        severityBadge(f.severity),
        f.rule,
        truncate(f.file, 30),
        f.line?.toString() || '-',
        truncate(f.message, 40),
      ]),
    ];

    console.log(table(tableData, {
      border: {
        topBody: chalk.gray('─'),
        topJoin: chalk.gray('┬'),
        topLeft: chalk.gray('┌'),
        topRight: chalk.gray('┐'),
        bottomBody: chalk.gray('─'),
        bottomJoin: chalk.gray('┴'),
        bottomLeft: chalk.gray('└'),
        bottomRight: chalk.gray('┘'),
        bodyLeft: chalk.gray('│'),
        bodyRight: chalk.gray('│'),
        bodyJoin: chalk.gray('│'),
        joinBody: chalk.gray('─'),
        joinLeft: chalk.gray('├'),
        joinRight: chalk.gray('┤'),
        joinJoin: chalk.gray('┼'),
      },
    }));

    if (result.findings.length > 20) {
      console.log(chalk.gray(`   ... and ${result.findings.length - 20} more findings`));
    }
  }

  // Footer
  console.log(chalk.gray('─'.repeat(50)));
  if (summary.total === 0) {
    console.log(chalk.green.bold('✓ No security issues found!'));
  } else {
    console.log(chalk.yellow(`⚠ ${summary.total} security issues found`));
  }
}

function severityBadge(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return chalk.bgRed.white(' CRIT ');
    case 'high':
      return chalk.bgYellow.black(' HIGH ');
    case 'medium':
      return chalk.bgMagenta.white(' MED  ');
    case 'low':
      return chalk.bgBlue.white(' LOW  ');
    case 'info':
      return chalk.bgGray.white(' INFO ');
    default:
      return severity;
  }
}

function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len - 3) + '...' : str;
}
