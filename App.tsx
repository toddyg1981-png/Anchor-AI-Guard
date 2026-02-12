import React, { useState, useCallback, useEffect, Suspense } from 'react';
import MarketingLanding from './components/MarketingLanding';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './components/DashboardOverview';
import { Project, Finding } from './types';
import { useBackendData } from './hooks/useBackendData';
import { useAuth } from './hooks/useAuth';
import { useWebSocket } from './hooks/useWebSocket';
import LoginSuccessOverlay from './components/LoginSuccessOverlay';
import { env } from './config/env';
import { FeatureGate } from './components/FeatureGate';

// Lazy-loaded views (only loaded when navigated to)
const AuthScreen = React.lazy(() => import('./components/AuthScreen'));
const ForgotPasswordScreen = React.lazy(() => import('./components/ForgotPasswordScreen'));
const ResetPasswordScreen = React.lazy(() => import('./components/ResetPasswordScreen'));
const AuthCallback = React.lazy(() => import('./components/AuthCallback'));
const OnboardingWizard = React.lazy(() => import('./components/OnboardingWizard'));
const PricingPage = React.lazy(() => import('./components/PricingPage').then(m => ({ default: m.PricingPage })));
const PrivacyPolicy = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.TermsOfService })));
const SecurityPage = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.SecurityPage })));
const AboutPage = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.AboutPage })));
const ContactPage = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.ContactPage })));
const PurchaseTerms = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.PurchaseTerms })));
const CookiePolicy = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.CookiePolicy })));
const AcceptableUsePolicy = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.AcceptableUsePolicy })));
const DataProcessingAgreement = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.DataProcessingAgreement })));
const DisclaimerPage = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.Disclaimer })));
const ResponsibleDisclosure = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.ResponsibleDisclosure })));
const ServiceLevelAgreement = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.ServiceLevelAgreement })));
const EndUserLicenceAgreement = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.EndUserLicenceAgreement })));
const SovereignDataResidencyPolicy = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.SovereignDataResidencyPolicy })));
const WhistleblowerPolicy = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.WhistleblowerPolicy })));
const IncidentResponsePolicy = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.IncidentResponsePolicy })));
const AccessibilityStatement = React.lazy(() => import('./components/LegalPages').then(m => ({ default: m.AccessibilityStatement })));

// Lazy-loaded dashboard sub-views
const ProjectDetailScreen = React.lazy(() => import('./components/ProjectDetailScreen'));
const FindingsReportScreen = React.lazy(() => import('./components/FindingsReportScreen'));
const TeamManagement = React.lazy(() => import('./components/TeamManagement'));
const IntegrationsSettings = React.lazy(() => import('./components/IntegrationsSettings'));
const SBOMViewer = React.lazy(() => import('./components/SBOMViewer'));
const BillingDashboard = React.lazy(() => import('./components/BillingDashboard').then(m => ({ default: m.BillingDashboard })));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const ThreatHunting = React.lazy(() => import('./components/ThreatHunting'));
const VulnerabilityManagement = React.lazy(() => import('./components/VulnerabilityManagement').then(m => ({ default: m.VulnerabilityManagement })));
const PhishingSimulator = React.lazy(() => import('./components/PhishingSimulator'));
const DataLossPrevention = React.lazy(() => import('./components/DataLossPrevention'));
const AttackSurfaceManagement = React.lazy(() => import('./components/AttackSurfaceManagement'));
const AISecurityGuard = React.lazy(() => import('./components/AISecurityGuard'));
const EDRPlatform = React.lazy(() => import('./components/EDRPlatform'));
const EndpointProtectionDashboard = React.lazy(() => import('./components/EndpointProtection'));
const UEBAPlatform = React.lazy(() => import('./components/UEBAPlatform'));
const SOARPlatform = React.lazy(() => import('./components/SOARPlatform'));
const NetworkTrafficAnalysis = React.lazy(() => import('./components/NetworkTrafficAnalysis'));
const EmailSecurity = React.lazy(() => import('./components/EmailSecurity'));
const BrowserIsolation = React.lazy(() => import('./components/BrowserIsolation'));
const SecurityAutomation = React.lazy(() => import('./components/SecurityAutomation'));
const IdentityGovernance = React.lazy(() => import('./components/IdentityGovernance'));
const PasswordVault = React.lazy(() => import('./components/PasswordVault'));
const CryptographyManager = React.lazy(() => import('./components/CryptographyManager'));
const ContainerSecurity = React.lazy(() => import('./components/ContainerSecurity'));
const NetworkSegmentation = React.lazy(() => import('./components/NetworkSegmentation'));
const DeceptionTechnology = React.lazy(() => import('./components/DeceptionTechnology'));
const ThreatModeling = React.lazy(() => import('./components/ThreatModeling'));
const PenetrationTesting = React.lazy(() => import('./components/PenetrationTesting'));
const PurpleTeam = React.lazy(() => import('./components/PurpleTeam'));
const SecurityMetrics = React.lazy(() => import('./components/SecurityMetrics'));
const RegulatoryIntelligence = React.lazy(() => import('./components/RegulatoryIntelligence'));
const VendorRiskManagement = React.lazy(() => import('./components/VendorRiskManagement'));
const AssetInventory = React.lazy(() => import('./components/AssetInventory'));
const OTICSSecurity = React.lazy(() => import('./components/OTICSecurity'));
const ForensicsLab = React.lazy(() => import('./components/ForensicsLab'));
const MalwareAnalysis = React.lazy(() => import('./components/MalwareAnalysis'));
const SecurityTraining = React.lazy(() => import('./components/SecurityTraining'));
const AutonomousSOC = React.lazy(() => import('./components/AutonomousSOC'));
const DigitalTwinSecurity = React.lazy(() => import('./components/DigitalTwinSecurity'));
const CyberInsuranceIntegration = React.lazy(() => import('./components/CyberInsuranceIntegration'));
const NationalSecurityModule = React.lazy(() => import('./components/NationalSecurityModule'));
const CriticalInfrastructureProtection = React.lazy(() => import('./components/CriticalInfrastructureProtection'));
const SupplyChainAttestation = React.lazy(() => import('./components/SupplyChainAttestation'));
const ActiveDefense = React.lazy(() => import('./components/ActiveDefense'));
const DarkWebMonitor = React.lazy(() => import('./components/DarkWebMonitor'));
const ComplianceHub = React.lazy(() => import('./components/ComplianceHub'));
const BreachSimulator = React.lazy(() => import('./components/BreachSimulator'));
const CloudSecurityPosture = React.lazy(() => import('./components/CloudSecurityPosture'));
const CICDSecurity = React.lazy(() => import('./components/CICDSecurity'));
const ThreatIntelligence = React.lazy(() => import('./components/ThreatIntelligence'));
const APISecurityScanner = React.lazy(() => import('./components/APISecurityScanner'));
const ExecutiveDashboard = React.lazy(() => import('./components/ExecutiveDashboard'));
const InsiderThreatDetection = React.lazy(() => import('./components/InsiderThreatDetection'));
const ZeroTrustSecurity = React.lazy(() => import('./components/ZeroTrustSecurity'));
const SOCDashboard = React.lazy(() => import('./components/SOCDashboard'));
const QuantumCryptography = React.lazy(() => import('./components/QuantumCryptography'));
const IncidentResponse = React.lazy(() => import('./components/IncidentResponseAutomation'));
const SecretsRotation = React.lazy(() => import('./components/SecretsRotation'));
const SupplyChainAI = React.lazy(() => import('./components/SupplyChainAI'));
const RASPAgent = React.lazy(() => import('./components/RASPAgent'));
const MobileSecurity = React.lazy(() => import('./components/MobileSecurity'));
const BackupDisasterRecovery = React.lazy(() => import('./components/BackupDisasterRecovery'));
const SelfProtection = React.lazy(() => import('./components/SelfProtection'));
const AnchorIntelligenceLanding = React.lazy(() => import('./components/AnchorIntelligenceLanding'));
const AnchorIntelligenceDashboard = React.lazy(() => import('./components/AnchorIntelligenceDashboard'));
const GovernmentLanding = React.lazy(() => import('./components/GovernmentLanding'));
const AIEvolutionDashboard = React.lazy(() => import('./components/AIEvolutionDashboard'));
const UserProfileSettings = React.lazy(() => import('./components/UserProfileSettings'));
const AIHelpDesk = React.lazy(() => import('./components/AIHelpDesk'));
const HowToGuide = React.lazy(() => import('./components/HowToGuide'));
const SDKSecurity = React.lazy(() => import('./components/SDKSecurity'));
const PillarPricing = React.lazy(() => import('./components/PillarPricing'));
const ProductNarratives = React.lazy(() => import('./components/ProductNarratives'));
const InvestorSlides = React.lazy(() => import('./components/InvestorSlides'));

// World-First Security Layers
const HardwareIntegrity = React.lazy(() => import('./components/HardwareIntegrity'));
const FirmwareSecurity = React.lazy(() => import('./components/FirmwareSecurity'));
const IdentityDrift = React.lazy(() => import('./components/IdentityDrift'));
const DataTrustEngine = React.lazy(() => import('./components/DataTrustEngine'));
const AIRuntimeSecurity = React.lazy(() => import('./components/AIRuntimeSecurity'));
const HumanBehaviourEngine = React.lazy(() => import('./components/HumanBehaviourEngine'));
const NationalTelemetryLayer = React.lazy(() => import('./components/NationalTelemetryLayer'));
const ArchitectureDrift = React.lazy(() => import('./components/ArchitectureDrift'));
const AutonomousRedTeam = React.lazy(() => import('./components/AutonomousRedTeam'));

// Newly-wired orphaned features
const AIDashboard = React.lazy(() => import('./components/AIDashboard'));
const AILLMSecurity = React.lazy(() => import('./components/AILLMSecurity'));
const AntiTampering = React.lazy(() => import('./components/AntiTampering'));
const ForensicsInvestigation = React.lazy(() => import('./components/ForensicsInvestigation'));
const SecurityAwarenessTraining = React.lazy(() => import('./components/SecurityAwarenessTraining'));
const NotFoundPage = React.lazy(() => import('./components/NotFoundPage'));

// New Security Modules (Gap Closure)
const DNSSecurity = React.lazy(() => import('./components/DNSSecurity'));
const WebApplicationFirewall = React.lazy(() => import('./components/WebApplicationFirewall'));
const DDoSProtection = React.lazy(() => import('./components/DDoSProtection'));
const PrivilegedAccessManagement = React.lazy(() => import('./components/PrivilegedAccessManagement'));
const CASBSecurity = React.lazy(() => import('./components/CASBSecurity'));
const IoTSecurity = React.lazy(() => import('./components/IoTSecurity'));
const SIEMPlatform = React.lazy(() => import('./components/SIEMPlatform'));
const PrivacyImpactAssessment = React.lazy(() => import('./components/PrivacyImpactAssessment'));
const PatchManagement = React.lazy(() => import('./components/PatchManagement'));
const SecureCodeReview = React.lazy(() => import('./components/SecureCodeReview'));
const AIAgentSecurity = React.lazy(() => import('./components/AIAgentSecurity'));
const DeepfakeDetection = React.lazy(() => import('./components/DeepfakeDetection'));
const SatelliteCommsSecurity = React.lazy(() => import('./components/SatelliteCommsSecurity'));
const LLMSupplyChain = React.lazy(() => import('./components/LLMSupplyChain'));

// Loading spinner for lazy-loaded components
const LazyFallback = () => (
  <div className="min-h-100 flex items-center justify-center">
    <div className="text-center">
      <svg className="animate-spin h-10 w-10 mx-auto text-cyan-400 mb-3" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-slate-400 text-sm">Loading module...</p>
    </div>
  </div>
);

// Main navigation views
export type AppView = 
  | 'marketing'      // Public marketing page
  | 'pricing'        // Public pricing page
  | 'auth'           // Login/signup
  | 'forgot-password'
  | 'reset-password'
  | 'auth-callback'  // OAuth callback
  | 'onboarding'     // New user onboarding
  | 'dashboard'      // Main app (authenticated)
  | 'privacy'        // Privacy policy
  | 'terms'          // Terms of service
  | 'security-info'  // Security page
  | 'about'          // About page
  | 'contact'        // Contact page
  | 'purchase-terms' // Purchase terms and conditions
  | 'intelligence'     // Anchor Intelligence B2B Landing Page
  | 'intelligence-dashboard' // API Customer Dashboard
  | 'government'      // Government & Sovereign Defense Landing Page
  | 'pillar-pricing'   // 5-Pillar pricing page
  | 'product-narratives' // Product deep-dive pages
  | 'investor-slides'   // Investor pitch deck
  | 'cookie-policy'     // Cookie policy
  | 'acceptable-use'    // Acceptable use policy
  | 'dpa'               // Data processing agreement
  | 'disclaimer'        // Disclaimer
  | 'responsible-disclosure' // Responsible disclosure
  | 'sla'               // Service level agreement
  | 'eula'              // End user licence agreement
  | 'sovereign-data'    // Sovereign data residency policy
  | 'whistleblower'     // Whistleblower policy
  | 'incident-response-policy' // Incident response policy
  | 'accessibility'     // Accessibility statement
  | 'not-found';        // 404 page

// Dashboard sub-views
export type DashboardView = 
  | 'overview' 
  | 'projectDetail' 
  | 'findingsReport' 
  | 'team' 
  | 'integrations' 
  | 'sbom'
  | 'billing'
  | 'admin'
  | 'threatHunting'
  | 'attackSurface'
  | 'vulnerability'
  | 'phishing'
  | 'dlp'
  | 'emailSecurity'
  | 'edr'
  | 'ueba'
  | 'networkTraffic'
  | 'soar'
  | 'aiSecurity'
  | 'browserIsolation'
  | 'securityAutomation'
  | 'identityGovernance'
  | 'passwordVault'
  | 'cryptographyManager'
  | 'containerSecurity'
  | 'networkSegmentation'
  | 'deceptionTechnology'
  | 'threatModeling'
  | 'penetrationTesting'
  | 'purpleTeam'
  | 'securityMetrics'
  | 'regulatoryIntelligence'
  | 'vendorRisk'
  | 'assetInventory'
  | 'oticsSecurity'
  | 'forensicsLab'
  | 'malwareAnalysis'
  | 'securityTraining'
  | 'autonomousSOC'
  | 'digitalTwin'
  | 'cyberInsurance'
  | 'nationalSecurity'
  | 'criticalInfra'
  | 'supplyChainAttestation'
  | 'activeDefense'
  | 'darkWebMonitor'
  | 'complianceHub'
  | 'breachSimulator'
  | 'cloudSecurity'
  | 'cicdSecurity'
  | 'threatIntelligence'
  | 'apiSecurity'
  | 'executiveDashboard'
  | 'insiderThreat'
  | 'zeroTrust'
  | 'socDashboard'
  | 'quantumCryptography'
  | 'incidentResponse'
  | 'secretsRotation'
  | 'supplyChainAI'
  | 'raspAgent'
  | 'mobileSecurity'
  | 'backupRecovery'
  | 'selfProtection'
  | 'intelligenceDashboard'
  | 'aiEvolution'
  | 'profile'
  | 'helpDesk'
  | 'howToGuide'
  | 'sdkSecurity'
  | 'hardwareIntegrity'
  | 'firmwareSecurity'
  | 'identityDrift'
  | 'dataTrustEngine'
  | 'aiRuntimeSecurity'
  | 'humanBehaviour'
  | 'nationalTelemetry'
  | 'architectureDrift'
  | 'autonomousRedTeam'
  | 'endpointProtection'
  | 'aiCommandCenter'
  | 'aiLLMSecurity'
  | 'antiTampering'
  | 'forensicsInvestigation'
  | 'securityAwarenessTraining'
  | 'dnsSecurity'
  | 'waf'
  | 'ddosProtection'
  | 'privilegedAccess'
  | 'casbSecurity'
  | 'iotSecurity'
  | 'siemPlatform'
  | 'privacyImpact'
  | 'patchManagement'
  | 'secureCodeReview'
  | 'aiAgentSecurity'
  | 'deepfakeDetection'
  | 'satelliteComms'
  | 'llmSupplyChain';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout, isDemoMode } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('marketing');
  const [dashboardView, setDashboardView] = useState<DashboardView>('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [showLoginSuccess, setShowLoginSuccess] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('onboarding_complete') === 'true';
  });
  const [currentPlan, setCurrentPlan] = useState<string | undefined>(undefined);
  // Demo mode gets starter tier — users must subscribe for premium features
  const userPlan = isDemoMode ? 'starter' : (currentPlan || 'starter');
  const [checkoutNotification, setCheckoutNotification] = useState<string | null>(null);
  
    const { projects, findings, activeScans, loading, error, refetch } = useBackendData(isAuthenticated, authLoading);

  // Handle URL-based navigation (for OAuth callbacks, password reset links, etc.)
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Guard: If an OAuth callback accidentally lands on the frontend
    // (e.g. old BACKEND_URL pointed here), redirect to the backend
    if (path.startsWith('/api/auth/')) {
      const backendBase = env.apiBaseUrl.replace(/\/api\/?$/, '');
      window.location.href = `${backendBase}${path}${window.location.search}`;
      return;
    }
    
    if (path === '/auth/callback' || params.has('token')) {
      setCurrentView('auth-callback');
    } else if (path === '/reset-password' || path.startsWith('/reset-password/')) {
      setCurrentView('reset-password');
    } else if (path === '/forgot-password') {
      setCurrentView('forgot-password');
    } else if (path === '/pricing') {
      setCurrentView('pricing');
    } else if (path === '/purchase-terms') {
      setCurrentView('purchase-terms');
    } else if (path === '/privacy') {
      setCurrentView('privacy');
    } else if (path === '/terms') {
      setCurrentView('terms');
    } else if (path === '/security') {
      setCurrentView('security-info');
    } else if (path === '/about') {
      setCurrentView('about');
    } else if (path === '/contact') {
      setCurrentView('contact');
    } else if (path === '/login' || path === '/signup') {
      setCurrentView('auth');
    } else if (path === '/intelligence' || path === '/anchor-intelligence') {
      setCurrentView('intelligence');
    } else if (path === '/intelligence/dashboard') {
      setCurrentView('intelligence-dashboard');
    } else if (path === '/government' || path === '/sovereign') {
      setCurrentView('government');
    } else if (path === '/pricing/pillars') {
      setCurrentView('pillar-pricing');
    } else if (path === '/products') {
      setCurrentView('product-narratives');
    } else if (path === '/investors') {
      setCurrentView('investor-slides');
    } else if (path === '/sla') {
      setCurrentView('sla');
    } else if (path === '/eula') {
      setCurrentView('eula');
    } else if (path === '/sovereign-data') {
      setCurrentView('sovereign-data');
    } else if (path === '/whistleblower') {
      setCurrentView('whistleblower');
    } else if (path === '/incident-response-policy') {
      setCurrentView('incident-response-policy');
    } else if (path === '/accessibility') {
      setCurrentView('accessibility');
    } else if (path === '/cookie-policy') {
      setCurrentView('cookie-policy');
    } else if (path === '/acceptable-use') {
      setCurrentView('acceptable-use');
    } else if (path === '/dpa') {
      setCurrentView('dpa');
    } else if (path === '/disclaimer') {
      setCurrentView('disclaimer');
    } else if (path === '/responsible-disclosure') {
      setCurrentView('responsible-disclosure');
    } else if (path !== '/' && path !== '/dashboard') {
      // Unknown route — show 404
      setCurrentView('not-found');
    }

    // Handle Stripe checkout success redirect
    if (params.get('checkout') === 'success' && path === '/dashboard') {
      setCurrentView('dashboard');
      setDashboardView('billing');
      setCheckoutNotification('🎉 Payment successful! Your subscription is now active.');
      setTimeout(() => setCheckoutNotification(null), 8000);
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }

    // Handle checkout canceled
    if (params.get('checkout') === 'canceled' && path === '/pricing') {
      setCurrentView('pricing');
      setCheckoutNotification('Checkout was canceled. You can try again anytime.');
      setTimeout(() => setCheckoutNotification(null), 5000);
      window.history.replaceState({}, '', '/pricing');
    }
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/auth/callback') {
        setCurrentView('auth-callback');
      } else if (path === '/reset-password' || path.startsWith('/reset-password/')) {
        setCurrentView('reset-password');
      } else if (path === '/forgot-password') {
        setCurrentView('forgot-password');
      } else if (path === '/pricing') {
        setCurrentView('pricing');
      } else if (path === '/privacy') {
        setCurrentView('privacy');
      } else if (path === '/terms') {
        setCurrentView('terms');
      } else if (path === '/security') {
        setCurrentView('security-info');
      } else if (path === '/about') {
        setCurrentView('about');
      } else if (path === '/contact') {
        setCurrentView('contact');
      } else if (path === '/login' || path === '/signup') {
        setCurrentView('auth');
      } else if (path === '/intelligence' || path === '/anchor-intelligence') {
        setCurrentView('intelligence');
      } else if (path === '/intelligence/dashboard') {
        setCurrentView('intelligence-dashboard');
      } else if (path === '/government' || path === '/sovereign') {
        setCurrentView('government');
      } else if (path === '/pricing/pillars') {
        setCurrentView('pillar-pricing');
      } else if (path === '/products') {
        setCurrentView('product-narratives');
      } else if (path === '/investors') {
        setCurrentView('investor-slides');
      } else if (path === '/purchase-terms') {
        setCurrentView('purchase-terms');
      } else if (path === '/sla') {
        setCurrentView('sla');
      } else if (path === '/eula') {
        setCurrentView('eula');
      } else if (path === '/sovereign-data') {
        setCurrentView('sovereign-data');
      } else if (path === '/whistleblower') {
        setCurrentView('whistleblower');
      } else if (path === '/incident-response-policy') {
        setCurrentView('incident-response-policy');
      } else if (path === '/accessibility') {
        setCurrentView('accessibility');
      } else if (path === '/cookie-policy') {
        setCurrentView('cookie-policy');
      } else if (path === '/acceptable-use') {
        setCurrentView('acceptable-use');
      } else if (path === '/dpa') {
        setCurrentView('dpa');
      } else if (path === '/disclaimer') {
        setCurrentView('disclaimer');
      } else if (path === '/responsible-disclosure') {
        setCurrentView('responsible-disclosure');
      } else if (path === '/dashboard') {
        setCurrentView('dashboard');
      } else if (path === '/') {
        if (isAuthenticated) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('marketing');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  // Fetch current plan when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const fetchCurrentPlan = async () => {
        try {
          const token = localStorage.getItem('anchor_auth_token');
          const response = await fetch(`${env.apiBaseUrl}/billing/subscription`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setCurrentPlan(data.subscription?.planTier || 'FREE');
          }
        } catch {
          // Billing data not available, don't block
        }
      };
      fetchCurrentPlan();
    }
  }, [isAuthenticated, authLoading]);

  // Determine initial view based on auth state
  useEffect(() => {
    if (!authLoading) {
      // Only skip redirect for unauthenticated users on public/special pages.
      // Authenticated users on 'auth' or 'auth-callback' should be sent to dashboard.
      if (!isAuthenticated && ['auth', 'auth-callback', 'reset-password', 'forgot-password', 'pricing', 'privacy', 'terms', 'security-info', 'about', 'contact', 'intelligence', 'government', 'pillar-pricing', 'product-narratives', 'investor-slides'].includes(currentView)) {
        return;
      }

      // Allow authenticated users to stay on truly public info pages
      if (isAuthenticated && ['pricing', 'privacy', 'terms', 'security-info', 'about', 'contact', 'intelligence', 'government', 'pillar-pricing', 'product-narratives', 'investor-slides', 'purchase-terms'].includes(currentView)) {
        return;
      }
      
      if (isAuthenticated) {
        // Check if new user needs onboarding
        if (!hasCompletedOnboarding) {
          setCurrentView('onboarding');
        } else if (currentView !== 'dashboard') {
          setCurrentView('dashboard');
          window.history.replaceState({}, '', '/');
        }
      }
      // If not authenticated, stay on whatever view we're on (marketing, auth, etc.)
      // Only force back to marketing if they're on a protected view
      else if (currentView === 'dashboard' || currentView === 'onboarding') {
        setCurrentView('marketing');
      }
    }
  }, [isAuthenticated, authLoading, hasCompletedOnboarding, currentView]);

  // WebSocket for real-time updates
  useWebSocket({
    onScanComplete: () => refetch(),
    onScanProgress: () => {},
    onFindingCreated: () => refetch(),
  });

  // Navigation handlers
  const handleGetStarted = useCallback(() => {
    setCurrentView('auth');
    window.history.pushState({}, '', '/signup');
  }, []);

  const handleLogin = useCallback(() => {
    setCurrentView('auth');
    window.history.pushState({}, '', '/login');
  }, []);

  const handleViewPricing = useCallback(() => {
    setCurrentView('pricing');
    window.history.pushState({}, '', '/pricing');
  }, []);

  const handleViewPrivacy = useCallback(() => {
    setCurrentView('privacy');
    window.history.pushState({}, '', '/privacy');
  }, []);

  const handleViewTerms = useCallback(() => {
    setCurrentView('terms');
    window.history.pushState({}, '', '/terms');
  }, []);

  const handleViewSecurityInfo = useCallback(() => {
    setCurrentView('security-info');
    window.history.pushState({}, '', '/security');
  }, []);

  const handleViewAbout = useCallback(() => {
    setCurrentView('about');
    window.history.pushState({}, '', '/about');
  }, []);

  const handleViewContact = useCallback(() => {
    setCurrentView('contact');
    window.history.pushState({}, '', '/contact');
  }, []);

  const handleViewPurchaseTerms = useCallback(() => {
    setCurrentView('purchase-terms');
    window.history.pushState({}, '', '/purchase-terms');
  }, []);

  const handleViewCookiePolicy = useCallback(() => {
    setCurrentView('cookie-policy');
    window.history.pushState({}, '', '/cookie-policy');
  }, []);

  const handleViewAcceptableUse = useCallback(() => {
    setCurrentView('acceptable-use');
    window.history.pushState({}, '', '/acceptable-use');
  }, []);

  const handleViewDPA = useCallback(() => {
    setCurrentView('dpa');
    window.history.pushState({}, '', '/dpa');
  }, []);

  const handleViewDisclaimer = useCallback(() => {
    setCurrentView('disclaimer');
    window.history.pushState({}, '', '/disclaimer');
  }, []);

  const handleViewResponsibleDisclosure = useCallback(() => {
    setCurrentView('responsible-disclosure');
    window.history.pushState({}, '', '/responsible-disclosure');
  }, []);

  const handleViewSLA = useCallback(() => {
    setCurrentView('sla');
    window.history.pushState({}, '', '/sla');
  }, []);

  const handleViewEULA = useCallback(() => {
    setCurrentView('eula');
    window.history.pushState({}, '', '/eula');
  }, []);

  const handleViewSovereignData = useCallback(() => {
    setCurrentView('sovereign-data');
    window.history.pushState({}, '', '/sovereign-data');
  }, []);

  const handleViewWhistleblower = useCallback(() => {
    setCurrentView('whistleblower');
    window.history.pushState({}, '', '/whistleblower');
  }, []);

  const handleViewIncidentResponsePolicy = useCallback(() => {
    setCurrentView('incident-response-policy');
    window.history.pushState({}, '', '/incident-response-policy');
  }, []);

  const handleViewAccessibility = useCallback(() => {
    setCurrentView('accessibility');
    window.history.pushState({}, '', '/accessibility');
  }, []);

  const handleBackToMarketing = useCallback(() => {
    setCurrentView('marketing');
    window.history.pushState({}, '', '/');
  }, []);

  const handleViewIntelligence = useCallback(() => {
    setCurrentView('intelligence');
    window.history.pushState({}, '', '/intelligence');
  }, []);

  const handleViewGovernment = useCallback(() => {
    setCurrentView('government');
    window.history.pushState({}, '', '/government');
  }, []);

  const handleViewPillarPricing = useCallback(() => {
    setCurrentView('pillar-pricing');
    window.history.pushState({}, '', '/pricing/pillars');
  }, []);

  const handleViewProductNarratives = useCallback(() => {
    setCurrentView('product-narratives');
    window.history.pushState({}, '', '/products');
  }, []);

  const handleViewInvestorSlides = useCallback(() => {
    setCurrentView('investor-slides');
    window.history.pushState({}, '', '/investors');
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setShowLoginSuccess(true);
    window.history.pushState({}, '', '/');
    if (!hasCompletedOnboarding) {
      setCurrentView('onboarding');
    } else {
      setCurrentView('dashboard');
    }
  }, [hasCompletedOnboarding]);

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem('onboarding_complete', 'true');
    setHasCompletedOnboarding(true);
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/');
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setShowLoginSuccess(false);
    setCurrentView('marketing');
    window.history.pushState({}, '', '/');
  }, [logout]);

  const handleViewProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setDashboardView('projectDetail');
  }, []);
  
  const handleBackToDashboard = useCallback(() => {
    setSelectedProject(null);
    setSelectedFinding(null);
    setDashboardView('overview');
  }, []);

  const handleNavigate = useCallback((view: DashboardView) => {
    setDashboardView(view);
  }, []);

  const handleNewScan = useCallback(() => {
    // If a project is already selected, stay on its detail and the scan panel is there
    if (selectedProject) {
      setDashboardView('projectDetail');
      return;
    }
    // Otherwise go to overview where user can select a project to scan
    setDashboardView('overview');
  }, [selectedProject]);

  const handleRepair = useCallback(() => {
    // Navigate to vulnerability management where auto-repair tools live
    setDashboardView('vulnerability');
  }, []);

  // Render dashboard content based on sub-view
  const renderDashboardContent = () => {
    const content = (() => {
    switch (dashboardView) {
      case 'projectDetail':
        return selectedProject ? (
            <ProjectDetailScreen project={selectedProject} onBack={handleBackToDashboard} onRefetch={refetch} />
        ) : (
          <DashboardOverview
            onViewProject={handleViewProject}
            projects={projects}
            activeScans={activeScans}
            findings={findings}
              loading={loading}
              error={error}
              onRefetch={refetch}
              onNavigate={handleNavigate}
              onNewScan={handleNewScan}
            />
        );
      case 'findingsReport':
        return (
          <FindingsReportScreen
            findings={findings}
            selectedFinding={selectedFinding}
            onSelectFinding={setSelectedFinding}
            subscriptionTier={userPlan}
            onNavigateToUpgrade={() => handleNavigate('billing')}
          />
        );
      case 'team':
        return <TeamManagement onBack={handleBackToDashboard} />;
      case 'integrations':
        return <IntegrationsSettings onBack={handleBackToDashboard} />;
      case 'sbom':
        return selectedProject ? (
          <SBOMViewer
            projectId={selectedProject.id}
            projectName={selectedProject.name}
            onBack={handleBackToDashboard}
          />
        ) : (
          <DashboardOverview
            onViewProject={handleViewProject}
            projects={projects}
            activeScans={activeScans}
            findings={findings}
              loading={loading}
              error={error}
              onRefetch={refetch}
              onNavigate={handleNavigate}
              onNewScan={handleNewScan}
          />
        );
      case 'billing':
        return (
          <div className="p-6">
            <button 
              onClick={handleBackToDashboard}
              className="mb-4 text-slate-400 hover:text-white flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <BillingDashboard onUpgrade={handleViewPricing} />
          </div>
        );
      case 'admin':
        return (
          <div className="p-6">
            <button 
              onClick={handleBackToDashboard}
              className="mb-4 text-slate-400 hover:text-white flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <AdminDashboard />
          </div>
        );
      case 'threatHunting':
        return <ThreatHunting />;
      case 'attackSurface':
        return <AttackSurfaceManagement />;
      case 'vulnerability':
        return <VulnerabilityManagement />;
      case 'phishing':
        return <PhishingSimulator />;
      case 'dlp':
        return <DataLossPrevention />;
      case 'emailSecurity':
        return <EmailSecurity />;
      case 'edr':
        return <EDRPlatform />;
      case 'endpointProtection':
        return <EndpointProtectionDashboard />;
      case 'ueba':
        return <UEBAPlatform />;
      case 'networkTraffic':
        return <NetworkTrafficAnalysis />;
      case 'soar':
        return <SOARPlatform />;
      case 'aiSecurity':
        return <AISecurityGuard />;
      case 'browserIsolation':
        return <BrowserIsolation />;
      case 'securityAutomation':
        return <SecurityAutomation />;
      case 'identityGovernance':
        return <IdentityGovernance />;
      case 'passwordVault':
        return <PasswordVault />;
      case 'cryptographyManager':
        return <FeatureGate addonId="quantum-cryptography" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><CryptographyManager /></FeatureGate>;
      case 'containerSecurity':
        return <ContainerSecurity />;
      case 'networkSegmentation':
        return <NetworkSegmentation />;
      case 'deceptionTechnology':
        return <FeatureGate addonId="deception-technology" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><DeceptionTechnology /></FeatureGate>;
      case 'threatModeling':
        return <ThreatModeling />;
      case 'penetrationTesting':
        return <PenetrationTesting />;
      case 'purpleTeam':
        return <PurpleTeam />;
      case 'securityMetrics':
        return <SecurityMetrics />;
      case 'regulatoryIntelligence':
        return <RegulatoryIntelligence />;
      case 'vendorRisk':
        return <VendorRiskManagement />;
      case 'assetInventory':
        return <AssetInventory />;
      case 'oticsSecurity':
        return <OTICSSecurity />;
      case 'forensicsLab':
        return <FeatureGate addonId="forensics-lab" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><ForensicsLab /></FeatureGate>;
      case 'malwareAnalysis':
        return <MalwareAnalysis />;
      case 'securityTraining':
        return <SecurityTraining />;
      case 'autonomousSOC':
        return <FeatureGate addonId="autonomous-soc" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><AutonomousSOC /></FeatureGate>;
      case 'digitalTwin':
        return <FeatureGate addonId="digital-twin-security" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><DigitalTwinSecurity /></FeatureGate>;
      case 'cyberInsurance':
        return <FeatureGate addonId="cyber-insurance" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><CyberInsuranceIntegration /></FeatureGate>;
      case 'nationalSecurity':
        return <NationalSecurityModule />;
      case 'criticalInfra':
        return <FeatureGate addonId="critical-infrastructure" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><CriticalInfrastructureProtection /></FeatureGate>;
      case 'supplyChainAttestation':
        return <SupplyChainAttestation />;
      case 'activeDefense':
        return <ActiveDefense />;
      case 'darkWebMonitor':
        return <FeatureGate addonId="dark-web-monitor" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><DarkWebMonitor /></FeatureGate>;
      case 'complianceHub':
        return <ComplianceHub />;
      case 'breachSimulator':
        return <FeatureGate addonId="breach-simulator" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><BreachSimulator /></FeatureGate>;
      case 'cloudSecurity':
        return <CloudSecurityPosture />;
      case 'cicdSecurity':
        return <CICDSecurity />;
      case 'threatIntelligence':
        return <ThreatIntelligence />;
      case 'apiSecurity':
        return <APISecurityScanner />;
      case 'executiveDashboard':
        return <ExecutiveDashboard />;
      case 'insiderThreat':
        return <InsiderThreatDetection />;
      case 'zeroTrust':
        return <ZeroTrustSecurity />;
      case 'socDashboard':
        return <SOCDashboard />;
      case 'quantumCryptography':
        return <QuantumCryptography />;
      case 'incidentResponse':
        return <IncidentResponse />;
      case 'secretsRotation':
        return <SecretsRotation />;
      case 'supplyChainAI':
        return <FeatureGate addonId="supply-chain-ai" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><SupplyChainAI /></FeatureGate>;
      case 'raspAgent':
        return <RASPAgent />;
      case 'mobileSecurity':
        return <MobileSecurity />;
      case 'backupRecovery':
        return <BackupDisasterRecovery />;
      case 'selfProtection':
        return <SelfProtection />;
      case 'intelligenceDashboard':
        return <AnchorIntelligenceDashboard />;
      case 'aiEvolution':
        return <AIEvolutionDashboard />;
      case 'profile':
        return <UserProfileSettings />;
      case 'helpDesk':
        return <AIHelpDesk />;
      case 'howToGuide':
        return <HowToGuide />;
      case 'sdkSecurity':
        return <SDKSecurity />;
      case 'hardwareIntegrity':
        return <HardwareIntegrity />;
      case 'firmwareSecurity':
        return <FirmwareSecurity />;
      case 'identityDrift':
        return <IdentityDrift />;
      case 'dataTrustEngine':
        return <DataTrustEngine />;
      case 'aiRuntimeSecurity':
        return <AIRuntimeSecurity />;
      case 'humanBehaviour':
        return <HumanBehaviourEngine />;
      case 'nationalTelemetry':
        return <NationalTelemetryLayer />;
      case 'architectureDrift':
        return <ArchitectureDrift />;
      case 'autonomousRedTeam':
        return <AutonomousRedTeam />;
      case 'aiCommandCenter':
        return <AIDashboard projectId="default" userId={user?.id || 'user'} userName={user?.email?.split('@')[0] || 'User'} />;
      case 'aiLLMSecurity':
        return <AILLMSecurity />;
      case 'antiTampering':
        return <AntiTampering />;
      case 'forensicsInvestigation':
        return <ForensicsInvestigation />;
      case 'securityAwarenessTraining':
        return <SecurityAwarenessTraining />;
      case 'dnsSecurity':
        return <DNSSecurity />;
      case 'waf':
        return <WebApplicationFirewall />;
      case 'ddosProtection':
        return <DDoSProtection />;
      case 'privilegedAccess':
        return <PrivilegedAccessManagement />;
      case 'casbSecurity':
        return <CASBSecurity />;
      case 'iotSecurity':
        return <IoTSecurity />;
      case 'siemPlatform':
        return <SIEMPlatform />;
      case 'privacyImpact':
        return <PrivacyImpactAssessment />;
      case 'patchManagement':
        return <PatchManagement />;
      case 'secureCodeReview':
        return <SecureCodeReview />;
      case 'aiAgentSecurity':
        return <FeatureGate addonId="ai-agent-security" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><AIAgentSecurity /></FeatureGate>;
      case 'deepfakeDetection':
        return <FeatureGate addonId="deepfake-detection" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><DeepfakeDetection /></FeatureGate>;
      case 'satelliteComms':
        return <FeatureGate addonId="satellite-comms" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><SatelliteCommsSecurity /></FeatureGate>;
      case 'llmSupplyChain':
        return <FeatureGate addonId="llm-supply-chain" currentTier={userPlan} onUpgrade={() => handleNavigate('billing')}><LLMSupplyChain /></FeatureGate>;
      case 'overview':
      default:
        return (
          <DashboardOverview
            onViewProject={handleViewProject}
            projects={projects}
            activeScans={activeScans}
            findings={findings}
              loading={loading}
              error={error}
              onRefetch={refetch}
              onNavigate={handleNavigate}
              onNewScan={handleNewScan}
          />
        );
    }
    })();

    return <Suspense fallback={<LazyFallback />}>{content}</Suspense>;
  };

  // Main render based on current view
  const renderContent = () => {
    // Show loading while checking auth OR if we just authenticated but view hasn't updated yet
    if (authLoading || (isAuthenticated && currentView === 'marketing')) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 mx-auto text-cyan-400 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'marketing':
        return (
          <MarketingLanding 
            onGetStarted={handleGetStarted} 
            onLogin={handleLogin}
            onViewPricing={handleViewPricing}
            onViewPrivacy={handleViewPrivacy}
            onViewTerms={handleViewTerms}
            onViewSecurity={handleViewSecurityInfo}
            onViewAbout={handleViewAbout}
            onViewContact={handleViewContact}
            onViewPurchaseTerms={handleViewPurchaseTerms}
            onViewCookiePolicy={handleViewCookiePolicy}
            onViewAcceptableUse={handleViewAcceptableUse}
            onViewDPA={handleViewDPA}
            onViewDisclaimer={handleViewDisclaimer}
            onViewResponsibleDisclosure={handleViewResponsibleDisclosure}
            onViewIntelligence={handleViewIntelligence}
            onViewGovernment={handleViewGovernment}
            onViewPillarPricing={handleViewPillarPricing}
            onViewProducts={handleViewProductNarratives}
            onViewInvestors={handleViewInvestorSlides}
            onViewSLA={handleViewSLA}
            onViewEULA={handleViewEULA}
            onViewSovereignData={handleViewSovereignData}
            onViewWhistleblower={handleViewWhistleblower}
            onViewIncidentResponsePolicy={handleViewIncidentResponsePolicy}
            onViewAccessibility={handleViewAccessibility}
          />
        );
      
      case 'pricing':
        return (
          <PricingPage 
            onBack={() => {
              setCurrentView(isAuthenticated ? 'dashboard' : 'marketing');
              window.history.pushState({}, '', '/');
            }}
            onSelectPlan={(tier) => {
              if (['ENTERPRISE', 'ENTERPRISE_PLUS', 'GOVERNMENT'].includes(tier)) {
                window.open('mailto:sales@anchoraiguard.com?subject=Enterprise%20Inquiry%20-%20' + encodeURIComponent(tier), '_blank');
              } else if (!isAuthenticated) {
                setCurrentView('auth');
                window.history.pushState({}, '', `/signup?plan=${tier}`);
              }
              // For authenticated users, PricingPage handles checkout internally
            }}
            currentPlan={currentPlan}
            isAuthenticated={isAuthenticated}
          />
        );
      
      case 'auth':
        return (
          <AuthScreen onSuccess={handleAuthSuccess} />
        );
      
      case 'forgot-password':
        return (
          <ForgotPasswordScreen 
            onBack={() => {
              setCurrentView('auth');
              window.history.pushState({}, '', '/login');
            }} 
          />
        );
      
      case 'reset-password':
        return (
          <ResetPasswordScreen 
            onSuccess={() => {
              setCurrentView('auth');
              window.history.pushState({}, '', '/login');
            }}
            onBack={() => {
              setCurrentView('forgot-password');
              window.history.pushState({}, '', '/forgot-password');
            }}
          />
        );
      
      case 'auth-callback':
        return (
          <AuthCallback 
            onSuccess={handleAuthSuccess}
            onError={() => {
              setCurrentView('auth');
              window.history.pushState({}, '', '/login');
            }}
          />
        );
      
      case 'onboarding':
        return (
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        );
      
      case 'dashboard':
        return (
          <DashboardLayout 
            currentView="dashboard"
            setCurrentView={() => {}}
            setDashboardView={handleNavigate}
            onViewTeam={() => setDashboardView('team')}
            onViewIntegrations={() => setDashboardView('integrations')}
            onLogout={handleLogout}
            onViewBilling={() => setDashboardView('billing')}
            onViewProfile={() => setDashboardView('profile')}
            onViewAdmin={() => setDashboardView('admin')}
            onNewScan={handleNewScan}
            onRepair={handleRepair}
            user={user}
          >
            {renderDashboardContent()}
          </DashboardLayout>
        );
      
      case 'privacy':
        return <PrivacyPolicy onBack={handleBackToMarketing} />;
      
      case 'terms':
        return <TermsOfService onBack={handleBackToMarketing} />;
      
      case 'security-info':
        return <SecurityPage onBack={handleBackToMarketing} />;
      
      case 'about':
        return <AboutPage onBack={handleBackToMarketing} />;
      
      case 'contact':
        return <ContactPage onBack={handleBackToMarketing} />;
      
      case 'purchase-terms':
        return <PurchaseTerms onBack={handleBackToMarketing} />;

      case 'cookie-policy':
        return <CookiePolicy onBack={handleBackToMarketing} />;

      case 'acceptable-use':
        return <AcceptableUsePolicy onBack={handleBackToMarketing} />;

      case 'dpa':
        return <DataProcessingAgreement onBack={handleBackToMarketing} />;

      case 'disclaimer':
        return <DisclaimerPage onBack={handleBackToMarketing} />;

      case 'responsible-disclosure':
        return <ResponsibleDisclosure onBack={handleBackToMarketing} />;

      case 'sla':
        return <ServiceLevelAgreement onBack={handleBackToMarketing} />;

      case 'eula':
        return <EndUserLicenceAgreement onBack={handleBackToMarketing} />;

      case 'sovereign-data':
        return <SovereignDataResidencyPolicy onBack={handleBackToMarketing} />;

      case 'whistleblower':
        return <WhistleblowerPolicy onBack={handleBackToMarketing} />;

      case 'incident-response-policy':
        return <IncidentResponsePolicy onBack={handleBackToMarketing} />;

      case 'accessibility':
        return <AccessibilityStatement onBack={handleBackToMarketing} />;

      case 'intelligence':
        return <AnchorIntelligenceLanding onBack={handleBackToMarketing} />;

      case 'government':
        return <GovernmentLanding onBack={handleBackToMarketing} onGetStarted={handleGetStarted} onViewIntelligence={handleViewIntelligence} />;

      case 'intelligence-dashboard':
        return <AnchorIntelligenceDashboard />;

      case 'pillar-pricing':
        return (
          <PillarPricing
            onBack={handleBackToMarketing}
            onGetStarted={handleGetStarted}
            onSelectPlan={(_pillarId, tierName) => {
              const customTiers = ['Enterprise', 'Government', 'Custom'];
              if (customTiers.some(t => tierName.includes(t))) {
                // Contact Sales handled inside PillarPricing already
                return;
              }
              // Navigate to main pricing page for Stripe checkout
              handleViewPricing();
            }}
          />
        );

      case 'product-narratives':
        return (
          <ProductNarratives
            onBack={handleBackToMarketing}
            onGetStarted={handleGetStarted}
            onViewPricing={handleViewPillarPricing}
          />
        );

      case 'investor-slides':
        return <InvestorSlides onBack={handleBackToMarketing} />;

      case 'not-found':
        return (
          <NotFoundPage onGoHome={() => {
            setCurrentView('marketing');
            window.history.pushState({}, '', '/');
          }} />
        );
      
      default:
        return (
          <MarketingLanding 
            onGetStarted={handleGetStarted} 
            onLogin={handleLogin}
            onViewPricing={handleViewPricing}
            onViewPrivacy={handleViewPrivacy}
            onViewTerms={handleViewTerms}
            onViewSecurity={handleViewSecurityInfo}
            onViewAbout={handleViewAbout}
            onViewContact={handleViewContact}
            onViewPurchaseTerms={handleViewPurchaseTerms}
            onViewCookiePolicy={handleViewCookiePolicy}
            onViewAcceptableUse={handleViewAcceptableUse}
            onViewDPA={handleViewDPA}
            onViewDisclaimer={handleViewDisclaimer}
            onViewResponsibleDisclosure={handleViewResponsibleDisclosure}
            onViewIntelligence={handleViewIntelligence}
            onViewGovernment={handleViewGovernment}
            onViewPillarPricing={handleViewPillarPricing}
            onViewProducts={handleViewProductNarratives}
            onViewInvestors={handleViewInvestorSlides}
            onViewSLA={handleViewSLA}
            onViewEULA={handleViewEULA}
            onViewSovereignData={handleViewSovereignData}
            onViewWhistleblower={handleViewWhistleblower}
            onViewIncidentResponsePolicy={handleViewIncidentResponsePolicy}
            onViewAccessibility={handleViewAccessibility}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent">
      <div className="relative z-10 min-h-screen">
        {/* Checkout notification banner */}
        {checkoutNotification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-100 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-medium shadow-2xl shadow-green-500/10 backdrop-blur-sm animate-in slide-in-from-top">
            <div className="flex items-center gap-3">
              <span>{checkoutNotification}</span>
              <button onClick={() => setCheckoutNotification(null)} className="text-green-400 hover:text-white ml-2">✕</button>
            </div>
          </div>
        )}
        {showLoginSuccess && (
          <LoginSuccessOverlay
            onContinue={() => setShowLoginSuccess(false)}
            imageSrc="/assets/screen%20back%20ground.jpeg"
          />
        )}
        {error && currentView === 'dashboard' && (
          <div className="bg-red-500/10 border-b border-red-500/30 text-red-300 px-6 py-3 text-sm">
            {error}
          </div>
        )}
        {loading && currentView === 'dashboard' && (
          <div className="bg-cyan-500/10 border-b border-cyan-500/20 text-cyan-300 px-6 py-3 text-sm">
            Loading live security data...
          </div>
        )}
        <Suspense fallback={<LazyFallback />}>
          {renderContent()}
        </Suspense>
      </div>
    </div>
  );
};

// Main App component — AuthProvider is in AppRouter so auth state
// persists across route changes and never remounts.
const App: React.FC = () => {
  return <AppContent />;
};

export default App;