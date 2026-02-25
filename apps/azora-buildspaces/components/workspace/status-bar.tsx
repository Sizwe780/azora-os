"use client"

import { useState, useEffect } from "react"
import { GitBranch, AlertCircle, CheckCircle2, Bell, Wifi, Cpu, Bot, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface StatusBarProps {
  activeFile: string
  agentCount: number
  activeAgents: number
}

export function StatusBar({ activeFile, agentCount, activeAgents }: StatusBarProps) {
  const [cpuUsage, setCpuUsage] = useState(45)

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(20, Math.min(90, prev + (Math.random() - 0.5) * 8)))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-6 bg-primary/5 border-t border-border flex items-center justify-between px-3 text-xs shrink-0 select-none">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-primary">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
            <Sparkles className="w-3.5 h-3.5" />
          </motion.div>
          <span className="font-medium">Elara Active</span>
        </div>

        <div className="h-3 w-px bg-border" />

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <GitBranch className="w-3.5 h-3.5 text-primary" />
          <span>main</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          <span>0 errors</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>2 warnings</span>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Bot className="w-3.5 h-3.5 text-primary" />
          <span>
            <span className="text-primary font-medium">{activeAgents}</span>/{agentCount} agents active
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Wifi className="w-3.5 h-3.5 text-primary" />
          <span>Connected</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Cpu className="w-3.5 h-3.5" />
          <span>{Math.round(cpuUsage)}% CPU</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span>TypeScript React</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span>UTF-8</span>
        </div>

        <Bell className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
      </div>
    </div>
  )
}
