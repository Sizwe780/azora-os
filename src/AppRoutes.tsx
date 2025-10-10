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

export default function AppRoutes() {
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
      </Routes>
    </DashboardLayout>
  );
}