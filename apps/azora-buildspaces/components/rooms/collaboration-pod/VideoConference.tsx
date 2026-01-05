"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor, MessageSquare, Users, Settings, Loader2 } from "lucide-react";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

interface VideoConferenceProps {
    ydoc: Y.Doc;
    provider: WebsocketProvider;
}

export default function VideoConference({ ydoc, provider }: VideoConferenceProps) {
    const { data: session } = useSession();
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);

    useEffect(() => {
        if (!provider) return;

        const updateParticipants = () => {
            const states = Array.from(provider.awareness.getStates().entries());
            const callParticipants = states
                .map(([id, state]: [number, any]) => ({
                    id,
                    name: state.user?.name || "Anonymous",
                    avatar: state.user?.avatar || "",
                    video: state.video || false,
                    mic: state.mic || false,
                    isSpeaking: state.isSpeaking || false,
                    isInCall: state.isInCall || false
                }))
                .filter(p => p.isInCall);
            
            setParticipants(callParticipants);
        };

        provider.awareness.on("change", updateParticipants);
        updateParticipants();

        return () => {
            provider.awareness.off("change", updateParticipants);
        };
    }, [provider]);

    const toggleCall = () => {
        const newState = !isCallActive;
        setIsCallActive(newState);
        provider.awareness.setLocalStateField("isInCall", newState);
        provider.awareness.setLocalStateField("video", isVideoOn && newState);
        provider.awareness.setLocalStateField("mic", isMicOn && newState);
    };

    const toggleVideo = () => {
        const newState = !isVideoOn;
        setIsVideoOn(newState);
        provider.awareness.setLocalStateField("video", newState);
    };

    const toggleMic = () => {
        const newState = !isMicOn;
        setIsMicOn(newState);
        provider.awareness.setLocalStateField("mic", newState);
    };

    return (
        <div className="h-full flex flex-col bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-white">Team Standup</h3>
                    <Badge variant="secondary" className={isCallActive ? "bg-green-600" : "bg-slate-700"}>
                        {isCallActive ? "Live" : "Idle"}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        {participants.length}
                    </Button>
                    <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 p-4 overflow-y-auto">
                {!isCallActive ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6">
                        <div className="w-64 h-48 bg-slate-800 rounded-xl border border-white/10 flex items-center justify-center">
                            <VideoOff className="w-12 h-12 text-slate-600" />
                        </div>
                        <div className="text-center space-y-4">
                            <h4 className="text-white font-medium">Ready to join?</h4>
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8" onClick={toggleCall}>
                                Join Call
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* My Video */}
                        <Card className="bg-slate-800 border-white/10 overflow-hidden aspect-video relative">
                            {isVideoOn ? (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                                    <Avatar className="w-20 h-20 border-4 border-white/10">
                                        <AvatarImage src={session?.user?.image || ""} />
                                        <AvatarFallback className="text-2xl bg-blue-600">{session?.user?.name?.[0] || "Y"}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-blue-600/50 backdrop-blur">You</Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                    <Avatar className="w-16 h-16">
                                        <AvatarFallback className="bg-slate-700">{session?.user?.name?.[0] || "Y"}</AvatarFallback>
                                    </Avatar>
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 flex gap-1">
                                {!isMicOn && <Badge variant="destructive" className="p-1"><MicOff className="w-3 h-3" /></Badge>}
                            </div>
                        </Card>

                        {/* Other Participants */}
                        {participants.filter(p => p.id !== provider.awareness.clientID).map((p) => (
                            <Card key={p.id} className="bg-slate-800 border-white/10 overflow-hidden aspect-video relative">
                                {p.video ? (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                                        <Avatar className="w-16 h-16 border-2 border-white/10">
                                            <AvatarFallback className="bg-purple-600">{p.name[0]}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                        <Avatar className="w-16 h-16">
                                            <AvatarFallback className="bg-slate-700">{p.name[0]}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                                    <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">{p.name}</span>
                                    {!p.mic && <Badge variant="destructive" className="p-1"><MicOff className="w-3 h-3" /></Badge>}
                                </div>
                                {p.isSpeaking && (
                                    <div className="absolute inset-0 border-2 border-green-500 pointer-events-none animate-pulse" />
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            {isCallActive && (
                <div className="p-4 border-t border-white/10 bg-slate-800/50">
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            variant={isMicOn ? "outline" : "destructive"}
                            size="lg"
                            onClick={toggleMic}
                            className="w-12 h-12 rounded-full p-0"
                        >
                            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </Button>

                        <Button
                            variant={isVideoOn ? "outline" : "destructive"}
                            size="lg"
                            onClick={toggleVideo}
                            className="w-12 h-12 rounded-full p-0"
                        >
                            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </Button>

                        <Button
                            variant={isScreenSharing ? "default" : "outline"}
                            size="lg"
                            onClick={() => setIsScreenSharing(!isScreenSharing)}
                            className="w-12 h-12 rounded-full p-0"
                        >
                            <Monitor className="w-5 h-5" />
                        </Button>

                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={toggleCall}
                            className="w-12 h-12 rounded-full p-0"
                        >
                            <PhoneOff className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}