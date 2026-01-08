"use client"

import { agentStyles } from "./african-agent-avatar"

type ActivityStatus = "idle" | "thinking" | "working" | "reviewing" | "complete" | "error"

interface AgentActivityBadgeProps {
    agent: keyof typeof agentStyles
    status: ActivityStatus
    customText?: string
    showDots?: boolean
    size?: "sm" | "md" | "lg"
    className?: string
}

const statusConfig: Record<ActivityStatus, { text: string; showDots: boolean }> = {
    idle: { text: "Ready", showDots: false },
    thinking: { text: "Thinking", showDots: true },
    working: { text: "Working", showDots: true },
    reviewing: { text: "Reviewing", showDots: true },
    complete: { text: "Complete", showDots: false },
    error: { text: "Error", showDots: false },
}

const sizeStyles = {
    sm: { padding: "px-2 py-0.5", text: "text-[10px]", dot: "w-1 h-1", gap: "gap-0.5" },
    md: { padding: "px-3 py-1", text: "text-xs", dot: "w-1.5 h-1.5", gap: "gap-1" },
    lg: { padding: "px-4 py-1.5", text: "text-sm", dot: "w-2 h-2", gap: "gap-1.5" },
}

export function AgentActivityBadge({
    agent,
    status,
    customText,
    showDots,
    size = "md",
    className = "",
}: AgentActivityBadgeProps) {
    const style = agentStyles[agent]
    const config = statusConfig[status]
    const sizeStyle = sizeStyles[size]
    const displayDots = showDots ?? config.showDots
    const displayText = customText ?? config.text

    return (
        <div
            className={`inline-flex items-center ${sizeStyle.gap} ${sizeStyle.padding} rounded-full ${className}`}
            style={{
                background: `linear-gradient(135deg, ${style.auraColors[0]}15, ${style.auraColors[1]}10)`,
                border: `1px solid ${style.auraColors[0]}30`,
                boxShadow: status === "working" ? `0 0 12px ${style.auraColors[0]}20` : undefined,
            }}
        >
            {/* Status indicator dot/icon */}
            {status === "complete" ? (
                <svg
                    className={`${sizeStyle.dot}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{ color: style.auraColors[0] }}
                >
                    <path
                        d="M2 6L5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : status === "error" ? (
                <svg
                    className={`${sizeStyle.dot}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{ color: "#EF4444" }}
                >
                    <path
                        d="M3 3L9 9M9 3L3 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            ) : displayDots ? (
                <div className={`flex items-center ${sizeStyle.gap}`}>
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className={`${sizeStyle.dot} rounded-full`}
                            style={{
                                background: style.auraColors[i % 3],
                                animation: `activity-dot 1.4s ease-in-out ${i * 0.15}s infinite`,
                            }}
                        />
                    ))}
                </div>
            ) : (
                <span
                    className={`${sizeStyle.dot} rounded-full`}
                    style={{
                        background: style.auraColors[0],
                        animation: status === "idle" ? "pulse-dot 2s ease-in-out infinite" : undefined,
                    }}
                />
            )}

            {/* Status text */}
            <span
                className={`${sizeStyle.text} font-medium`}
                style={{
                    background: `linear-gradient(90deg, ${style.auraColors[0]}, ${style.auraColors[1]})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                {displayText}
            </span>

            <style>{`
        @keyframes activity-dot {
          0%, 60%, 100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1.3);
          }
        }

        @keyframes pulse-dot {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
        </div>
    )
}

// Compound component for task-specific activity
interface TaskActivityProps {
    agent: keyof typeof agentStyles
    task: string
    status: ActivityStatus
    progress?: number
    className?: string
}

export function TaskActivity({
    agent,
    task,
    status,
    progress,
    className = "",
}: TaskActivityProps) {
    const style = agentStyles[agent]

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${className}`}
            style={{
                background: `linear-gradient(135deg, ${style.auraColors[0]}08, ${style.auraColors[1]}05)`,
                border: `1px solid ${style.auraColors[0]}20`,
            }}
        >
            {/* Agent indicator */}
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                    background: `linear-gradient(135deg, ${style.auraColors[0]}30, ${style.auraColors[1]}20)`,
                    border: `2px solid ${style.auraColors[0]}40`,
                    color: style.auraColors[0],
                }}
            >
                {style.name[0]}
            </div>

            {/* Task info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{task}</p>
                {typeof progress === "number" && (
                    <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg, ${style.auraColors[0]}, ${style.auraColors[1]})`,
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Status badge */}
            <AgentActivityBadge agent={agent} status={status} size="sm" />
        </div>
    )
}
