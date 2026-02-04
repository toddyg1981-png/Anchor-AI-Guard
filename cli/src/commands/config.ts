/**
 * Config Command - Manage Anchor configuration
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import yaml from 'yaml';

export async function configCommand(
  action: string,
  key?: string,
  value?: string
): Promise<void> {
  const configPath = path.join(process.cwd(), '.anchor.yml');
  
  switch (action) {
    case 'show':
      showConfig(configPath);
      break;
    case 'get':
      if (!key) {
        console.error(chalk.red('Error: Key required for get action'));
        process.exit(1);
      }
      getConfig(configPath, key);
      break;
    case 'set':
      if (!key || value === undefined) {
        console.error(chalk.red('Error: Key and value required for set action'));
        process.exit(1);
      }
      setConfig(configPath, key, value);
      break;
    case 'reset':
      resetConfig(configPath);
      break;
    default:
      console.error(chalk.red(`Error: Unknown action: ${action}`));
      console.log(chalk.gray('Valid actions: show, get, set, reset'));
      process.exit(1);
  }
}

function showConfig(configPath: string): void {
  if (!fs.existsSync(configPath)) {
    console.log(chalk.yellow('No configuration file found. Run: anchor init'));
    return;
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  console.log(chalk.cyan('Current configuration:'));
  console.log(content);
}

function getConfig(configPath: string, key: string): void {
  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('No configuration file found. Run: anchor init'));
    process.exit(1);
  }

  const config = yaml.parse(fs.readFileSync(configPath, 'utf-8'));
  const value = getNestedValue(config, key);
  
  if (value === undefined) {
    console.error(chalk.red(`Key not found: ${key}`));
    process.exit(1);
  }

  console.log(typeof value === 'object' ? yaml.stringify(value) : value);
}

function setConfig(configPath: string, key: string, value: string): void {
  let config: any = {};
  
  if (fs.existsSync(configPath)) {
    config = yaml.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  // Parse value (handle booleans, numbers)
  let parsedValue: any = value;
  if (value === 'true') parsedValue = true;
  else if (value === 'false') parsedValue = false;
  else if (!isNaN(Number(value))) parsedValue = Number(value);

  setNestedValue(config, key, parsedValue);
  fs.writeFileSync(configPath, yaml.stringify(config));
  
  console.log(chalk.green(`✓ Set ${key} = ${value}`));
}

function resetConfig(configPath: string): void {
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
    console.log(chalk.green('✓ Configuration reset'));
  } else {
    console.log(chalk.yellow('No configuration file to reset'));
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}
