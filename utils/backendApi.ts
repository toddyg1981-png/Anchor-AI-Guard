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
  async createProject(data: { name: string; description?: string; owner?: string; scope?: { domains?: string[]; apis?: string[]; mobileBuilds?: string[] } }): Promise<Project> {
    const baseUrl = env.apiBaseUrl;
    const response = await apiClient.post<{ project: ApiProject }>(`${baseUrl}/projects`, data);
    return mapProject(response.project);
  },

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

  async scanGithub(projectId: string, repoUrl: string, branch: string = 'main'): Promise<{ scanId: string; status: string }> {
    const baseUrl = env.apiBaseUrl;
    try {
      return await apiClient.post<{ scanId: string; status: string }>(`${baseUrl}/scans/github`, {
        projectId,
        repoUrl,
        branch,
      });
    } catch (error) {
      logger.error('Failed to trigger GitHub scan', { projectId, repoUrl, error });
      throw error;
    }
  },

  async scanUpload(projectId: string, files: Array<{ name: string; content: string }>): Promise<{ scanId: string; status: string }> {
    const baseUrl = env.apiBaseUrl;
    try {
      return await apiClient.post<{ scanId: string; status: string }>(`${baseUrl}/scans/upload`, {
        projectId,
        files,
      });
    } catch (error) {
      logger.error('Failed to trigger upload scan', { projectId, error });
      throw error;
    }
  },

  async scanSnippet(projectId: string, code: string, filename: string = 'snippet.ts'): Promise<{ scanId: string; status: string }> {
    const baseUrl = env.apiBaseUrl;
    try {
      return await apiClient.post<{ scanId: string; status: string }>(`${baseUrl}/scans/snippet`, {
        projectId,
        code,
        filename,
      });
    } catch (error) {
      logger.error('Failed to trigger snippet scan', { projectId, error });
      throw error;
    }
  },

  // ===========================================================================
  // THREAT INTELLIGENCE ROUTES
  // ===========================================================================
  threatIntel: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/threat-intel/dashboard`);
    },
    async extractIOCs(text: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/threat-intel/extract-iocs`, { text });
    },
    async analyze(indicator: string, type: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/threat-intel/analyze`, { indicator, type });
    },
    async predictVulnerabilities(projectId?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/threat-intel/predict-vulnerabilities`, { projectId });
    },
    async searchCVEs(query: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/threat-intel/cves?query=${encodeURIComponent(query)}`);
    },
    async getKEV() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/threat-intel/kev`);
    },
    async checkReputation(indicators: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/threat-intel/reputation`, { indicators });
    },
  },

  // ===========================================================================
  // COMPLIANCE ROUTES
  // ===========================================================================
  compliance: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/compliance/dashboard`);
    },
    async getFrameworks() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/compliance/frameworks`);
    },
    async assessFramework(frameworkId: string, projectId?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/compliance/assess`, { frameworkId, projectId });
    },
    async getReport(frameworkId: string, format?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/compliance/report/${frameworkId}${format ? `?format=${format}` : ''}`);
    },
    async runFullAudit(projectId?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/compliance/audit`, { projectId });
    },
  },

  // ===========================================================================
  // SOC / AUTONOMOUS SOC ROUTES
  // ===========================================================================
  soc: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/soc/dashboard`);
    },
    async getEvents(params?: { severity?: string; status?: string; limit?: number }) {
      const baseUrl = env.apiBaseUrl;
      const queryParts: string[] = [];
      if (params?.severity) queryParts.push(`severity=${params.severity}`);
      if (params?.status) queryParts.push(`status=${params.status}`);
      if (params?.limit) queryParts.push(`limit=${params.limit}`);
      const query = queryParts.length ? `?${queryParts.join('&')}` : '';
      return apiClient.get<unknown>(`${baseUrl}/soc/events${query}`);
    },
    async createEvent(data: { title: string; description: string; severity: string; source: string }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/soc/events`, data);
    },
    async updateEvent(id: string, updates: { status?: string; assignee?: string }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.put<unknown>(`${baseUrl}/soc/events/${id}`, updates);
    },
    async getIncidents() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/soc/incidents`);
    },
    async createIncident(data: { title: string; severity: string; eventIds?: string[] }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/soc/incidents`, data);
    },
    async triageEvent(eventId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/soc/triage`, { eventId });
    },
    async getPlaybooks() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/soc/playbooks`);
    },
    async executePlaybook(playbookId: string, eventId?: string, incidentId?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/soc/playbooks/execute`, { playbookId, eventId, incidentId });
    },
  },

  // ===========================================================================
  // ATTACK SURFACE ROUTES
  // ===========================================================================
  attackSurface: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/attack-surface/dashboard`);
    },
    async getAssets() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/attack-surface/assets`);
    },
    async addAsset(data: { name: string; type: string; identifier: string }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/attack-surface/assets`, data);
    },
    async deleteAsset(id: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.delete<unknown>(`${baseUrl}/attack-surface/assets/${id}`);
    },
    async discover(domain: string, options?: { deep?: boolean }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/attack-surface/discover`, { domain, ...options });
    },
    async analyze(assetId?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/attack-surface/analyze`, { assetId });
    },
  },

  // ===========================================================================
  // AI GUARDRAILS / LLM SECURITY ROUTES
  // ===========================================================================
  aiGuardrails: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/ai-guardrails/dashboard`);
    },
    async scanPrompt(prompt: string, checkTypes?: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/ai-guardrails/scan`, { prompt, checkTypes });
    },
    async sanitize(input: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/ai-guardrails/sanitize`, { input });
    },
    async analyzeModel(modelId: string, prompts: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/ai-guardrails/analyze-model`, { modelId, prompts });
    },
    async getConfig() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/ai-guardrails/config`);
    },
    async updateConfig(config: Record<string, unknown>) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.put<unknown>(`${baseUrl}/ai-guardrails/config`, config);
    },
    async getAuditLog() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/ai-guardrails/audit-log`);
    },
  },

  // ===========================================================================
  // VULNERABILITY INTELLIGENCE ROUTES
  // ===========================================================================
  vulnIntel: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/vuln-intel/dashboard`);
    },
    async searchCVE(query: string, product?: string) {
      const baseUrl = env.apiBaseUrl;
      const params: string[] = [`query=${encodeURIComponent(query)}`];
      if (product) params.push(`product=${encodeURIComponent(product)}`);
      return apiClient.get<unknown>(`${baseUrl}/vuln-intel/search?${params.join('&')}`);
    },
    async getCVEDetails(cveId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/vuln-intel/cve/${cveId}`);
    },
    async getEPSS(cveIds: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/vuln-intel/epss?cveIds=${cveIds.join(',')}`);
    },
    async prioritize(projectId?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/vuln-intel/prioritize`, { projectId });
    },
    async getRemediation(cveId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/vuln-intel/remediation/${cveId}`);
    },
    async getTrending() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/vuln-intel/trending`);
    },
  },

  // ===========================================================================
  // DIGITAL TWIN ROUTES
  // ===========================================================================
  digitalTwin: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/digital-twin/dashboard`);
    },
    async getEnvironments() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/digital-twin/environments`);
    },
    async createEnvironment(data: { name: string; assets: unknown[]; connections?: unknown[] }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/digital-twin/environments`, data);
    },
    async getEnvironment(id: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/digital-twin/environments/${id}`);
    },
    async deleteEnvironment(id: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.delete<unknown>(`${baseUrl}/digital-twin/environments/${id}`);
    },
    async simulate(environmentId: string, attackType: string, targetAsset?: string, startingPoint?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/digital-twin/simulate`, { environmentId, attackType, targetAsset, startingPoint });
    },
    async getSimulation(id: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/digital-twin/simulations/${id}`);
    },
    async getSimulations(environmentId?: string) {
      const baseUrl = env.apiBaseUrl;
      const query = environmentId ? `?environmentId=${environmentId}` : '';
      return apiClient.get<unknown>(`${baseUrl}/digital-twin/simulations${query}`);
    },
    async analyzeAttackPath(environmentId: string, targetAsset: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/digital-twin/analyze-attack-path`, { environmentId, targetAsset });
    },
    async generateFromFindings(projectId?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/digital-twin/generate-from-findings`, { projectId });
    },
  },

  // ===========================================================================
  // QUANTUM CRYPTOGRAPHY ROUTES
  // ===========================================================================
  quantumCrypto: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/quantum-crypto/dashboard`);
    },
    async scan(target?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/quantum-crypto/scan`, { target });
    },
    async generateKeypair(algorithm: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/quantum-crypto/generate-keypair`, { algorithm });
    },
    async getMigrationPlan() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/quantum-crypto/migration-plan`, {});
    },
    async testResistance(algorithm: string, dataSize?: number) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/quantum-crypto/test-resistance`, { algorithm, dataSize });
    },
    async getAgilityScore() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/quantum-crypto/agility-score`);
    },
  },

  // ===========================================================================
  // SUPPLY CHAIN SECURITY ROUTES
  // ===========================================================================
  supplyChain: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/supply-chain/dashboard`);
    },
    async scan(packageName: string, version?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/supply-chain/scan`, { packageName, version });
    },
    async analyze(packages: Array<{ name: string; version: string }>) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/supply-chain/analyze`, { packages });
    },
    async verifyAttestation(packageName: string, attestationType?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/supply-chain/verify-attestation`, { packageName, attestationType });
    },
  },

  // ===========================================================================
  // BREACH SIMULATION ROUTES
  // ===========================================================================
  breachSim: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/breach-sim/dashboard`);
    },
    async getScenarios() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/breach-sim/scenarios`);
    },
    async runSimulation(scenarioId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/breach-sim/run`, { scenarioId });
    },
    async getResults(simulationId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/breach-sim/results/${simulationId}`);
    },
    async runCustom(description: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/breach-sim/custom`, { description });
    },
  },

  // ===========================================================================
  // SELF PROTECTION ROUTES
  // ===========================================================================
  selfProtection: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/self-protection/dashboard`);
    },
    async verifyIntegrity() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/self-protection/verify-integrity`, {});
    },
    async toggleLockdown(enabled: boolean) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/self-protection/lockdown`, { enabled });
    },
    async getThreats() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/self-protection/threats`);
    },
    async assess() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/self-protection/assess`, {});
    },
  },

  // ===========================================================================
  // DECEPTION TECHNOLOGY ROUTES
  // ===========================================================================
  deception: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/deception/dashboard`);
    },
    async getHoneypots() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/deception/honeypots`);
    },
    async interactHoneypot(honeypotId: string, action: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/deception/honeypots/${honeypotId}/interact`, { action });
    },
    async createDecoy(type: string, name: string, config?: Record<string, unknown>) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/deception/decoys`, { type, name, config });
    },
    async createBreadcrumbs(count: number, types?: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/deception/breadcrumbs`, { count, types });
    },
    async analyzeAttacker(attackerIP: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/deception/analyze-attacker`, { attackerIP });
    },
  },

  // ===========================================================================
  // REGULATORY INTELLIGENCE ROUTES
  // ===========================================================================
  regulatoryIntel: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/regulatory-intel/dashboard`);
    },
    async analyzeImpact(regulationId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/regulatory-intel/analyze-impact`, { regulationId });
    },
    async search(query: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/regulatory-intel/search?query=${encodeURIComponent(query)}`);
    },
  },

  // ===========================================================================
  // NATIONAL SECURITY ROUTES
  // ===========================================================================
  nationalSecurity: {
    async getDashboard() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/national-security/dashboard`);
    },
    async getThreatBriefing(region?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/national-security/threat-briefing`, { region });
    },
    async assessCriticalInfra(sector: string, assets: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/national-security/critical-infra/assess`, { sector, assets });
    },
  },

  // ===========================================================================
  // GENERIC SECURITY MODULES (powers all remaining 49+ modules)
  // ===========================================================================
  modules: {
    async getDashboard(module: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/modules/${module}/dashboard`);
    },
    async getItems(module: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/modules/${module}/items`);
    },
    async createItem(module: string, data: Record<string, unknown>) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/modules/${module}/items`, data);
    },
    async analyze(module: string, context?: string, question?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/modules/${module}/analyze`, { context, question });
    },
  },

  // ===========================================================================
  // SPECIALIZED MODULE ENDPOINTS
  // ===========================================================================
  darkWeb: {
    async scan(domains?: string[], emails?: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/dark-web/scan`, { domains, emails });
    },
  },

  phishingSim: {
    async getTemplates() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/phishing-sim/templates`);
    },
    async createCampaign(data: { name: string; template: string; targets: string[]; schedule?: string }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/phishing-sim/campaigns`, data);
    },
  },

  incidentResponse: {
    async executePlaybook(playbookType: string, incidentDetails?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/incident-response/playbooks/execute`, { playbookType, incidentDetails });
    },
  },

  securityMetrics: {
    async getKPIs() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/security-metrics/kpis`);
    },
  },

  zeroTrust: {
    async getPosture() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/zero-trust/posture`);
    },
  },

  containerSecurity: {
    async scan(image?: string, registry?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/container-security/scan`, { image, registry });
    },
  },

  cloudSecurity: {
    async getPosture() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/cloud-security/posture`);
    },
  },

  cicdSecurity: {
    async getPipelines() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<unknown>(`${baseUrl}/cicd-security/pipelines`);
    },
  },

  apiSecurity: {
    async scan(url?: string, openApiSpec?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/api-security/scan`, { url, openApiSpec });
    },
  },

  threatHunting: {
    async hunt(hypothesis: string, dataSource?: string, iocs?: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/threat-hunting/hunt`, { hypothesis, dataSource, iocs });
    },
  },

  vendorRisk: {
    async assess(vendorName: string, vendorDomain?: string, dataShared?: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/vendor-risk/assess`, { vendorName, vendorDomain, dataShared });
    },
  },

  forensics: {
    async analyze(caseDescription: string, evidenceType?: string, artifacts?: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/forensics/analyze`, { caseDescription, evidenceType, artifacts });
    },
  },

  threatModeling: {
    async create(applicationName: string, description?: string, components?: string[], dataFlows?: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/threat-modeling/create`, { applicationName, description, components, dataFlows });
    },
  },

  aiChat: {
    async sendMessage(message: string, conversationId?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<unknown>(`${baseUrl}/ai-chat/message`, { message, conversationId });
    },
  },

  // Customer Protection Badge System
  badges: {
    async create(type?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{
        success: boolean;
        badge: {
          id: string;
          type: string;
          status: string;
          createdAt: string;
          expiresAt: string;
          verificationUrl: string;
          imageUrl: string;
          embedCode: string;
        };
      }>(`${baseUrl}/badges`, { type });
    },

    async list() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        badges: Array<{
          id: string;
          type: string;
          status: string;
          createdAt: string;
          expiresAt: string;
          verificationCount: number;
          lastVerified: string;
        }>;
      }>(`${baseUrl}/badges`);
    },

    async verify(badgeId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        verified: boolean;
        badge: {
          id: string;
          type: string;
          status: string;
          organization: string;
          protectedSince: string;
          validUntil: string;
          verificationSignature: string;
        };
      }>(`${baseUrl}/badges/verify/${badgeId}`);
    },

    async update(badgeId: string, updates: { status?: string; securityScore?: number; complianceFrameworks?: string[] }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.patch<{ success: boolean }>(`${baseUrl}/badges/${badgeId}`, updates);
    },

    async revoke(badgeId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.delete<{ success: boolean }>(`${baseUrl}/badges/${badgeId}`);
    },

    async getStats() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        stats: {
          total: number;
          active: number;
          suspended: number;
          expired: number;
          revoked: number;
          totalVerifications: number;
        };
      }>(`${baseUrl}/badges/stats`);
    },

    getImageUrl(badgeId: string, size?: 'small' | 'medium' | 'large') {
      const baseUrl = env.apiBaseUrl;
      return `${baseUrl}/badges/${badgeId}/image${size ? `?size=${size}` : ''}`;
    },

    getVerificationUrl(badgeId: string) {
      const baseUrl = env.apiBaseUrl;
      return `${baseUrl}/badges/verify/${badgeId}`;
    },
  },

  // AI Self-Evolution Engine
  aiEvolution: {
    async getStatus() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        status: {
          lastUpdate: string;
          threatsProcessed: number;
          rulesGenerated: number;
          updatesApplied: number;
          nextScheduledUpdate: string;
          aiAnalysisCount: number;
          competitiveScore: number;
        };
        feeds: Array<{ id: string; name: string; type: string; status: string }>;
        stats: {
          totalThreats: number;
          activeRules: number;
          autoGeneratedRules: number;
        };
      }>(`${baseUrl}/ai-evolution/status`);
    },

    async triggerEvolution(aggressive: boolean = false) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{
        success: boolean;
        results: { newThreats: number; newRules: number; updates: string[]; sources: string[] };
      }>(`${baseUrl}/ai-evolution/trigger`, { aggressive });
    },

    async bootstrap() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{
        success: boolean;
        message: string;
        results: {
          phase1_feeds: { threats: number; sources: string[] };
          phase2_rules: { generated: number };
          phase3_landscape: { completed: boolean };
          totalTime: number;
        };
        engineState: {
          totalThreats: number;
          totalRules: number;
          activeSources: number;
          evolutionInterval: string;
          nextCycle: string;
        };
      }>(`${baseUrl}/ai-evolution/bootstrap`, {});
    },

    async getThreats(params?: { severity?: string; type?: string; limit?: number }) {
      const baseUrl = env.apiBaseUrl;
      const query = new URLSearchParams();
      if (params?.severity) query.set('severity', params.severity);
      if (params?.type) query.set('type', params.type);
      if (params?.limit) query.set('limit', params.limit.toString());
      return apiClient.get<{
        total: number;
        threats: Array<{
          id: string;
          source: string;
          type: string;
          severity: string;
          title: string;
          description: string;
          timestamp: string;
          processed: boolean;
          aiAnalysis?: string;
        }>;
      }>(`${baseUrl}/ai-evolution/threats?${query}`);
    },

    async getRules() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        total: number;
        autoGenerated: number;
        enabled: number;
        rules: Array<{
          id: string;
          name: string;
          type: string;
          pattern: string;
          severity: string;
          enabled: boolean;
          autoGenerated: boolean;
          createdAt: string;
          effectiveness: number;
        }>;
      }>(`${baseUrl}/ai-evolution/rules`);
    },

    async toggleRule(ruleId: string, enabled: boolean) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.patch<{ success: boolean }>(`${baseUrl}/ai-evolution/rules/${ruleId}`, { enabled });
    },

    async analyze(params: { topic?: string; threatId?: string; customQuery?: string }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{ analysis: string }>(`${baseUrl}/ai-evolution/analyze`, params);
    },

    async generateModule(requirement: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{
        success: boolean;
        module: {
          moduleName: string;
          description: string;
          pseudoCode: string;
          integrationPoints: string[];
        };
      }>(`${baseUrl}/ai-evolution/generate-module`, { requirement });
    },

    async getCompetitiveAnalysis() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        analysisDate: string;
        emergingThreats: string[];
        competitorFeatures: string[];
        recommendedUpdates: string[];
        anchorAdvantages: string[];
        competitiveScore: number;
      }>(`${baseUrl}/ai-evolution/competitive-analysis`);
    },

    async getEvolutionLog(limit?: number) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        total: number;
        log: Array<{
          timestamp: string;
          action: string;
          details: string;
          aiGenerated: boolean;
        }>;
      }>(`${baseUrl}/ai-evolution/log${limit ? `?limit=${limit}` : ''}`);
    },

    async getFeeds() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        feeds: Array<{
          id: string;
          name: string;
          url: string;
          type: string;
          updateFrequency: number;
          status: string;
        }>;
        totalFeeds: number;
        activeFeeds: number;
      }>(`${baseUrl}/ai-evolution/feeds`);
    },

    async addFeed(feed: { name: string; url: string; type: string; updateFrequency?: number }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{ success: boolean; feed: unknown }>(`${baseUrl}/ai-evolution/feeds`, feed);
    },

    async predictThreats(params: { industry?: string; assets?: string[]; timeframe?: string }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{
        predictions: Array<{
          threat: string;
          likelihood: string;
          timeframe: string;
          mitigation: string;
        }>;
        recommendedActions: string[];
        riskScore: number;
        confidence: number;
      }>(`${baseUrl}/ai-evolution/predict`, params);
    },

    async scan() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{
        success: boolean;
        message: string;
        results: {
          newThreats: number;
          newRules: number;
          updates: string[];
          sources: string[];
          duration: number;
          timestamp: string;
        };
      }>(`${baseUrl}/ai-evolution/scan`, {});
    },

    async repair(mode: 'soft' | 'hard' = 'soft') {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{
        success: boolean;
        message: string;
        itemsRepaired?: number;
        before?: { threats: number; rules: number; updates: number };
        after?: { threats: number; rules: number; updates: number };
        reseedResults?: { newThreats: number; newRules: number };
        currentStats?: { threats: number; rules: number; updates: number; activeFeeds: number };
      }>(`${baseUrl}/ai-evolution/repair`, { mode });
    },

    async getMetrics() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        threats: Array<{ timestamp: number; value: number }>;
        rules: Array<{ timestamp: number; value: number }>;
        analyses: Array<{ timestamp: number; value: number }>;
        competitiveScore: Array<{ timestamp: number; value: number }>;
        currentTotals: {
          threats: number;
          rules: number;
          analyses: number;
          score: number;
        };
      }>(`${baseUrl}/ai-evolution/metrics`);
    },
  },

  // Endpoint Detection & Response (EDR) - PC, Mac, Linux, Mobile protection
  endpointProtection: {
    // Device management
    async registerDevice(data: {
      hostname: string;
      platform: string;
      osVersion: string;
      agentVersion: string;
      ipAddress: string;
      macAddress: string;
      serialNumber?: string;
      hardware?: Record<string, string>;
      userEmail?: string;
    }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{
        success: boolean;
        device: unknown;
        agentConfig: {
          heartbeatInterval: number;
          eventReportingInterval: number;
          scanSchedule: string;
          protectionLevel: string;
          cloudLookupEnabled: boolean;
        };
      }>(`${baseUrl}/endpoint/devices/register`, data);
    },

    async getDevices(params?: { status?: string; platform?: string }) {
      const baseUrl = env.apiBaseUrl;
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.platform) query.append('platform', params.platform);
      return apiClient.get<{
        devices: Array<{
          id: string;
          hostname: string;
          platform: string;
          osVersion: string;
          status: string;
          lastSeen: string;
          riskScore: number;
          complianceStatus: string;
          protectionStatus: {
            realTimeProtection: boolean;
            firewallEnabled: boolean;
            encryptionEnabled: boolean;
            antivirusUpdated: boolean;
            osPatched: boolean;
          };
        }>;
        stats: {
          total: number;
          online: number;
          offline: number;
          compromised: number;
          isolated: number;
          compliant: number;
          avgRiskScore: number;
          byPlatform: Record<string, number>;
        };
      }>(`${baseUrl}/endpoint/devices${query.toString() ? `?${query}` : ''}`);
    },

    async getDevice(deviceId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        device: unknown;
        recentEvents: unknown[];
        threats: unknown[];
        timeline: unknown[];
      }>(`${baseUrl}/endpoint/devices/${deviceId}`);
    },

    async isolateDevice(deviceId: string, reason?: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{ success: boolean; message: string; device: unknown }>(
        `${baseUrl}/endpoint/devices/${deviceId}/isolate`,
        { reason }
      );
    },

    async restoreDevice(deviceId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{ success: boolean; message: string; device: unknown }>(
        `${baseUrl}/endpoint/devices/${deviceId}/restore`,
        {}
      );
    },

    async scanDevice(deviceId: string, scanType?: 'quick' | 'full' | 'custom', targets?: string[]) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{
        success: boolean;
        scanId: string;
        message: string;
        estimatedDuration: string;
      }>(`${baseUrl}/endpoint/devices/${deviceId}/scan`, { scanType, targets });
    },

    // Threat management
    async reportThreat(data: {
      endpointId: string;
      threatType: string;
      threatName: string;
      severity: string;
      filePath?: string;
      fileHash?: string;
      processName?: string;
      iocIndicators?: string[];
    }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{
        success: boolean;
        threat: unknown;
        aiAnalysis: unknown;
        actionTaken: string;
      }>(`${baseUrl}/endpoint/threats/report`, data);
    },

    async getThreats(params?: { severity?: string; status?: string; days?: string }) {
      const baseUrl = env.apiBaseUrl;
      const query = new URLSearchParams();
      if (params?.severity) query.append('severity', params.severity);
      if (params?.status) query.append('status', params.status);
      if (params?.days) query.append('days', params.days);
      return apiClient.get<{
        threats: Array<{
          id: string;
          endpointId: string;
          detectedAt: string;
          threatType: string;
          threatName: string;
          severity: string;
          status: string;
          actionTaken: string;
          mitreTactic?: string;
          mitreTechnique?: string;
        }>;
        stats: {
          total: number;
          critical: number;
          high: number;
          medium: number;
          low: number;
          quarantined: number;
          blocked: number;
          byType: Record<string, number>;
        };
      }>(`${baseUrl}/endpoint/threats${query.toString() ? `?${query}` : ''}`);
    },

    // Policy management
    async createPolicy(data: {
      name: string;
      description: string;
      type: string;
      targetPlatforms: string[];
      targetGroups?: string[];
      settings: Record<string, unknown>;
    }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{ success: boolean; policy: unknown }>(`${baseUrl}/endpoint/policies`, data);
    },

    async getPolicies() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{ policies: unknown[] }>(`${baseUrl}/endpoint/policies`);
    },

    async updatePolicy(policyId: string, data: { enabled?: boolean; settings?: Record<string, unknown> }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.patch<{ success: boolean; policy: unknown }>(`${baseUrl}/endpoint/policies/${policyId}`, data);
    },

    // Quarantine management
    async getQuarantine() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        files: Array<{
          id: string;
          endpointId: string;
          originalPath: string;
          fileName: string;
          fileHash: string;
          threatName: string;
          quarantinedAt: string;
          status: string;
        }>;
        stats: {
          total: number;
          quarantined: number;
          restored: number;
          deleted: number;
        };
      }>(`${baseUrl}/endpoint/quarantine`);
    },

    async deleteQuarantinedFile(fileId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.delete<{ success: boolean; message: string }>(`${baseUrl}/endpoint/quarantine/${fileId}`);
    },

    // Events & telemetry
    async reportEvents(endpointId: string, events: Array<{
      type: string;
      description: string;
      severity: string;
      details: Record<string, unknown>;
    }>) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{ success: boolean; processed: number }>(`${baseUrl}/endpoint/events`, { endpointId, events });
    },

    async getEvents(params?: { endpointId?: string; type?: string; limit?: string }) {
      const baseUrl = env.apiBaseUrl;
      const query = new URLSearchParams();
      if (params?.endpointId) query.append('endpointId', params.endpointId);
      if (params?.type) query.append('type', params.type);
      if (params?.limit) query.append('limit', params.limit);
      return apiClient.get<{ events: unknown[] }>(`${baseUrl}/endpoint/events${query.toString() ? `?${query}` : ''}`);
    },

    // Dashboard stats
    async getStats() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        devices: {
          total: number;
          online: number;
          offline: number;
          compromised: number;
          isolated: number;
          compliant: number;
          avgRiskScore: number;
        };
        threats: {
          total: number;
          last24h: number;
          critical: number;
          active: number;
          blocked: number;
          quarantined: number;
        };
        events: {
          total: number;
          last24h: number;
          byType: Record<string, number>;
        };
        policies: {
          total: number;
          enabled: number;
        };
        protectionScore: number;
      }>(`${baseUrl}/endpoint/stats`);
    },
  },

  // ==========================================
  // ANCHOR INTELLIGENCE — B2B AI-AS-A-SERVICE
  // ==========================================
  anchorIntelligence: {
    // Get B2B pricing plans
    async getPlans() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{ plans: Array<{
        tier: string;
        name: string;
        monthlyPrice: number;
        monthlyPriceFormatted: string;
        yearlyPrice: number;
        yearlyPriceFormatted: string;
        rateLimit: string;
        monthlyQuota: string;
        permissions: string[];
        description: string;
      }> }>(`${baseUrl}/intelligence/plans`);
    },

    // Create API key
    async createKey(data: { name: string; plan: string; ipWhitelist?: string[] }) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.post<{ success: boolean; apiKey: {
        id: string; key: string; name: string; plan: string;
        rateLimit: number; monthlyQuota: number; permissions: string[];
      }; warning: string }>(`${baseUrl}/intelligence/keys`, data);
    },

    // List API keys
    async getKeys() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{ keys: Array<{
        id: string; keyPreview: string; name: string; plan: string;
        enabled: boolean; rateLimit: number; monthlyQuota: number;
        monthlyUsed: number; lastUsed: string; createdAt: string;
      }> }>(`${baseUrl}/intelligence/keys`);
    },

    // Revoke API key
    async revokeKey(keyId: string) {
      const baseUrl = env.apiBaseUrl;
      return apiClient.delete<{ success: boolean }>(`${baseUrl}/intelligence/keys/${keyId}`);
    },

    // Get usage statistics
    async getUsage() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get<{
        summary: {
          totalRequests: number;
          totalQuota: number | string;
          activeKeys: number;
          totalKeys: number;
        };
        byKey: Array<{
          keyId: string; name: string; plan: string;
          used: number; quota: number; percentage: number; lastUsed: string;
        }>;
        dailyUsage: Record<string, number>;
      }>(`${baseUrl}/intelligence/usage`);
    },

    // ---- B2B API (API Key authenticated) ----

    // Get threats feed
    async getThreats(apiKey: string, params?: { severity?: string; type?: string; limit?: number }) {
      const baseUrl = env.apiBaseUrl;
      const query = new URLSearchParams();
      if (params?.severity) query.set('severity', params.severity);
      if (params?.type) query.set('type', params.type);
      if (params?.limit) query.set('limit', String(params.limit));
      const url = `${baseUrl}/intelligence/v1/threats${query.toString() ? '?' + query.toString() : ''}`;
      const res = await fetch(url, { headers: { 'x-api-key': apiKey } });
      return res.json();
    },

    // Generate detection rule
    async generateRule(apiKey: string, data: { threat: string; format: string; context?: string; severity?: string }) {
      const baseUrl = env.apiBaseUrl;
      const res = await fetch(`${baseUrl}/intelligence/v1/rules/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(data)
      });
      return res.json();
    },

    // Analyze threat
    async analyze(apiKey: string, data: { type: string; data: string; context?: string }) {
      const baseUrl = env.apiBaseUrl;
      const res = await fetch(`${baseUrl}/intelligence/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(data)
      });
      return res.json();
    },

    // Predict threats
    async predict(apiKey: string, data: { industry?: string; technologies?: string[]; timeframe?: string }) {
      const baseUrl = env.apiBaseUrl;
      const res = await fetch(`${baseUrl}/intelligence/v1/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(data)
      });
      return res.json();
    },

    // Competitive intelligence
    async competitive(apiKey: string, data: { competitors?: string[]; focus?: string }) {
      const baseUrl = env.apiBaseUrl;
      const res = await fetch(`${baseUrl}/intelligence/v1/competitive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(data)
      });
      return res.json();
    },

    // IOC enrichment
    async enrich(apiKey: string, data: { type: string; value: string }) {
      const baseUrl = env.apiBaseUrl;
      const res = await fetch(`${baseUrl}/intelligence/v1/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(data)
      });
      return res.json();
    },

    // Get API docs
    async getDocs() {
      const baseUrl = env.apiBaseUrl;
      return apiClient.get(`${baseUrl}/intelligence/v1/docs`);
    },
  },
};
