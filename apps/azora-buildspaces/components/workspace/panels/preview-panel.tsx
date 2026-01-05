"use client"

import { useState, useEffect } from "react"
import {
  RefreshCw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  Loader2,
  Maximize2,
  QrCode,
  Wifi,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

type DeviceMode = "mobile" | "tablet" | "desktop"

export function PreviewPanel() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop")
  const [isLoading, setIsLoading] = useState(true)
  const [url, setUrl] = useState("localhost:3000")
  const [isConnected, setIsConnected] = useState(true)

  const deviceWidths = {
    mobile: 375,
    tablet: 768,
    desktop: "100%",
  }

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 800)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-10 border-b border-border bg-muted/30 flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-background border border-border">
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${deviceMode === "mobile" ? "bg-primary/20 text-primary" : ""}`}
              onClick={() => setDeviceMode("mobile")}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${deviceMode === "tablet" ? "bg-primary/20 text-primary" : ""}`}
              onClick={() => setDeviceMode("tablet")}
            >
              <Tablet className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${deviceMode === "desktop" ? "bg-primary/20 text-primary" : ""}`}
              onClick={() => setDeviceMode("desktop")}
            >
              <Monitor className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* URL Bar */}
        <div className="flex-1 max-w-xs mx-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-primary" : "bg-destructive"}`} />
            <Globe className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{url}</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh}>
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <QrCode className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center p-4 overflow-auto">
        <motion.div
          layout
          className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 relative"
          style={{
            width: deviceWidths[deviceMode],
            maxWidth: "100%",
            height: deviceMode === "desktop" ? "100%" : "auto",
            aspectRatio: deviceMode !== "desktop" ? "9/16" : undefined,
            maxHeight: "100%",
          }}
        >
          {/* Device Frame for mobile/tablet */}
          {deviceMode !== "desktop" && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-800 rounded-full" />
          )}

          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-gray-500">Loading preview...</span>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
              {/* Simulated App Preview */}
              <div className="min-h-full">
                {/* Nav */}
                <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500" />
                    <span className="font-semibold text-gray-900">BuildSpaces</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                    <div className="h-8 w-20 bg-emerald-500 rounded-lg" />
                  </div>
                </div>

                {/* Hero */}
                <div className="px-4 py-12 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs mb-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    AI-Powered
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">Build with AI Agents</h1>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                    Transform your vision into production-ready code
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg">Get Started</button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg">
                      Watch Demo
                    </button>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="px-4 pb-8">
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 bg-white rounded-xl border border-gray-200">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 mb-2" />
                        <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                        <div className="h-2 w-full bg-gray-100 rounded" />
                        <div className="h-2 w-2/3 bg-gray-100 rounded mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="h-6 border-t border-border bg-muted/30 flex items-center justify-between px-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Wifi className={`w-3 h-3 ${isConnected ? "text-primary" : "text-destructive"}`} />
            {isConnected ? "Hot reload active" : "Disconnected"}
          </span>
          <span>{deviceMode === "desktop" ? "100%" : deviceWidths[deviceMode] + "px"}</span>
        </div>
        <span>Updated: just now</span>
      </div>
    </div>
  )
}
