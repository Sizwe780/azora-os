"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  RefreshCw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  Loader2,
  Maximize2,
  Wifi,
  WifiOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

type DeviceMode = "mobile" | "tablet" | "desktop"

const PREVIEW_URLS = [
  process.env.NEXT_PUBLIC_PREVIEW_URL,
  "http://localhost:3000",
].filter(Boolean) as string[]

export function PreviewPanel() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop")
  const [isLoading, setIsLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState(PREVIEW_URLS[0])
  const [inputUrl, setInputUrl] = useState(PREVIEW_URLS[0])
  const [iframeError, setIframeError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const deviceWidths: Record<DeviceMode, number | string> = {
    mobile: 375,
    tablet: 768,
    desktop: "100%",
  }

  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    setIframeError(false)
    if (iframeRef.current) {
      iframeRef.current.src = previewUrl
    }
  }, [previewUrl])

  const handleOpenExternal = () => {
    window.open(previewUrl, "_blank", "noopener,noreferrer")
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPreviewUrl(inputUrl)
    setIframeError(false)
    setIsLoading(true)
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
              title="Mobile view"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${deviceMode === "tablet" ? "bg-primary/20 text-primary" : ""}`}
              onClick={() => setDeviceMode("tablet")}
              title="Tablet view"
            >
              <Tablet className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${deviceMode === "desktop" ? "bg-primary/20 text-primary" : ""}`}
              onClick={() => setDeviceMode("desktop")}
              title="Desktop view"
            >
              <Monitor className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* URL Bar */}
        <form className="flex-1 max-w-xs mx-2" onSubmit={handleUrlSubmit}>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-xs cursor-text hover:border-primary/50 transition-colors">
            <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent text-muted-foreground outline-none min-w-0 text-xs"
              placeholder="http://localhost:3000"
            />
          </div>
        </form>

        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh} title="Refresh">
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleOpenExternal} title="Open in new tab">
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center p-4 overflow-auto">
        <motion.div
          layout
          className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 relative h-full"
          style={{
            width: deviceWidths[deviceMode],
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {/* Device notch for mobile/tablet */}
          {deviceMode !== "desktop" && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-800 rounded-b-full z-10" />
          )}

          {!iframeError ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm text-gray-500">Connecting to dev server...</span>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-0"
                title="Live preview"
                onLoad={() => setIsLoading(false)}
                onError={() => { setIframeError(true); setIsLoading(false) }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-4 p-6 text-center">
              <WifiOff className="w-12 h-12 text-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-700">Dev server not reachable</p>
                <p className="text-xs text-gray-500 mt-1">
                  Start your dev server at <code className="bg-gray-100 px-1 rounded">{previewUrl}</code>
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleRefresh} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </Button>
              <Button size="sm" variant="outline" onClick={handleOpenExternal} className="gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Open in browser
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="h-6 border-t border-border bg-muted/30 flex items-center justify-between px-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            {!iframeError ? (
              <Wifi className="w-3 h-3 text-primary" />
            ) : (
              <WifiOff className="w-3 h-3 text-destructive" />
            )}
            {!iframeError ? "Live preview" : "Disconnected"}
          </span>
          <span>{deviceMode !== "desktop" ? `${deviceWidths[deviceMode]}px` : "Responsive"}</span>
        </div>
        <span>{previewUrl}</span>
      </div>
    </div>
  )
}
