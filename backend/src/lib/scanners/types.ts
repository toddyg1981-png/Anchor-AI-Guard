export interface ScannerFinding {
  title: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  guidance: string;
  reproduction: string;
  filePath?: string;
  lineNumber?: number;
}
