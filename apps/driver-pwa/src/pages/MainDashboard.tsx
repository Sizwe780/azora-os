import React from "react";
import GlassPanel from "../components/atoms/GlassPanel";
// Import your actual widgets/components here:
import ProfileCard from "../../components/molecules/ProfileCard";
import AdvisorPanel from "../components/AdvisorPanel";
import FederationWidget from "../components/FederationWidget";
import { ReputationEconomyWidget } from "../components/ReputationEconomyWidget";
import { GovernanceProposalsWidget } from "../components/GovernanceProposalsWidget";
import { ConstitutionWidget } from "../components/ConstitutionWidget";
import LeaderboardWidget from "../components/LeaderboardWidget";

export default function MainDashboard() {
  return (
    <div className="w-full max-w-6xl mx-auto px-2 py-8">
      <GlassPanel accent="premium" animated className="mb-8 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-yellow-300 mb-2 text-center">Azora Intelligent Logistics Console</h1>
        <p className="text-lg text-white/70 text-center mb-2">Welcome to your premium dashboard ✨</p>
      </GlassPanel>

      {/* Responsive grid for widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <GlassPanel className="col-span-1">
          <ProfileCard username="Demo User" role="Citizen" status="online" />
        </GlassPanel>
        <GlassPanel className="col-span-1">
          <AdvisorPanel />
        </GlassPanel>
        <GlassPanel className="col-span-1">
          <FederationWidget userId="demo_user" />
        </GlassPanel>
        <GlassPanel className="col-span-1">
          <ReputationEconomyWidget userId="demo_user" />
        </GlassPanel>
        <GlassPanel className="col-span-1">
          <GovernanceProposalsWidget userId="demo_user" />
        </GlassPanel>
        <GlassPanel className="col-span-1">
          <ConstitutionWidget />
        </GlassPanel>
        <GlassPanel className="col-span-1">
          <LeaderboardWidget />
        </GlassPanel>
        {/* Add more GlassPanels with widgets as needed */}
      </div>
    </div>
  );
}