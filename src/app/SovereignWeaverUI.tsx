import React from 'react';
// src/components/azora/SovereignWeaverUI.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/ui/GlassCard';
import TrackingMap from './TrackingMap'; // The AI-powered map

// --- Type Definitions ---
type MissionStep = {
  id: string;
  action: string;
  params: Record<string, any>;
  status: 'pending' | 'approved' | 'executing' | 'complete' | 'rejected';
};

type MissionProtocol = {
  missionId: string;
  title: string;
  summary: string;
  steps: MissionStep[];
  confidence: number;
  impact: string;
};

// --- The Golden Egg: The Sovereign Weaver UI ---
export default function SovereignWeaverUI() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [mission, setMission] = useState<MissionProtocol | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Periodically check for new missions from the Weaver AI
  useEffect(() => {
    const interval = setInterval(() => {
      if (isEnabled && !mission) {
        fetchMission();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isEnabled, mission]);

  const fetchMission = async () => {
    setIsLoading(true);
    try {
      // This endpoint would trigger the new weaverService on the backend
      const res = await axios.post('/api/weaver/generate-mission', {
        objective: 'Optimize long-haul logistics from Johannesburg to Cape Town.',
        context: {
          fleetSize: 50,
          cargoType: 'mixed-goods',
          priority: 'high',
          weather: 'clear',
          knownRisks: ['protest-action-n1-highway', 'congestion-cape-town-port'],
        }
      });
      if (res.data) {
        setMission(res.data);
      }
    } catch (error) {
      console.error("Weaver AI mission generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepApproval = (stepId: string, isApproved: boolean) => {
    if (!mission) return;
    const newSteps = mission.steps.map(step => {
      if (step.id === stepId) {
        return { ...step, status: (isApproved ? 'approved' : 'rejected') as MissionStep['status'] };
      }
      return step;
    });
    setMission({ ...mission, steps: newSteps });
  };

  const executeMission = () => {
    if (!mission) return;
    // In a real app, this would send the approved steps to the backend for execution.
    console.log("Executing mission:", mission.missionId);
    setMission(null); // Reset after execution
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-900 text-white">
      {/* --- Header & Master Control --- */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-300">Azora Sovereign Weaver</h1>
          <p className="text-white/70">Your proactive, generative AI for complex operations.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{isEnabled ? 'Weaver AI is Active' : 'Weaver AI is Disabled'}</span>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${isEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isEnabled ? 'Disable AI' : 'Enable AI'}
          </button>
        </div>
      </div>

      {/* --- Main Interactive Interface --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: AI Map */}
        <div className="lg:col-span-2">
          <GlassCard className="p-4 !bg-slate-800/50 border-cyan-400/20">
            <h2 className="text-xl font-semibold mb-4">Live Operations Map</h2>
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <TrackingMap />
            </div>
          </GlassCard>
        </div>

        {/* Right Panel: The Weaver's Mission Protocol */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 animate-float border-purple-400/30">
            <h2 className="text-xl font-semibold mb-2">Mission Control</h2>
            {isLoading && <p>Weaver is analyzing...</p>}
            {!isEnabled && <p className="text-center text-white/60 p-8">AI is disabled. Enable to receive missions.</p>}
            
            {isEnabled && mission && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-purple-300">{mission.title}</h3>
                <p className="text-sm text-white/80">{mission.summary}</p>
                <p className="text-xs"><strong>Confidence:</strong> {mission.confidence * 100}% | <strong>Impact:</strong> {mission.impact}</p>
                
                <div className="space-y-3 pt-4 border-t border-white/20">
                  {mission.steps.map(step => (
                    <div key={step.id} className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="font-semibold">{step.action}</p>
                      <p className="text-xs text-white/60">{JSON.stringify(step.params)}</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleStepApproval(step.id, true)} className="text-xs bg-green-600 px-2 py-1 rounded">Approve</button>
                        <button onClick={() => handleStepApproval(step.id, false)} className="text-xs bg-red-600 px-2 py-1 rounded">Reject</button>
                        <span className={`text-xs font-bold ml-auto ${step.status === 'approved' ? 'text-green-400' : step.status === 'rejected' ? 'text-red-400' : 'text-gray-400'}`}>{step.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={executeMission} className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold">
                  Execute Approved Steps
                </button>
              </div>
            )}

            {isEnabled && !mission && !isLoading && (
              <div className="text-center text-white/60 p-8">
                <p>The Weaver is observing...</p>
                <p className="text-xs">It will generate a mission when a complex opportunity or risk is identified.</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
