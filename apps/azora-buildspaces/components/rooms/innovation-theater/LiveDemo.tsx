"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
    Monitor, 
    Smartphone, 
    Maximize2, 
    Mic, 
    MicOff, 
    Video, 
    VideoOff,
    Heart,
    ThumbsUp,
    Zap,
    MessageSquare,
    Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const REACTIONS = ["❤️", "🚀", "🔥", "👏", "💯", "😮"];

export default function LiveDemo() {
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isSharing, setIsSharing] = useState(false);
    const [reactions, setReactions] = useState<{ id: number, emoji: string, x: number }[]>([]);
    const [viewerCount, setViewerCount] = useState(124);

    useEffect(() => {
        if (isSharing) {
            const interval = setInterval(() => {
                if (Math.random() > 0.7) {
                    const id = Date.now();
                    const emoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
                    const x = Math.random() * 80 + 10; // 10% to 90%
                    setReactions(prev => [...prev, { id, emoji, x }]);
                    setTimeout(() => {
                        setReactions(prev => prev.filter(r => r.id !== id));
                    }, 3000);
                }
                setViewerCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isSharing]);

    return (
        <div className="h-full flex flex-col bg-black text-white relative overflow-hidden">
            {/* Main Stage */}
            <div className="flex-1 relative flex items-center justify-center bg-slate-900">
                {!isSharing ? (
                    <div className="text-center space-y-6 z-10">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto border border-primary/30">
                            <Monitor className="w-12 h-12 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">Ready to Pitch?</h2>
                            <p className="text-slate-400 max-w-md mx-auto">
                                Share your screen to start the live demonstration. Your audience is waiting in the theater.
                            </p>
                        </div>
                        <Button 
                            size="lg" 
                            className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-full shadow-lg shadow-primary/20"
                            onClick={() => setIsSharing(true)}
                        >
                            Start Screen Share
                        </Button>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col">
                        {/* Simulated Screen Share Content */}
                        <div className="flex-1 bg-slate-800 m-4 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                                    <Zap className="w-8 h-8 text-yellow-500" />
                                </div>
                                <h3 className="text-xl font-medium text-white/50">Azora BuildSpaces Demo</h3>
                                <p className="text-sm text-white/30">Sharing: Window "Chrome - Localhost:3000"</p>
                            </div>

                            {/* Floating Reactions */}
                            <AnimatePresence>
                                {reactions.map((r) => (
                                    <motion.div
                                        key={r.id}
                                        initial={{ y: 400, opacity: 0, scale: 0.5 }}
                                        animate={{ y: -100, opacity: 1, scale: 1.5 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 3, ease: "easeOut" }}
                                        className="absolute text-3xl pointer-events-none"
                                        style={{ left: `${r.x}%` }}
                                    >
                                        {r.emoji}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Presenter PIP */}
                {isCamOn && (
                    <div className="absolute bottom-20 right-8 w-56 h-36 bg-slate-800 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-20 group">
                        <div className="w-full h-full flex items-center justify-center bg-slate-700 relative">
                            <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center">
                                <Users className="w-6 h-6 text-slate-400" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                <span className="text-[10px] font-medium uppercase tracking-wider">You (Presenter)</span>
                            </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                            <div className={`w-2 h-2 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(34,197,94,0.5)]`} />
                        </div>
                    </div>
                )}

                {/* Live Stats Overlay */}
                {isSharing && (
                    <div className="absolute top-8 left-8 flex items-center gap-3 z-20">
                        <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                            Live
                        </div>
                        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-medium">{viewerCount}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="h-20 border-t border-white/10 flex items-center justify-between px-8 bg-slate-950 z-30">
                <div className="flex items-center gap-4">
                    <Button
                        variant={isMicOn ? "secondary" : "destructive"}
                        size="icon"
                        className="rounded-full h-12 w-12 shadow-lg"
                        onClick={() => setIsMicOn(!isMicOn)}
                    >
                        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                    <Button
                        variant={isCamOn ? "secondary" : "destructive"}
                        size="icon"
                        className="rounded-full h-12 w-12 shadow-lg"
                        onClick={() => setIsCamOn(!isCamOn)}
                    >
                        {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 border-white/10 text-white hover:bg-white/5 rounded-full px-6">
                        <Monitor className="w-4 h-4" />
                        Desktop
                    </Button>
                    <Button variant="outline" className="gap-2 border-white/10 text-white hover:bg-white/5 rounded-full px-6">
                        <Smartphone className="w-4 h-4" />
                        Mobile
                    </Button>
                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <Button 
                        variant={isSharing ? "destructive" : "default"}
                        className="rounded-full px-8 font-bold"
                        onClick={() => setIsSharing(!isSharing)}
                    >
                        {isSharing ? "Stop Demo" : "Start Demo"}
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <MessageSquare className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <Maximize2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
