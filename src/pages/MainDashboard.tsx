import React from 'react';
import GlassPanel from '../components/azora/atoms/GlassPanel';
import Heading from '../components/azora/atoms/Heading';
import Skeleton from '../components/azora/atoms/Skeleton';
import ProfileCard from '../components/azora/molecules/ProfileCard';
import AdvisorPanel from '../components/azora/AdvisorPanel';
import FederationWidget from '../components/azora/FederationWidget';
import { ReputationEconomyWidget } from '../components/azora/ReputationEconomyWidget';
import { GovernanceProposalsWidget } from '../components/azora/GovernanceProposalsWidget';
import { ConstitutionWidget } from '../components/azora/ConstitutionWidget';
import LeaderboardWidget from '../components/azora/LeaderboardWidget';

export default function MainDashboard() {
  return (
    <div className="space-y-6 p-6">
      <GlassPanel className="flex flex-col items-center p-8 mb-6">
        <Heading level={1}>Azora Intelligent Logistics Console</Heading>
        <Skeleton lines={1} className="w-1/2 mx-auto" />
      </GlassPanel>
      <ProfileCard username="Demo User" role="Citizen" status="online" />
      <AdvisorPanel />
      <FederationWidget userId="demo_user" />
      <ReputationEconomyWidget userId="demo_user" />
      <GovernanceProposalsWidget userId="demo_user" />
      <ConstitutionWidget />
      <LeaderboardWidget />
    </div>
  );
}