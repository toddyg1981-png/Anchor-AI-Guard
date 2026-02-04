/**
 * Configuration loader
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { Config } from './types';

export async function loadConfig(configPath?: string): Promise<Config> {
  const paths = configPath
    ? [configPath]
    : [
        '.anchor.yml',
        '.anchor.yaml',
        'anchor.config.yml',
        'anchor.config.yaml',
        '.anchor.json',
        'anchor.config.json',
      ];

  for (const p of paths) {
    const fullPath = path.resolve(p);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      if (p.endsWith('.json')) {
        return JSON.parse(content);
      }
      return yaml.parse(content) || {};
    }
  }

  return {};
}

export function getDefaultConfig(): Config {
  return {
    version: '1.0',
    severity: 'low',
    failOn: 'high',
    ignore: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
    ],
    scanners: {
      secrets: true,
      sast: true,
      dependencies: true,
      iac: true,
      dockerfile: true,
    },
    rules: {},
  };
}
