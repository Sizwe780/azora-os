"use client";

import { useEffect, useState, useRef } from "react";
import { AvatarBadge } from "../avatars/Avatar";

export type AgentType = "elara" | "themba" | "code" | "design" | "governance";
export type Verdict = "pass" | "block";

export interface OrchestrationEvent {
    id: string;
    timestamp: number;
    agent: AgentType;
    action: string;
    code?: string;
    verdict?: Verdict;
}

interface AscendStreamProps {
    events?: OrchestrationEvent[];
    maxEvents?: number;
    autoScroll?: boolean;
}

/**
 * AscendStream - Live orchestration event stream
 * Renders agent actions, code diffs, and constitutional verdicts
 */
export function AscendStream({
    events: externalEvents,
    maxEvents = 50,
    autoScroll = true
}: AscendStreamProps) {
    const [events, setEvents] = useState<OrchestrationEvent[]>([]);
    const streamRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (externalEvents) {
            const id = requestAnimationFrame(() => setEvents(externalEvents.slice(-maxEvents)));
            return () => cancelAnimationFrame(id);
        }

        // Demo seed events for showcase
        const seedEvents: OrchestrationEvent[] = [
            {
                id: "1",
                timestamp: Date.now(),
                agent: "elara",
                action: "task: initialize dashboard component"
            },
            {
                id: "2",
                timestamp: Date.now() + 250,
                agent: "code",
                action: "write: Dashboard.tsx",
                code: "export function Dashboard() {\n  return <div>...</div>\n}"
            },
            {
                id: "3",
                timestamp: Date.now() + 600,
                agent: "themba",
                action: "review: C4 architecture contracts",
                verdict: "pass"
            },
            {
                id: "4",
                timestamp: Date.now() + 950,
                agent: "governance",
                action: "verify: AI_DEV_LAWS compliance",
                verdict: "pass"
            },
            {
                id: "5",
                timestamp: Date.now() + 1200,
                agent: "design",
                action: "validate: accessibility standards",
                verdict: "pass"
            }
        ];

        const id2 = requestAnimationFrame(() => setEvents(seedEvents));
        return () => cancelAnimationFrame(id2);
    }, [externalEvents, maxEvents]);

    // Auto-scroll to bottom on new events
    useEffect(() => {
        if (autoScroll && streamRef.current) {
            streamRef.current.scrollTop = streamRef.current.scrollHeight;
        }
    }, [events, autoScroll]);

    const getAgentLabel = (agent: AgentType) => {
        switch (agent) {
            case "elara": return "Elara";
            case "themba": return "Themba";
            case "code": return "CodeGen";
            case "design": return "Design";
            case "governance": return "Court";
            default: return agent;
        }
    };

    return (
        <div className="ascend-stream" ref={streamRef}>
            {events.length === 0 ? (
                <div className="text-center text-sm opacity-50 py-8">
                    Awaiting orchestration events...
                </div>
            ) : (
                events.map((event) => (
                    <div key={event.id} className={`event agent-${event.agent}`}>
                        <div className="flex items-center gap-2 mb-1">
                            {(event.agent === "elara" || event.agent === "themba") && (
                                <AvatarBadge persona={event.agent} />
                            )}
                            {(event.agent !== "elara" && event.agent !== "themba") && (
                                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5">
                                    {getAgentLabel(event.agent)}
                                </span>
                            )}
                            <span className="text-xs opacity-50">
                                {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                        </div>

                        <span className="action">{event.action}</span>

                        {event.code && (
                            <pre className="code">
                                <code>{event.code}</code>
                            </pre>
                        )}

                        {event.verdict && (
                            <span className={`verdict ${event.verdict}`}>
                                {event.verdict === "pass" ? "✓ PASS" : "✕ BLOCK"}
                            </span>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

/**
 * Compact inline stream for embedding in other components
 */
export function AscendStreamCompact({ events }: { events?: OrchestrationEvent[] }) {
    return (
        <div className="flex items-center gap-2 text-xs font-mono overflow-x-auto py-2">
            {(events || []).slice(-3).map((event, i) => (
                <span
                    key={event.id || i}
                    className={`px-2 py-1 rounded-full border whitespace-nowrap
            ${event.agent === "elara" ? "border-[var(--aether-teal)] text-[var(--aether-teal)]" : ""}
            ${event.agent === "themba" ? "border-[var(--aether-gold)] text-[var(--aether-gold)]" : ""}
            ${event.agent === "governance" ? "border-[var(--aether-violet)] text-[var(--aether-violet)]" : ""}
            ${!["elara", "themba", "governance"].includes(event.agent) ? "border-white/20" : ""}
          `}
                >
                    {event.action}
                </span>
            ))}
        </div>
    );
}
