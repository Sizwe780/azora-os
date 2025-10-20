import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CommandPaletteProvider } from './context/CommandPaletteContext';
import { NudgeProvider } from './context/NudgeContext'; // Import NudgeProvider
import NudgeBanner from './components/global/NudgeBanner'; // Import NudgeBanner
import MainLayout from './components/layout/MainLayout';
import WalletPage from './pages/wallet/WalletPage';
import TransactionsPage from './pages/wallet/TransactionsPage';
import LiveComplianceDashboard from './pages/compliance/LiveComplianceDashboard';
import MissionControl from './pages/monitoring/MissionControl';

// Static commands for now. AI will power this later.
const initialCommands = [
  { id: 'nav-wallet', title: 'Go to Wallet', action: (navigate) => navigate('/wallet') },
  { id: 'nav-transactions', title: 'View Transactions', action: (navigate) => navigate('/wallet/transactions') },
  { id: 'nav-compliance', title: 'Open Live Compliance Feed', action: (navigate) => navigate('/compliance/live') },
  { id: 'theme-dark', title: 'Change Theme to Dark', action: () => console.log('Theme changed to Dark') },
  { id: 'theme-light', title: 'Change Theme to Light', action: () => console.log('Theme changed to Light') },
];

const CommandPalette = () => {
  const { isOpen, closePalette } = useCommandPalette();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCommands, setFilteredCommands] = useState(initialCommands);
  const navigate = useNavigate();

  useEffect(() => {
    
    if (searchTerm) {
      
      setFilteredCommands(
        initialCommands.filter(cmd =>
          cmd.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredCommands(initialCommands);
    }
  }, [searchTerm]);

  const handleCommand = (command) => {
    command.action(navigate);
    closePalette();
    setSearchTerm('');
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      closePalette();
    }
  }, [closePalette]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20">
      <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg text-white" role="dialog">
        <input
          type="text"
          autoFocus
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type a command or search..."
          className="w-full p-4 bg-gray-900 text-white rounded-t-lg focus:outline-none"
        />
        <ul className="p-2 max-h-80 overflow-y-auto">
          {filteredCommands.map((cmd) => (
            <li
              key={cmd.id}
              onClick={() => handleCommand(cmd)}
              className="p-3 hover:bg-gray-700 rounded-md cursor-pointer"
            >
              {cmd.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

function App() {
  return (
    <NudgeProvider>
      <CommandPaletteProvider>
        <Router>
          <AppRoutes />
          <NudgeBanner />
        </Router>
      </CommandPaletteProvider>
    </NudgeProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/wallet" element={
        <ProtectedRoute>
          <MainLayout>
            <WalletPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/wallet/transactions" element={
        <ProtectedRoute>
          <MainLayout>
            <TransactionsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/compliance/live" element={
        <ProtectedRoute>
          <MainLayout>
            <LiveComplianceDashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('azora_token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default App;

