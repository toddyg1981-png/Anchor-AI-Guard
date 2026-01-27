
export enum Severity {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Informational = 'Informational',
  Resolved = 'Resolved'
}

export interface Project {
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
  runHistory: ScanRun[];
}

export interface ScanRun {
    id: string;
    date: string;
    result: string;
    findings: number;
    status: 'Completed' | 'In Progress' | 'Failed';
}

export interface ActiveScan {
  id: string;
  projectName: string;
  progress: number;
}

export interface Finding {
  id: string;
  severity: Severity;
  type: string;
  description: string;
  guidance: string;
  reproduction: string;
  project: string;
}
