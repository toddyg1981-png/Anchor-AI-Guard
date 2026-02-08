import React, { useState, useCallback, useEffect, Suspense } from 'react';
import MarketingLanding from './components/MarketingLanding';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './components/DashboardOverview';
import { Project, Finding } from './types';
import { useBackendData } from './hooks/useBackendData';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useWebSocket } from './hooks/useWebSocket';
import LoginSuccessOverlay from './components/LoginSuccessOverlay';
import { env } from './config/env';

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
  | 'intelligence-dashboard'; // API Customer Dashboard

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
  | 'intelligenceDashboard';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('marketing');
  const [dashboardView, setDashboardView] = useState<DashboardView>('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [showLoginSuccess, setShowLoginSuccess] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('onboarding_complete') === 'true';
  });
  
    const { projects, findings, activeScans, loading, error, refetch } = useBackendData(isAuthenticated, authLoading);

  // Handle URL-based navigation (for OAuth callbacks, password reset links, etc.)
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Guard: If an OAuth callback accidentally lands on the frontend
    // (e.g. old BACKEND_URL pointed here), redirect to the backend
    if (path.startsWith('/api/auth/')) {
      const backendBase = env.apiBaseUrl.replace('/api', '');
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
      // Handle checkout=canceled return from Stripe
      if (params.get('checkout') === 'canceled') {
        setCurrentView('pricing');
      } else {
        setCurrentView('pricing');
      }
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
    }

    // Handle Stripe checkout success redirect
    if (params.get('checkout') === 'success' && path === '/dashboard') {
      setCurrentView('dashboard');
      setDashboardView('billing');
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Determine initial view based on auth state
  useEffect(() => {
    if (!authLoading) {
      // Don't override special routes
      if (['auth', 'auth-callback', 'reset-password', 'forgot-password', 'pricing', 'privacy', 'terms', 'security-info', 'about', 'contact', 'intelligence', 'intelligence-dashboard'].includes(currentView)) {
        return;
      }
      
      if (isAuthenticated) {
        // Check if new user needs onboarding
        if (!hasCompletedOnboarding) {
          setCurrentView('onboarding');
        } else if (currentView !== 'dashboard' && currentView !== 'purchase-terms') {
          setCurrentView('dashboard');
        }
      } else {
        // Not authenticated — redirect protected views back to marketing
        if (currentView === 'dashboard' || currentView === 'onboarding') {
          setCurrentView('marketing');
        }
      }
    }
  }, [isAuthenticated, authLoading, hasCompletedOnboarding, currentView]);

  // WebSocket for real-time updates
  useWebSocket({
    onScanComplete: () => refetch(),
    onScanProgress: (_event) => {
      // Scan progress event - could update UI state here
    },
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

  const handleBackToMarketing = useCallback(() => {
    setCurrentView('marketing');
    window.history.pushState({}, '', '/');
  }, []);

  const handleViewIntelligence = useCallback(() => {
    setCurrentView('intelligence');
    window.history.pushState({}, '', '/intelligence');
  }, []);

  const handleViewIntelligenceDashboard = useCallback(() => {
    setCurrentView('intelligence-dashboard');
    window.history.pushState({}, '', '/intelligence/dashboard');
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
            />
        );
      case 'findingsReport':
        return (
          <FindingsReportScreen
            findings={findings}
            selectedFinding={selectedFinding}
            onSelectFinding={setSelectedFinding}
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
        return <CryptographyManager />;
      case 'containerSecurity':
        return <ContainerSecurity />;
      case 'networkSegmentation':
        return <NetworkSegmentation />;
      case 'deceptionTechnology':
        return <DeceptionTechnology />;
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
        return <ForensicsLab />;
      case 'malwareAnalysis':
        return <MalwareAnalysis />;
      case 'securityTraining':
        return <SecurityTraining />;
      case 'autonomousSOC':
        return <AutonomousSOC />;
      case 'digitalTwin':
        return <DigitalTwinSecurity />;
      case 'cyberInsurance':
        return <CyberInsuranceIntegration />;
      case 'nationalSecurity':
        return <NationalSecurityModule />;
      case 'criticalInfra':
        return <CriticalInfrastructureProtection />;
      case 'supplyChainAttestation':
        return <SupplyChainAttestation />;
      case 'activeDefense':
        return <ActiveDefense />;
      case 'darkWebMonitor':
        return <DarkWebMonitor />;
      case 'complianceHub':
        return <ComplianceHub />;
      case 'breachSimulator':
        return <BreachSimulator />;
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
        return <SupplyChainAI />;
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
            onViewIntelligence={handleViewIntelligence}
          />
        );
      
      case 'pricing':
        return (
          <PricingPage 
            onBack={() => {
              setCurrentView(isAuthenticated ? 'dashboard' : 'marketing');
              window.history.pushState({}, '', '/');
            }}
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
            onViewAdmin={() => setDashboardView('admin')}
            onNewScan={handleNewScan}
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

      case 'intelligence':
        return <AnchorIntelligenceLanding />;

      case 'intelligence-dashboard':
        return <AnchorIntelligenceDashboard />;
      
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
            onViewIntelligence={handleViewIntelligence}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent">
      <div className="relative z-10 min-h-screen">
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

// Main App component with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;