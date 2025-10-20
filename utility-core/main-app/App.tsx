import React from 'react';
import AppRoutes from './AppRoutes';
import { NotificationProvider } from './context/NotificationProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { I18nProvider } from './lib/i18n/i18nContext';
import { Toaster } from './app/Toaster';
import { SkipLink } from './lib/accessibility';
import { NeuralInterface } from './src/components/NeuralInterface';

export default function App() {
  const handleIntent = (intent: string) => {
    console.log('Processing intent:', intent);
    // Here we would integrate with the Azora AI to process the intent
    // and assemble the appropriate neural pathway
  };

  return (
    <I18nProvider>
      <ThemeProvider>
        <NotificationProvider>
          <SkipLink />
          <NeuralInterface onIntent={handleIntent} />
          <Toaster />
        </NotificationProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}