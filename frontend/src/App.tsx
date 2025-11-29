import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { LoginPage } from './components/LoginPage';
import { AppLayout } from './components/AppLayout';
import { PrincipalDashboard } from './components/PrincipalDashboard';
import { TutorDashboard } from './components/TutorDashboard';
import { SubjectTeacherDashboard } from './components/SubjectTeacherDashboard';
import { GradeEntryPage } from './components/GradeEntryPage';
import { BimesterGradePage } from './components/BimesterGradePage';
import { ConsolidationPage } from './components/ConsolidationPage';
import { ReportCardsPage } from './components/ReportCardsPage';
import { FinalReportCardsPage } from './components/FinalReportCardsPage';
import { UGELDataPage } from './components/UGELDataPage';
import { AccountsPage } from './components/AccountsPage';
import { HistoryPage } from './components/HistoryPage';
import { ReportsPage } from './components/ReportsPage';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBimester, setSelectedBimester] = useState('bim3');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    // Principal pages
    if (user?.role === 'principal') {
      switch (currentPage) {
        case 'dashboard':
          return <PrincipalDashboard selectedBimester={selectedBimester} onNavigate={setCurrentPage} />;
        case 'accounts':
          return <AccountsPage />;
        case 'report-cards':
          return <ReportCardsPage selectedBimester={selectedBimester} />;
        case 'final-report-cards':
          return <FinalReportCardsPage />;
        case 'ugel':
          return <UGELDataPage selectedBimester={selectedBimester} />;
        case 'reports':
          return <ReportsPage selectedBimester={selectedBimester} />;
        case 'profile':
          return (
            <div className="p-6">
              <h1>Mi Perfil</h1>
              <p className="text-gray-600 mt-1">
                <strong>Nombre:</strong> {user?.fullName}<br />
                <strong>Email:</strong> {user?.email}<br />
                <strong>Rol:</strong> Director
              </p>
            </div>
          );
        default:
          return <PrincipalDashboard selectedBimester={selectedBimester} onNavigate={setCurrentPage} />;
      }
    }

    // Tutor pages
    if (user?.role === 'tutor') {
      switch (currentPage) {
        case 'dashboard':
          return <TutorDashboard selectedBimester={selectedBimester} onNavigate={setCurrentPage} />;
        case 'consolidation':
          return <ConsolidationPage selectedBimester={selectedBimester} />;
        case 'report-cards':
          return <ReportCardsPage selectedBimester={selectedBimester} />;
        case 'final-report-cards':
          return <FinalReportCardsPage />;
        case 'ugel':
          return <UGELDataPage selectedBimester={selectedBimester} />;
        case 'profile':
          return (
            <div className="p-6">
              <h1>Mi Perfil</h1>
              <p className="text-gray-600 mt-1">
                <strong>Nombre:</strong> {user?.fullName}<br />
                <strong>Email:</strong> {user?.email}<br />
                <strong>Rol:</strong> Tutor<br />
                <strong>Secciones:</strong> {user?.assignedSections?.join(', ')}
              </p>
            </div>
          );
        default:
          return <TutorDashboard selectedBimester={selectedBimester} onNavigate={setCurrentPage} />;
      }
    }

    // Subject Teacher pages
    if (user?.role === 'subject_teacher') {
      switch (currentPage) {
        case 'dashboard':
          return <SubjectTeacherDashboard selectedBimester={selectedBimester} onNavigate={setCurrentPage} />;
        case 'grades':
          return <GradeEntryPage selectedBimester={selectedBimester} />;
        case 'bimester-grade':
          return <BimesterGradePage selectedBimester={selectedBimester} />;
        case 'history':
          return <HistoryPage selectedBimester={selectedBimester} />;
        case 'profile':
          return (
            <div className="p-6">
              <h1>Mi Perfil</h1>
              <p className="text-gray-600 mt-1">
                <strong>Nombre:</strong> {user?.fullName}<br />
                <strong>Email:</strong> {user?.email}<br />
                <strong>Rol:</strong> Profesor<br />
                <strong>Secciones:</strong> {user?.assignedSections?.join(', ')}<br />
                <strong>Cursos:</strong> {user?.assignedCourses?.length} asignatura(s)
              </p>
            </div>
          );
        default:
          return <SubjectTeacherDashboard selectedBimester={selectedBimester} onNavigate={setCurrentPage} />;
      }
    }

    return null;
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      selectedBimester={selectedBimester}
      onBimesterChange={setSelectedBimester}
    >
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}