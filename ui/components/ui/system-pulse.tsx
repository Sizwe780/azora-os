"use client"

import { useState, useEffect } from "react"

type HealthStatus = "ok" | "warning" | "critical"

export function SystemPulse() {
  const [status, setStatus] = useState<HealthStatus>("ok")
  const [pulseSpeed, setPulseSpeed] = useState(3)
  const [metrics, setMetrics] = useState({
    services: 12,
    healthy: 11,
    warning: 1,
    critical: 0,
  })

  useEffect(() => {
    // Simulate health status changes
    const interval = setInterval(() => {
      const random = Math.random()
      if (random > 0.97) {
        setStatus("critical")
        setPulseSpeed(1)
        setMetrics({ services: 12, healthy: 9, warning: 2, critical: 1 })
      } else if (random > 0.88) {
        setStatus("warning")
        setPulseSpeed(1.8)
        setMetrics({ services: 12, healthy: 10, warning: 2, critical: 0 })
      } else {
        setStatus("ok")
        setPulseSpeed(3)
        setMetrics({ services: 12, healthy: 11, warning: 1, critical: 0 })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case "ok":
        return "var(--status-ok)"
      case "warning":
        return "var(--status-warning)"
      case "critical":
        return "var(--status-critical)"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "ok":
        return "Optimal"
      case "warning":
        return "Elevated"
      case "critical":
        return "Critical"
    }
  }

  return (
    <div className="flex-1 max-w-md mx-8 relative">
      {/* Pulse bar */}
      <div className="h-1.5 rounded-full overflow-hidden bg-muted/30 relative">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            background: `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}80)`,
            animation: `pulse-glow ${pulseSpeed}s ease-in-out infinite`,
            boxShadow: `0 0 20px ${getStatusColor()}`,
            width: "100%",
          }}
        />
      </div>

      {/* Status label */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">System Pulse</span>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: getStatusColor() }}>
          {getStatusText()}
        </span>
      </div>

      {/* Metrics tooltip */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 glassmorphic bg-card/95 rounded-lg px-3 py-2 border border-border shadow-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="flex gap-4 text-[10px]">
          <div>
            <div className="text-muted-foreground mb-0.5">Healthy</div>
            <div className="font-mono font-semibold text-[var(--status-ok)]">{metrics.healthy}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-0.5">Warning</div>
            <div className="font-mono font-semibold text-[var(--status-warning)]">{metrics.warning}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-0.5">Critical</div>
            <div className="font-mono font-semibold text-[var(--status-critical)]">{metrics.critical}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
