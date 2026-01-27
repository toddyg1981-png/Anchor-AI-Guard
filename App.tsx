
import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './components/DashboardOverview';
import ProjectDetailScreen from './components/ProjectDetailScreen';
import FindingsReportScreen from './components/FindingsReportScreen';
import { Project, Finding } from './types';
import { mockProjects, mockFindings } from './constants';
import NeonWebBackground from './components/NeonWebBackground';

export type View = 'landing' | 'dashboard' | 'projects' | 'findings' | 'reports' | 'settings';
export type DashboardView = 'overview' | 'projectDetail' | 'findingsReport';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [dashboardView, setDashboardView] = useState<DashboardView>('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const navigateToDashboard = useCallback(() => {
    setCurrentView('dashboard');
    setDashboardView('overview');
  }, []);

  const handleViewProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setDashboardView('projectDetail');
  }, []);
  
  const handleViewFinding = useCallback((finding: Finding) => {
    setSelectedFinding(finding);
    setDashboardView('findingsReport');
  }, []);
  
  const handleBackToDashboard = useCallback(() => {
      setSelectedProject(null);
      setSelectedFinding(null);
      setDashboardView('overview');
      setCurrentView('dashboard');
  }, []);

  const renderDashboardContent = () => {
    switch (dashboardView) {
      case 'projectDetail':
        return selectedProject ? <ProjectDetailScreen project={selectedProject} onBack={handleBackToDashboard} /> : <DashboardOverview onViewProject={handleViewProject} />;
      case 'findingsReport':
        return <FindingsReportScreen findings={mockFindings} selectedFinding={selectedFinding} onSelectFinding={setSelectedFinding} />;
      case 'overview':
      default:
        return <DashboardOverview onViewProject={handleViewProject} />;
    }
  };

  const renderContent = () => {
    if (currentView === 'landing') {
      return <LandingPage onGetStarted={navigateToDashboard} />;
    }
  
    return (
      <DashboardLayout currentView={currentView} setCurrentView={setCurrentView} setDashboardView={setDashboardView}>
        {renderDashboardContent()}
      </DashboardLayout>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#05080a]">
      <NeonWebBackground />
      <div className="relative z-10 h-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;