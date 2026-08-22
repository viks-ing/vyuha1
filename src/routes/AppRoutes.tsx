import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { AppLayout } from '../components/layout/AppLayout';
import { LandingPage } from '../pages/Landing';
import { LoginPage } from '../pages/Login';
import { SignupPage } from '../pages/Signup';
import { ForgotPasswordPage } from '../pages/ForgotPassword';
import { ResetPasswordPage } from '../pages/ResetPassword';
import { Onboarding } from '../pages/Onboarding';
import { Dashboard } from '../pages/Dashboard';
import { RouteIntelligence } from '../pages/RouteIntelligence';
import { NewAnalysis } from '../pages/NewAnalysis';
import { ScenarioLab } from '../pages/ScenarioLab';
import { History } from '../pages/History';
import { Profile } from '../pages/Profile';
import { Settings } from '../pages/Settings';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { company } = useCompany();

  if (!company.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing & Auth Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Onboarding Flow Route */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Main Application Layout Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/route-intelligence" element={<RouteIntelligence />} />
        <Route path="/new-analysis" element={<NewAnalysis />} />
        <Route path="/scenario-lab" element={<ScenarioLab />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback Route redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

