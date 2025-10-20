import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

// Wrap every page in DashboardLayout for the premium glassmorphic UI on every route
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout><MainDashboard /></DashboardLayout>} />
      <Route path="/ledger" element={<DashboardLayout><LedgerPage /></DashboardLayout>} />
      <Route path="/contracts" element={<DashboardLayout><ContractsPage /></DashboardLayout>} />
      <Route path="/profile" element={<DashboardLayout><ProfilePage /></DashboardLayout>} />
      <Route path="/nation" element={<DashboardLayout><NationPage /></DashboardLayout>} />
      <Route path="/federation" element={<DashboardLayout><FederationPage /></DashboardLayout>} />
      <Route path="/advisor" element={<DashboardLayout><AdvisorPage /></DashboardLayout>} />
      <Route path="/jobs" element={<DashboardLayout><Jobs /></DashboardLayout>} />
      <Route path="/dispatch" element={<DashboardLayout><DispatchPage /></DashboardLayout>} />
      <Route path="/drivers" element={<DashboardLayout><DriversAdmin /></DashboardLayout>} />
      <Route path="/driver" element={<DashboardLayout><DriverPage driverId="driver_demo" /></DashboardLayout>} />
      <Route path="/subscription" element={<DashboardLayout><SubscriptionPage companyId="demo_company" /></DashboardLayout>} />
      <Route path="/partners" element={<DashboardLayout><PartnerDashboard /></DashboardLayout>} />
      <Route path="/billing" element={<DashboardLayout><Billing companyId="demo_company" /></DashboardLayout>} />
      <Route path="/settings" element={<DashboardLayout><Settings companyId="demo_company" /></DashboardLayout>} />
    </Routes>
  );
}