import React from 'react';
import AppRoutes from './AppRoutes';
import { NotificationProvider } from './context/NotificationProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { Toaster } from './app/Toaster';
import { SkipLink } from './lib/accessibility';

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <SkipLink />
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster />
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
}