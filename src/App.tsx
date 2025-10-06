import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeProvider';
import { NotificationProvider } from './atomic/NotificationProvider';
import { DashboardLayout } from './layouts/DashboardLayout';
import Sidebar from './components/azora/Sidebar';
import ProfileCard from './components/azora/molecules/ProfileCard';
import AdvisorPanel from './components/azora/AdvisorPanel';
import { ReputationEconomyWidget } from './components/azora/ReputationEconomyWidget';
import { GovernanceProposalsWidget } from './components/azora/GovernanceProposalsWidget';
import { ConstitutionWidget } from './components/azora/ConstitutionWidget';
import LeaderboardWidget from './components/azora/LeaderboardWidget';
import FederationWidget from './components/azora/FederationWidget'; // If exists
import Card from './components/azora/atoms/Card';
import Heading from './components/azora/atoms/Heading';
import Skeleton from './components/azora/atoms/Skeleton';
import GlassPanel from './components/azora/atoms/GlassPanel';

// Logo assets
import logoDark from './assets/logo-dark.png';
import logoLight from './assets/logo-light.png';

const USER_ID = 'demo_user';

function Logo() {
  const { theme } = useTheme();
  return (
    <img
      src={theme === 'dark' ? logoDark : logoLight}
      alt="Azora Logo"
      style={{ width: 128, margin: '0 auto' }}
    />
  );
}

function MainDashboard() {
  return (
    <DashboardLayout>
      <Sidebar isOpen={true} />
      <div className="space-y-6">
        <GlassPanel className="flex flex-col items-center p-8">
          <Logo />
          <Heading level={1}>Azora Intelligent Logistics Console</Heading>
          <Skeleton lines={1} className="w-1/2 mx-auto" />
        </GlassPanel>
        <ProfileCard username="Demo User" role="Citizen" status="online" />
        <AdvisorPanel />
        <Card>
          <Heading>Federation</Heading>
          <FederationWidget userId={USER_ID} />
        </Card>
        <Card>
          <ReputationEconomyWidget userId={USER_ID} />
        </Card>
        <Card>
          <GovernanceProposalsWidget userId={USER_ID} />
        </Card>
        <Card>
          <ConstitutionWidget />
        </Card>
        <Card>
          <LeaderboardWidget />
        </Card>
        {/* Add any additional components here */}
      </div>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <MainDashboard />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;