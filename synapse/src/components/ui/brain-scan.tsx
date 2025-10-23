"use client"

import { useState, useEffect } from "react"

interface ServiceNode {
  id: string
  name: string
  category: "core" | "ai" | "enterprise" | "infrastructure" | "frontend"
  x: number
  y: number
  health: "ok" | "warning" | "critical"
  connections: string[]
  metrics: {
    cpu: number
    memory: number
    requests: number
    uptime: number
  }
}

const services: ServiceNode[] = [
  // Core Services
  {
    id: "ai-unified",
    name: "AI Unified",
    category: "core",
    x: 50,
    y: 50,
    health: "ok",
    connections: ["ai-recommendations", "ai-valuation", "ai-evolution", "ai-ml-engine"],
    metrics: { cpu: 45, memory: 62, requests: 1247, uptime: 99.98 },
  },
  {
    id: "auth",
    name: "Auth Service",
    category: "core",
    x: 30,
    y: 30,
    health: "ok",
    connections: ["ai-unified", "wallet", "marketplace"],
    metrics: { cpu: 28, memory: 41, requests: 3421, uptime: 99.99 },
  },
  {
    id: "wallet",
    name: "Wallet",
    category: "core",
    x: 70,
    y: 30,
    health: "ok",
    connections: ["ai-unified", "billing", "ledger"],
    metrics: { cpu: 52, memory: 58, requests: 892, uptime: 99.97 },
  },

  // AI Services
  {
    id: "ai-recommendations",
    name: "AI Recommendations",
    category: "ai",
    x: 35,
    y: 60,
    health: "ok",
    connections: ["ai-unified", "analytics"],
    metrics: { cpu: 67, memory: 74, requests: 2156, uptime: 99.95 },
  },
  {
    id: "ai-valuation",
    name: "AI Valuation",
    category: "ai",
    x: 65,
    y: 60,
    health: "warning",
    connections: ["ai-unified", "analytics"],
    metrics: { cpu: 82, memory: 88, requests: 1543, uptime: 99.89 },
  },
  {
    id: "ai-evolution",
    name: "AI Evolution Engine",
    category: "ai",
    x: 40,
    y: 75,
    health: "ok",
    connections: ["ai-unified", "ai-ml-engine"],
    metrics: { cpu: 71, memory: 79, requests: 456, uptime: 99.94 },
  },
  {
    id: "ai-ml-engine",
    name: "ML Engine",
    category: "ai",
    x: 60,
    y: 75,
    health: "ok",
    connections: ["ai-unified", "ai-evolution"],
    metrics: { cpu: 88, memory: 91, requests: 678, uptime: 99.92 },
  },

  // Enterprise Services
  {
    id: "marketplace",
    name: "Marketplace",
    category: "enterprise",
    x: 20,
    y: 50,
    health: "ok",
    connections: ["auth", "billing", "analytics"],
    metrics: { cpu: 34, memory: 47, requests: 1876, uptime: 99.96 },
  },
  {
    id: "billing",
    name: "Billing Service",
    category: "enterprise",
    x: 80,
    y: 50,
    health: "ok",
    connections: ["wallet", "ledger", "marketplace"],
    metrics: { cpu: 41, memory: 53, requests: 1234, uptime: 99.98 },
  },
  {
    id: "ledger",
    name: "Ledger",
    category: "enterprise",
    x: 85,
    y: 65,
    health: "ok",
    connections: ["billing", "wallet"],
    metrics: { cpu: 29, memory: 38, requests: 987, uptime: 99.99 },
  },

  // Infrastructure Services
  {
    id: "analytics",
    name: "Analytics",
    category: "infrastructure",
    x: 50,
    y: 85,
    health: "ok",
    connections: ["ai-recommendations", "ai-valuation", "marketplace", "notification"],
    metrics: { cpu: 56, memory: 64, requests: 4521, uptime: 99.93 },
  },
  {
    id: "notification",
    name: "Notification Service",
    category: "infrastructure",
    x: 15,
    y: 70,
    health: "ok",
    connections: ["analytics", "auth"],
    metrics: { cpu: 22, memory: 31, requests: 8765, uptime: 99.97 },
  },
]

export function BrainScan() {
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [dataFlow, setDataFlow] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const interval = setInterval(() => {
      setDataFlow((prev) => (prev + 2) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (health: string) => {
    switch (health) {
      case "ok":
        return "var(--status-ok)"
      case "warning":
        return "var(--status-warning)"
      case "critical":
        return "var(--status-critical)"
      default:
        return "var(--accent-primary)"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "core":
        return "var(--accent-primary)"
      case "ai":
        return "var(--accent-secondary)"
      case "enterprise":
        return "var(--accent-tertiary)"
      case "infrastructure":
        return "var(--status-info)"
      default:
        return "var(--accent-primary)"
    }
  }

  const filteredServices =
    selectedCategory === "all" ? services : services.filter((s) => s.category === selectedCategory)

  const categories = [
    { id: "all", name: "All Services", count: services.length },
    { id: "core", name: "Core", count: services.filter((s) => s.category === "core").length },
    { id: "ai", name: "AI", count: services.filter((s) => s.category === "ai").length },
    { id: "enterprise", name: "Enterprise", count: services.filter((s) => s.category === "enterprise").length },
    {
      id: "infrastructure",
      name: "Infrastructure",
      count: services.filter((s) => s.category === "infrastructure").length,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-balance">System Architecture</h2>
          <p className="text-muted-foreground text-pretty">
            Real-time visualization of 50+ microservices across the Azora OS platform
          </p>
        </div>
        <div className="glassmorphic bg-card/80 rounded-xl px-4 py-3 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Total Services</div>
          <div className="text-2xl font-bold">{services.length}</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === cat.id
                ? "glassmorphic bg-primary/10 text-primary border border-primary/30"
                : "glassmorphic bg-card/60 hover:bg-card/80 border border-border"
            }`}
          >
            {cat.name}
            <span className="ml-2 text-xs opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Main Brain Scan Visualization */}
      <div className="glassmorphic bg-card/80 rounded-2xl p-8 border border-border min-h-[600px] relative overflow-hidden">
        {/* Background grid effect */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <svg className="w-full h-[600px] relative z-10" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Draw connections with animated data flow */}
          {filteredServices.map((service) =>
            service.connections.map((targetId) => {
              const target = services.find((s) => s.id === targetId)
              if (!target || (selectedCategory !== "all" && target.category !== selectedCategory)) return null
              return (
                <g key={`${service.id}-${targetId}`}>
                  <line
                    x1={service.x}
                    y1={service.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="url(#connection-gradient)"
                    strokeWidth="0.2"
                    opacity="0.3"
                  />
                  <line
                    x1={service.x}
                    y1={service.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="url(#connection-gradient)"
                    strokeWidth="0.4"
                    opacity="0.6"
                    strokeDasharray="1 2"
                    strokeDashoffset={dataFlow / 10}
                    className="data-flow"
                  />
                </g>
              )
            }),
          )}

          {/* Draw nodes */}
          {filteredServices.map((service) => (
            <g
              key={service.id}
              onMouseEnter={() => setActiveNode(service.id)}
              onMouseLeave={() => setActiveNode(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Outer pulse ring */}
              <circle
                cx={service.x}
                cy={service.y}
                r={service.category === "core" ? 7 : 5}
                fill="none"
                stroke={getCategoryColor(service.category)}
                strokeWidth="0.2"
                opacity="0.4"
                className="breathe"
              />

              {/* Health indicator ring */}
              <circle
                cx={service.x}
                cy={service.y}
                r={service.category === "core" ? 5.5 : 4}
                fill="none"
                stroke={getHealthColor(service.health)}
                strokeWidth="0.3"
                opacity="0.6"
                className={service.health === "warning" ? "pulse-glow" : ""}
              />

              {/* Main node */}
              <circle
                cx={service.x}
                cy={service.y}
                r={service.category === "core" ? 4 : 2.5}
                fill={getCategoryColor(service.category)}
                filter="url(#glow)"
                className="pulse-glow"
                opacity={activeNode === service.id ? 1 : 0.9}
              />

              {/* Label */}
              <text
                x={service.x}
                y={service.y + (service.category === "core" ? 9 : 7)}
                textAnchor="middle"
                fill="currentColor"
                fontSize="2.5"
                fontWeight="600"
                opacity={activeNode === service.id ? 1 : 0.7}
                className="transition-opacity"
              >
                {service.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Overlay info panel */}
        {activeNode && (
          <div className="absolute top-8 right-8 glassmorphic bg-card/95 rounded-xl p-5 border border-border min-w-[280px] shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-base mb-1">{services.find((s) => s.id === activeNode)?.name}</h4>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${getCategoryColor(services.find((s) => s.id === activeNode)?.category || "")}20`,
                      color: getCategoryColor(services.find((s) => s.id === activeNode)?.category || ""),
                    }}
                  >
                    {services.find((s) => s.id === activeNode)?.category}
                  </span>
                </div>
              </div>
              <div
                className="w-3 h-3 rounded-full pulse-glow"
                style={{
                  backgroundColor: getHealthColor(services.find((s) => s.id === activeNode)?.health || "ok"),
                }}
              />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">CPU Usage</span>
                  <span className="font-mono font-medium">
                    {services.find((s) => s.id === activeNode)?.metrics.cpu}%
                  </span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full transition-all duration-500"
                    style={{ width: `${services.find((s) => s.id === activeNode)?.metrics.cpu}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Memory</span>
                  <span className="font-mono font-medium">
                    {services.find((s) => s.id === activeNode)?.metrics.memory}%
                  </span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-full transition-all duration-500"
                    style={{ width: `${services.find((s) => s.id === activeNode)?.metrics.memory}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Requests/sec</span>
                  <span className="font-mono font-medium">
                    {services.find((s) => s.id === activeNode)?.metrics.requests.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-mono font-medium text-[var(--status-ok)]">
                    {services.find((s) => s.id === activeNode)?.metrics.uptime}%
                  </span>
                </div>
              </div>
            </div>

            <button className="mt-4 w-full px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors border border-primary/20">
              View Service Details →
            </button>
          </div>
        )}
      </div>

      {/* Service Cards Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Service Health Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          {filteredServices.slice(0, 9).map((service) => (
            <div
              key={service.id}
              className="glassmorphic bg-card/80 rounded-xl p-5 border border-border hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              onMouseEnter={() => setActiveNode(service.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1 text-sm">{service.name}</h4>
                  <p className="text-xs text-muted-foreground capitalize">{service.category} Service</p>
                </div>
                <div
                  className="w-2.5 h-2.5 rounded-full pulse-glow flex-shrink-0"
                  style={{ backgroundColor: getHealthColor(service.health) }}
                />
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">CPU</span>
                    <span className="font-mono">{service.metrics.cpu}%</span>
                  </div>
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full transition-all duration-1000"
                      style={{ width: `${service.metrics.cpu}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Memory</span>
                    <span className="font-mono">{service.metrics.memory}%</span>
                  </div>
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-full transition-all duration-1000"
                      style={{ width: `${service.metrics.memory}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs pt-1">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-mono text-[var(--status-ok)]">{service.metrics.uptime}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
