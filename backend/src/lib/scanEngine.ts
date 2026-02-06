import os from 'os';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import fg from 'fast-glob';
import { prisma } from './prisma';
import { wsManager } from './websocket';
import { scanSecrets } from './scanners/secrets';
import { scanStaticCode } from './scanners/staticCode';
import { scanIaC } from './scanners/iac';
import { scanDockerfile } from './scanners/dockerfile';
import { scanDependencies } from './scanners/dependencies';

export interface ScanRequest {
  projectId: string;
  targetPath: string;
}

const allowedRoot = () => {
  const root = process.env.SCAN_ROOT ?? process.cwd();
  return path.resolve(root);
};

const resolveTargetPath = (targetPath: string): string => {
  const root = allowedRoot();
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(root)) {
    throw new Error('Target path is outside allowed scan root');
  }
  return resolved;
};

// ---------------------------------------------------------------------------
// Core scanner — runs all scanners on a directory and saves findings to DB
// ---------------------------------------------------------------------------
async function scanDirectory(projectId: string, scanDir: string): Promise<{ scanId: string; findingsCount: number }> {
  const scan = await prisma.scan.create({
    data: {
      projectId,
      status: 'RUNNING',
      progress: 5,
      startedAt: new Date(),
    },
  });

  const updateProgress = async (progress: number, status: string = 'RUNNING') => {
    await prisma.scan.update({
      where: { id: scan.id },
      data: { progress },
    });
    wsManager.emitScanProgress(scan.id, projectId, progress, status);
  };

  const files = await fg(['**/*.*'], {
    cwd: scanDir,
    dot: false,
    onlyFiles: true,
    ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
  });

  await updateProgress(15);

  const findings = [
    ...scanSecrets(scanDir, files),
    ...scanStaticCode(scanDir, files),
    ...scanIaC(scanDir, files),
    ...scanDockerfile(scanDir, files),
    ...scanDependencies(scanDir),
  ];

  await updateProgress(80);

  if (findings.length > 0) {
    await prisma.finding.createMany({
      data: findings.map((finding) => ({
        projectId,
        title: finding.title,
        type: finding.type,
        severity: finding.severity,
        description: finding.description,
        guidance: finding.guidance,
        reproduction: finding.reproduction,
        filePath: finding.filePath,
        lineNumber: finding.lineNumber,
      })),
    });
  }

  await prisma.scan.update({
    where: { id: scan.id },
    data: {
      status: 'COMPLETED',
      progress: 100,
      completedAt: new Date(),
      findingsCount: findings.length,
    },
  });

  wsManager.emitScanComplete(scan.id, projectId, findings.length);

  return { scanId: scan.id, findingsCount: findings.length };
}

// ---------------------------------------------------------------------------
// Original local-path scan (kept for backward compatibility)
// ---------------------------------------------------------------------------
export async function runScan({ projectId, targetPath }: ScanRequest): Promise<void> {
  const resolvedPath = resolveTargetPath(targetPath);
  await scanDirectory(projectId, resolvedPath);
}

// ---------------------------------------------------------------------------
// GitHub repo scan — clone a public repo, scan it, then clean up
// ---------------------------------------------------------------------------
export async function runGithubScan(
  projectId: string,
  repoUrl: string,
  branch: string = 'main'
): Promise<{ scanId: string; findingsCount: number }> {
  // Validate the URL looks like a git repo
  if (!/^https:\/\/(github|gitlab|bitbucket)\.\w+\/.+/i.test(repoUrl)) {
    throw new Error('Invalid repository URL. Use an HTTPS URL from GitHub, GitLab, or Bitbucket.');
  }

  const tmpDir = path.join(os.tmpdir(), `anchor-scan-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    // Use execFileSync to avoid shell injection — arguments are passed as array
    execFileSync('git', ['clone', '--depth', '1', '--branch', branch, repoUrl, tmpDir], {
      timeout: 120000, // 2 minute timeout for clone
      stdio: 'pipe',
    });

    return await scanDirectory(projectId, tmpDir);
  } finally {
    // Always clean up temp directory
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      console.warn('Failed to clean up temp scan directory:', tmpDir);
    }
  }
}

// ---------------------------------------------------------------------------
// Upload scan — accept an array of {name, content} file objects, write to
//               temp dir, scan, then clean up
// ---------------------------------------------------------------------------
export async function runUploadScan(
  projectId: string,
  files: Array<{ name: string; content: string }>
): Promise<{ scanId: string; findingsCount: number }> {
  if (files.length === 0) {
    throw new Error('No files provided for scanning.');
  }
  if (files.length > 500) {
    throw new Error('Too many files. Maximum 500 files per upload scan.');
  }

  const tmpDir = path.join(os.tmpdir(), `anchor-scan-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    for (const file of files) {
      // Sanitize filename — prevent path traversal
      const safeName = path.normalize(file.name).replace(/^(\.\.(\/|\\|$))+/, '');
      if (safeName.startsWith('/') || safeName.startsWith('\\')) continue;

      const filePath = path.join(tmpDir, safeName);
      const fileDir = path.dirname(filePath);

      // Ensure the file stays within tmpDir
      if (!filePath.startsWith(tmpDir)) continue;

      fs.mkdirSync(fileDir, { recursive: true });
      // Content is sent as plain text (not base64) for simplicity
      fs.writeFileSync(filePath, file.content, 'utf-8');
    }

    return await scanDirectory(projectId, tmpDir);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      console.warn('Failed to clean up temp scan directory:', tmpDir);
    }
  }
}

// ---------------------------------------------------------------------------
// Snippet scan — accept raw code text, write to a temp file, scan it
// ---------------------------------------------------------------------------
export async function runSnippetScan(
  projectId: string,
  code: string,
  filename: string = 'snippet.ts'
): Promise<{ scanId: string; findingsCount: number }> {
  if (!code || code.trim().length === 0) {
    throw new Error('No code provided for scanning.');
  }
  if (code.length > 500000) {
    throw new Error('Code snippet too large. Maximum 500KB.');
  }

  const tmpDir = path.join(os.tmpdir(), `anchor-scan-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  // Sanitize filename
  const safeName = path.basename(filename);

  try {
    fs.writeFileSync(path.join(tmpDir, safeName), code, 'utf-8');
    return await scanDirectory(projectId, tmpDir);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      console.warn('Failed to clean up temp scan directory:', tmpDir);
    }
  }
}

export async function failScan(scanId: string, projectId: string, reason: string): Promise<void> {
  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: 'FAILED',
      progress: 100,
      completedAt: new Date(),
    },
  });
  // Emit failure event
  wsManager.emitScanFailed(scanId, projectId, reason);
  console.error('Scan failed:', reason);
}
