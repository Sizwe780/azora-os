import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load all page components for code splitting
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SanctuaryPage = lazy(() => import('./pages/SanctuaryPage'));
const LedgerPage = lazy(() => import('./pages/LedgerPage'));
const KlippPage = lazy(() => import('./pages/KlippPage'));
const GenesisChamberPage = lazy(() => import('./pages/GenesisChamberPage'));
const Settings = lazy(() => import('./pages/Settings'));
const DriverCommandCenter = lazy(() => import('./pages/DriverCommandCenter'));
const ColdChainCommand = lazy(() => import('./pages/ColdChainCommand'));
const UniversalSafetyCommand = lazy(() => import('./pages/UniversalSafetyCommand'));
const QuantumTracking = lazy(() => import('./pages/QuantumTracking'));
const QuantumAI = lazy(() => import('./pages/QuantumAI'));
const AIEvolution = lazy(() => import('./pages/AIEvolution'));
const LiveTripTrackingPage = lazy(() => import('./pages/LiveTripTrackingPage'));
const DemandForecasting = lazy(() => import('./pages/DemandForecasting'));
const RouteOptimization = lazy(() => import('./pages/RouteOptimization'));
const AnomalyDetection = lazy(() => import('./pages/AnomalyDetection'));
const FleetClustering = lazy(() => import('./pages/FleetClustering'));

// Enterprise Services Pages
const AdminPortalPage = lazy(() => import('./pages/AdminPortalPage'));
const EmployeeOnboardingPage = lazy(() => import('./pages/EmployeeOnboardingPage'));
const DocumentVaultPage = lazy(() => import('./pages/DocumentVaultPage'));
const TrafficRoutingPage = lazy(() => import('./pages/TrafficRoutingPage'));
const AITripPlanningPage = lazy(() => import('./pages/AITripPlanningPage'));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'));
const HRDeputyCEOPage = lazy(() => import('./pages/HRDeputyCEOPage'));

// Dashboard Pages
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const RevenuePage = lazy(() => import('./pages/RevenuePage'));
const OperationsPage = lazy(() => import('./pages/OperationsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const CEOInsightsPage = lazy(() => import('./pages/CEOInsightsPage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Founder Pages
const EmailPage = lazy(() => import('./pages/EmailPage'));
const FoundersPage = lazy(() => import('./pages/FoundersPage'));

// Onboarding Pages
const FounderOnboarding = lazy(() => import('./pages/onboarding/FounderOnboarding'));
const UniversalOnboarding = lazy(() => import('./pages/onboarding/UniversalOnboarding'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
      <p className="text-white">Loading Azora OS...</p>
    </div>
  </div>
);

export default function AppRoutes() {
  // For demo purposes, we'll use the CEO (Sizwe Ngwenya) as the default user
  // In production, this would come from authentication context
  const currentUserId = 'user_001'; // Sizwe Ngwenya - CEO & CTO

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<UniversalOnboarding />} />
          <Route path="/onboarding/founder" element={<FounderOnboarding />} />
          <Route path="/*" element={
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route index element={<Dashboard userId={currentUserId} />} />
                  <Route path="/dashboard" element={<Dashboard userId={currentUserId} />} />
                  <Route path="/driver" element={<DriverCommandCenter />} />
                  <Route path="/tracking" element={<QuantumTracking />} />
                  <Route path="/ai" element={<QuantumAI />} />
                  <Route path="/evolution" element={<AIEvolution />} />
                  <Route path="/demand-forecasting" element={<DemandForecasting />} />
                  <Route path="/route-optimization" element={<RouteOptimization />} />
                  <Route path="/anomaly-detection" element={<AnomalyDetection />} />
                  <Route path="/fleet-clustering" element={<FleetClustering />} />
                  <Route path="/coldchain" element={<ColdChainCommand />} />
                  <Route path="/safety" element={<UniversalSafetyCommand />} />
                  <Route path="/klipp" element={<KlippPage />} />
                  <Route path="/genesis-chamber" element={<GenesisChamberPage />} />
                  <Route path="/ledger" element={<LedgerPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/live-trip" element={<LiveTripTrackingPage />} />

                  {/* Dashboard Pages - Role-based access */}
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

                  {/* Retail Partner Dashboard */}
                  <Route path="/retail-partner" element={<Dashboard userId={currentUserId} />} />

                  {/* New Enterprise Services Routes */}
                  <Route path="/admin" element={<AdminPortalPage />} />
                  <Route path="/employee-onboarding" element={<EmployeeOnboardingPage />} />
                  <Route path="/documents" element={<DocumentVaultPage />} />
                  <Route path="/traffic" element={<TrafficRoutingPage />} />
                  <Route path="/trip-ai" element={<AITripPlanningPage />} />
                  <Route path="/accessibility" element={<AccessibilityPage />} />
                  <Route path="/hr-ai" element={<HRDeputyCEOPage />} />
                </Routes>
              </Suspense>
            </DashboardLayout>
          } />
        </Routes>
      </Suspense>
    </div>
  );
}