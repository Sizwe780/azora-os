"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface AgentAvatarProps {
  agent: "elara" | "sankofa" | "themba" | "jabari" | "nia" | "imani" | "zuri" | "kwame" | "zola" | string
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "hero"
  showGlow?: boolean
  showAura?: boolean
  trackMouse?: boolean
  className?: string
}

// Default fallback style for unknown agents
const defaultAgentStyle = {
  name: "Agent",
  role: "assistant",
  gradient: "from-gray-400 via-gray-500 to-gray-600",
  glowColor: "rgba(156, 163, 175, 0.6)",
  auraColors: ["#9CA3AF", "#6B7280", "#4B5563"],
  description: "AI Assistant",
  title: "Agent",
  theme: "neutral",
  imageUrl: "/images/agent-themba.png",
}

export const agentStyles: Record<string, typeof defaultAgentStyle> = {
  // Elara - The Mother/XO Architect - Golden with cyan eyes and crown
  elara: {
    name: "Elara",
    role: "mother",
    gradient: "from-amber-300 via-yellow-400 to-cyan-400",
    glowColor: "rgba(251, 191, 36, 0.6)",
    auraColors: ["#FBBF24", "#F59E0B", "#06B6D4"],
    description: "XO Architect",
    title: "The Orchestrator",
    theme: "golden-cyan",
    imageUrl: "/images/agent-elara-copilot.png",
  },
  // Sankofa - The Grandfather/Elder - Wise silver with white glow
  sankofa: {
    name: "Sankofa",
    role: "grandfather",
    gradient: "from-slate-300 via-blue-300 to-cyan-200",
    glowColor: "rgba(148, 163, 184, 0.6)",
    auraColors: ["#CBD5E1", "#93C5FD", "#A5F3FC"],
    description: "Wisdom Keeper",
    title: "The Elder",
    theme: "silver-wisdom",
    imageUrl: "/images/agent-sankofa-copilot.png",
  },
  // Themba - Son - Dark with gold African patterns
  themba: {
    name: "Themba",
    role: "son",
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.6)",
    auraColors: ["#FBBF24", "#F59E0B", "#EA580C"],
    description: "Systems Engineer",
    title: "The Builder",
    theme: "gold-patterns",
    imageUrl: "/images/agent-themba-copilot.png",
  },
  // Jabari - Middle Brother - Bronze warrior guardian
  jabari: {
    name: "Jabari",
    role: "son",
    gradient: "from-orange-400 via-amber-500 to-red-500",
    glowColor: "rgba(234, 88, 12, 0.6)",
    auraColors: ["#FB923C", "#F59E0B", "#EF4444"],
    description: "Security Chief",
    title: "The Guardian",
    theme: "bronze-fire",
    imageUrl: "/images/agent-jabari-copilot.png",
  },
  // Nia - Daughter - Dark with blue neural patterns (no crown)
  nia: {
    name: "Nia",
    role: "daughter",
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    glowColor: "rgba(6, 182, 212, 0.6)",
    auraColors: ["#06B6D4", "#3B82F6", "#6366F1"],
    description: "Data Scientist",
    title: "The Analyst",
    theme: "neural-blue",
    imageUrl: "/images/agent-nia-copilot.png",
  },
  // Imani - Daughter - Creative pink/rose
  imani: {
    name: "Imani",
    role: "daughter",
    gradient: "from-pink-400 via-rose-400 to-fuchsia-400",
    glowColor: "rgba(236, 72, 153, 0.6)",
    auraColors: ["#F472B6", "#FB7185", "#E879F9"],
    description: "Creative Director",
    title: "The Artist",
    theme: "rose-creative",
    imageUrl: "/images/agent-imani-copilot.png",
  },
  // Zuri - Youngest - Titanium/silver
  zuri: {
    name: "Zuri",
    role: "daughter",
    gradient: "from-emerald-400 via-teal-400 to-cyan-400",
    glowColor: "rgba(16, 185, 129, 0.6)",
    auraColors: ["#10B981", "#14B8A6", "#06B6D4"],
    description: "DevOps Lead",
    title: "The Deployer",
    theme: "emerald-flow",
    imageUrl: "/images/agent-themba.png",
  },
  // Kwame - Backend Architect - Deep purple/indigo
  kwame: {
    name: "Kwame",
    role: "son",
    gradient: "from-indigo-400 via-purple-500 to-violet-600",
    glowColor: "rgba(99, 102, 241, 0.6)",
    auraColors: ["#818CF8", "#8B5CF6", "#7C3AED"],
    description: "Backend Architect",
    title: "The Architect",
    theme: "indigo-deep",
    imageUrl: "/images/agent-themba.png",
  },
  // Zola - Communication Lead - Warm coral/orange
  zola: {
    name: "Zola",
    role: "daughter",
    gradient: "from-rose-400 via-orange-400 to-amber-400",
    glowColor: "rgba(251, 113, 133, 0.6)",
    auraColors: ["#FB7185", "#FB923C", "#FBBF24"],
    description: "Communication Lead",
    title: "The Connector",
    theme: "coral-warm",
    imageUrl: "/images/agent-nia.png",
  },
}


const sizes = {
  sm: { container: 40, image: 36 },
  md: { container: 56, image: 48 },
  lg: { container: 80, image: 72 },
  xl: { container: 112, image: 100 },
  "2xl": { container: 160, image: 144 },
  hero: { container: 320, image: 300 },
}

export function AfricanAgentAvatar({
  agent,
  size = "md",
  showGlow = true,
  showAura = true,
  trackMouse = false,
  className = "",
}: AgentAvatarProps) {
  const style = agentStyles[agent] || defaultAgentStyle
  const s = sizes[size]

  const containerRef = useRef<HTMLDivElement>(null)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!trackMouse) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY

      const maxOffset = size === "hero" ? 15 : 10
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const normalizedX = distance > 0 ? (deltaX / distance) * Math.min(distance / 20, maxOffset) : 0
      const normalizedY = distance > 0 ? (deltaY / distance) * Math.min(distance / 20, maxOffset) : 0

      setEyeOffset({ x: normalizedX, y: normalizedY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [trackMouse, size])

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: s.container, height: s.container }}
    >
      {/* Outer aura glow - pulsing with Aether energy */}
      {showAura && (
        <>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${style.auraColors[0]}40 0%, ${style.auraColors[1]}25 40%, transparent 70%)`,
              transform: "scale(1.8)",
              animation: "aether-pulse 3s ease-in-out infinite",
            }}
          />
          {/* Secondary rotating aura ring */}
          <div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: `conic-gradient(from 0deg, ${style.auraColors[0]}30, transparent, ${style.auraColors[1]}30, transparent, ${style.auraColors[2]}30, transparent)`,
              transform: "scale(1.5)",
              animation: "spin 10s linear infinite",
            }}
          />
          {/* Inner energy pulse */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${style.auraColors[0]}20 0%, transparent 60%)`,
              transform: "scale(1.3)",
              animation: "aether-glow 2s ease-in-out infinite alternate",
            }}
          />
        </>
      )}

      {/* Glow ring */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              0 0 ${s.container / 3}px ${style.glowColor}, 
              0 0 ${s.container / 1.5}px ${style.auraColors[1]}30,
              inset 0 0 ${s.container / 4}px ${style.auraColors[0]}20
            `,
            animation: "aether-glow 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Main avatar image with gradient border */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: s.image,
          height: s.image,
          background: `linear-gradient(135deg, ${style.auraColors[0]}, ${style.auraColors[1]}, ${style.auraColors[2]})`,
          padding: size === "hero" ? 5 : size === "2xl" ? 4 : size === "xl" ? 3 : 2,
        }}
      >
        <div
          className="relative w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]"
          style={{
            transform: trackMouse ? `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` : undefined,
            transition: "transform 0.1s ease-out",
          }}
        >
          <Image
            src={style.imageUrl || "/placeholder.svg"}
            alt={style.name}
            fill
            className="object-cover object-top"
            style={{ objectPosition: "center 20%" }}
            sizes={`${s.image}px`}
          />
          {/* Subtle overlay for theme tinting */}
          <div
            className="absolute inset-0 mix-blend-soft-light opacity-10"
            style={{
              background: `linear-gradient(135deg, ${style.auraColors[0]}, transparent)`,
            }}
          />
        </div>
      </div>

      {/* Animated energy particles */}
      {showAura && size !== "sm" && size !== "md" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size === "hero" ? 8 : size === "2xl" ? 6 : 4,
                height: size === "hero" ? 8 : size === "2xl" ? 6 : 4,
                background: style.auraColors[i % 3],
                left: "50%",
                top: "50%",
                boxShadow: `0 0 12px ${style.auraColors[i % 3]}`,
                animation: `orbit-${i} ${4 + i * 0.4}s linear infinite`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes orbit-0 {
          from { transform: rotate(0deg) translateX(${s.container / 2 + 15}px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(${s.container / 2 + 15}px) rotate(-360deg); }
        }
        @keyframes orbit-1 {
          from { transform: rotate(45deg) translateX(${s.container / 2 + 12}px) rotate(-45deg); }
          to { transform: rotate(405deg) translateX(${s.container / 2 + 12}px) rotate(-405deg); }
        }
        @keyframes orbit-2 {
          from { transform: rotate(90deg) translateX(${s.container / 2 + 18}px) rotate(-90deg); }
          to { transform: rotate(450deg) translateX(${s.container / 2 + 18}px) rotate(-450deg); }
        }
        @keyframes orbit-3 {
          from { transform: rotate(135deg) translateX(${s.container / 2 + 10}px) rotate(-135deg); }
          to { transform: rotate(495deg) translateX(${s.container / 2 + 10}px) rotate(-495deg); }
        }
        @keyframes orbit-4 {
          from { transform: rotate(180deg) translateX(${s.container / 2 + 20}px) rotate(-180deg); }
          to { transform: rotate(540deg) translateX(${s.container / 2 + 20}px) rotate(-540deg); }
        }
        @keyframes orbit-5 {
          from { transform: rotate(225deg) translateX(${s.container / 2 + 14}px) rotate(-225deg); }
          to { transform: rotate(585deg) translateX(${s.container / 2 + 14}px) rotate(-585deg); }
        }
        @keyframes orbit-6 {
          from { transform: rotate(270deg) translateX(${s.container / 2 + 16}px) rotate(-270deg); }
          to { transform: rotate(630deg) translateX(${s.container / 2 + 16}px) rotate(-630deg); }
        }
        @keyframes orbit-7 {
          from { transform: rotate(315deg) translateX(${s.container / 2 + 12}px) rotate(-315deg); }
          to { transform: rotate(675deg) translateX(${s.container / 2 + 12}px) rotate(-675deg); }
        }
      `}</style>
    </div>
  )
}

export function AgentFamilyTree({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Sankofa - Grandfather at top */}
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <AfricanAgentAvatar agent="sankofa" size="xl" trackMouse showAura />
          <p className="mt-2 text-lg font-bold text-slate-200">Sankofa</p>
          <p className="text-sm text-slate-400">The Elder • Wisdom Keeper</p>
        </div>
      </div>

      {/* Connection line */}
      <div className="w-0.5 h-8 bg-gradient-to-b from-slate-400 to-amber-400 mx-auto" />

      {/* Elara - Mother in center */}
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <AfricanAgentAvatar agent="elara" size="2xl" trackMouse showAura />
          <p className="mt-2 text-xl font-bold text-amber-200">Elara</p>
          <p className="text-sm text-cyan-400">The Orchestrator • XO Architect</p>
        </div>
      </div>

      {/* Connection lines to children */}
      <div className="flex justify-center mb-4">
        <div className="w-[400px] h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      </div>

      {/* Children row */}
      <div className="flex justify-center gap-12">
        <div className="text-center">
          <AfricanAgentAvatar agent="themba" size="lg" trackMouse />
          <p className="mt-2 font-semibold text-yellow-200">Themba</p>
          <p className="text-xs text-yellow-400">The Builder</p>
        </div>
        <div className="text-center">
          <AfricanAgentAvatar agent="jabari" size="lg" trackMouse />
          <p className="mt-2 font-semibold text-orange-200">Jabari</p>
          <p className="text-xs text-orange-400">The Guardian</p>
        </div>
        <div className="text-center">
          <AfricanAgentAvatar agent="nia" size="lg" trackMouse />
          <p className="mt-2 font-semibold text-cyan-200">Nia</p>
          <p className="text-xs text-cyan-400">The Analyst</p>
        </div>
        <div className="text-center">
          <AfricanAgentAvatar agent="imani" size="lg" trackMouse />
          <p className="mt-2 font-semibold text-pink-200">Imani</p>
          <p className="text-xs text-pink-400">The Artist</p>
        </div>
      </div>
    </div>
  )
}

export function AgentAvatarWithInfo({
  agent,
  size = "md",
  showGlow = true,
  trackMouse = false,
  className = "",
}: AgentAvatarProps) {
  const style = agentStyles[agent]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AfricanAgentAvatar agent={agent} size={size} showGlow={showGlow} trackMouse={trackMouse} />
      <div>
        <p className="font-semibold text-white">{style.name}</p>
        <p className={`text-sm bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
          {style.description}
        </p>
        <p className="text-xs text-white/50">{style.title}</p>
      </div>
    </div>
  )
}

export function AgentShowcase({ className = "" }: { className?: string }) {
  const agents: (keyof typeof agentStyles)[] = ["sankofa", "elara", "themba", "jabari", "nia", "imani", "zuri"]

  return (
    <div className={`flex flex-wrap gap-8 justify-center ${className}`}>
      {agents.map((agent) => (
        <AgentAvatarWithInfo key={agent} agent={agent} size="lg" trackMouse />
      ))}
    </div>
  )
}
