"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    Sun
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";

const AMBIENT_SOUNDS = [
    { id: 'rain', name: 'Rainfall', icon: '🌧️', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }, // Placeholder
    { id: 'forest', name: 'Forest', icon: '🌲', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'cafe', name: 'Cafe', icon: '☕', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 'waves', name: 'Waves', icon: '🌊', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
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

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Play notification sound
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
                        <span className="text-xs font-medium">Focus Streak: 3h 12m</span> 
                    </div> 
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
                                    <div className="grid grid-cols-2 gap-2"> 
                                        {AMBIENT_SOUNDS.map((sound) => ( 
                                            <button 
                                                key={sound.id} 
                                                onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)} 
                                                className={`p-3 rounded-xl border text-left transition-all ${
                                                    activeSound === sound.id  
                                                    ? 'bg-primary/10 border-primary text-primary'  
                                                    : 'bg-background hover:border-primary/30' 
                                                }`} 
                                            > 
                                                <div className="text-xl mb-1">{sound.icon}</div> 
                                                <div className="text-[10px] font-medium">{sound.name}</div> 
                                            </button> 
                                        ))} 
                                    </div> 
                                </div> 
                            </div> 
                        </motion.div> 
                    )} 
                </AnimatePresence> 

                {/* Right: Minimalist Editor */} 
                <div className="flex-1 relative flex flex-col"> 
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
                                {AMBIENT_SOUNDS.map(s => ( 
                                    <button  
                                        key={s.id} 
                                        onClick={() => setActiveSound(activeSound === s.id ? null : s.id)} 
                                        className={`text-xl grayscale hover:grayscale-0 transition-all ${activeSound === s.id ? 'grayscale-0 scale-110' : 'opacity-50'}`} 
                                    > 
                                        {s.icon} 
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

