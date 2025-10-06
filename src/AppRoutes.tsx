import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainDashboard />} />
      <Route path="/ledger" element={<LedgerPage />} />
      <Route path="/contracts" element={<ContractsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/nation" element={<NationPage />} />
      <Route path="/federation" element={<FederationPage />} />
      <Route path="/advisor" element={<AdvisorPage />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/dispatch" element={<DispatchPage />} />
      <Route path="/drivers" element={<DriversAdmin />} />
      <Route path="/driver" element={<DriverPage driverId="driver_demo" />} />
      <Route path="/subscription" element={<SubscriptionPage companyId="demo_company" />} />
      <Route path="/partners" element={<PartnerDashboard />} />
      <Route path="/billing" element={<Billing companyId="demo_company" />} />
      <Route path="/settings" element={<Settings companyId="demo_company" />} />
    </Routes>
  );
}