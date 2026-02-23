"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Smile, Paperclip, Hash, Users, Settings, Search, Sparkles, FileText } from "lucide-react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

interface Message {
    id: string;
    user: string;
    avatar: string;
    message: string;
    time: string;
    reactions: Record<string, number>;
}

interface ChatProps {
    ydoc: Y.Doc;
    provider: WebsocketProvider;
}

const CHANNELS = [
    { id: "general", name: "general", unread: 0 },
    { id: "design", name: "design", unread: 3 },
    { id: "development", name: "development", unread: 7 },
    { id: "marketing", name: "marketing", unread: 0 },
    { id: "random", name: "random", unread: 12 }
];

export default function Chat({ ydoc, provider }: ChatProps) {
    const [activeChannel, setActiveChannel] = useState("general");
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [meetingSummary, setMeetingSummary] = useState<any>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Get the shared array for the active channel
    const sharedMessages = ydoc.getArray<Message>(`chat-${activeChannel}`);

    useEffect(() => {
        // Initial load
        setMessages(sharedMessages.toArray());

        // Observe changes
        const observer = () => {
            setMessages(sharedMessages.toArray());
        };

        sharedMessages.observe(observer);

        // Cleanup
        return () => {
            sharedMessages.unobserve(observer);
        };
    }, [activeChannel, ydoc]);

    useEffect(() => {
        // Scroll to bottom on new messages
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageText.trim()) return;

        const newMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            user: "You",
            avatar: "Y",
            message: messageText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: {}
        };

        sharedMessages.push([newMessage]);
        setMessageText("");
    };

    const activeChannelData = CHANNELS.find(c => c.id === activeChannel);

    const generateMeetingSummary = async () => {
        if (messages.length === 0 || isSummarizing) return;
        setIsSummarizing(true);
        setMeetingSummary(null);

        try {
            const res = await fetch("/api/collaboration/meeting-summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: messages.map(m => ({
                        sender: m.user,
                        content: m.message,
                    })),
                    participants: [...new Set(messages.map(m => m.user))],
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setMeetingSummary(data.summary);
            }
        } catch (error) {
            console.error("Meeting summary failed:", error);
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="h-full flex bg-slate-900">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/10 bg-slate-800/50">
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Channels</h3>
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search channels..."
                            className="pl-10 bg-slate-700 border-slate-600"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2">
                        {CHANNELS.map((channel) => (
                            <button
                                key={channel.id}
                                onClick={() => setActiveChannel(channel.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg mb-1 transition-colors ${
                                    activeChannel === channel.id
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-slate-700 text-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Hash className="w-4 h-4" />
                                    <span className="text-sm">{channel.name}</span>
                                </div>
                                {channel.unread > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                        {channel.unread}
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-blue-600">Y</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">You</p>
                            <p className="text-xs text-slate-400">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col">
                {/* Channel Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-semibold text-white">{activeChannelData?.name}</h2>
                        <Badge variant="secondary" className="bg-slate-700">
                            <Users className="w-3 h-3 mr-1" />
                            24 members
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={generateMeetingSummary}
                            disabled={isSummarizing || messages.length === 0}
                            className="gap-1.5"
                        >
                            <Sparkles className="w-4 h-4" />
                            {isSummarizing ? "Summarizing..." : "AI Summary"}
                        </Button>
                        <Button variant="outline" size="sm">
                            <Users className="w-4 h-4 mr-2" />
                            Members
                        </Button>
                    </div>
                </div>

                {/* Meeting Summary Panel */}
                {meetingSummary && (
                    <div className="mx-4 mt-2 p-4 bg-slate-800/80 rounded-lg border border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <h3 className="text-sm font-semibold text-white">{meetingSummary.title}</h3>
                                <Badge variant="outline" className={`text-xs ${
                                    meetingSummary.sentiment === 'positive' ? 'text-green-400 border-green-500/30' :
                                    meetingSummary.sentiment === 'negative' ? 'text-red-400 border-red-500/30' :
                                    'text-slate-400 border-slate-500/30'
                                }`}>
                                    {meetingSummary.sentiment}
                                </Badge>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setMeetingSummary(null)} className="text-slate-400 h-6 w-6 p-0">✕</Button>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{meetingSummary.summary}</p>
                        {meetingSummary.actionItems?.length > 0 && (
                            <div className="mb-2">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Action Items</span>
                                <div className="mt-1 space-y-1">
                                    {meetingSummary.actionItems.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                            <Badge variant="outline" className={`text-[10px] ${
                                                item.priority === 'high' ? 'text-red-400 border-red-500/30' :
                                                item.priority === 'medium' ? 'text-yellow-400 border-yellow-500/30' :
                                                'text-green-400 border-green-500/30'
                                            }`}>{item.priority}</Badge>
                                            <span>{item.task}</span>
                                            <span className="text-slate-500 text-xs">→ {item.assignee}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {meetingSummary.nextSteps && (
                            <p className="text-xs text-blue-400 mt-2">Next: {meetingSummary.nextSteps}</p>
                        )}
                    </div>
                )}

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
                                <Hash className="w-12 h-12 mb-4 opacity-20" />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex gap-3 group">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-slate-700 text-white">{msg.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-white">{msg.user}</span>
                                        <span className="text-xs text-slate-500">{msg.time}</span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed">{msg.message}</p>
                                    {Object.keys(msg.reactions).length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {Object.entries(msg.reactions).map(([emoji, count]) => (
                                                <Badge key={emoji} variant="outline" className="bg-slate-800 border-white/5 text-xs py-0 px-2">
                                                    {emoji} {count}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" type="button">
                            <Paperclip className="w-5 h-5 text-slate-400" />
                        </Button>
                        <Input
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder={`Message #${activeChannelData?.name}`}
                            className="flex-1 bg-slate-800 border-white/10 text-white"
                        />
                        <Button variant="ghost" size="icon" type="button">
                            <Smile className="w-5 h-5 text-slate-400" />
                        </Button>
                        <Button 
                            size="icon" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleSendMessage()}
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
