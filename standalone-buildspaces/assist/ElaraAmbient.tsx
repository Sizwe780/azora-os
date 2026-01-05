"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Avatar } from "@/components/avatars";

// Web Speech API Types
interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: { transcript: string };
}

interface SpeechRecognitionResultList {
    length: number;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

interface SpeechRecognitionInstance {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

// Types
export type AmbientState = "idle" | "listening" | "thinking" | "responding" | "error";
export type AscendAgent = "Elara" | "Themba" | "AscendCode" | "AscendDesign" | "AscendGovernance" | "AscendFocus";

export interface Directive {
    id: string;
    timestamp: number;
    speech: string;
    intent: string;
    routedTo: AscendAgent;
    response?: string;
    status: "pending" | "processing" | "complete" | "failed";
}

export interface ElaraAmbientConfig {
    roomContext?: string;
    enableAuditLog?: boolean;
    voiceFeedback?: boolean;
}

/**
 * ElaraAmbient Agent
 * Voice-first constitutional agent for BuildSpaces
 * Always-listening, routes directives to Ascend AI Family
 */
export function useElaraAmbient(config: ElaraAmbientConfig = {}) {
    const { roomContext = "CodeChamber", enableAuditLog = true, voiceFeedback = true } = config;

    const [state, setState] = useState<AmbientState>("idle");
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [directives, setDirectives] = useState<Directive[]>([]);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Parse directive and route to appropriate agent
    const parseDirective = useCallback((speech: string): { intent: string; agent: AscendAgent } => {
        const lower = speech.toLowerCase();

        // Route based on keywords
        if (lower.includes("scaffold") || lower.includes("generate") || lower.includes("code") || lower.includes("build")) {
            return { intent: "code_generation", agent: "AscendCode" };
        }
        if (lower.includes("design") || lower.includes("ui") || lower.includes("layout") || lower.includes("style")) {
            return { intent: "design_task", agent: "AscendDesign" };
        }
        if (lower.includes("review") || lower.includes("architecture") || lower.includes("structure")) {
            return { intent: "architecture_review", agent: "Themba" };
        }
        if (lower.includes("verify") || lower.includes("constitution") || lower.includes("compliance") || lower.includes("audit")) {
            return { intent: "governance_check", agent: "AscendGovernance" };
        }
        if (lower.includes("focus") || lower.includes("pomodoro") || lower.includes("distraction")) {
            return { intent: "focus_mode", agent: "AscendFocus" };
        }

        // Default to Elara for general queries
        return { intent: "general_guidance", agent: "Elara" };
    }, []);

    // Handle incoming directive
    const handleDirective = useCallback(async (speech: string) => {
        // Check for wake word "Elara"
        if (!speech.toLowerCase().includes("elara")) {
            return; // Ignore if wake word not detected
        }

        setState("thinking");
        const { intent, agent } = parseDirective(speech);

        const directive: Directive = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            speech,
            intent,
            routedTo: agent,
            status: "pending"
        };

        setDirectives(prev => [...prev, directive]);

        // Log to audit trail
        if (enableAuditLog) {
            console.log("[ElaraAmbient] Directive logged:", {
                ...directive,
                roomContext,
                constitutionalCompliance: true
            });
        }

        // Simulate agent processing
        setState("responding");
        directive.status = "processing";
        setDirectives(prev => prev.map(d => d.id === directive.id ? directive : d));

        // Generate response based on agent
        await new Promise(resolve => setTimeout(resolve, 1500));

        const responses: Record<AscendAgent, string> = {
            Elara: "I understand. Let me guide you through this task step by step.",
            Themba: "Reviewing the architecture now. I'll ensure it follows C4 principles.",
            AscendCode: "Generating the code with constitutional validation. One moment.",
            AscendDesign: "Creating the design with accessibility and Aether Aura principles.",
            AscendGovernance: "Running constitutional compliance check. No violations detected.",
            AscendFocus: "Activating Deep Focus mode. All distractions minimized."
        };

        directive.response = responses[agent];
        directive.status = "complete";
        setDirectives(prev => prev.map(d => d.id === directive.id ? directive : d));

        // Voice feedback
        if (voiceFeedback && synthRef.current) {
            const utterance = new SpeechSynthesisUtterance(directive.response);
            utterance.rate = 1;
            utterance.pitch = 1;
            synthRef.current.speak(utterance);
        }

        setState("idle");
    }, [parseDirective, roomContext, enableAuditLog, voiceFeedback]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognitionAPI) {
                const recognition = new SpeechRecognitionAPI() as SpeechRecognitionInstance;
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = "en-US";

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    let finalTranscript = "";
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        if (result.isFinal) {
                            finalTranscript += result[0].transcript;
                        }
                    }
                    if (finalTranscript) {
                        setTranscript(finalTranscript);
                        handleDirective(finalTranscript);
                    }
                };

                recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                    setError(`Speech recognition error: ${event.error}`);
                    setState("error");
                };

                recognitionRef.current = recognition;
            }

            synthRef.current = window.speechSynthesis;
        }
    }, []);

    // Start listening
    const startListening = useCallback(async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            recognitionRef.current?.start();
            setIsListening(true);
            setState("listening");
            setError(null);
        } catch (err) {
            setError("Microphone access denied");
            setState("error");
        }
    }, []);

    // Stop listening
    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
        setState("idle");
    }, []);

    // Toggle listening
    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return {
        state,
        isListening,
        transcript,
        directives,
        error,
        startListening,
        stopListening,
        toggleListening
    };
}

/**
 * ElaraAmbient UI Component
 * Visual presence for the ambient agent
 */
export function ElaraAmbientPresence({ roomContext = "CodeChamber" }: { roomContext?: string }) {
    const { state, isListening, transcript, directives, toggleListening, error } = useElaraAmbient({
        roomContext,
        enableAuditLog: true,
        voiceFeedback: true
    });

    const stateToAvatarState = (s: AmbientState) => {
        switch (s) {
            case "listening": return "guiding";
            case "thinking": return "thinking";
            case "responding": return "verifying";
            default: return "idle";
        }
    };

    return (
        <div className="elara-ambient-presence fixed bottom-6 left-6 z-50">
            {/* Ambient Aura Ring */}
            <div className={`relative ${isListening ? "animate-pulse" : ""}`} style={{ animationDuration: "2s" }}>
                {/* Outer Glow */}
                {isListening && (
                    <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-[#21d4b3]/30 via-[#8a66ff]/30 to-[#f5c349]/30 blur-xl animate-spin"
                        style={{ animationDuration: "4s" }} />
                )}

                {/* Avatar Button */}
                <button
                    onClick={toggleListening}
                    className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#0c0f14] border border-white/10 hover:border-[#21d4b3]/50 transition-all duration-300"
                    aria-label={isListening ? "Stop listening" : "Start Elara"}
                >
                    <Avatar persona="elara" size={48} state={stateToAvatarState(state)} />
                </button>

                {/* State Indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0c0f14] ${state === "idle" ? "bg-gray-500" :
                    state === "listening" ? "bg-[#21d4b3] animate-pulse" :
                        state === "thinking" ? "bg-[#f5c349] animate-pulse" :
                            state === "responding" ? "bg-[#8a66ff]" :
                                "bg-red-500"
                    }`} />
            </div>

            {/* Expanded Panel (when listening) */}
            {isListening && (
                <div className="absolute bottom-20 left-0 w-80 p-4 bg-[#0c0f14]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-[#21d4b3] animate-pulse" />
                        <span className="text-xs font-mono text-[#21d4b3]">ELARA LISTENING</span>
                    </div>

                    {transcript && (
                        <p className="text-sm text-white/80 mb-3">"{transcript}"</p>
                    )}

                    {directives.slice(-3).map(d => (
                        <div key={d.id} className="text-xs text-white/60 py-1 border-t border-white/5">
                            <span className="text-[#8a66ff]">[{d.routedTo}]</span> {d.intent}
                            {d.status === "complete" && <span className="text-[#21d4b3] ml-2">✓</span>}
                        </div>
                    ))}

                    {error && (
                        <p className="text-xs text-red-400 mt-2">{error}</p>
                    )}
                </div>
            )}
        </div>
    );
}
