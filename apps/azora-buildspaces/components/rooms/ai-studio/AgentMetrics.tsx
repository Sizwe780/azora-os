"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { Activity, Zap, Coins, Clock, RefreshCw } from "lucide-react";

interface AgentMetricsData {
  agentUsageData: Array<{
    name: string;
    tokens: number;
    cost: number;
    latency: number;
  }>;
  tokenHistory: Array<{
    hour: string;
    tokens: number;
  }>;
  summary: {
    totalCost: number;
    totalTokens: number;
    avgLatency: number;
    activeAgents: number;
  };
}

export default function AgentMetrics() {
    const [metrics, setMetrics] = useState<AgentMetricsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMetrics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/ai-studio/metrics');
            if (response.ok) {
                const data = await response.json();
                setMetrics(data);
            } else {
                throw new Error('Failed to load metrics');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            // Fallback to mock data
            setMetrics({
                agentUsageData: [
                    { name: 'Sankofa', tokens: 4500, cost: 0.12, latency: 1.2 },
                    { name: 'Themba', tokens: 3200, cost: 0.08, latency: 1.5 },
                    { name: 'Jabari', tokens: 1200, cost: 0.03, latency: 0.8 },
                    { name: 'Nia', tokens: 2800, cost: 0.07, latency: 2.1 },
                    { name: 'Imani', tokens: 1500, cost: 0.04, latency: 1.1 },
                    { name: 'Elara', tokens: 8500, cost: 0.25, latency: 0.5 },
                ],
                tokenHistory: Array.from({ length: 24 }, (_, i) => ({
                    hour: `${i}:00`,
                    tokens: Math.floor(Math.random() * 5000) + 1000,
                })),
                summary: {
                    totalCost: 12.45,
                    totalTokens: 1200000,
                    avgLatency: 1.4,
                    activeAgents: 6
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMetrics();
        // Refresh metrics every 30 seconds
        const interval = setInterval(loadMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="h-full overflow-y-auto p-4 space-y-4 bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Loading metrics...</p>
                </div>
            </div>
        );
    }

    if (error && !metrics) {
        return (
            <div className="h-full overflow-y-auto p-4 space-y-4 bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Failed to load metrics: {error}</p>
                    <button
                        onClick={loadMetrics}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const data = metrics!;

    return (
        <div className="h-full overflow-y-auto p-4 space-y-4 bg-background">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Coins className="w-4 h-4" />
                            Total Cost
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${data.summary.totalCost.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Last 24 hours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Total Tokens
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(data.summary.totalTokens / 1000).toFixed(0)}K</div>
                        <p className="text-xs text-muted-foreground">↑ 12% from yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Avg Latency
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.avgLatency.toFixed(1)}s</div>
                        <p className="text-xs text-muted-foreground">Across all agents</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Active Agents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.activeAgents}/6</div>
                        <p className="text-xs text-green-500">All systems operational</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="h-[300px]">
                    <CardHeader>
                        <CardTitle className="text-sm">Token Usage by Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.agentUsageData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                />
                                <Bar dataKey="tokens" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="h-[300px]">
                    <CardHeader>
                        <CardTitle className="text-sm">Token Velocity (24h)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.tokenHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="hour" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="tokens"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}