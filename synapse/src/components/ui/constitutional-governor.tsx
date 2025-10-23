"use client"

import { useState, useEffect } from "react"

interface GovernorLog {
  id: string
  timestamp: string
  action: string
  decision: "approved" | "denied" | "pending"
  rule?: string
  principle?: string
}

const constitutionalPrinciples = [
  { name: "Biological Integrity", icon: "🧬", active: true },
  { name: "Cosmological Economics", icon: "🌌", active: true },
  { name: "Natural Governance", icon: "🌿", active: true },
  { name: "Phoenix Protocol", icon: "🔥", active: false },
]

export function ConstitutionalGovernor() {
  const [logs, setLogs] = useState<GovernorLog[]>([
    {
      id: "1",
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      action: "Cross-service data flow: AI Unified → Analytics",
      decision: "approved",
      principle: "Mycelial Network Protocol",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 45000).toLocaleTimeString("en-US", { hour12: false }),
      action: "User permission escalation attempt",
      decision: "denied",
      rule: "Immune System Defense",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 82000).toLocaleTimeString("en-US", { hour12: false }),
      action: "AI model evolution request",
      decision: "approved",
      principle: "DNA Polymerase Validation",
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 125000).toLocaleTimeString("en-US", { hour12: false }),
      action: "Financial transaction: Wallet → Ledger",
      decision: "approved",
      rule: "Fusion Energy Economics",
    },
  ])

  const [aiThought, setAiThought] = useState(
    "Analyzing marketplace transaction patterns. Cross-referencing with compliance frameworks.",
  )

  useEffect(() => {
    const thoughtInterval = setInterval(() => {
      const thoughts = [
        "Monitoring AI Valuation service. CPU usage elevated but within acceptable parameters.",
        "Detected anomalous pattern in authentication requests. Initiating immune response protocol.",
        "Optimizing data flow between microservices. Applying mycelial network principles.",
        "Constitutional review: All services operating within biological integrity constraints.",
        "Phoenix Protocol standby. System resilience at 99.94%. No intervention required.",
        "Analyzing cross-service dependencies. Trophic cascade analysis in progress.",
      ]
      setAiThought(thoughts[Math.floor(Math.random() * thoughts.length)])
    }, 8000)

    const logInterval = setInterval(() => {
      const actions = [
        "API rate limit validation",
        "Data encryption verification",
        "Service health monitoring",
        "User authentication refresh",
        "Blockchain transaction validation",
        "AI model performance check",
        "Database query optimization",
        "Network latency analysis",
      ]
      const principles = [
        "Organelle Architecture",
        "Keystone Species Resilience",
        "Trophic Level Balance",
        "Black Hole Economics",
        "Multiverse Value Creation",
      ]

      const newLog: GovernorLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        action: actions[Math.floor(Math.random() * actions.length)],
        decision: Math.random() > 0.15 ? "approved" : "denied",
        principle: Math.random() > 0.5 ? principles[Math.floor(Math.random() * principles.length)] : undefined,
      }
      setLogs((prev) => [newLog, ...prev].slice(0, 12))
    }, 6000)

    return () => {
      clearInterval(thoughtInterval)
      clearInterval(logInterval)
    }
  }, [])

  return (
    <aside className="fixed right-0 top-16 bottom-0 w-[360px] glassmorphic bg-card/60 border-l border-border flex flex-col">
      {/* AI Constitutional Agent Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center pulse-glow shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Constitutional AI</h3>
            <p className="text-xs text-muted-foreground">Active Monitoring</p>
          </div>
        </div>

        {/* AI Thought Process */}
        <div className="glassmorphic bg-muted/30 rounded-lg p-4 border border-border/50">
          <div className="flex items-start gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 pulse-glow" />
            <p className="text-xs leading-relaxed flex-1">{aiThought}</p>
          </div>
          <button className="w-full px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors border border-primary/20">
            View Full Analysis →
          </button>
        </div>

        {/* Constitutional Principles */}
        <div className="mt-4 space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Active Principles
          </div>
          <div className="grid grid-cols-2 gap-2">
            {constitutionalPrinciples.map((principle) => (
              <div
                key={principle.name}
                className={`glassmorphic rounded-lg p-2 border text-center transition-all ${
                  principle.active ? "bg-primary/5 border-primary/20" : "bg-card/50 border-border/50 opacity-50"
                }`}
              >
                <div className="text-lg mb-0.5">{principle.icon}</div>
                <div className="text-[9px] font-medium leading-tight">{principle.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Governor Logs Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-6 pb-3">
          <h3 className="font-semibold text-sm mb-1">Governance Log</h3>
          <p className="text-xs text-muted-foreground">Real-time decision transparency</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2.5">
          {logs.map((log, index) => (
            <div
              key={log.id}
              className="glassmorphic bg-card/80 rounded-lg p-3 border border-border/50 hover:border-border transition-all duration-200"
              style={{ animation: index === 0 ? "slideIn 0.3s ease-out" : "none" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-muted-foreground">{log.timestamp}</span>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    log.decision === "approved"
                      ? "bg-[var(--status-ok)]/10 text-[var(--status-ok)]"
                      : log.decision === "denied"
                        ? "bg-[var(--status-critical)]/10 text-[var(--status-critical)]"
                        : "bg-[var(--status-warning)]/10 text-[var(--status-warning)]"
                  }`}
                >
                  {log.decision}
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-1">{log.action}</p>
              {(log.rule || log.principle) && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/30">
                  <svg
                    className="w-3 h-3 text-muted-foreground flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-[10px] text-muted-foreground font-medium truncate">
                    {log.rule || log.principle}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
