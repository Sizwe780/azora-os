import React from 'react';
import { ThemeProvider } from './context/ThemeProvider';
import { NotificationProvider } from './atomic/NotificationProvider';
import { DashboardLayout } from './layouts/DashboardLayout';
import Sidebar from './components/azora/Sidebar';
import ProfileCard from './components/azora/molecules/ProfileCard';
import Heading from './components/azora/atoms/Heading';
import Skeleton from './components/azora/atoms/Skeleton';
import GlassPanel from './components/azora/atoms/GlassPanel';
import { ReputationEconomyWidget } from './components/azora/ReputationEconomyWidget';
import { GovernanceProposalsWidget } from './components/azora/GovernanceProposalsWidget';
import { ConstitutionWidget } from './components/azora/ConstitutionWidget';
import LeaderboardWidget from './components/azora/LeaderboardWidget';
// Add other components/widgets as needed

const USER_ID = 'demo_user';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <DashboardLayout>
          <Sidebar isOpen={true} />
          <div className="space-y-6">
            <ProfileCard username="Demo User" role="Citizen" status="online" />
            <GlassPanel>
              <Heading level={2}>Azora Dashboard</Heading>
              <Skeleton lines={2} />
            </GlassPanel>
            <ReputationEconomyWidget userId={USER_ID} />
            <GovernanceProposalsWidget userId={USER_ID} />
            <ConstitutionWidget />
            <LeaderboardWidget />
            {/* Add other widgets/panels here */}
          </div>
        </DashboardLayout>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;