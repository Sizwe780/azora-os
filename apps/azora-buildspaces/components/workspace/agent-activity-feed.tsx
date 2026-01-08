"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Code2, Database, Sparkles, X, Check, Loader2, Shield, Palette } from "lucide-react"

interface Activity {
  id: string
  agent: string
  action: string
  status: "active" | "complete" | "pending"
  icon: any
  color: string
}

// Map agent names to their UI configuration
const agentConfig: Record<string, { icon: any; color: string }> = {
  Elara: { icon: Sparkles, color: "from-primary to-emerald-400" },
  Sankofa: { icon: Code2, color: "from-accent to-purple-400" },
  Themba: { icon: Database, color: "from-amber-500 to-orange-400" },
  Jabari: { icon: Shield, color: "from-blue-500 to-cyan-400" },
  Naledi: { icon: Palette, color: "from-pink-500 to-rose-400" },
}

export function AgentActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch real agent execution data from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/agents/executions?limit=10&status=active,pending,complete")
        if (response.ok) {
          const data = await response.json()
          const formattedActivities = data.executions?.map((exec: any) => ({
            id: exec.id,
            agent: exec.agent?.name || "Unknown Agent",
            action: exec.task?.description || exec.task?.title || "Processing task",
            status: exec.status === "running" ? "active" : exec.status === "completed" ? "complete" : "pending",
            icon: agentConfig[exec.agent?.name]?.icon || Bot,
            color: agentConfig[exec.agent?.name]?.color || "from-gray-500 to-gray-400",
          })) || []
          setActivities(formattedActivities)
        }
      } catch (error) {
        console.error("Failed to fetch agent activities:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchActivities, 5000)
    return () => clearInterval(interval)
  }, [])

  if (isMinimized) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary"
      >
        <Bot className="w-6 h-6 text-background" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">Agent Activity</span>
        </div>
        <button onClick={() => setIsMinimized(true)} className="p-1 rounded hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Activities */}
      <div className="p-3 space-y-2 max-h-64 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <Bot className="w-8 h-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground">No active agent tasks</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
            <motion.div
              key={activity.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center shrink-0`}
              >
                <activity.icon className="w-4 h-4 text-background" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground">{activity.agent}</div>
                <div className="text-xs text-muted-foreground truncate">{activity.action}</div>
              </div>
              <div className="shrink-0">
                {activity.status === "complete" && <Check className="w-4 h-4 text-primary" />}
                {activity.status === "active" && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                {activity.status === "pending" && (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                )}
              </div>
            </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
