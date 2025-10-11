import React from 'react';
import { Suspense, lazy } from 'react';
import { Skeleton } from '../components/ui/Skeleton';
import { ProposalVolumeChart } from '../components/metrics/ProposalVolumeChart';
import { RepDistributionChart } from '../components/metrics/RepDistributionChart';
import { FederationTrafficWidget } from '../components/metrics/FederationTrafficWidget';
import { AlertBanner } from '../components/ui/AlertBanner';
import { useAlerting } from '../hooks/useAlerting';
import { CommandCenter } from '../app/CommandCenter';
import { AZORAFounderWidget } from '../app/AZORAFounderWidget';
import { GlassCard } from '../components/ui/GlassCard';

const GovernanceProposalsWidget = lazy(() => import('../app/GovernanceProposalsWidget'));
const GovernanceProposalForm = lazy(() => import('../app/GovernanceProposalForm'));
const ConstitutionWidget = lazy(() => import('../app/ConstitutionWidget'));
const ProtocolUpgradeWidget = lazy(() => import('../app/ProtocolUpgradeWidget'));
const InterNationWidget = lazy(() => import('../app/FederationWidget'));
const InviteNationForm = lazy(() => import('../app/InviteNationForm'));
const ReputationBridgeWidget = lazy(() => import('../app/ReputationBridgeWidget'));
const CrossNationProposalsWidget = lazy(() => import('../app/CrossNationProposalsWidget'));
const LeaderboardWidget = lazy(() => import('../app/LeaderboardWidget'));
const ReputationMilestonesWidget = lazy(() => import('../app/ReputationMilestonesWidget'));
const DelegateReputationWidget = lazy(() => import('../app/DelegateReputationWidget'));

export default function Dashboard({ userId = 'demo_user' }: { userId?: string }) {
  useAlerting();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-cyan-300 mb-2">Command Center</h1>
        <p className="text-white/70">Azora OS Dashboard - All Systems Operational</p>
      </div>
      <CommandCenter />
      <AlertBanner />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AZORA AI Founder Widget */}
        <section id="azora-founder" className="col-span-full">
          <AZORAFounderWidget />
        </section>
        {/* Metrics Section */}
        <section id="metrics" className="col-span-full space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Metrics</h2>
            <div className="space-y-6">
              <ProposalVolumeChart />
              <RepDistributionChart />
              <FederationTrafficWidget />
            </div>
          </GlassCard>
        </section>
        
        {/* Governance Section */}
        <section id="governance" className="col-span-full lg:col-span-2 space-y-6">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <GovernanceProposalForm userId={userId} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-60 w-full" />}>
          <GovernanceProposalsWidget userId={userId} />
        </Suspense>
      </section>
        {/* Constitution & Upgrades */}
        <section id="constitution" className="lg:col-span-1 space-y-6">
          <Suspense fallback={<Skeleton className="h-60 w-full" />}>
            <ConstitutionWidget />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-60 w-full" />}>
            <ProtocolUpgradeWidget userId={userId} />
          </Suspense>
        </section>
        
        {/* Federation */}
        <section id="federation" className="col-span-full space-y-6">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <InviteNationForm />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-60 w-full" />}>
          <InterNationWidget userId={userId} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-60 w-full" />}>
          <ReputationBridgeWidget userId={userId} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-60 w-full" />}>
          <CrossNationProposalsWidget userId={userId} />
        </Suspense>
      </section>
        {/* Reputation */}
        <section id="reputation" className="col-span-full lg:col-span-1 space-y-6">
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <LeaderboardWidget userId={userId} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <ReputationMilestonesWidget userId={userId} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <DelegateReputationWidget userId={userId} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
