"use client"

import { useState, useRef, useEffect } from "react"
import { X, TerminalIcon, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { XTerminal } from "./x-terminal"

interface TerminalPanelProps {
  onClose: () => void
}

export function TerminalPanel({ onClose }: TerminalPanelProps) {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001?type=terminal&sessionId=default")
    
    socket.onopen = () => {
      setIsConnected(true)
      console.log("Terminal WebSocket connected")
    }

    socket.onclose = () => {
      setIsConnected(false)
      console.log("Terminal WebSocket disconnected")
    }

    setWs(socket)

    return () => {
      socket.close()
    }
  }, [])

  const handleData = (data: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(data)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <TerminalIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Terminal</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden">
        <XTerminal 
          onData={handleData} 
          socket={ws}
        />
      </div>
    </div>
  )
}
