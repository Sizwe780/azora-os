import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import WalletPage from './pages/wallet/WalletPage';
import TransactionsPage from './pages/wallet/TransactionsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('azora_token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
