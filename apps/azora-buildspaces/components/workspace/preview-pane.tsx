"use client"

/**
 * Preview Pane - Live Application Preview
 * 
 * Constitutional Compliance:
 * - REAL PREVIEW: Actual running application in iframe
 * - TRUTH: Shows real runtime URL, not fake
 * - SELF-HEALING: Reload capability
 * 
 * This displays the live preview of the application running
 * in the WebContainer runtime.
 */

import React, { useState, useEffect, useRef } from 'react'
import { runtimeEngine } from '@/lib/runtime/container'
import { useWorkspace } from '@/lib/workspace/workspace-context'
import { Button } from '@/components/ui/button'
import {
  Monitor,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Tablet,
  Laptop,
  AlertTriangle,
  Play,
  Square,
} from 'lucide-react'

type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'full'

const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667, label: 'Mobile' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  desktop: { width: 1920, height: 1080, label: 'Desktop' },
  full: { width: '100%', height: '100%', label: 'Full' },
}

export function PreviewPane() {
  const { projectRoot, projectName } = useWorkspace()
  const [serverUrl, setServerUrl] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewport, setViewport] = useState<ViewportSize>('full')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Check if server is already running
  useEffect(() => {
    const url = runtimeEngine.getServerUrl()
    if (url) {
      setServerUrl(url)
      setIsRunning(true)
    }
  }, [])

  const handleStart = async () => {
    if (!projectRoot) {
      setError('No project loaded')
      return
    }

    setIsStarting(true)
    setError(null)

    try {
      // Boot runtime if needed
      const state = runtimeEngine.getState()
      if (state.status === 'idle') {
        await runtimeEngine.boot()
      }

      // Mount files
      await runtimeEngine.mount(projectRoot)

      // Start dev server
      const url = await runtimeEngine.startDevServer((output) => {
        console.log('[Preview] Server output:', output)
      })

      setServerUrl(url)
      setIsRunning(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start server'
      setError(errorMsg)
      console.error('[Preview] Start failed:', err)
    } finally {
      setIsStarting(false)
    }
  }

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const handleOpenExternal = () => {
    if (serverUrl) {
      window.open(serverUrl, '_blank')
    }
  }

  const handleStop = async () => {
    try {
      await runtimeEngine.restart()
      setServerUrl(null)
      setIsRunning(false)
    } catch (err) {
      console.error('[Preview] Stop failed:', err)
    }
  }

  const getViewportStyle = () => {
    if (viewport === 'full') {
      return { width: '100%', height: '100%' }
    }
    const size = VIEWPORT_SIZES[viewport]
    return {
      width: size.width,
      height: size.height,
      maxWidth: '100%',
      maxHeight: '100%',
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3e3e42] bg-[#161b22]">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Preview</span>
          {isRunning && (
            <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
              Running
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Viewport Selectors */}
          <div className="flex items-center gap-1 mr-2 border-r border-[#3e3e42] pr-2">
            <Button
              onClick={() => setViewport('mobile')}
              size="sm"
              variant="ghost"
              className={`h-7 px-2 ${viewport === 'mobile' ? 'bg-white/10' : ''}`}
              title="Mobile View"
            >
              <Smartphone className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => setViewport('tablet')}
              size="sm"
              variant="ghost"
              className={`h-7 px-2 ${viewport === 'tablet' ? 'bg-white/10' : ''}`}
              title="Tablet View"
            >
              <Tablet className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => setViewport('desktop')}
              size="sm"
              variant="ghost"
              className={`h-7 px-2 ${viewport === 'desktop' ? 'bg-white/10' : ''}`}
              title="Desktop View"
            >
              <Laptop className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => setViewport('full')}
              size="sm"
              variant="ghost"
              className={`h-7 px-2 ${viewport === 'full' ? 'bg-white/10' : ''}`}
              title="Full View"
            >
              <Monitor className="w-3 h-3" />
            </Button>
          </div>

          {/* Action Buttons */}
          {isRunning ? (
            <>
              <Button
                onClick={handleReload}
                size="sm"
                variant="ghost"
                className="h-7 px-2 hover:bg-white/10"
                title="Reload Preview"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button
                onClick={handleOpenExternal}
                size="sm"
                variant="ghost"
                className="h-7 px-2 hover:bg-white/10"
                title="Open in New Tab"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
              <Button
                onClick={handleStop}
                size="sm"
                variant="ghost"
                className="h-7 px-2 hover:bg-white/10 text-red-400"
                title="Stop Server"
              >
                <Square className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <Button
              onClick={handleStart}
              size="sm"
              disabled={isStarting}
              className="h-7 px-3 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isStarting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* URL Bar */}
      {serverUrl && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#3e3e42] bg-[#161b22]/50">
          <span className="text-xs text-gray-400">URL:</span>
          <code className="text-xs text-emerald-400 font-mono flex-1 truncate">
            {serverUrl}
          </code>
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 flex items-center justify-center bg-[#0d1117] overflow-auto p-4">
        {error && (
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="p-4 rounded-full bg-red-500/10">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Preview Error</h3>
              <p className="text-sm text-gray-400 mb-4">{error}</p>
              <Button
                onClick={handleStart}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {!error && !serverUrl && !isStarting && (
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="p-4 rounded-full bg-blue-500/10">
              <Monitor className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Preview</h3>
              <p className="text-sm text-gray-400 mb-4">
                Start the development server to see your application live
              </p>
              <Button
                onClick={handleStart}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Play className="w-3 h-3 mr-2" />
                Start Server
              </Button>
            </div>
          </div>
        )}

        {serverUrl && !error && (
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden"
            style={getViewportStyle()}
          >
            <iframe
              ref={iframeRef}
              src={serverUrl}
              className="w-full h-full border-0"
              title="Application Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            />
          </div>
        )}
      </div>
    </div>
  )
}
