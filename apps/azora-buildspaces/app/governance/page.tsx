"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Server, Cpu, ShieldCheck } from "lucide-react";

export default function GovernanceBoard() {
    const [nodes, setNodes] = useState([
        { id: "Citadel", type: "NPU", status: "Active", load: 12, ip: "localhost" },
        { id: "Forge-X515", type: "CPU", status: "Active", load: 45, ip: "10.0.0.1" }
    ]);

    const [logs, setLogs] = useState([
        { id: 1, time: "13:40:02", agent: "Elara", action: "Scaffolded Project", node: "Forge-X515" },
        { id: 2, time: "13:41:15", agent: "Zuri", action: "Updated Design Tokens", node: "Citadel" },
        { id: 3, time: "13:42:30", agent: "Supervisor", action: "Negotiated Task #402", node: "Citadel" }
    ]);

    return (
        <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-slate-100">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold tracking-tight text-amber-500">Azora Governance Board</h1>
                <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                    <ShieldCheck className="w-4 h-4 mr-2" /> Sovereign Mesh Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {nodes.map(node => (
                    <Card key={node.id} className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-medium text-slate-300">
                                {node.id} <span className="text-xs text-slate-500 ml-2">({node.ip})</span>
                            </CardTitle>
                            <Server className="h-5 w-5 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4 mt-4">
                                <div className="flex-1">
                                    <p className="text-sm text-slate-400">Hardware Type</p>
                                    <p className="text-lg font-semibold text-slate-200">{node.type}</p>
                                </div>
                                <div className="flex-1 text-right">
                                    <p className="text-sm text-slate-400">Current Load</p>
                                    <p className="text-lg font-semibold text-amber-400">{node.load}%</p>
                                </div>
                            </div>
                            <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-amber-500 h-full transition-all duration-500"
                                    style={{ width: `${node.load}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-amber-500" /> Agent Activity Log
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {logs.map(log => (
                            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                <div className="flex items-center space-x-4">
                                    <span className="text-xs text-slate-500 font-mono">{log.time}</span>
                                    <Badge className="bg-amber-900/50 text-amber-200 border-amber-800">{log.agent}</Badge>
                                    <span className="text-sm text-slate-300">{log.action}</span>
                                </div>
                                <span className="text-xs text-slate-500 italic">via {log.node}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
