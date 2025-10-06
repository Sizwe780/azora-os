import React from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ReputationEconomyWidget } from './components/azora/ReputationEconomyWidget';
import { GovernanceProposalsWidget } from './components/azora/GovernanceProposalsWidget';
import { ConstitutionWidget } from './components/azora/ConstitutionWidget';
import { LeaderboardWidget } from './components/azora/LeaderboardWidget';
import { NotificationProvider } from './atomic/NotificationProvider';
import { ThemeProvider } from './context/ThemeProvider';

const USER_ID = 'demo_user';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <DashboardLayout>
          <div className="space-y-6">
            <ReputationEconomyWidget userId={USER_ID} />
            <GovernanceProposalsWidget userId={USER_ID} />
            <ConstitutionWidget />
            <LeaderboardWidget />
          </div>
        </DashboardLayout>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
