"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Focus,
    Timer,
    Target,
    Brain,
    Coffee,
    Moon,
    Sun,
    Zap,
    CheckCircle2,
    Clock,
    Play,
    Pause,
    RotateCcw,
    Settings,
    BarChart3,
    TrendingUp
} from "lucide-react";

interface FocusSession {
    id: string;
    title: string;
    duration: number; // minutes
    completed: boolean;
    date: Date;
    type: 'deep-work' | 'break' | 'learning';
}

interface ProductivityStats {
    totalSessions: number;
    totalMinutes: number;
    averageSession: number;
    streak: number;
    todayMinutes: number;
}

export default function DeepFocus() {
    const [isActive, setIsActive] = useState(false);
    const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [stats, setStats] = useState<ProductivityStats>({
        totalSessions: 0,
        totalMinutes: 0,
        averageSession: 0,
        streak: 0,
        todayMinutes: 0
    });

    // Load sessions from localStorage or database
    useEffect(() => {
        const saved = localStorage.getItem('deep-focus-sessions');
        if (saved) {
            const parsed = JSON.parse(saved);
            setSessions(parsed);
            calculateStats(parsed);
        }
    }, []);

    const calculateStats = (sessionList: FocusSession[]) => {
        const completed = sessionList.filter(s => s.completed);
        const totalMinutes = completed.reduce((sum, s) => sum + s.duration, 0);
        const today = new Date().toDateString();
        const todaySessions = completed.filter(s => new Date(s.date).toDateString() === today);
        const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

        setStats({
            totalSessions: completed.length,
            totalMinutes,
            averageSession: completed.length > 0 ? Math.round(totalMinutes / completed.length) : 0,
            streak: calculateStreak(completed),
            todayMinutes
        });
    };

    const calculateStreak = (completedSessions: FocusSession[]) => {
        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);

            const hasSession = completedSessions.some(s =>
                new Date(s.date).toDateString() === checkDate.toDateString()
            );

            if (hasSession) {
                streak++;
            } else if (i > 0) { // Allow missing today but not gaps
                break;
            }
        }

        return streak;
    };

    const startSession = (type: FocusSession['type'], duration: number, title: string) => {
        const session: FocusSession = {
            id: Date.now().toString(),
            title,
            duration,
            completed: false,
            date: new Date(),
            type
        };

        setCurrentSession(session);
        setTimeLeft(duration * 60); // convert to seconds
        setIsActive(true);
    };

    const pauseSession = () => {
        setIsActive(false);
    };

    const resumeSession = () => {
        setIsActive(true);
    };

    const endSession = () => {
        if (currentSession) {
            const completed = timeLeft <= 0;
            const updatedSession = { ...currentSession, completed };

            const newSessions = [...sessions, updatedSession];
            setSessions(newSessions);
            localStorage.setItem('deep-focus-sessions', JSON.stringify(newSessions));
            calculateStats(newSessions);
        }

        setCurrentSession(null);
        setIsActive(false);
        setTimeLeft(0);
    };

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => {
                    if (time <= 1) {
                        endSession();
                        return 0;
                    }
                    return time - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getSessionIcon = (type: FocusSession['type']) => {
        switch (type) {
            case 'deep-work': return <Focus className="w-4 h-4" />;
            case 'break': return <Coffee className="w-4 h-4" />;
            case 'learning': return <Brain className="w-4 h-4" />;
        }
    };

    const presetSessions = [
        { type: 'deep-work' as const, duration: 25, title: 'Deep Work Sprint', icon: Focus },
        { type: 'deep-work' as const, duration: 50, title: 'Extended Focus', icon: Target },
        { type: 'break' as const, duration: 5, title: 'Short Break', icon: Coffee },
        { type: 'break' as const, duration: 15, title: 'Long Break', icon: Moon },
        { type: 'learning' as const, duration: 30, title: 'Learning Session', icon: Brain }
    ];

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-6 border-b bg-muted/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Focus className="w-6 h-6 text-primary" />
                            Deep Focus
                        </h1>
                        <p className="text-muted-foreground">Productivity sessions with AI assistance</p>
                    </div>
                    <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            <div className="flex-1 p-6">
                <Tabs defaultValue="timer" className="h-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="timer">Timer</TabsTrigger>
                        <TabsTrigger value="stats">Statistics</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="timer" className="space-y-6 mt-6">
                        {/* Current Session */}
                        {currentSession ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {getSessionIcon(currentSession.type)}
                                        {currentSession.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-6xl font-mono font-bold mb-2">
                                            {formatTime(timeLeft)}
                                        </div>
                                        <Progress
                                            value={(1 - timeLeft / (currentSession.duration * 60)) * 100}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex justify-center gap-2">
                                        {isActive ? (
                                            <Button onClick={pauseSession} variant="outline">
                                                <Pause className="w-4 h-4 mr-2" />
                                                Pause
                                            </Button>
                                        ) : (
                                            <Button onClick={resumeSession}>
                                                <Play className="w-4 h-4 mr-2" />
                                                Resume
                                            </Button>
                                        )}
                                        <Button onClick={endSession} variant="destructive">
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            End Session
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Start a Focus Session</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {presetSessions.map((preset) => (
                                            <Button
                                                key={preset.title}
                                                variant="outline"
                                                className="h-20 flex flex-col gap-2"
                                                onClick={() => startSession(preset.type, preset.duration, preset.title)}
                                            >
                                                <preset.icon className="w-6 h-6" />
                                                <div className="text-center">
                                                    <div className="font-medium">{preset.title}</div>
                                                    <div className="text-sm text-muted-foreground">{preset.duration} min</div>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold">{stats.todayMinutes}</div>
                                    <p className="text-xs text-muted-foreground">Minutes Today</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold">{stats.streak}</div>
                                    <p className="text-xs text-muted-foreground">Day Streak</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold">{stats.totalSessions}</div>
                                    <p className="text-xs text-muted-foreground">Total Sessions</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold">{stats.averageSession}</div>
                                    <p className="text-xs text-muted-foreground">Avg Session (min)</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="stats" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        Weekly Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Weekly statistics coming soon...</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Productivity Trends
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Trend analysis coming soon...</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Session History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {sessions.slice(-10).reverse().map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                                            <div className="flex items-center gap-3">
                                                {getSessionIcon(session.type)}
                                                <div>
                                                    <div className="font-medium">{session.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(session.date).toLocaleDateString()} • {session.duration} min
                                                    </div>
                                                </div>
                                            </div>
                                            {session.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                        </div>
                                    ))}
                                    {sessions.length === 0 && (
                                        <p className="text-muted-foreground text-center py-8">
                                            No sessions completed yet. Start your first focus session!
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}