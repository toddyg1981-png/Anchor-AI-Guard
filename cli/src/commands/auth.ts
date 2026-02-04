/**
 * Auth Command - Authenticate with Anchor Cloud
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

const AUTH_FILE = path.join(os.homedir(), '.anchor', 'auth.json');

interface AuthData {
  token: string;
  email?: string;
  expiresAt?: string;
}

interface AuthOptions {
  token?: string;
}

export async function authCommand(action: string, options: AuthOptions): Promise<void> {
  switch (action) {
    case 'login':
      await login(options);
      break;
    case 'logout':
      logout();
      break;
    case 'status':
      status();
      break;
    case 'token':
      showToken();
      break;
    default:
      console.error(chalk.red(`Error: Unknown action: ${action}`));
      console.log(chalk.gray('Valid actions: login, logout, status, token'));
      process.exit(1);
  }
}

async function login(options: AuthOptions): Promise<void> {
  if (options.token) {
    // Non-interactive login with token
    saveAuth({ token: options.token });
    console.log(chalk.green('✓ Logged in with API token'));
    return;
  }

  // Interactive login
  console.log(chalk.cyan('⚓ Anchor Cloud Login'));
  console.log('');
  console.log('To authenticate, visit:');
  console.log(chalk.underline('https://app.anchor.security/cli/auth'));
  console.log('');
  console.log('Or use: anchor auth login --token <your-api-token>');
  console.log('');
  console.log(chalk.gray('Get your API token from: https://app.anchor.security/settings/tokens'));
}

function logout(): void {
  if (fs.existsSync(AUTH_FILE)) {
    fs.unlinkSync(AUTH_FILE);
    console.log(chalk.green('✓ Logged out'));
  } else {
    console.log(chalk.yellow('Not logged in'));
  }
}

function status(): void {
  const auth = loadAuth();
  
  if (!auth) {
    console.log(chalk.yellow('Not authenticated'));
    console.log(chalk.gray('Run: anchor auth login'));
    return;
  }

  console.log(chalk.green('✓ Authenticated'));
  if (auth.email) {
    console.log(`  Email: ${auth.email}`);
  }
  if (auth.expiresAt) {
    const expires = new Date(auth.expiresAt);
    const now = new Date();
    if (expires < now) {
      console.log(chalk.red('  Token expired'));
    } else {
      console.log(`  Expires: ${expires.toLocaleDateString()}`);
    }
  }
}

function showToken(): void {
  const auth = loadAuth();
  
  if (!auth) {
    console.error(chalk.red('Not authenticated'));
    process.exit(1);
  }

  // Only show masked token for security
  const masked = auth.token.slice(0, 8) + '...' + auth.token.slice(-4);
  console.log(masked);
}

function saveAuth(data: AuthData): void {
  const dir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(AUTH_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
}

function loadAuth(): AuthData | null {
  if (!fs.existsSync(AUTH_FILE)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  const auth = loadAuth();
  return auth?.token || null;
}
