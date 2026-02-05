import React, { useState, useCallback, useEffect } from 'react';
import MarketingLanding from './components/MarketingLanding';
import AuthScreen from './components/AuthScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import AuthCallback from './components/AuthCallback';
import OnboardingWizard from './components/OnboardingWizard';
import { PricingPage } from './components/PricingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './components/DashboardOverview';
import ProjectDetailScreen from './components/ProjectDetailScreen';
import FindingsReportScreen from './components/FindingsReportScreen';
import TeamManagement from './components/TeamManagement';
import IntegrationsSettings from './components/IntegrationsSettings';
import SBOMViewer from './components/SBOMViewer';
import { BillingDashboard } from './components/BillingDashboard';
import AdminDashboard from './components/AdminDashboard';
import ThreatHunting from './components/ThreatHunting';
import { VulnerabilityManagement } from './components/VulnerabilityManagement';
import PhishingSimulator from './components/PhishingSimulator';
import DataLossPrevention from './components/DataLossPrevention';
import AttackSurfaceManagement from './components/AttackSurfaceManagement';
import AISecurityGuard from './components/AISecurityGuard';
import EDRPlatform from './components/EDRPlatform';
import UEBAPlatform from './components/UEBAPlatform';
import SOARPlatform from './components/SOARPlatform';
import NetworkTrafficAnalysis from './components/NetworkTrafficAnalysis';
import EmailSecurity from './components/EmailSecurity';
import BrowserIsolation from './components/BrowserIsolation';
import SecurityAutomation from './components/SecurityAutomation';
import IdentityGovernance from './components/IdentityGovernance';
import PasswordVault from './components/PasswordVault';
import CryptographyManager from './components/CryptographyManager';
import ContainerSecurity from './components/ContainerSecurity';
import NetworkSegmentation from './components/NetworkSegmentation';
import DeceptionTechnology from './components/DeceptionTechnology';
import ThreatModeling from './components/ThreatModeling';
import PenetrationTesting from './components/PenetrationTesting';
import PurpleTeam from './components/PurpleTeam';
import SecurityMetrics from './components/SecurityMetrics';
import RegulatoryIntelligence from './components/RegulatoryIntelligence';
import VendorRiskManagement from './components/VendorRiskManagement';
import AssetInventory from './components/AssetInventory';
import OTICSSecurity from './components/OTICSSecurity';
import ForensicsLab from './components/ForensicsLab';
import MalwareAnalysis from './components/MalwareAnalysis';
import SecurityTraining from './components/SecurityTraining';
import AutonomousSOC from './components/AutonomousSOC';
import DigitalTwinSecurity from './components/DigitalTwinSecurity';
import CyberInsuranceIntegration from './components/CyberInsuranceIntegration';
import NationalSecurityModule from './components/NationalSecurityModule';
import CriticalInfrastructureProtection from './components/CriticalInfrastructureProtection';
import SupplyChainAttestation from './components/SupplyChainAttestation';
import { Project, Finding } from './types';
import { useBackendData } from './hooks/useBackendData';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useWebSocket } from './hooks/useWebSocket';
import LoginSuccessOverlay from './components/LoginSuccessOverlay';
import { PrivacyPolicy, TermsOfService, SecurityPage, AboutPage, ContactPage } from './components/LegalPages';

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
  | 'contact';       // Contact page

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
  | 'supplyChainAttestation';

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
  
    const { projects, findings, activeScans, loading, error, refetch } = useBackendData();

  // Handle URL-based navigation (for OAuth callbacks, password reset links, etc.)
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path === '/auth/callback' || params.has('token')) {
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
    }
  }, []);

  // Determine initial view based on auth state
  useEffect(() => {
    if (!authLoading) {
      // Don't override special routes
      if (['auth-callback', 'reset-password', 'forgot-password', 'pricing', 'privacy', 'terms', 'security-info', 'about', 'contact'].includes(currentView)) {
        return;
      }
      
      if (isAuthenticated) {
        // Check if new user needs onboarding
        if (!hasCompletedOnboarding) {
          setCurrentView('onboarding');
        } else {
          setCurrentView('dashboard');
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

  const handleBackToMarketing = useCallback(() => {
    setCurrentView('marketing');
    window.history.pushState({}, '', '/');
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

  // Render dashboard content based on sub-view
  const renderDashboardContent = () => {
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
  };

  // Main render based on current view
  const renderContent = () => {
    // Show loading while checking auth
    if (authLoading) {
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
          />
        );
      
      case 'pricing':
        return (
          <PricingPage 
            onBack={() => {
              setCurrentView(isAuthenticated ? 'dashboard' : 'marketing');
              window.history.pushState({}, '', '/');
            }}
            onSelectPlan={(_planId) => {
              if (!isAuthenticated) {
                setCurrentView('auth');
                window.history.pushState({}, '', '/signup');
              } else {
                // Handle plan selection - navigate to billing
                setDashboardView('billing');
                setCurrentView('dashboard');
              }
            }}
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
        {renderContent()}
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