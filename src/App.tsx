import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider.js';
import { NotificationProvider } from './atomic/NotificationProvider';
import AppRoutes from './AppRoutes';
import PWAInstallPrompt from './components/azora/PWAInstallPrompt';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
          <div className="bg-gradient-to-r from-yellow-400 to-cyan-400 text-white p-8 m-8 rounded-2xl shadow-2xl text-2xl font-bold">
             If you see this with a fancy gradient, Tailwind is working!
          </div>
          <PWAInstallPrompt />
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}
export default App;