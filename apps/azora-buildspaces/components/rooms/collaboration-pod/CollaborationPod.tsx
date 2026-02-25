"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Video, Palette, MessageSquare, CheckSquare, Share2, Users, Settings, Bell, Wifi, WifiOff, Monitor, RefreshCw } from "lucide-react";
import VideoConference from "./VideoConference";
import Whiteboard from "./Whiteboard";
import Chat from "./Chat";
import TaskBoard from "./TaskBoard";

const SAMPLE_PARTICIPANTS = [
    { id: 1, name: "Alice Chen", initials: "AC", status: "online" as const },
    { id: 2, name: "Bob Kumar", initials: "BK", status: "away" as const },
    { id: 3, name: "Diana Ross", initials: "DR", status: "typing" as const },
];

const EMOJIS = ["👍", "❤️", "🎉", "🔥", "🤔", "😂"];

interface FlyingEmoji {
    id: number;
    emoji: string;
    x: number;
}

interface RoomSettings {
    roomName: string;
    maxParticipants: string;
    videoQuality: string;
    enableTranscription: boolean;
}

const STATUS_COLORS: Record<string, string> = {
    online: "bg-green-500",
    away: "bg-amber-500",
    typing: "bg-blue-400",
};

export default function CollaborationPod() {
    const [activeTab, setActiveTab] = useState("video");
    const [notifications, setNotifications] = useState(5);
    const [isConnected, setIsConnected] = useState(false);

    // Feature 1: Screen Share
    const [isSharing, setIsSharing] = useState(false);
    const screenStreamRef = useRef<MediaStream | null>(null);

    // Feature 2: Participants
    const [participants] = useState(SAMPLE_PARTICIPANTS);

    // Feature 3: Emoji Reactions
    const [showEmojiBar, setShowEmojiBar] = useState(false);
    const [flyingEmojis, setFlyingEmojis] = useState<FlyingEmoji[]>([]);
    const emojiIdRef = useRef(0);

    // Feature 4: Reconnect
    const providerRef = useRef<WebsocketProvider | null>(null);
    const ydocRef = useRef<Y.Doc | null>(null);
    const [providerVersion, setProviderVersion] = useState(0);

    // Feature 5: Settings
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<RoomSettings>({
        roomName: "Azora Collaboration Pod",
        maxParticipants: "10",
        videoQuality: "Medium",
        enableTranscription: false,
    });
    const [pendingSettings, setPendingSettings] = useState<RoomSettings>(settings);

    // Initialize Yjs — recreated on reconnect via providerVersion
    const { ydoc, provider } = useMemo(() => {
        if (ydocRef.current) ydocRef.current.destroy();
        const doc = new Y.Doc();
        ydocRef.current = doc;
        const wsProvider = typeof window !== 'undefined'
            ? new WebsocketProvider('wss://demos.yjs.dev', 'azora-buildspaces-pod', doc)
            : null;
        providerRef.current = wsProvider;
        return { ydoc: doc, provider: wsProvider };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providerVersion]);

    useEffect(() => {
        if (provider) {
            provider.on('status', (event: any) => {
                setIsConnected(event.status === 'connected');
            });
        }
        return () => provider?.destroy();
    }, [provider]);

    // Feature 1: Screen share helpers
    const startScreenShare = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            screenStreamRef.current = stream;
            setIsSharing(true);
            stream.getVideoTracks()[0].addEventListener('ended', () => {
                setIsSharing(false);
                screenStreamRef.current = null;
            });
        } catch {
            setIsSharing(false);
        }
    }, []);

    const stopScreenShare = useCallback(() => {
        screenStreamRef.current?.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
        setIsSharing(false);
    }, []);

    useEffect(() => {
        return () => {
            screenStreamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    // Feature 3: Fire emoji
    const fireEmoji = useCallback((emoji: string) => {
        const id = ++emojiIdRef.current;
        const x = 10 + Math.random() * 80;
        setFlyingEmojis(prev => [...prev, { id, emoji, x }]);
        setTimeout(() => setFlyingEmojis(prev => prev.filter(e => e.id !== id)), 1800);
    }, []);

    // Feature 4: Reconnect handler
    const handleReconnect = useCallback(() => {
        setProviderVersion(v => v + 1);
    }, []);

    // Feature 5: Save settings
    const saveSettings = useCallback(() => {
        setSettings(pendingSettings);
        setSettingsOpen(false);
    }, [pendingSettings]);

    const tabs = [
        { id: "video", label: "Video Call", icon: Video, component: VideoConference },
        { id: "whiteboard", label: "Whiteboard", icon: Palette, component: Whiteboard },
        { id: "chat", label: "Team Chat", icon: MessageSquare, component: Chat },
        { id: "tasks", label: "Task Board", icon: CheckSquare, component: TaskBoard },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || VideoConference;

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Feature 4: Disconnection banner */}
            {!isConnected && (
                <div className="bg-red-700/80 text-white text-sm px-6 py-2 flex items-center justify-between">
                    <span>⚠️ Disconnected from collaboration server</span>
                    <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-red-600" onClick={handleReconnect}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Reconnect
                    </Button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        {settings.roomName}
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
                        {/* Feature 1: Screen Share button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={isSharing ? stopScreenShare : startScreenShare}
                            className={isSharing ? "border-green-500 text-green-400" : ""}
                        >
                            <Monitor className="w-4 h-4 mr-2" />
                            {isSharing ? "Sharing" : "Share Screen"}
                        </Button>

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
                        {/* Feature 5: Settings button */}
                        <Button variant="outline" size="sm" onClick={() => { setPendingSettings(settings); setSettingsOpen(true); }}>
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Feature 2: Participant presence strip */}
            <div className="flex items-center gap-3 px-6 py-2 border-b border-white/5 bg-slate-900/30">
                <Users className="w-4 h-4 text-slate-400" />
                <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">{participants.length}</Badge>
                <div className="flex items-center gap-2">
                    {participants.map(p => (
                        <div key={p.id} className="relative flex items-center" title={`${p.name} — ${p.status}`}>
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                {p.initials}
                            </div>
                            <span
                                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${STATUS_COLORS[p.status]} ${p.status === "typing" ? "animate-pulse" : ""}`}
                            />
                        </div>
                    ))}
                </div>
                <span className="text-xs text-slate-500 ml-1">
                    {participants.find(p => p.status === "typing")?.name} is typing…
                </span>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative">
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

                    {/* Feature 3: Emoji hover zone wrapping content */}
                    <div
                        className="flex-1 mx-6 mb-6 mt-4 relative"
                        onMouseEnter={() => setShowEmojiBar(true)}
                        onMouseLeave={() => setShowEmojiBar(false)}
                    >
                        {provider && <ActiveComponent ydoc={ydoc} provider={provider} />}

                        {/* Emoji reaction bar */}
                        <AnimatePresence>
                            {showEmojiBar && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-slate-800/90 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 z-10"
                                >
                                    {EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => fireEmoji(emoji)}
                                            className="text-xl hover:scale-125 transition-transform"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Flying emojis */}
                        <AnimatePresence>
                            {flyingEmojis.map(e => (
                                <motion.div
                                    key={e.id}
                                    initial={{ opacity: 1, y: 0, x: 0 }}
                                    animate={{ opacity: 0, y: -200, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.6, ease: "easeOut" }}
                                    className="pointer-events-none absolute bottom-12 text-3xl z-20"
                                    style={{ left: `${e.x}%` }}
                                >
                                    {e.emoji}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </Tabs>
            </div>

            {/* Feature 5: Room Settings Dialog */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="bg-slate-900 border border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Room Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label htmlFor="roomName">Room Name</Label>
                            <Input
                                id="roomName"
                                value={pendingSettings.roomName}
                                onChange={e => setPendingSettings(s => ({ ...s, roomName: e.target.value }))}
                                className="bg-slate-800 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Max Participants</Label>
                            <Select
                                value={pendingSettings.maxParticipants}
                                onValueChange={v => setPendingSettings(s => ({ ...s, maxParticipants: v }))}
                            >
                                <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                    {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Video Quality</Label>
                            <Select
                                value={pendingSettings.videoQuality}
                                onValueChange={v => setPendingSettings(s => ({ ...s, videoQuality: v }))}
                            >
                                <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                    {["Low", "Medium", "High"].map(q => (
                                        <SelectItem key={q} value={q}>{q}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="transcription">Enable Transcription</Label>
                            <Switch
                                id="transcription"
                                checked={pendingSettings.enableTranscription}
                                onCheckedChange={v => setPendingSettings(s => ({ ...s, enableTranscription: v }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSettingsOpen(false)}>Cancel</Button>
                        <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
