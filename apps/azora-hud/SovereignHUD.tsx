"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph3D to avoid SSR issues with WebGL
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export interface HUDNode {
    id: string;
    isGhost?: boolean;
    type: string;
}

export interface HUDLink {
    source: string;
    target: string;
    value: number;
}

export interface HUDData {
    nodes: HUDNode[];
    links: HUDLink[];
}

export const SovereignHUD = ({ data }: { data: HUDData }) => {
    const graphData = useMemo(() => data, [data]);

    return (
        <div className="fixed inset-0 z-50 pointer-events-none bg-transparent overflow-hidden">
            {/* 3D Force Graph Layer */}
            <div className="absolute inset-0 opacity-60">
                <ForceGraph3D
                    graphData={graphData}
                    backgroundColor="rgba(0,0,0,0)"
                    nodeColor={(node: any) => node.isGhost ? '#4A0E0E' : '#D4AF37'} // Sankofa Maroon vs Citadel Gold
                    linkColor={() => 'rgba(212, 175, 55, 0.2)'}
                    nodeOpacity={0.8}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={(d: any) => d.value * 0.001}
                    nodeLabel={(node: any) => `${node.type}: ${node.id}`}
                    showNavInfo={false}
                    enablePointerInteraction={false} // HUD is non-interactive overlay
                />
            </div>

            {/* Agent Pulse Overlay */}
            <div className="absolute bottom-8 right-8 p-6 bg-slate-950/40 backdrop-blur-md border border-amber-500/30 rounded-2xl">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                        <div className="absolute inset-0 w-3 h-3 bg-amber-500 rounded-full" />
                    </div>
                    <div>
                        <p className="text-xs font-mono text-amber-500/70 uppercase tracking-widest">Mesh Status</p>
                        <p className="text-sm font-bold text-slate-100">Sovereign Intelligence Active</p>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>NPU LOAD</span>
                        <span className="text-amber-400">105 t/s</span>
                    </div>
                    <div className="w-full bg-slate-800/50 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[45%]" />
                    </div>
                </div>
            </div>

            {/* Temporal Indicator */}
            <div className="absolute top-8 left-8">
                <p className="text-[10px] font-mono text-amber-500/50 uppercase tracking-[0.2em]">Temporal Knowledge Graph</p>
                <h2 className="text-2xl font-light text-slate-100 tracking-tight">Sankofa Chronos <span className="text-amber-500 font-bold">v1.0</span></h2>
            </div>
        </div>
    );
};

export default SovereignHUD;
