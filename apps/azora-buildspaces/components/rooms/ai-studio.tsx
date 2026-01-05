"use client";

import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Brain, Play, Share2, Settings, Database, Network } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import NotebookInterface from "./ai-studio/AgentWorkflowEditor";
import TrainingDashboard from "./ai-studio/AgentMetrics";
import ModelVisualizer from "./ai-studio/AgentGraph";

export default function AIStudio() {
    const [isTraining, setIsTraining] = useState(false);

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Toolbar */}
            <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 text-purple-500 rounded-md border border-purple-500/20">
                        <Brain className="w-4 h-4" />
                        <span className="text-sm font-medium">AI Studio</span>
                    </div>
                    <span className="text-muted-foreground text-sm">/</span>
                    <span className="text-sm font-medium">Orchestration: Auth-Flow-v1</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        className={`gap-2 ${isTraining ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                        onClick={() => setIsTraining(!isTraining)}
                    >
                        <Play className="w-4 h-4" />
                        {isTraining ? "Stop Execution" : "Run Workflow"}
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Export
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">

                    {/* Left Panel: Workflow Editor */}
                    <ResizablePanel defaultSize={60} minSize={30}>
                        <div className="h-full flex flex-col">
                            <NotebookInterface />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Right Panel: Visualization & Metrics */}
                    <ResizablePanel defaultSize={40} minSize={20}>
                        <ResizablePanelGroup direction="vertical">

                            {/* Top Right: Agent Metrics */}
                            <ResizablePanel defaultSize={50} minSize={20}>
                                <div className="h-full flex flex-col">
                                    <div className="h-10 border-b flex items-center px-4 bg-muted/10 gap-2">
                                        <Database className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Agent Metrics</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <TrainingDashboard isTraining={isTraining} />
                                    </div>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            {/* Bottom Right: Agent Graph */}
                            <ResizablePanel defaultSize={50} minSize={20}>
                                <div className="h-full flex flex-col border-t">
                                    <div className="h-10 border-b flex items-center px-4 bg-muted/10 gap-2">
                                        <Network className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Agent Interaction Graph</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden relative">
                                        <ModelVisualizer />
                                    </div>
                                </div>
                            </ResizablePanel>

                        </ResizablePanelGroup>
                    </ResizablePanel>

                </ResizablePanelGroup>
            </div>
        </div>
    );
}
