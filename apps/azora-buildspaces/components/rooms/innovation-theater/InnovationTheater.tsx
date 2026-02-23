"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Settings, Users, MessageSquare, Mic, MicOff, Video, VideoOff, Circle as Record, Share2, QrCode } from "lucide-react";
import SlideEditor from "./SlideEditor";
import LiveDemo from "./LiveDemo";
import AudienceFeedback from "./AudienceFeedback";

export default function InnovationTheater() {
    const [isStreaming, setIsStreaming] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [activeTab, setActiveTab] = useState("slides");
    const [currentSlide, setCurrentSlide] = useState(1);
    const [totalSlides, setTotalSlides] = useState(12);
    const [qaQuestions, setQaQuestions] = useState([
        { id: 1, question: "Can you explain the architecture diagram in more detail?", author: "Sarah Chen", votes: 5, answered: false },
        { id: 2, question: "What's the performance impact of this implementation?", author: "Mike Ross", votes: 3, answered: false },
        { id: 3, question: "Are there any security considerations?", author: "Jessica P", votes: 2, answered: true },
    ]);

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        Innovation Theater
                        {isStreaming && <Badge variant="destructive" className="animate-pulse">LIVE</Badge>}
                        {isRecording && <Badge variant="secondary" className="bg-red-600">REC</Badge>}
                    </h1>
                    <p className="text-slate-400">Present your ideas with live demos and audience interaction</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>124 viewers</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Media Controls */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsMicOn(!isMicOn)}
                            className={isMicOn ? "" : "bg-red-600/20 border-red-600"}
                        >
                            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsVideoOn(!isVideoOn)}
                            className={isVideoOn ? "" : "bg-red-600/20 border-red-600"}
                        >
                            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant={isRecording ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => setIsRecording(!isRecording)}
                        >
                            <Record className="w-4 h-4 mr-2" />
                            {isRecording ? "Stop Rec" : "Record"}
                        </Button>
                        <Button
                            variant={isStreaming ? "destructive" : "default"}
                            size="sm"
                            onClick={() => setIsStreaming(!isStreaming)}
                            className="flex items-center gap-2"
                        >
                            {isStreaming ? (
                                <>
                                    <Square className="w-4 h-4" />
                                    Stop Stream
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Start Stream
                                </>
                            )}
                        </Button>
                        <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                        <Button variant="outline" size="sm">
                            <QrCode className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Left Panel - Presentation Tools */}
                <div className="w-80 border-r border-white/10 bg-slate-900/50">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
                            <TabsTrigger value="slides" className="text-xs">Slides</TabsTrigger>
                            <TabsTrigger value="demo" className="text-xs">Demo</TabsTrigger>
                            <TabsTrigger value="feedback" className="text-xs">Feedback</TabsTrigger>
                            <TabsTrigger value="qa" className="text-xs">Q&A</TabsTrigger>
                        </TabsList>

                        <TabsContent value="slides" className="flex-1 m-0">
                            <SlideEditor />
                        </TabsContent>

                        <TabsContent value="demo" className="flex-1 m-0">
                            <LiveDemo />
                        </TabsContent>

                        <TabsContent value="feedback" className="flex-1 m-0">
                            <AudienceFeedback />
                        </TabsContent>

                        <TabsContent value="qa" className="flex-1 m-0">
                            <div className="h-full flex flex-col bg-background border-l">
                                <div className="p-4 border-b">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Q&A Session
                                    </h3>
                                    <div className="flex gap-4 mt-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-500">{qaQuestions.length}</div>
                                            <div className="text-xs text-muted-foreground">Questions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-500">{qaQuestions.filter(q => q.answered).length}</div>
                                            <div className="text-xs text-muted-foreground">Answered</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {qaQuestions.map((question) => (
                                        <div key={question.id} className={`p-3 rounded-lg border ${question.answered ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="text-sm font-medium text-white">{question.author}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">{question.votes} votes</span>
                                                    {question.answered && <Badge variant="secondary" className="text-xs">Answered</Badge>}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-300 mb-2">{question.question}</p>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="text-xs">
                                                    👍 {question.votes}
                                                </Button>
                                                {!question.answered && (
                                                    <Button size="sm" variant="default" className="text-xs">
                                                        Answer
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Center - Main Presentation Area */}
                <div className="flex-1 flex flex-col">
                    {/* Presentation Canvas */}
                    <div className="flex-1 bg-slate-800/50 m-4 rounded-lg border border-white/10 flex items-center justify-center">
                        <div className="text-center text-slate-400">
                            <div className="w-24 h-24 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                                <Play className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Presentation Canvas</h3>
                            <p className="text-sm">Your slides and demos will appear here</p>
                            {isStreaming && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-red-400">
                                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium">LIVE</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Presentation Controls */}
                    <div className="mx-4 mb-4">
                        <Card className="bg-slate-900/50 border-white/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
                                            disabled={currentSlide <= 1}
                                        >
                                            <Play className="w-4 h-4 mr-2 rotate-180" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentSlide(Math.min(totalSlides, currentSlide + 1))}
                                            disabled={currentSlide >= totalSlides}
                                        >
                                            Next
                                            <Play className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        Slide {currentSlide} of {totalSlides}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            Fullscreen
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Notes
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Panel - Audience Interaction */}
                <div className="w-80 border-l border-white/10 bg-slate-900/50">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Audience Chat
                        </h3>
                    </div>
                    <div className="flex-1 p-4 space-y-3">
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    A
                                </div>
                                <span className="text-sm font-medium text-white">Alex Johnson</span>
                                <span className="text-xs text-slate-400">2m ago</span>
                            </div>
                            <p className="text-sm text-slate-300">Great presentation! The demo was really impressive.</p>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    S
                                </div>
                                <span className="text-sm font-medium text-white">Sarah Chen</span>
                                <span className="text-xs text-slate-400">1m ago</span>
                            </div>
                            <p className="text-sm text-slate-300">Can you show the code for the animation?</p>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    M
                                </div>
                                <span className="text-sm font-medium text-white">Mike Ross</span>
                                <span className="text-xs text-slate-400">30s ago</span>
                            </div>
                            <p className="text-sm text-slate-300">Love the real-time features!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}