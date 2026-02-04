// AI Module Exports - World First Features
export { AIRemediationEngine, QUICK_FIXES } from './remediation';
export type { RemediationContext, RemediationResult, PRContent } from './remediation';

export { NaturalLanguageQuery, EXAMPLE_QUERIES } from './nlq';
export type { QueryResult, QueryContext } from './nlq';

export { DeveloperSecurityScore } from './developer-score';
export type { DeveloperScore, DeveloperActivity, Badge, ScoreHistory } from './developer-score';

export { AttackPathAnalyzer } from './attack-path';
export type { AttackGraph, AttackPath, AttackNode, AttackEdge } from './attack-path';

export { PredictiveVulnerabilityAI } from './predictive';
export type { PredictedVulnerability, PredictionContext } from './predictive';
