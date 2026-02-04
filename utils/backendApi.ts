import { apiClient } from './apiClient';
import { env } from '../config/env';
import { Finding, Project, Severity, ActiveScan } from '../types';
import { logger } from './logger';

interface ApiProject {
  id: string;
  name: string;
  owner: string;
  totalScans: number;
  activeScans: number;
  findingsCount: number;
  scope: {
    domains: string[];
    apis: string[];
    mobileBuilds: string[];
  };
  runHistory: Array<{
    id: string;
    date: string;
    result: string;
    findings: number;
    status: 'Completed' | 'In Progress' | 'Failed';
  }>;
}

interface ApiFinding {
  id: string;
  title: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  guidance: string;
  reproduction: string;
  project?: {
    id: string;
    name: string;
  };
}

interface ApiScan {
  id: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  project?: {
    id: string;
    name: string;
  };
}

const toSeverity = (severity: ApiFinding['severity']): Severity => {
  switch (severity) {
    case 'CRITICAL':
      return Severity.Critical;
    case 'HIGH':
      return Severity.High;
    case 'MEDIUM':
      return Severity.Medium;
    case 'LOW':
    default:
      return Severity.Low;
  }
};

const mapFinding = (finding: ApiFinding): Finding => ({
  id: finding.id,
  severity: toSeverity(finding.severity),
  type: finding.type || finding.title,
  description: finding.description,
  guidance: finding.guidance,
  reproduction: finding.reproduction,
  project: finding.project?.name ?? 'Unknown Project',
});

const mapProject = (project: ApiProject): Project => ({
  id: project.id,
  name: project.name,
  owner: project.owner ?? 'Unassigned',
  totalScans: project.totalScans ?? 0,
  activeScans: project.activeScans ?? 0,
  findingsCount: project.findingsCount ?? 0,
  scope: project.scope ?? { domains: [], apis: [], mobileBuilds: [] },
  runHistory: (project.runHistory ?? []).map((run) => ({
    id: run.id,
    date: run.date,
    result: run.result,
    findings: run.findings,
    status: run.status,
  })),
});

export const backendApi = {
  async getProjects(): Promise<Project[]> {
    const baseUrl = env.apiBaseUrl;
    const response = await apiClient.get<{ projects: ApiProject[] }>(`${baseUrl}/projects`);
    return response.projects.map(mapProject);
  },

  async getFindings(): Promise<Finding[]> {
    const baseUrl = env.apiBaseUrl;
    const response = await apiClient.get<{ findings: ApiFinding[] }>(`${baseUrl}/findings`);
    return response.findings.map(mapFinding);
  },

  async getActiveScans(): Promise<ActiveScan[]> {
    const baseUrl = env.apiBaseUrl;
    const response = await apiClient.get<{ scans: ApiScan[] }>(`${baseUrl}/scans`);
    return response.scans
      .filter((scan) => scan.status === 'QUEUED' || scan.status === 'RUNNING')
      .map((scan) => ({
        id: scan.id,
        projectName: scan.project?.name ?? 'Unknown Project',
        progress: scan.progress ?? 0,
      }));
  },

  async runScan(projectId: string, targetPath: string): Promise<{ scanId: string; status: string }> {
    const baseUrl = env.apiBaseUrl;
    try {
      return await apiClient.post<{ scanId: string; status: string }>(`${baseUrl}/scans/run`, {
        projectId,
        targetPath,
      });
    } catch (error) {
      logger.error('Failed to trigger scan', { projectId, error });
      throw error;
    }
  },
};
