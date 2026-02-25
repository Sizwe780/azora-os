"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Play, 
    Pause, 
    RotateCcw, 
    Volume2, 
    VolumeX, 
    Maximize2, 
    Minimize2, 
    Music, 
    Coffee, 
    Brain, 
    Zap,
    Settings,
    Moon,
    Sun,
    Target,
    TrendingUp,
    Flame,
    Calendar,
    BarChart3,
    Sparkles,
    CheckCircle2,
    CloudRain,
    TreePine,
    Waves,
    Wind,
    Headphones,
    Keyboard,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";

const AMBIENT_SOUNDS = [
    { id: 'rain', name: 'Rain', Icon: CloudRain, url: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3' },
    { id: 'forest', name: 'Forest', Icon: TreePine, url: '' },
    { id: 'cafe', name: 'Cafe', Icon: Coffee, url: '' },
    { id: 'ocean', name: 'Ocean', Icon: Waves, url: '' },
    { id: 'whitenoise', name: 'White Noise', Icon: Wind, url: '' },
    { id: 'binaural', name: 'Binaural', Icon: Headphones, url: '' },
];

const FOCUS_MODES = [
    { id: 'pomodoro', name: 'Pomodoro', duration: 25 * 60 },
    { id: 'deep', name: 'Deep Work', duration: 50 * 60 },
    { id: 'short', name: 'Short Break', duration: 5 * 60 },
    { id: 'long', name: 'Long Break', duration: 15 * 60 },
];

export default function DeepFocus() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('pomodoro');
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(50);
    const [isZenMode, setIsZenMode] = useState(false);
    const [activeSound, setActiveSound] = useState<string | null>(null);
    const [code, setCode] = useState("// Focus on your code here...\n\nfunction solveProblem() {\n  // Deep work in progress\n}");
    const [completedSessions, setCompletedSessions] = useState(0);
    const [totalFocusTime, setTotalFocusTime] = useState(0); // seconds
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [dailyGoal, setDailyGoal] = useState(120); // minutes
    const [todayMinutes, setTodayMinutes] = useState(0);
    const [streak, setStreak] = useState(0);
    const [distractions, setDistractions] = useState(0);
    const [sessionLog, setSessionLog] = useState<{ date: string; minutes: number; mode: string }[]>([]);
    const [aiInsights, setAiInsights] = useState<string[]>([]);
    const [breakCount, setBreakCount] = useState(0);
    const [longestSession, setLongestSession] = useState(0); // minutes
    const [dailyGoalText, setDailyGoalText] = useState('');
    const [dailyGoalInput, setDailyGoalInput] = useState('');

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load persisted data from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("azora-deep-focus")
            if (saved) {
                const data = JSON.parse(saved)
                setCompletedSessions(data.completedSessions || 0)
                setTotalFocusTime(data.totalFocusTime || 0)
                if (data.mode) setMode(data.mode)
                if (data.code) setCode(data.code)
                if (data.sessionLog) setSessionLog(data.sessionLog)
                if (data.dailyGoal) setDailyGoal(data.dailyGoal)
                // Calculate today's minutes and streak from session log
                const today = new Date().toISOString().split('T')[0]
                const todayLogs = (data.sessionLog || []).filter((s: any) => s.date === today)
                setTodayMinutes(todayLogs.reduce((sum: number, s: any) => sum + (s.minutes || 0), 0))
                // Calculate streak
                let s = 0
                for (let d = 0; d < 365; d++) {
                    const checkDate = new Date()
                    checkDate.setDate(checkDate.getDate() - d)
                    const dateStr = checkDate.toISOString().split('T')[0]
                    const hasSession = (data.sessionLog || []).some((log: any) => log.date === dateStr)
                    if (hasSession) s++
                    else break
                }
                setStreak(s)
            }
            // Load deep-focus-stats
            const statsRaw = localStorage.getItem("deep-focus-stats")
            if (statsRaw) {
                const stats = JSON.parse(statsRaw)
                if (stats.breakCount) setBreakCount(stats.breakCount)
                if (stats.longestSession) setLongestSession(stats.longestSession)
                if (stats.dailyGoalText) { setDailyGoalText(stats.dailyGoalText); setDailyGoalInput(stats.dailyGoalText) }
            }
        } catch { /* ignore */ }
    }, [])

    // Save to localStorage on session completion
    const persistState = useCallback(() => {
        try {
            localStorage.setItem("azora-deep-focus", JSON.stringify({
                completedSessions,
                totalFocusTime,
                mode,
                code,
                sessionLog,
                dailyGoal,
                lastSession: new Date().toISOString(),
            }))
            const today = new Date().toISOString().split('T')[0]
            const sessionsToday = sessionLog.filter(s => s.date === today).length
            localStorage.setItem("deep-focus-stats", JSON.stringify({
                sessionsToday,
                totalFocusTime,
                longestSession,
                breakCount,
                dailyGoalText,
            }))
        } catch { /* ignore */ }
    }, [completedSessions, totalFocusTime, mode, code, sessionLog, dailyGoal, longestSession, breakCount, dailyGoalText])

    useEffect(() => {
        persistState()
    }, [completedSessions, totalFocusTime, persistState])

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
                setTotalFocusTime((prev) => prev + 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Track break completions
            if (mode === 'short' || mode === 'long') {
                setBreakCount(prev => prev + 1);
            }
            // Session completed
            if (mode === 'pomodoro' || mode === 'deep') {
                setCompletedSessions((prev) => prev + 1);
                const sessionMinutes = FOCUS_MODES.find(m => m.id === mode)?.duration ? Math.round((FOCUS_MODES.find(m => m.id === mode)?.duration || 0) / 60) : 25
                setTodayMinutes(prev => prev + sessionMinutes)
                setLongestSession(prev => Math.max(prev, sessionMinutes))
                setSessionLog(prev => [...prev, {
                    date: new Date().toISOString().split('T')[0],
                    minutes: sessionMinutes,
                    mode,
                }])
                // Log to analytics API
                fetch('/api/deep-focus/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'log-session', data: { duration: sessionMinutes, mode, completed: true } }),
                }).catch(() => {})
                // Emit cross-room event for achievement tracking
                fetch('/api/collectibles/achievements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event: 'focus-complete', room: 'deep-focus', data: { mode } }),
                }).catch(() => {})
                // Check if we've hit the flow state (10h+)
                if (totalFocusTime >= 36000) {
                    fetch('/api/collectibles/achievements', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ event: 'focus-streak', room: 'deep-focus', data: { totalHours: Math.floor(totalFocusTime / 3600) } }),
                    }).catch(() => {})
                }
            }
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft, mode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatHHMM = (seconds: number) =>
        `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}`;

    const todayStr = new Date().toISOString().split('T')[0];

    const toggleTimer = () => setIsActive(!isActive);
    
    const resetTimer = () => {
        setIsActive(false);
        const currentMode = FOCUS_MODES.find(m => m.id === mode);
        setTimeLeft(currentMode?.duration || 25 * 60);
    };

    const switchMode = (newMode: string) => {
        setMode(newMode);
        setIsActive(false);
        const m = FOCUS_MODES.find(f => f.id === newMode);
        setTimeLeft(m?.duration || 25 * 60);
    };

    // Audio playback — play only when a sound with a URL is selected
    useEffect(() => {
        const sound = AMBIENT_SOUNDS.find(s => s.id === activeSound)
        if (sound && sound.url) {
            if (!audioRef.current) {
                audioRef.current = new Audio(sound.url)
                audioRef.current.loop = true
            } else {
                audioRef.current.src = sound.url
            }
            audioRef.current.volume = isMuted ? 0 : volume / 100
            audioRef.current.play().catch(() => {})
        } else {
            audioRef.current?.pause()
        }
        return () => { audioRef.current?.pause() }
    }, [activeSound, isMuted, volume])

    // Keyboard shortcuts: Space = toggle, R = reset, B = start break
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA') return
            if (e.code === 'Space') { e.preventDefault(); setIsActive(a => !a) }
            if (e.key === 'r' || e.key === 'R') { setIsActive(false); const cm = FOCUS_MODES.find(m => m.id === mode); setTimeLeft(cm?.duration || 25 * 60) }
            if (e.key === 'b' || e.key === 'B') { switchMode('short') }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [mode])

    return (
        <div className={`h-full flex flex-col transition-colors duration-700 ${isZenMode ? 'bg-slate-950' : 'bg-background'}`}> 
            {/* Header / Zen Toggle */}
            <div className="h-14 border-b flex items-center justify-between px-6 bg-muted/10 backdrop-blur-sm z-10"> 
                <div className="flex items-center gap-4"> 
                    <div className="flex items-center gap-2 text-primary"> 
                        <Brain className="w-5 h-5" /> 
                        <span className="font-bold tracking-tight">Deep Focus</span> 
                    </div> 
                    <div className="h-4 w-px bg-border" /> 
                    <div className="flex gap-1"> 
                        {FOCUS_MODES.map((m) => ( 
                            <button 
                                key={m.id} 
                                onClick={() => switchMode(m.id)} 
                                className={`px-3 py-1 text-xs rounded-full transition-all ${
                                    mode === m.id 
                                    ? 'bg-primary text-primary-foreground font-medium' 
                                    : 'hover:bg-muted text-muted-foreground' 
                                }`} 
                            > 
                                {m.name} 
                            </button> 
                        ))} 
                    </div> 
                </div> 

                <div className="flex items-center gap-4"> 
                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1 rounded-full"> 
                        <Zap className="w-3.5 h-3.5 text-yellow-500" /> 
                        <span className="text-xs font-medium">
                            {completedSessions} sessions · {Math.floor(totalFocusTime / 3600)}h {Math.floor((totalFocusTime % 3600) / 60)}m
                        </span> 
                    </div>
                    {streak > 0 && (
                        <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1 rounded-full">
                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-xs font-medium text-orange-400">{streak} day streak</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, Math.round(todayMinutes / dailyGoal * 100))} className="w-20 h-1.5" />
                        <span className="text-[10px] text-muted-foreground">{todayMinutes}/{dailyGoal}m</span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className={`gap-1.5 ${showAnalytics ? 'bg-blue-500/10 text-blue-400' : ''}`}
                    > 
                        <BarChart3 className="w-4 h-4" /> 
                        Stats
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsZenMode(!isZenMode)} 
                        className="gap-2" 
                    > 
                        {isZenMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} 
                        {isZenMode ? "Exit Zen" : "Zen Mode"} 
                    </Button> 
                </div> 
            </div> 

            <div className="flex-1 flex overflow-hidden"> 
                {/* Left: Timer & Controls */} 
                <AnimatePresence mode="wait"> 
                    {!isZenMode && ( 
                        <motion.div  
                            initial={{ width: 0, opacity: 0 }} 
                            animate={{ width: 320, opacity: 1 }} 
                            exit={{ width: 0, opacity: 0 }} 
                            className="border-r bg-muted/5 flex flex-col overflow-hidden" 
                        > 
                            <div className="p-8 flex flex-col items-center justify-center flex-1 space-y-8"> 
                                {/* Timer Circle */} 
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                                        {FOCUS_MODES.find(m => m.id === mode)?.name || 'Focus'}
                                    </span>
                                <div className="relative w-48 h-48 flex items-center justify-center"> 
                                    <svg className="w-full h-full -rotate-90"> 
                                        <circle 
                                            cx="96" 
                                            cy="96" 
                                            r="88" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="4" 
                                            className="text-muted/20" 
                                        /> 
                                        <circle 
                                            cx="96" 
                                            cy="96" 
                                            r="88" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="4" 
                                            strokeDasharray={553} 
                                            strokeDashoffset={553 - (553 * (timeLeft / (FOCUS_MODES.find(m => m.id === mode)?.duration || 1)))} 
                                            className="text-primary transition-all duration-1000" 
                                            strokeLinecap="round" 
                                        /> 
                                    </svg> 
                                    <div className="absolute inset-0 flex flex-col items-center justify-center"> 
                                        <span className="text-4xl font-mono font-bold tracking-tighter"> 
                                            {formatTime(timeLeft)} 
                                        </span> 
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1"> 
                                            {isActive ? 'Focusing' : 'Paused'} 
                                        </span> 
                                    </div> 
                                </div>
                                </div>

                                {/* Controls */} 
                                <div className="flex items-center gap-4"> 
                                    <Button  
                                        variant="outline"  
                                        size="icon"  
                                        className="rounded-full" 
                                        onClick={resetTimer} 
                                    > 
                                        <RotateCcw className="w-4 h-4" /> 
                                    </Button> 
                                    <Button  
                                        size="lg"  
                                        className="rounded-full w-16 h-16 shadow-lg shadow-primary/20" 
                                        onClick={toggleTimer} 
                                    > 
                                        {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />} 
                                    </Button> 
                                    <Button  
                                        variant="outline"  
                                        size="icon"  
                                        className="rounded-full" 
                                        onClick={() => setIsMuted(!isMuted)} 
                                    > 
                                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />} 
                                    </Button> 
                                </div> 

                                {/* Ambient Sounds */} 
                                <div className="w-full space-y-4 pt-4"> 
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"> 
                                        <Music className="w-3 h-3" /> 
                                        Ambient Soundscape 
                                    </h3> 
                                    <div className="grid grid-cols-3 gap-2"> 
                                        {AMBIENT_SOUNDS.map(({ id, name, Icon }) => ( 
                                            <button 
                                                key={id} 
                                                onClick={() => setActiveSound(activeSound === id ? null : id)} 
                                                className={`p-2 rounded-xl border text-left transition-all relative ${
                                                    activeSound === id  
                                                    ? 'bg-primary/10 border-primary text-primary'  
                                                    : 'bg-background hover:border-primary/30' 
                                                }`} 
                                            > 
                                                {activeSound === id && (
                                                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                                    </span>
                                                )}
                                                <Icon className="w-4 h-4 mb-1" /> 
                                                <div className="text-[10px] font-medium leading-tight">{name}</div> 
                                            </button> 
                                        ))} 
                                    </div> 
                                </div>

                                {/* Daily Goal */}
                                <div className="w-full space-y-2 pt-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Target className="w-3 h-3" />
                                            Daily Goal
                                        </h3>
                                        <span className="text-xs text-muted-foreground">{todayMinutes}/{dailyGoal}m</span>
                                    </div>
                                    {dailyGoalText && (
                                        <p className="text-xs text-primary/80 truncate">{dailyGoalText}</p>
                                    )}
                                    <form
                                        onSubmit={e => { e.preventDefault(); setDailyGoalText(dailyGoalInput) }}
                                        className="flex gap-1"
                                    >
                                        <Input
                                            value={dailyGoalInput}
                                            onChange={e => setDailyGoalInput(e.target.value)}
                                            placeholder="Set today's goal…"
                                            className="h-7 text-xs"
                                        />
                                        <Button type="submit" size="sm" variant="outline" className="h-7 px-2 text-xs shrink-0">Set</Button>
                                    </form>
                                    <Progress value={Math.min(100, Math.round(todayMinutes / dailyGoal * 100))} className="h-2" />
                                    {todayMinutes >= dailyGoal && (
                                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Goal achieved! 🎉</span>
                                        </div>
                                    )}
                                </div>

                                {/* Mini Streak Calendar (last 7 days) */}
                                <div className="w-full space-y-2 pt-2">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        This Week
                                    </h3>
                                    <div className="flex gap-1 justify-center">
                                        {Array.from({ length: 7 }, (_, i) => {
                                            const d = new Date()
                                            d.setDate(d.getDate() - (6 - i))
                                            const dateStr = d.toISOString().split('T')[0]
                                            const dayMinutes = sessionLog
                                                .filter(s => s.date === dateStr)
                                                .reduce((sum, s) => sum + s.minutes, 0)
                                            const intensity = dayMinutes === 0 ? 0 : dayMinutes < 30 ? 1 : dayMinutes < 60 ? 2 : dayMinutes < 120 ? 3 : 4
                                            const colors = ['bg-muted/20', 'bg-emerald-900', 'bg-emerald-700', 'bg-emerald-500', 'bg-emerald-400']
                                            const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-1">
                                                    <span className="text-[9px] text-muted-foreground">{dayNames[d.getDay()]}</span>
                                                    <div className={`w-6 h-6 rounded-sm ${colors[intensity]} flex items-center justify-center`} title={`${dateStr}: ${dayMinutes}m`}>
                                                        {dayMinutes > 0 && <span className="text-[8px] text-white font-mono">{dayMinutes}</span>}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Session Statistics */}
                                <div className="w-full space-y-2 pt-2">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <BarChart3 className="w-3 h-3" />
                                        Session Stats
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-muted/10 rounded-lg p-2 border">
                                            <div className="text-[10px] text-muted-foreground mb-0.5">Today</div>
                                            <div className="text-sm font-bold">{sessionLog.filter(s => s.date === todayStr).length} <span className="text-[10px] font-normal text-muted-foreground">sessions</span></div>
                                        </div>
                                        <div className="bg-muted/10 rounded-lg p-2 border">
                                            <div className="text-[10px] text-muted-foreground mb-0.5">Total Focus</div>
                                            <div className="text-sm font-bold">{formatHHMM(totalFocusTime)}</div>
                                        </div>
                                        <div className="bg-muted/10 rounded-lg p-2 border">
                                            <div className="text-[10px] text-muted-foreground mb-0.5">Longest</div>
                                            <div className="text-sm font-bold">{longestSession}<span className="text-[10px] font-normal text-muted-foreground">m</span></div>
                                        </div>
                                        <div className="bg-muted/10 rounded-lg p-2 border">
                                            <div className="text-[10px] text-muted-foreground mb-0.5">Breaks</div>
                                            <div className="text-sm font-bold">{breakCount}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Keyboard Shortcuts Legend */}
                                <div className="w-full pt-2 pb-4">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                                        <Keyboard className="w-3 h-3" />
                                        Shortcuts
                                    </h3>
                                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted border text-[9px] font-mono">Space</kbd> toggle</span>
                                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted border text-[9px] font-mono">R</kbd> reset</span>
                                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted border text-[9px] font-mono">B</kbd> break</span>
                                    </div>
                                </div>
                            </div> 
                        </motion.div> 
                    )} 
                </AnimatePresence> 

                {/* Right: Minimalist Editor */} 
                <div className="flex-1 relative flex flex-col">
                    {/* Analytics Panel */}
                    <AnimatePresence>
                        {showAnalytics && !isZenMode && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-b bg-muted/5 overflow-hidden"
                            >
                                <div className="p-4 grid grid-cols-4 gap-4">
                                    <div className="bg-muted/10 rounded-lg p-3 border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Flame className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs font-semibold text-muted-foreground">Streak</span>
                                        </div>
                                        <div className="text-2xl font-bold">{streak} <span className="text-sm font-normal text-muted-foreground">days</span></div>
                                    </div>
                                    <div className="bg-muted/10 rounded-lg p-3 border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-semibold text-muted-foreground">Total Focus</span>
                                        </div>
                                        <div className="text-2xl font-bold font-mono">{formatHHMM(totalFocusTime)}</div>
                                    </div>
                                    <div className="bg-muted/10 rounded-lg p-3 border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs font-semibold text-muted-foreground">Sessions</span>
                                        </div>
                                        <div className="text-2xl font-bold">{completedSessions}</div>
                                    </div>
                                    <div className="bg-muted/10 rounded-lg p-3 border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-4 h-4 text-purple-500" />
                                            <span className="text-xs font-semibold text-muted-foreground">Longest</span>
                                        </div>
                                        <div className="text-2xl font-bold">{longestSession}<span className="text-sm font-normal text-muted-foreground">m</span></div>
                                    </div>
                                    <div className="bg-muted/10 rounded-lg p-3 border col-span-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-4 h-4 text-sky-500" />
                                            <span className="text-xs font-semibold text-muted-foreground">Sessions Today</span>
                                        </div>
                                        <div className="text-2xl font-bold">{sessionLog.filter(s => s.date === todayStr).length}</div>
                                    </div>
                                    <div className="bg-muted/10 rounded-lg p-3 border col-span-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Coffee className="w-4 h-4 text-amber-500" />
                                            <span className="text-xs font-semibold text-muted-foreground">Break Count</span>
                                        </div>
                                        <div className="text-2xl font-bold">{breakCount}</div>
                                    </div>
                                </div>
                                {/* 30-day activity chart */}
                                <div className="px-4 pb-4">
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Last 30 Days</h4>
                                    <div className="flex items-end gap-[2px] h-16">
                                        {Array.from({ length: 30 }, (_, i) => {
                                            const d = new Date()
                                            d.setDate(d.getDate() - (29 - i))
                                            const dateStr = d.toISOString().split('T')[0]
                                            const dayMinutes = sessionLog
                                                .filter(s => s.date === dateStr)
                                                .reduce((sum, s) => sum + s.minutes, 0)
                                            const maxMinutes = Math.max(1, ...sessionLog.map(s => s.minutes))
                                            const height = dayMinutes > 0 ? Math.max(4, (dayMinutes / Math.max(maxMinutes, dailyGoal)) * 64) : 2
                                            return (
                                                <div
                                                    key={i}
                                                    className={`flex-1 rounded-t-sm transition-all ${dayMinutes >= dailyGoal ? 'bg-emerald-500' : dayMinutes > 0 ? 'bg-blue-500/60' : 'bg-muted/20'}`}
                                                    style={{ height: `${height}px` }}
                                                    title={`${dateStr}: ${dayMinutes}m`}
                                                />
                                            )
                                        })}
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[9px] text-muted-foreground">30d ago</span>
                                        <span className="text-[9px] text-muted-foreground">Today</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence> 
                    {isZenMode && ( 
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 opacity-20 hover:opacity-100 transition-opacity"> 
                            <div className="text-6xl font-mono font-bold tracking-tighter text-white"> 
                                {formatTime(timeLeft)} 
                            </div> 
                        </div> 
                    )} 

                    <div className="flex-1"> 
                        <Editor 
                            height="100%" 
                            defaultLanguage="typescript" 
                            theme={isZenMode ? "vs-dark" : "light"} 
                            value={code} 
                            onChange={(v) => setCode(v || "")} 
                            options={{ 
                                minimap: { enabled: false }, 
                                fontSize: isZenMode ? 18 : 14, 
                                lineNumbers: isZenMode ? "off" : "on", 
                                glyphMargin: false, 
                                folding: false, 
                                lineDecorationsWidth: 0, 
                                lineNumbersMinChars: 0, 
                                padding: { top: isZenMode ? 100 : 20 }, 
                                scrollBeyondLastLine: false, 
                                wordWrap: "on", 
                                cursorBlinking: "smooth", 
                                cursorSmoothCaretAnimation: "on", 
                                smoothScrolling: true, 
                                fontFamily: "'JetBrains Mono', monospace", 
                            }} 
                        /> 
                    </div> 

                    {/* Zen Mode Overlay Controls */} 
                    {isZenMode && ( 
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-2xl"> 
                            <button onClick={toggleTimer} className="text-white hover:text-primary transition-colors"> 
                                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />} 
                            </button> 
                            <div className="w-px h-4 bg-white/10" /> 
                            <div className="flex gap-4"> 
                                {AMBIENT_SOUNDS.map(({ id, Icon }) => ( 
                                    <button  
                                        key={id} 
                                        onClick={() => setActiveSound(activeSound === id ? null : id)} 
                                        className={`transition-all ${activeSound === id ? 'text-primary scale-110' : 'text-white/50 hover:text-white'}`} 
                                    > 
                                        <Icon className="w-5 h-5" />
                                    </button> 
                                ))} 
                            </div> 
                            <div className="w-px h-4 bg-white/10" /> 
                            <button onClick={() => setIsZenMode(false)} className="text-white/50 hover:text-white transition-colors"> 
                                <Minimize2 className="w-5 h-5" /> 
                            </button> 
                        </div> 
                    )} 
                </div> 
            </div> 
        </div> 
    ); 
}

