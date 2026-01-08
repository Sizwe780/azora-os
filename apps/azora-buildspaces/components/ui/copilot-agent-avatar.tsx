"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { agentStyles } from "./african-agent-avatar"

interface CopilotAgentAvatarProps {
    agent: keyof typeof agentStyles
    size?: "sm" | "md" | "lg" | "xl" | "hero"
    showActivity?: boolean
    activityText?: string
    isWorking?: boolean
    className?: string
}

const sizeConfig = {
    sm: { container: 48, avatar: 40, glow: 60, particles: 4 },
    md: { container: 80, avatar: 64, glow: 100, particles: 6 },
    lg: { container: 120, avatar: 96, glow: 150, particles: 8 },
    xl: { container: 180, avatar: 144, glow: 220, particles: 10 },
    hero: { container: 280, avatar: 224, glow: 340, particles: 12 },
}

export function CopilotAgentAvatar({
    agent,
    size = "lg",
    showActivity = false,
    activityText = "Ready",
    isWorking = false,
    className = "",
}: CopilotAgentAvatarProps) {
    const style = agentStyles[agent]
    const config = sizeConfig[size]
    const containerRef = useRef<HTMLDivElement>(null)
    const [rotation, setRotation] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    // Mouse tracking for 3D head rotation
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return

            const rect = containerRef.current.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2

            const deltaX = e.clientX - centerX
            const deltaY = e.clientY - centerY

            // Calculate rotation based on mouse distance (max 15 degrees)
            const maxRotation = 15
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
            const maxDistance = 400

            const rotateY = (deltaX / maxDistance) * maxRotation
            const rotateX = -(deltaY / maxDistance) * maxRotation

            setRotation({
                x: Math.max(-maxRotation, Math.min(maxRotation, rotateX)),
                y: Math.max(-maxRotation, Math.min(maxRotation, rotateY)),
            })
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    // Generate orbital particles with deterministic values (no Math.random for hydration)
    const particles = useMemo(() => {
        // Use a deterministic pattern based on index to avoid hydration mismatch
        const seedPattern = [0.3, 0.7, 0.1, 0.9, 0.5, 0.2, 0.8, 0.4, 0.6, 0.15, 0.85, 0.45]
        return Array.from({ length: config.particles }, (_, i) => ({
            id: i,
            delay: i * (3 / config.particles),
            duration: 3 + seedPattern[i % seedPattern.length] * 2,
            radius: config.glow * 0.4 + seedPattern[(i + 3) % seedPattern.length] * (config.glow * 0.15),
            size: 3 + seedPattern[(i + 5) % seedPattern.length] * 4,
            colorIndex: i % 3,
        }))
    }, [config])

    return (
        <div
            ref={containerRef}
            className={`relative inline-flex flex-col items-center ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                perspective: "1000px",
                width: config.container,
            }}
        >
            {/* Main avatar container with 3D transforms */}
            <div
                className="relative"
                style={{
                    width: config.container,
                    height: config.container,
                    transform: `
            rotateX(${rotation.x}deg) 
            rotateY(${rotation.y}deg)
          `,
                    transformStyle: "preserve-3d",
                    transition: "transform 0.15s ease-out",
                }}
            >
                {/* Outer glow aura */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${style.auraColors[0]}50 0%, ${style.auraColors[1]}30 40%, transparent 70%)`,
                        transform: `scale(1.6) translateZ(-30px)`,
                        animation: "aether-pulse 3s ease-in-out infinite",
                        filter: "blur(8px)",
                    }}
                />

                {/* Rotating orbital ring */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `conic-gradient(from 0deg, ${style.auraColors[0]}40, transparent, ${style.auraColors[1]}40, transparent, ${style.auraColors[2]}40, transparent)`,
                        transform: "scale(1.4) translateZ(-20px)",
                        animation: "spin 8s linear infinite",
                    }}
                />

                {/* Inner energy pulse ring */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `radial-gradient(circle, transparent 50%, ${style.auraColors[0]}20 60%, transparent 70%)`,
                        transform: "scale(1.2) translateZ(-10px)",
                        animation: "aether-glow 2s ease-in-out infinite alternate",
                    }}
                />

                {/* Floating avatar with bobbing animation */}
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                        animation: "copilot-float 4s ease-in-out infinite",
                        transformStyle: "preserve-3d",
                    }}
                >
                    {/* Gradient border ring */}
                    <div
                        className="relative rounded-full"
                        style={{
                            width: config.avatar + 8,
                            height: config.avatar + 8,
                            background: `linear-gradient(135deg, ${style.auraColors[0]}, ${style.auraColors[1]}, ${style.auraColors[2]})`,
                            padding: 4,
                            boxShadow: `
                0 0 30px ${style.glowColor},
                0 0 60px ${style.auraColors[0]}40,
                inset 0 0 20px ${style.auraColors[1]}20
              `,
                            transform: "translateZ(20px)",
                        }}
                    >
                        {/* Avatar image */}
                        <div
                            className="relative w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]"
                            style={{
                                boxShadow: `inset 0 0 20px ${style.auraColors[0]}30`,
                            }}
                        >
                            <Image
                                src={style.imageUrl || "/placeholder.svg"}
                                alt={style.name}
                                fill
                                className="object-cover object-top"
                                style={{ objectPosition: "center 20%" }}
                                sizes={`${config.avatar}px`}
                            />

                            {/* Overlay shimmer effect when working */}
                            {isWorking && (
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: `linear-gradient(135deg, transparent 30%, ${style.auraColors[0]}30 50%, transparent 70%)`,
                                        animation: "shimmer 2s infinite",
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Orbital particles */}
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            background: style.auraColors[particle.colorIndex],
                            boxShadow: `0 0 ${particle.size * 2}px ${style.auraColors[particle.colorIndex]}`,
                            left: "50%",
                            top: "50%",
                            marginLeft: -particle.size / 2,
                            marginTop: -particle.size / 2,
                            animation: `orbit-particle ${particle.duration}s linear infinite`,
                            animationDelay: `${particle.delay}s`,
                            transformOrigin: "center center",
                            ["--orbit-radius" as string]: `${particle.radius}px`,
                        }}
                    />
                ))}
            </div>

            {/* Activity indicator */}
            {showActivity && (
                <div
                    className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{
                        background: `linear-gradient(135deg, ${style.auraColors[0]}20, ${style.auraColors[1]}10)`,
                        border: `1px solid ${style.auraColors[0]}30`,
                    }}
                >
                    {isWorking && (
                        <div className="flex items-center gap-1">
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                    background: style.auraColors[0],
                                    animation: "typing-dot 1.4s ease-in-out infinite",
                                }}
                            />
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                    background: style.auraColors[1],
                                    animation: "typing-dot 1.4s ease-in-out 0.2s infinite",
                                }}
                            />
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                    background: style.auraColors[2],
                                    animation: "typing-dot 1.4s ease-in-out 0.4s infinite",
                                }}
                            />
                        </div>
                    )}
                    <span
                        className="text-xs font-medium"
                        style={{
                            background: `linear-gradient(90deg, ${style.auraColors[0]}, ${style.auraColors[1]})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        {activityText}
                    </span>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
        @keyframes copilot-float {
          0%, 100% {
            transform: translateY(0px) rotateZ(-0.5deg);
          }
          50% {
            transform: translateY(-12px) rotateZ(0.5deg);
          }
        }

        @keyframes orbit-particle {
          from {
            transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes typing-dot {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes aether-pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1.5) translateZ(-30px);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.7) translateZ(-30px);
          }
        }

        @keyframes aether-glow {
          0% {
            opacity: 0.3;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
        </div>
    )
}

// Agent showcase with Copilot-style avatars
export function CopilotAgentShowcase({ className = "" }: { className?: string }) {
    const agents: (keyof typeof agentStyles)[] = ["elara", "sankofa", "themba", "jabari", "nia", "imani"]

    const activityStates = [
        { text: "Orchestrating...", working: true },
        { text: "Wisdom ready", working: false },
        { text: "Building...", working: true },
        { text: "Securing...", working: true },
        { text: "Analyzing...", working: true },
        { text: "Designing...", working: false },
    ]

    return (
        <div className={`flex flex-wrap justify-center gap-12 ${className}`}>
            {agents.map((agent, i) => {
                const style = agentStyles[agent]
                const activity = activityStates[i]
                return (
                    <div key={agent} className="flex flex-col items-center text-center">
                        <CopilotAgentAvatar
                            agent={agent}
                            size="lg"
                            showActivity
                            activityText={activity.text}
                            isWorking={activity.working}
                        />
                        <h3 className="mt-4 font-semibold text-white">{style.name}</h3>
                        <p
                            className="text-sm"
                            style={{
                                background: `linear-gradient(90deg, ${style.auraColors[0]}, ${style.auraColors[1]})`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            {style.description}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
