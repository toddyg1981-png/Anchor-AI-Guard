import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useCallback } from 'react';

// Map DashboardView values to URL paths
const VIEW_TO_PATH: Record<string, string> = {
  'overview': '/dashboard',
  'ai-chat': '/dashboard/ai-chat',
  'ai-analysis': '/dashboard/ai-analysis',
  'ai-dashboard': '/dashboard/ai-dashboard',
  'ai-evolution': '/dashboard/ai-evolution',
  'ai-help-desk': '/dashboard/ai-help-desk',
  'ai-llm-security': '/dashboard/ai-llm-security',
  'ai-runtime-security': '/dashboard/ai-runtime-security',
  'ai-security-guard': '/dashboard/ai-security-guard',
  'attack-surface': '/dashboard/attack-surface',
  'attack-path': '/dashboard/attack-path',
  'active-defense': '/dashboard/active-defense',
  'anti-tampering': '/dashboard/anti-tampering',
  'api-security': '/dashboard/api-security',
  'architecture-drift': '/dashboard/architecture-drift',
  'asset-inventory': '/dashboard/asset-inventory',
  'autonomous-red-team': '/dashboard/autonomous-red-team',
  'autonomous-soc': '/dashboard/autonomous-soc',
  'backup-disaster-recovery': '/dashboard/backup-disaster-recovery',
  'billing': '/dashboard/billing',
  'breach-simulator': '/dashboard/breach-simulator',
  'browser-isolation': '/dashboard/browser-isolation',
  'cicd-security': '/dashboard/cicd-security',
  'cloud-security': '/dashboard/cloud-security',
  'collaboration': '/dashboard/collaboration',
  'compliance': '/dashboard/compliance',
  'container-security': '/dashboard/container-security',
  'critical-infrastructure': '/dashboard/critical-infrastructure',
  'cryptography': '/dashboard/cryptography',
  'cyber-insurance': '/dashboard/cyber-insurance',
  'dark-web': '/dashboard/dark-web',
  'data-loss-prevention': '/dashboard/data-loss-prevention',
  'data-trust': '/dashboard/data-trust',
  'deception': '/dashboard/deception',
  'digital-twin': '/dashboard/digital-twin',
  'edr': '/dashboard/edr',
  'email-security': '/dashboard/email-security',
  'endpoint': '/dashboard/endpoint',
  'executive': '/dashboard/executive',
  'findings': '/dashboard/findings',
  'firmware-security': '/dashboard/firmware-security',
  'forensics': '/dashboard/forensics',
  'forensics-lab': '/dashboard/forensics-lab',
  'identity-governance': '/dashboard/identity-governance',
  'incident-response': '/dashboard/incident-response',
  'intelligence': '/dashboard/intelligence',
  'iot-security': '/dashboard/iot-security',
  'knowledge-base': '/dashboard/knowledge-base',
  'microsegmentation': '/dashboard/microsegmentation',
  'national-telemetry': '/dashboard/national-telemetry',
  'network-security': '/dashboard/network-security',
  'pen-test': '/dashboard/pen-test',
  'privacy-management': '/dashboard/privacy-management',
  'quantum-computing': '/dashboard/quantum-computing',
  'regulatory-intel': '/dashboard/regulatory-intel',
  'risk-quantification': '/dashboard/risk-quantification',
  'sbom': '/dashboard/sbom',
  'security-awareness': '/dashboard/security-awareness',
  'security-mesh': '/dashboard/security-mesh',
  'security-ratings': '/dashboard/security-ratings',
  'settings': '/dashboard/settings',
  'admin': '/dashboard/admin',
  'supply-chain': '/dashboard/supply-chain',
  'third-party': '/dashboard/third-party',
  'threat-hunting': '/dashboard/threat-hunting',
  'threat-intel': '/dashboard/threat-intel',
  'vendor-risk': '/dashboard/vendor-risk',
  'vulnerability-intel': '/dashboard/vulnerability-intel',
  'zero-trust': '/dashboard/zero-trust',
};

// Reverse mapping
const PATH_TO_VIEW: Record<string, string> = {};
Object.entries(VIEW_TO_PATH).forEach(([view, path]) => {
  PATH_TO_VIEW[path] = view;
});

export function useAppRouter(
  currentView: string,
  setCurrentView: (view: string) => void
) {
  const navigate = useNavigate();
  const location = useLocation();

  // Sync URL → state on mount and URL changes
  useEffect(() => {
    const view = PATH_TO_VIEW[location.pathname];
    if (view && view !== currentView) {
      setCurrentView(view);
    }
  }, [location.pathname]);

  // Sync state → URL when view changes
  const navigateToView = useCallback((view: string) => {
    setCurrentView(view);
    const path = VIEW_TO_PATH[view] || `/dashboard/${view}`;
    navigate(path, { replace: false });
  }, [navigate, setCurrentView]);

  return { navigateToView };
}

export { VIEW_TO_PATH, PATH_TO_VIEW };
