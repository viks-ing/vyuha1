import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Onboarding } from '../pages/Onboarding';
import { Dashboard } from '../pages/Dashboard';
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
      {/* Onboarding Flow Route */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Main Application Layout Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="new-analysis" element={<NewAnalysis />} />
        <Route path="scenario-lab" element={<ScenarioLab />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback Route redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
