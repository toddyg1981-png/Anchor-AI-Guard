import path from 'path';
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

export async function runScan({ projectId, targetPath }: ScanRequest): Promise<void> {
  const resolvedPath = resolveTargetPath(targetPath);

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
    // Emit WebSocket event
    wsManager.emitScanProgress(scan.id, projectId, progress, status);
  };

  const files = await fg(['**/*.*'], {
    cwd: resolvedPath,
    dot: false,
    onlyFiles: true,
    ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
  });

  await updateProgress(15);

  const findings = [
    ...scanSecrets(resolvedPath, files),
    ...scanStaticCode(resolvedPath, files),
    ...scanIaC(resolvedPath, files),
    ...scanDockerfile(resolvedPath, files),
    ...scanDependencies(resolvedPath),
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

  // Emit scan complete event
  wsManager.emitScanComplete(scan.id, projectId, findings.length);
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
