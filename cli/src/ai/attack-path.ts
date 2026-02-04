/**
 * Attack Path Visualization - WORLD FIRST
 * Visual graph showing how vulnerabilities chain together
 */

import { Finding, Severity } from '../types';

export interface AttackNode {
  id: string;
  type: 'entry' | 'vulnerability' | 'asset' | 'impact';
  label: string;
  finding?: Finding;
  severity?: Severity;
  description: string;
  x?: number;
  y?: number;
}

export interface AttackEdge {
  source: string;
  target: string;
  label: string;
  exploitDifficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

export interface AttackPath {
  nodes: AttackNode[];
  edges: AttackEdge[];
  totalRisk: number;
  description: string;
  mitigations: string[];
}

export interface AttackGraph {
  paths: AttackPath[];
  criticalPath: AttackPath | null;
  summary: {
    totalPaths: number;
    criticalPaths: number;
    entryPoints: number;
    highValueAssets: number;
  };
}

// Vulnerability chain rules - which vulns can lead to others
const CHAIN_RULES: Array<{
  from: string[];
  to: string[];
  label: string;
  difficulty: 'easy' | 'medium' | 'hard';
}> = [
  // SQL Injection chains
  {
    from: ['sql-injection', 'sql-injection-python'],
    to: ['database-access'],
    label: 'Extract data',
    difficulty: 'easy',
  },
  {
    from: ['database-access'],
    to: ['credential-theft'],
    label: 'Steal credentials',
    difficulty: 'medium',
  },
  {
    from: ['credential-theft'],
    to: ['account-takeover'],
    label: 'Login as user',
    difficulty: 'easy',
  },
  
  // XSS chains
  {
    from: ['xss-innerhtml', 'xss-document-write', 'xss-dangerously-set'],
    to: ['session-hijack'],
    label: 'Steal session',
    difficulty: 'easy',
  },
  {
    from: ['session-hijack'],
    to: ['account-takeover'],
    label: 'Impersonate user',
    difficulty: 'easy',
  },
  
  // Command Injection chains
  {
    from: ['command-injection', 'command-injection-python'],
    to: ['server-access'],
    label: 'Execute commands',
    difficulty: 'easy',
  },
  {
    from: ['server-access'],
    to: ['lateral-movement'],
    label: 'Access other systems',
    difficulty: 'medium',
  },
  
  // Secret exposure chains
  {
    from: ['aws-access-key', 'gcp-api-key', 'azure-storage-key', 'database-url'],
    to: ['cloud-access'],
    label: 'Access cloud resources',
    difficulty: 'easy',
  },
  {
    from: ['cloud-access'],
    to: ['data-exfiltration'],
    label: 'Download data',
    difficulty: 'easy',
  },
  
  // Path traversal chains
  {
    from: ['path-traversal'],
    to: ['config-access'],
    label: 'Read config files',
    difficulty: 'medium',
  },
  {
    from: ['config-access'],
    to: ['credential-theft'],
    label: 'Extract secrets',
    difficulty: 'easy',
  },
  
  // SSRF chains
  {
    from: ['ssrf-potential'],
    to: ['internal-network'],
    label: 'Access internal services',
    difficulty: 'medium',
  },
  {
    from: ['internal-network'],
    to: ['cloud-metadata'],
    label: 'Access metadata API',
    difficulty: 'medium',
  },
  {
    from: ['cloud-metadata'],
    to: ['cloud-access'],
    label: 'Get IAM credentials',
    difficulty: 'easy',
  },
  
  // Auth bypass chains
  {
    from: ['jwt-none-algorithm'],
    to: ['auth-bypass'],
    label: 'Forge tokens',
    difficulty: 'easy',
  },
  {
    from: ['auth-bypass'],
    to: ['account-takeover'],
    label: 'Access any account',
    difficulty: 'easy',
  },
];

// High-value targets (impacts)
const IMPACTS = [
  { id: 'data-exfiltration', label: '💾 Data Exfiltration', severity: 'critical' },
  { id: 'account-takeover', label: '👤 Account Takeover', severity: 'critical' },
  { id: 'server-access', label: '🖥️ Server Compromise', severity: 'critical' },
  { id: 'lateral-movement', label: '🔀 Lateral Movement', severity: 'critical' },
  { id: 'ransomware', label: '🔐 Ransomware', severity: 'critical' },
];

export class AttackPathAnalyzer {
  /**
   * Analyze findings and generate attack paths
   */
  analyze(findings: Finding[]): AttackGraph {
    // Group findings by entry point potential
    const entryPoints = this.identifyEntryPoints(findings);
    
    // Build attack paths from each entry point
    const paths: AttackPath[] = [];
    
    for (const entry of entryPoints) {
      const reachablePaths = this.buildPaths(entry, findings);
      paths.push(...reachablePaths);
    }

    // Sort by risk and find critical path
    paths.sort((a, b) => b.totalRisk - a.totalRisk);
    const criticalPath = paths.length > 0 ? paths[0] : null;

    return {
      paths,
      criticalPath,
      summary: {
        totalPaths: paths.length,
        criticalPaths: paths.filter(p => p.totalRisk >= 80).length,
        entryPoints: entryPoints.length,
        highValueAssets: IMPACTS.length,
      },
    };
  }

  /**
   * Identify potential entry points
   */
  private identifyEntryPoints(findings: Finding[]): Finding[] {
    // Entry points are findings that can initiate an attack
    const entryPointRules = [
      'sql-injection',
      'xss-innerhtml',
      'xss-document-write',
      'command-injection',
      'path-traversal',
      'ssrf-potential',
      'jwt-none-algorithm',
      'aws-access-key',
      'github-token',
      'database-url',
    ];

    return findings.filter(f => 
      entryPointRules.some(rule => f.rule.includes(rule))
    );
  }

  /**
   * Build attack paths from an entry point
   */
  private buildPaths(entry: Finding, allFindings: Finding[]): AttackPath[] {
    const paths: AttackPath[] = [];
    
    // DFS to find all paths to impact nodes
    const visited = new Set<string>();
    const currentPath: AttackNode[] = [];
    const currentEdges: AttackEdge[] = [];

    const entryNode: AttackNode = {
      id: `entry-${entry.id}`,
      type: 'entry',
      label: `🚪 ${entry.rule}`,
      finding: entry,
      severity: entry.severity,
      description: entry.message,
    };

    this.dfs(
      entryNode,
      allFindings,
      visited,
      currentPath,
      currentEdges,
      paths
    );

    return paths;
  }

  private dfs(
    node: AttackNode,
    allFindings: Finding[],
    visited: Set<string>,
    currentPath: AttackNode[],
    currentEdges: AttackEdge[],
    results: AttackPath[]
  ): void {
    visited.add(node.id);
    currentPath.push(node);

    // Check if we've reached an impact node
    if (node.type === 'impact') {
      results.push({
        nodes: [...currentPath],
        edges: [...currentEdges],
        totalRisk: this.calculatePathRisk(currentPath, currentEdges),
        description: this.describeAttackPath(currentPath),
        mitigations: this.suggestMitigations(currentPath),
      });
      
      currentPath.pop();
      visited.delete(node.id);
      return;
    }

    // Find next possible nodes
    const nextSteps = this.findNextSteps(node, allFindings);

    for (const next of nextSteps) {
      if (!visited.has(next.node.id)) {
        currentEdges.push(next.edge);
        this.dfs(next.node, allFindings, visited, currentPath, currentEdges, results);
        currentEdges.pop();
      }
    }

    currentPath.pop();
    visited.delete(node.id);
  }

  private findNextSteps(
    current: AttackNode,
    _allFindings: Finding[]
  ): Array<{ node: AttackNode; edge: AttackEdge }> {
    const steps: Array<{ node: AttackNode; edge: AttackEdge }> = [];
    
    // Find applicable chain rules
    for (const rule of CHAIN_RULES) {
      const currentRule = current.finding?.rule || current.id;
      
      if (rule.from.some(r => currentRule.includes(r))) {
        for (const targetId of rule.to) {
          // Check if target is an impact or another finding
          const impact = IMPACTS.find(i => i.id === targetId);
          
          if (impact) {
            steps.push({
              node: {
                id: `impact-${impact.id}`,
                type: 'impact',
                label: impact.label,
                severity: impact.severity as Severity,
                description: `Critical impact: ${impact.label}`,
              },
              edge: {
                source: current.id,
                target: `impact-${impact.id}`,
                label: rule.label,
                exploitDifficulty: rule.difficulty,
                description: `${rule.label} (${rule.difficulty})`,
              },
            });
          } else {
            // Create intermediate node
            steps.push({
              node: {
                id: `step-${targetId}`,
                type: 'vulnerability',
                label: targetId,
                description: `Intermediate step: ${targetId}`,
              },
              edge: {
                source: current.id,
                target: `step-${targetId}`,
                label: rule.label,
                exploitDifficulty: rule.difficulty,
                description: rule.label,
              },
            });
          }
        }
      }
    }

    return steps;
  }

  private calculatePathRisk(nodes: AttackNode[], edges: AttackEdge[]): number {
    let risk = 0;
    
    // Base risk from node severities
    for (const node of nodes) {
      const severityRisk: Record<Severity, number> = {
        critical: 25,
        high: 20,
        medium: 10,
        low: 5,
        info: 1,
      };
      risk += severityRisk[node.severity || 'medium'];
    }

    // Adjust for exploit difficulty
    for (const edge of edges) {
      const difficultyMultiplier = {
        easy: 1.2,
        medium: 1.0,
        hard: 0.7,
      };
      risk *= difficultyMultiplier[edge.exploitDifficulty];
    }

    // Impact multiplier
    const hasDataExfil = nodes.some(n => n.id.includes('data-exfiltration'));
    const hasAccountTakeover = nodes.some(n => n.id.includes('account-takeover'));
    const hasServerCompromise = nodes.some(n => n.id.includes('server-access'));
    
    if (hasDataExfil) risk *= 1.5;
    if (hasAccountTakeover) risk *= 1.3;
    if (hasServerCompromise) risk *= 1.4;

    return Math.min(100, Math.round(risk));
  }

  private describeAttackPath(nodes: AttackNode[]): string {
    if (nodes.length < 2) return 'Single vulnerability';
    
    const entry = nodes[0];
    const impact = nodes[nodes.length - 1];
    
    return `An attacker exploiting ${entry.label} could eventually achieve ${impact.label} through a ${nodes.length - 1}-step attack chain.`;
  }

  private suggestMitigations(nodes: AttackNode[]): string[] {
    const mitigations: string[] = [];
    
    for (const node of nodes) {
      if (node.finding?.fix) {
        mitigations.push(node.finding.fix);
      }
    }

    // Add generic mitigations
    mitigations.push('Implement defense in depth with multiple security layers');
    mitigations.push('Monitor for suspicious activity patterns');
    
    return [...new Set(mitigations)].slice(0, 5);
  }

  /**
   * Generate visualization data for rendering
   */
  generateVisualization(graph: AttackGraph): {
    mermaid: string;
    d3Data: { nodes: any[]; links: any[] };
  } {
    // Generate Mermaid diagram
    let mermaid = 'graph TD\n';
    
    if (graph.criticalPath) {
      const path = graph.criticalPath;
      
      for (const node of path.nodes) {
        const style = node.type === 'entry' ? '([' : 
                      node.type === 'impact' ? '{{' : '[';
        const endStyle = node.type === 'entry' ? '])' :
                         node.type === 'impact' ? '}}' : ']';
        mermaid += `    ${node.id}${style}${node.label}${endStyle}\n`;
      }
      
      for (const edge of path.edges) {
        const arrow = edge.exploitDifficulty === 'easy' ? '==>' :
                      edge.exploitDifficulty === 'medium' ? '-->' : '-.->';
        mermaid += `    ${edge.source} ${arrow}|${edge.label}| ${edge.target}\n`;
      }
    }

    // Generate D3 compatible data
    const d3Nodes = graph.paths.flatMap(p => p.nodes).map(n => ({
      id: n.id,
      label: n.label,
      type: n.type,
      severity: n.severity,
    }));

    const d3Links = graph.paths.flatMap(p => p.edges).map(e => ({
      source: e.source,
      target: e.target,
      label: e.label,
    }));

    return {
      mermaid,
      d3Data: {
        nodes: [...new Map(d3Nodes.map(n => [n.id, n])).values()],
        links: d3Links,
      },
    };
  }
}
