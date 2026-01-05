"use client";

import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarState } from "../avatars/Avatar";
import { MessageSquare, Shield, GraduationCap, Sparkles, X } from "lucide-react";

interface DockAssistantProps {
    defaultOpen?: boolean;
}

/**
 * DockAssistant - Fixed position assistant with Elara avatar
 * Features cursor tracking and action panel
 */
export function DockAssistant({ defaultOpen = false }: DockAssistantProps) {
    const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [state, setState] = useState<AvatarState>("idle");
    const [isPanelOpen, setIsPanelOpen] = useState(defaultOpen);
    const [showCursorGlow, setShowCursorGlow] = useState(false);

    useEffect(() => {
        const onMove = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    const handleAction = useCallback((action: AvatarState) => {
        setState(action);
        setShowCursorGlow(true);

        // Reset after 3 seconds
        setTimeout(() => {
            setState("idle");
            setShowCursorGlow(false);
        }, 3000);
    }, []);

    return (
        <>
            <div className="assistant-dock">
                {/* Action Panel */}
                {isPanelOpen && (
                    <div className="panel animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-mono text-aether-teal flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                ELARA ACTIVE
                            </span>
                            <button
                                onClick={() => setIsPanelOpen(false)}
                                className="p-1 hover:bg-white/10 rounded"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>

                        <button onClick={() => handleAction("guiding")}>
                            <MessageSquare className="w-4 h-4 inline mr-2" />
                            Elara: Guide task
                        </button>

                        <button onClick={() => handleAction("verifying")}>
                            <Shield className="w-4 h-4 inline mr-2" />
                            Court: Constitutional check
                        </button>

                        <button onClick={() => handleAction("thinking")}>
                            <GraduationCap className="w-4 h-4 inline mr-2" />
                            Teach me
                        </button>
                    </div>
                )}

                {/* Avatar Button */}
                <button
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className="relative transition-transform hover:scale-105 active:scale-95"
                    aria-label="Toggle Elara assistant"
                >
                    <Avatar persona="elara" size={56} state={state} />
                </button>
            </div>

            {/* Cursor Glow Effect */}
            <div
                className={`cursor-glow transition-opacity duration-150 ${showCursorGlow ? "active" : ""}`}
                style={{ left: cursor.x, top: cursor.y }}
                aria-hidden="true"
            />
        </>
    );
}
