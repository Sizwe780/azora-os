import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import MainDashboard from './pages/MainDashboard';
import LedgerPage from './pages/LedgerPage';
import ContractsPage from './pages/ContractsPage';
import ProfilePage from './pages/ProfilePage';
import NationPage from './pages/NationPage';
import FederationPage from './pages/FederationPage';
import AdvisorPage from './pages/AdvisorPage';
import Jobs from './pages/Jobs';
import DispatchPage from './pages/DispatchPage';
import DriversAdmin from './pages/DriversAdmin';
import DriverPage from './pages/Driver';
import SubscriptionPage from './pages/Subscription';
import PartnerDashboard from './pages/PartnerDashboard';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import KlippPage from './pages/KlippPage';
import LoginPage from './pages/LoginPage';

// A simple auth check. In a real app, this would be more robust.
const isAuthenticated = () => {
  // For now, let's simulate being logged in.
  // To test the login page, set this to false.
  return sessionStorage.getItem('azora-auth') === 'true';
};

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Wrap every page in DashboardLayout for the premium glassmorphic UI on every route
export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
            <PrivateRoute>
              <DashboardLayout><MainDashboard /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/klipp" element={
            <PrivateRoute>
              <DashboardLayout><KlippPage /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/ledger" element={
            <PrivateRoute>
              <DashboardLayout><LedgerPage /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/contracts" element={
            <PrivateRoute>
              <DashboardLayout><ContractsPage /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/profile" element={
            <PrivateRoute>
              <DashboardLayout><ProfilePage /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/nation" element={
            <PrivateRoute>
              <DashboardLayout><NationPage /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/federation" element={
            <PrivateRoute>
              <DashboardLayout><FederationPage /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/advisor" element={
            <PrivateRoute>
              <DashboardLayout><AdvisorPage /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/jobs" element={
            <PrivateRoute>
              <DashboardLayout><Jobs /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/dispatch" element={
            <PrivateRoute>
              <DashboardLayout><DispatchPage /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/drivers" element={
            <PrivateRoute>
              <DashboardLayout><DriversAdmin /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/driver" element={
            <PrivateRoute>
              <DashboardLayout><DriverPage driverId="driver_demo" /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/subscription" element={
            <PrivateRoute>
              <DashboardLayout><SubscriptionPage companyId="demo_company" /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/partners" element={
            <PrivateRoute>
              <DashboardLayout><PartnerDashboard /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/billing" element={
            <PrivateRoute>
              <DashboardLayout><Billing companyId="demo_company" /></DashboardLayout>
            </PrivateRoute>
          } 
        />
        <Route path="/settings" element={
            <PrivateRoute>
              <DashboardLayout><Settings companyId="demo_company" /></DashboardLayout>
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}