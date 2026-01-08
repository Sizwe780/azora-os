"use client"

import { useState, useEffect } from "react"
import { agentStyles } from "./african-agent-avatar"
import { CopilotAgentAvatar } from "./copilot-agent-avatar"
import { AgentActivityBadge } from "./agent-activity-badge"
import {
    Code2,
    FileText,
    Palette,
    Brain,
    Terminal,
    Wrench,
    Users,
    Sparkles,
    LucideIcon,
} from "lucide-react"

interface LiveRoomCardProps {
    room: {
        id: string
        title: string
        description: string
        icon: LucideIcon
        color: string
        href: string
    }
    activeAgent?: keyof typeof agentStyles
    activityStatus?: "idle" | "active" | "busy"
    currentTask?: string
    taskProgress?: number
    isLarge?: boolean
    className?: string
}

// Simulated live data - in production this would come from a real-time source
const liveMetrics = {
    "code-chamber": { linesGenerated: "2.4K", filesActive: 12, buildStatus: "passing" },
    "spec-chamber": { specsValidated: 47, coverage: "94%", tests: 128 },
    "design-studio": { components: 34, tokens: 156, a11yScore: "100%" },
    "ai-studio": { agents: 6, orchestrations: 89, avgLatency: "1.2s" },
    "command-desk": { commands: "1.2K", sessions: 45, uptime: "99.9%" },
    "maker-lab": { scaffolds: 23, deploys: 156, environments: 3 },
    "collaboration-pod": { users: 8, sessions: 12, latency: "45ms" },
    "knowledge-ocean": { queries: "5.6K", documents: 890, accuracy: "97%" },
}

export function LiveRoomCard({
    room,
    activeAgent,
    activityStatus = "idle",
    currentTask,
    taskProgress,
    isLarge = false,
    className = "",
}: LiveRoomCardProps) {
    const [pulseActive, setPulseActive] = useState(false)
    const agentStyle = activeAgent ? agentStyles[activeAgent] : null
    const metrics = liveMetrics[room.id as keyof typeof liveMetrics]

    // Simulate activity pulses
    useEffect(() => {
        if (activityStatus === "active" || activityStatus === "busy") {
            const interval = setInterval(() => {
                setPulseActive((prev) => !prev)
            }, 2000)
            return () => clearInterval(interval)
        }
    }, [activityStatus])

    const Icon = room.icon

    return (
        <div
            className={`
        group relative rounded-xl overflow-hidden transition-all duration-300
        hover:transform hover:scale-[1.02] hover:shadow-2xl
        ${isLarge ? "lg:col-span-2 lg:row-span-2" : ""}
        ${className}
      `}
            style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`,
                border: `1px solid ${activityStatus !== "idle" ? `var(--${room.color}-500)30` : "rgba(255,255,255,0.1)"}`,
                boxShadow: activityStatus === "busy" ? `0 0 30px ${agentStyle?.glowColor || "rgba(255,255,255,0.1)"}` : undefined,
            }}
        >
            {/* Active status glow overlay */}
            {activityStatus !== "idle" && agentStyle && (
                <div
                    className="absolute inset-0 opacity-20 transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(circle at 80% 20%, ${agentStyle.auraColors[0]}40 0%, transparent 50%)`,
                        animation: pulseActive ? "room-pulse 2s ease-in-out infinite" : undefined,
                    }}
                />
            )}

            {/* Content */}
            <div className={`relative p-6 ${isLarge ? "min-h-[280px]" : "min-h-[160px]"} flex flex-col`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-lg`}
                            style={{
                                background: `linear-gradient(135deg, var(--${room.color}-500)20, var(--${room.color}-500)10)`,
                            }}
                        >
                            <Icon className={`h-6 w-6 text-${room.color}-400`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                {room.title}
                            </h3>
                            {activityStatus !== "idle" && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span
                                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                                        style={{ background: agentStyle?.auraColors[0] || "#10B981" }}
                                    />
                                    <span className="text-xs text-gray-400">Live</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active agent avatar */}
                    {activeAgent && activityStatus !== "idle" && (
                        <div className="relative">
                            <CopilotAgentAvatar
                                agent={activeAgent}
                                size="sm"
                                showActivity={false}
                            />
                            {activityStatus === "busy" && (
                                <div
                                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                    style={{
                                        background: agentStyle?.auraColors[0],
                                        boxShadow: `0 0 8px ${agentStyle?.auraColors[0]}`,
                                    }}
                                >
                                    <span className="text-[8px] text-white font-bold">!</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4">{room.description}</p>

                {/* Current task (if active) */}
                {currentTask && activityStatus !== "idle" && (
                    <div
                        className="mb-4 p-3 rounded-lg"
                        style={{
                            background: `linear-gradient(135deg, ${agentStyle?.auraColors[0]}10, ${agentStyle?.auraColors[1]}05)`,
                            border: `1px solid ${agentStyle?.auraColors[0]}20`,
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">Current Task</span>
                            {activeAgent && (
                                <AgentActivityBadge
                                    agent={activeAgent}
                                    status={activityStatus === "busy" ? "working" : "thinking"}
                                    size="sm"
                                />
                            )}
                        </div>
                        <p className="text-sm text-white truncate">{currentTask}</p>
                        {typeof taskProgress === "number" && (
                            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${taskProgress}%`,
                                        background: `linear-gradient(90deg, ${agentStyle?.auraColors[0]}, ${agentStyle?.auraColors[1]})`,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Live metrics for large cards */}
                {isLarge && metrics && (
                    <div className="mt-auto pt-4 border-t border-white/10">
                        <div className="grid grid-cols-3 gap-4">
                            {Object.entries(metrics).slice(0, 3).map(([key, value]) => (
                                <div key={key}>
                                    <p className="text-xl font-bold text-white">{value}</p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Connection indicators */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-1 h-1 rounded-full bg-white/20"
                            style={{
                                animation: activityStatus !== "idle" ? `connection-dot 1.5s ease-in-out ${i * 0.2}s infinite` : undefined,
                                background: activityStatus !== "idle" ? agentStyle?.auraColors[0] : undefined,
                            }}
                        />
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes room-pulse {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.25;
          }
        }

        @keyframes connection-dot {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
        </div>
    )
}

// Grid of live room cards
export function LiveRoomGrid({ className = "" }: { className?: string }) {
    const rooms = [
        {
            id: "code-chamber",
            title: "Code Chamber",
            description: "Full-stack cloud IDE with Monaco, terminal, and Git",
            icon: Code2,
            color: "emerald",
            href: "/features/code-chamber",
            agent: "themba" as const,
            status: "busy" as const,
            task: "Generating authentication module",
            progress: 67,
        },
        {
            id: "spec-chamber",
            title: "Spec Chamber",
            description: "Requirements & validation",
            icon: FileText,
            color: "blue",
            href: "/features/spec-chamber",
            agent: "nia" as const,
            status: "active" as const,
            task: "Validating API specification",
            progress: 89,
        },
        {
            id: "design-studio",
            title: "Design Studio",
            description: "Figma to React pipeline",
            icon: Palette,
            color: "purple",
            href: "/features/design-studio",
            agent: "imani" as const,
            status: "active" as const,
            task: "Extracting design tokens",
            progress: 45,
        },
        {
            id: "ai-studio",
            title: "AI Studio",
            description: "Agent orchestration",
            icon: Brain,
            color: "pink",
            href: "/features/ai-studio",
            agent: "elara" as const,
            status: "busy" as const,
            task: "Coordinating multi-agent workflow",
            progress: 34,
        },
        {
            id: "command-desk",
            title: "Command Desk",
            description: "Slash commands",
            icon: Terminal,
            color: "amber",
            href: "/features/command-desk",
        },
        {
            id: "maker-lab",
            title: "Maker Lab",
            description: "Full-stack scaffolding",
            icon: Wrench,
            color: "rose",
            href: "/features/maker-lab",
        },
        {
            id: "collaboration-pod",
            title: "Collaboration Pod",
            description: "Real-time teamwork",
            icon: Users,
            color: "cyan",
            href: "/features/collaboration-pod",
        },
        {
            id: "knowledge-ocean",
            title: "Knowledge Ocean",
            description: "AI-powered search & insights",
            icon: Sparkles,
            color: "indigo",
            href: "/features/knowledge-ocean",
            agent: "sankofa" as const,
            status: "active" as const,
            task: "Indexing knowledge base",
            progress: 78,
        },
    ]

    return (
        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
            {rooms.map((room, i) => (
                <LiveRoomCard
                    key={room.id}
                    room={room}
                    activeAgent={room.agent}
                    activityStatus={room.status || "idle"}
                    currentTask={room.task}
                    taskProgress={room.progress}
                    isLarge={i === 0}
                />
            ))}
        </div>
    )
}
