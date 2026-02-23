"use client";

import { useState, useEffect, useMemo } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Palette, MessageSquare, CheckSquare, Share2, Users, Settings, Bell, Wifi, WifiOff } from "lucide-react";
import VideoConference from "./VideoConference";
import Whiteboard from "./Whiteboard";
import Chat from "./Chat";
import TaskBoard from "./TaskBoard";

export default function CollaborationPod() {
    const [activeTab, setActiveTab] = useState("video");
    const [notifications, setNotifications] = useState(5);
    const [isConnected, setIsConnected] = useState(false);

    // Initialize Yjs for real-time collaboration
    const { ydoc, provider } = useMemo(() => {
        const doc = new Y.Doc();
        const wsProvider = typeof window !== 'undefined' 
            ? new WebsocketProvider('wss://demos.yjs.dev', 'azora-buildspaces-pod', doc)
            : null;
        return { ydoc: doc, provider: wsProvider };
    }, []);

    useEffect(() => {
        if (provider) {
            provider.on('status', (event: any) => {
                setIsConnected(event.status === 'connected');
            });
        }
        return () => provider?.destroy();
    }, [provider]);

    const tabs = [
        { id: "video", label: "Video Call", icon: Video, component: VideoConference },
        { id: "whiteboard", label: "Whiteboard", icon: Palette, component: Whiteboard },
        { id: "chat", label: "Team Chat", icon: MessageSquare, component: Chat },
        { id: "tasks", label: "Task Board", icon: CheckSquare, component: TaskBoard },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || VideoConference;

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        Collaboration Pod
                        <Badge variant="secondary" className={isConnected ? "bg-green-600" : "bg-red-600"}>
                            {isConnected ? "Connected" : "Offline"}
                        </Badge>
                    </h1>
                    <p className="text-slate-400">Real-time team collaboration powered by Yjs</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        {isConnected ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
                        <span>{isConnected ? "Sync Active" : "Sync Paused"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="relative">
                            <Bell className="w-4 h-4" />
                            {notifications > 0 && (
                                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                                    {notifications}
                                </Badge>
                            )}
                        </Button>
                        <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Invite
                        </Button>
                        <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-4 m-6 mb-0 bg-slate-800/50 border border-white/10">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="flex-1 mx-6 mb-6 mt-4">
                        {provider && <ActiveComponent ydoc={ydoc} provider={provider} />}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
