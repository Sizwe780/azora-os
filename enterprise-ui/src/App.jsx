import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './contexts/AuthContext'
import { useTheme } from './contexts/ThemeContext'

// Layout Components
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import Onboarding from './pages/Onboarding'
import Subscription from './pages/Subscription'

// Service Panels
import RetailPartnerPanel from './pages/services/RetailPartnerPanel'
import EVLeaderPanel from './pages/services/EVLeaderPanel'
import NeuralContextPanel from './pages/services/NeuralContextPanel'
import SafetyOrchestratorPanel from './pages/services/SafetyOrchestratorPanel'
import ColdChainPanel from './pages/services/ColdChainPanel'
import TrackingEnginePanel from './pages/services/TrackingEnginePanel'
import DeepMindPanel from './pages/services/DeepMindPanel'
import AnalyticsPanel from './pages/services/AnalyticsPanel'
// import CompliancePanel from './pages/services/CompliancePanel'
import DocumentVaultPanel from './pages/services/DocumentVaultPanel'
import MaintenancePanel from './pages/services/MaintenancePanel'
import OnboardingPanel from './pages/services/OnboardingPanel'
import TrafficRoutingPanel from './pages/services/TrafficRoutingPanel'
import CryptoLedgerPanel from './pages/services/CryptoLedgerPanel'
import TripPlanningPanel from './pages/services/TripPlanningPanel'
import TMSPanel from './pages/services/TMSPanel'
import KlippPanel from './pages/services/KlippPanel'
import AdminPanel from './pages/services/AdminPanel'
import DriverBehaviorPanel from './pages/services/DriverBehaviorPanel'
import DocumentVerificationPanel from './pages/services/DocumentVerificationPanel'
import AIEvolutionPanel from './pages/services/AIEvolutionPanel'
import AccessibilityPanel from './pages/services/AccessibilityPanel'
import HRDeputyPanel from './pages/services/HRDeputyPanel'
import AIAssistantPanel from './pages/services/AIAssistantPanel'

function App() {
  const { user, loading } = useAuth()
  const { theme } = useTheme()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-primary)',
            borderTop: '3px solid var(--accent-primary)',
            borderRadius: '50%'
          }}
        />
      </div>
    )
  }

  return (
    <div data-theme={theme}>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/*" element={
            user ? <Navigate to="/dashboard" replace /> : (
              <AuthLayout>
                <Routes>
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="*" element={<Navigate to="/auth/login" replace />} />
                </Routes>
              </AuthLayout>
            )
          } />

          {/* Onboarding Route */}
          <Route path="/onboarding" element={
            user && !user.onboardingComplete ? <Onboarding /> : <Navigate to="/dashboard" replace />
          } />

          {/* Protected Routes */}
          <Route path="/*" element={
            !user ? <Navigate to="/auth/login" replace /> : 
            user && !user.onboardingComplete ? <Navigate to="/onboarding" replace /> : (
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/subscription" element={<Subscription />} />
                  
                  {/* Service Routes */}
                  <Route path="/services/retail-partner" element={<RetailPartnerPanel />} />
                  <Route path="/services/ev-leader" element={<EVLeaderPanel />} />
                  <Route path="/services/neural-context" element={<NeuralContextPanel />} />
                  <Route path="/services/safety-orchestrator" element={<SafetyOrchestratorPanel />} />
                  <Route path="/services/cold-chain" element={<ColdChainPanel />} />
                  <Route path="/services/tracking-engine" element={<TrackingEnginePanel />} />
                  <Route path="/services/deep-mind" element={<DeepMindPanel />} />
                  <Route path="/services/analytics" element={<AnalyticsPanel />} />
                  <Route path="/services/compliance" element={<CompliancePanel />} />
                  <Route path="/services/document-vault" element={<DocumentVaultPanel />} />
                  <Route path="/services/maintenance" element={<MaintenancePanel />} />
                  <Route path="/services/employee-onboarding" element={<OnboardingPanel />} />
                  <Route path="/services/traffic-routing" element={<TrafficRoutingPanel />} />
                  <Route path="/services/crypto-ledger" element={<CryptoLedgerPanel />} />
                  <Route path="/services/trip-planning" element={<TripPlanningPanel />} />
                  <Route path="/services/tms" element={<TMSPanel />} />
                  <Route path="/services/klipp" element={<KlippPanel />} />
                  <Route path="/services/admin" element={<AdminPanel />} />
                  <Route path="/services/driver-behavior" element={<DriverBehaviorPanel />} />
                  <Route path="/services/document-verification" element={<DocumentVerificationPanel />} />
                  <Route path="/services/ai-evolution" element={<AIEvolutionPanel />} />
                  <Route path="/services/accessibility" element={<AccessibilityPanel />} />
                  <Route path="/services/hr-deputy" element={<HRDeputyPanel />} />
                  <Route path="/services/ai-assistant" element={<AIAssistantPanel />} />
                  
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </MainLayout>
            )
          } />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
