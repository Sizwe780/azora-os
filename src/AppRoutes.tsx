import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import SanctuaryPage from './pages/SanctuaryPage';
import LedgerPage from './pages/LedgerPage';
import KlippPage from './pages/KlippPage';
import GenesisChamberPage from './pages/GenesisChamberPage';
import Settings from './pages/Settings';
import DriverCommandCenter from './pages/DriverCommandCenter';
import WoolworthsDashboard from './pages/WoolworthsDashboard';
import ColdChainCommand from './pages/ColdChainCommand';
import UniversalSafetyCommand from './pages/UniversalSafetyCommand';
import QuantumTracking from './pages/QuantumTracking';
import QuantumAI from './pages/QuantumAI';
import AIEvolution from './pages/AIEvolution';
// New Enterprise Services Pages
import AdminPortalPage from './pages/AdminPortalPage';
import EmployeeOnboardingPage from './pages/EmployeeOnboardingPage';
import DocumentVaultPage from './pages/DocumentVaultPage';
import TrafficRoutingPage from './pages/TrafficRoutingPage';
import AITripPlanningPage from './pages/AITripPlanningPage';
import AccessibilityPage from './pages/AccessibilityPage';
import HRDeputyCEOPage from './pages/HRDeputyCEOPage';
// Dashboard Pages
import AttendancePage from './pages/AttendancePage';
import RevenuePage from './pages/RevenuePage';
import OperationsPage from './pages/OperationsPage';
import SupportPage from './pages/SupportPage';
import CEOInsightsPage from './pages/CEOInsightsPage';
import SecurityPage from './pages/SecurityPage';
import LegalPage from './pages/LegalPage';
import FinancePage from './pages/FinancePage';
import Dashboard from './pages/Dashboard';
// Founder Pages
import EmailPage from './pages/EmailPage';
import FoundersPage from './pages/FoundersPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function AppRoutes() {
  // For demo purposes, we'll use the CEO (Sizwe Ngwenya) as the default user
  // In production, this would come from authentication context
  const currentUserId = 'user_001'; // Sizwe Ngwenya - CEO & CTO

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<SanctuaryPage />} />
        <Route path="/driver" element={<DriverCommandCenter />} />
        <Route path="/tracking" element={<QuantumTracking />} />
        <Route path="/ai" element={<QuantumAI />} />
        <Route path="/evolution" element={<AIEvolution />} />
        <Route path="/woolworths" element={<WoolworthsDashboard />} />
        <Route path="/coldchain" element={<ColdChainCommand />} />
        <Route path="/safety" element={<UniversalSafetyCommand />} />
        <Route path="/klipp" element={<KlippPage />} />
        <Route path="/genesis-chamber" element={<GenesisChamberPage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Dashboard Pages - Role-based access */}
        <Route 
          path="/dashboard" 
          element={<Dashboard userId={currentUserId} />} 
        />
        <Route 
          path="/attendance" 
          element={
            <ProtectedRoute userId={currentUserId} route="/attendance">
              <AttendancePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/revenue" 
          element={
            <ProtectedRoute userId={currentUserId} route="/revenue">
              <RevenuePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/operations" 
          element={
            <ProtectedRoute userId={currentUserId} route="/operations">
              <OperationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/support" 
          element={
            <ProtectedRoute userId={currentUserId} route="/support">
              <SupportPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ceo-insights" 
          element={
            <ProtectedRoute userId={currentUserId} route="/ceo-insights">
              <CEOInsightsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/security" 
          element={
            <ProtectedRoute userId={currentUserId} route="/security">
              <SecurityPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/legal" 
          element={
            <ProtectedRoute userId={currentUserId} route="/legal">
              <LegalPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/finance" 
          element={
            <ProtectedRoute userId={currentUserId} route="/finance">
              <FinancePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Email & Founders Pages */}
        <Route 
          path="/emails" 
          element={
            <ProtectedRoute userId={currentUserId} route="/emails">
              <EmailPage userId={currentUserId} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/founders" 
          element={<FoundersPage />} 
        />
        
        {/* New Enterprise Services Routes */}
        <Route path="/admin" element={<AdminPortalPage />} />
        <Route path="/onboarding" element={<EmployeeOnboardingPage />} />
        <Route path="/documents" element={<DocumentVaultPage />} />
        <Route path="/traffic" element={<TrafficRoutingPage />} />
        <Route path="/trip-ai" element={<AITripPlanningPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/hr-ai" element={<HRDeputyCEOPage />} />
      </Routes>
    </DashboardLayout>
  );
}