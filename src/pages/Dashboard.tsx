import React, { Suspense, lazy } from 'react';
import { ModernDashboardLayout } from '../layouts/ModernDashboardLayout';
import { Skeleton } from '../components/ui/Skeleton';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ProposalVolumeChart } from '../components/metrics/ProposalVolumeChart';
import { RepDistributionChart } from '../components/metrics/RepDistributionChart';
import { FederationTrafficWidget } from '../components/metrics/FederationTrafficWidget';
import { AlertBanner } from '../components/ui/AlertBanner';
import { useAlerting } from '../hooks/useAlerting';
import { CommandCenter } from '../components/azora/CommandCenter';
import { AZORAFounderWidget } from '../components/azora/AZORAFounderWidget';

const GovernanceProposalsWidget = lazy(() => import('../components/azora/GovernanceProposalsWidget.tsx').then(mod => ({ default: mod.default as unknown as React.ComponentType<any> })));
const GovernanceProposalForm = lazy(() => import('../components/azora/GovernanceProposalForm.tsx').then(mod => ({ default: mod.default as unknown as React.ComponentType<any> })));
const ConstitutionWidget = lazy(() => import('../components/azora/ConstitutionWidget.tsx').then(mod => ({ default: mod.default as unknown as React.ComponentType<any> })));
const ProtocolUpgradeWidget = lazy(() => import('../components/azora/ProtocolUpgradeWidget.tsx').then(mod => ({ default: mod.default as unknown as React.ComponentType<any> })));
const InterNationWidget = lazy(() => import('../components/azora/FederationWidget.tsx').then(mod => ({ default: mod.default as unknown as React.ComponentType<any> })));
const InviteNationForm = lazy(() => import('../components/azora/InviteNationForm.tsx').then(mod => ({ default: mod.default as unknown as React.ComponentType<any> })));
const ReputationBridgeWidget = lazy(() => import('../components/azora/ReputationBridgeWidget.tsx').then(mod => ({ default: mod.default as unknown as React.ComponentType<any> })));
const CrossNationProposalsWidget = lazy(() => import('../components/azora/CrossNationProposalsWidget.tsx').then(mod => ({ default: mod.default as unknown as React.ComponentType<any> })));
const LeaderboardWidget = lazy(() => import('../components/azora/LeaderboardWidget.tsx').then(mod => ({ default: mod.default as unknown as React.ComponentType<any> })));
const ReputationMilestonesWidget = lazy(() => import('../components/azora/ReputationMilestonesWidget.tsx').then(mod => ({ default: mod.default as unknown as React.ComponentType<any> })));
const DelegateReputationWidget = lazy(() => import('../components/azora/DelegateReputationWidget.tsx').then(mod => ({ default: mod.default as unknown as React.ComponentType<any> })));

export default function Dashboard({ userId = 'demo_user' }: { userId?: string }) {
  useAlerting();
  return (
    <ModernDashboardLayout>
      <CommandCenter />
      <AlertBanner />
      <div className="absolute top-4 right-6">
        <ThemeToggle />
      </div>
      {/* AZORA AI Founder Widget */}
      <section id="azora-founder" className="col-span-2">
        <AZORAFounderWidget />
      </section>
      {/* Metrics Section */}
      <section id="metrics" className="col-span-2 space-y-6">
        <ProposalVolumeChart />
        <RepDistributionChart />
        <FederationTrafficWidget />
      </section>
      {/* Governance Section */}
      <section id="governance" className="col-span-2 space-y-6">
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <GovernanceProposalForm userId={userId} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-60 w-full" />}>
          <GovernanceProposalsWidget userId={userId} />
        </Suspense>
      </section>
      {/* Constitution & Upgrades */}
      <section id="constitution" className="space-y-6">
        <Suspense fallback={<Skeleton className="h-60 w-full" />}>
          <ConstitutionWidget />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-60 w-full" />}>
          <ProtocolUpgradeWidget userId={userId} />
        </Suspense>
      </section>
      {/* Federation */}
      <section id="federation" className="col-span-2 space-y-6">
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
      <section id="reputation" className="space-y-6">
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
    </ModernDashboardLayout>
  );
}
