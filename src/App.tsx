import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { MetricsProvider } from './context/MetricsProvider';
import { AlertProvider } from './context/AlertProvider';
import { AdvisorProvider } from './context/AdvisorProvider';
import { ModernDashboardLayout } from './layouts/ModernDashboardLayout';
import { Toaster } from './app/Toaster';
import { ThemeProvider } from './context/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <MetricsProvider>
        <AlertProvider>
          <AdvisorProvider>
            <BrowserRouter>
              <ModernDashboardLayout>
                <AppRoutes />
                <Toaster />
              </ModernDashboardLayout>
            </BrowserRouter>
          </AdvisorProvider>
        </AlertProvider>
      </MetricsProvider>
    </ThemeProvider>
  );
}