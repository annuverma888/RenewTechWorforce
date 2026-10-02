import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ChooseRolePage from './pages/auth/ChooseRolePage';

// Technician Pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianProfilePage from './pages/technician/TechnicianProfilePage';
import TechnicianCertificatesPage from './pages/technician/TechnicianCertificatesPage';
import TechnicianAssessmentsPage from './pages/technician/TechnicianAssessmentsPage';
import TakeAssessmentPage from './pages/technician/TakeAssessmentPage';
import RecommendedProjectsPage from './pages/technician/RecommendedProjectsPage';
import MyApplicationsPage from './pages/technician/MyApplicationsPage';
import DigitalSkillPassportPage from './pages/technician/DigitalSkillPassportPage';
import ErrorBoundary from './components/common/ErrorBoundary';

// EPC Company Pages
import EPCDashboard from './pages/epc/EPCDashboard';
import PostProjectPage from './pages/epc/PostProjectPage';
import TechnicianSearchPage from './pages/epc/TechnicianSearchPage';
import EPCProjectsPage from './pages/epc/ProjectsPage';
import EPCProjectDetailsPage from './pages/epc/ProjectDetailsPage';
import ApplicationsPage from './pages/epc/ApplicationsPage';
import WorkforcePage from './pages/epc/WorkforcePage';

// Public & Project Discovery Pages
import ProjectListingPage from './pages/projects/ProjectListingPage';
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
import SkillPassportVerificationPage from './pages/public/SkillPassportVerificationPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage';
import AdminTechniciansPage from './pages/admin/AdminTechniciansPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';

// Landing Page
import LandingPage from './pages/LandingPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, allowPendingRole = false }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has not chosen their role yet
  if (user?.role === 'pending_role' && !allowPendingRole) {
    return <Navigate to="/choose-role" replace />;
  }

  // If role is set and attempting to access restricted role routes
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'technician') return <Navigate to="/technician/dashboard" replace />;
    if (user?.role === 'epc_company') return <Navigate to="/epc/dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Only Route (for login/register when already signed in)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading, isAuthenticated, getDashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'pending_role') {
      console.log('[AUTH] Redirecting to dashboard: /choose-role');
      return <Navigate to="/choose-role" replace />;
    }
    const dest = getDashboardPath(user?.role);
    console.log('[AUTH] Redirecting to dashboard:', dest);
    return <Navigate to={dest} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/projects" element={<ProjectListingPage />} />
            <Route path="/find-projects" element={<Navigate to="/projects" replace />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/technicians/:id" element={<TechnicianProfilePage />} />

            {/* Completely PUBLIC Skill Passport Verification Route (NO ProtectedRoute, NO Auth Guard, NO Login redirect) */}
            <Route
              path="/verify/skill-passport/:technicianId"
              element={<SkillPassportVerificationPage />}
            />
            <Route
              path="/verify/skill-passport"
              element={<SkillPassportVerificationPage />}
            />
            <Route
              path="/passport/:id"
              element={<SkillPassportVerificationPage />}
            />

            {/* Role Selection Route (For first-time Google sign-ins or registrations) */}
            <Route
              path="/choose-role"
              element={
                <ProtectedRoute allowPendingRole={true}>
                  <ChooseRolePage />
                </ProtectedRoute>
              }
            />

            {/* Protected Technician Routes */}
            <Route
              path="/technician/dashboard"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <TechnicianDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/profile"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <TechnicianProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/certificates"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <TechnicianCertificatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/assessments"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <TechnicianAssessmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/assessments/:id/take"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <TakeAssessmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/recommended"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <RecommendedProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/applications"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <MyApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/skill-passport"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <ErrorBoundary>
                    <DigitalSkillPassportPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/passport"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <ErrorBoundary>
                    <DigitalSkillPassportPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            {/* Technician Route Aliases */}
            <Route
              path="/technician/find-projects"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <Navigate to="/technician/recommended" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/skill-profile"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <Navigate to="/technician/profile" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/skill-assessment"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <Navigate to="/technician/assessments" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/work-history"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <Navigate to="/technician/profile" replace />
                </ProtectedRoute>
              }
            />

            {/* Protected EPC Company Routes */}
            <Route
              path="/epc/dashboard"
              element={
                <ProtectedRoute allowedRoles={['epc_company', 'admin']}>
                  <EPCDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/epc/post-project"
              element={
                <ProtectedRoute allowedRoles={['epc_company', 'admin']}>
                  <PostProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/epc/technicians"
              element={
                <ProtectedRoute allowedRoles={['epc_company', 'admin']}>
                  <TechnicianSearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/epc/projects"
              element={
                <ProtectedRoute allowedRoles={['epc_company', 'admin']}>
                  <EPCProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/epc/projects/:id"
              element={
                <ProtectedRoute allowedRoles={['epc_company', 'admin']}>
                  <EPCProjectDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/epc/applications"
              element={
                <ProtectedRoute allowedRoles={['epc_company', 'admin']}>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/epc/workforce"
              element={
                <ProtectedRoute allowedRoles={['epc_company', 'admin']}>
                  <WorkforcePage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/certificates"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCertificatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/technicians"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminTechniciansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCompaniesPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
