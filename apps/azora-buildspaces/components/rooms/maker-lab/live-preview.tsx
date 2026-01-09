/**
 * Live Preview Component
 * Shows generation logs and live app preview side-by-side
 * 
 * Constitutional Compliance:
 * - TRUTH: Real-time logs showing actual generation progress
 * - SELF-HEALING: Auto-boot with error recovery
 * 
 * Split view: Generation Log (left) + Live App iframe (right)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Terminal,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { GenerationLog } from '@/lib/engines/spark-generator'
import { runtimeEngine } from '@/lib/runtime/container'

interface LivePreviewProps {
  logs: GenerationLog[]
  projectRoot: string
  isGenerating: boolean
  onBootComplete?: (url: string) => void
}

export function LivePreview({
  logs,
  projectRoot,
  isGenerating,
  onBootComplete,
}: LivePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [bootStatus, setBootStatus] = useState<'idle' | 'booting' | 'ready' | 'error'>('idle')
  const [bootLogs, setBootLogs] = useState<string[]>([])
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, bootLogs])

  // Auto-boot when generation completes
  useEffect(() => {
    if (!isGenerating && logs.length > 0) {
      const lastLog = logs[logs.length - 1]
      if (lastLog.step === 'complete' && !lastLog.message.includes('failed')) {
        // Small delay to ensure files are written
        setTimeout(() => {
          handleBoot()
        }, 500)
      }
    }
  }, [isGenerating, logs])

  /**
   * Boot the WebContainer and start dev server
   * Constitutional: Real boot process, real errors shown
   */
  const handleBoot = async () => {
    if (bootStatus === 'booting') return

    try {
      setBootStatus('booting')
      setBootLogs(['🚀 Booting WebContainer...'])

      // Boot WebContainer if not already booted
      if (!runtimeEngine.isReady()) {
        await runtimeEngine.boot()
        setBootLogs((prev) => [...prev, '✅ WebContainer booted'])
      }

      // Mount project files
      setBootLogs((prev) => [...prev, '📁 Mounting project files...'])
      await runtimeEngine.mount(projectRoot)
      setBootLogs((prev) => [...prev, '✅ Files mounted'])

      // Start dev server with output streaming
      setBootLogs((prev) => [...prev, '📦 Installing dependencies...'])
      
      const url = await runtimeEngine.startDevServer((output) => {
        if (output.type === 'stdout') {
          setBootLogs((prev) => [...prev, output.data as string])
        } else if (output.type === 'stderr') {
          setBootLogs((prev) => [...prev, `❌ ${output.data}`])
        }
      })

      setPreviewUrl(url)
      setBootStatus('ready')
      setBootLogs((prev) => [...prev, `✅ Server running at ${url}`])
      
      onBootComplete?.(url)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Boot failed'
      setBootStatus('error')
      setBootLogs((prev) => [...prev, `❌ Error: ${errorMsg}`])
      console.error('[LivePreview] Boot failed:', error)
    }
  }

  /**
   * Restart the runtime
   */
  const handleRestart = async () => {
    try {
      setBootLogs((prev) => [...prev, '🔄 Restarting...'])
      await runtimeEngine.restart()
      setPreviewUrl(null)
      setBootStatus('idle')
      setBootLogs((prev) => [...prev, '✅ Runtime restarted'])
      
      // Re-boot
      await handleBoot()
    } catch (error) {
      setBootLogs((prev) => [...prev, `❌ Restart failed: ${error}`])
    }
  }

  const getStepIcon = (step: GenerationLog['step']) => {
    switch (step) {
      case 'complete':
        return logs[logs.length - 1]?.message.includes('failed') ? (
          <XCircle className="w-4 h-4 text-red-500" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        )
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
    }
  }

  return (
    <div className="h-full flex gap-4 p-4">
      {/* Left Panel: Generation Logs */}
      <div className="w-1/2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                <CardTitle className="text-lg">Generation Log</CardTitle>
              </div>
              <Badge variant={isGenerating ? 'default' : 'secondary'}>
                {isGenerating ? 'Generating...' : 'Complete'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full px-4 pb-4">
              <div className="space-y-2 font-mono text-xs">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 rounded bg-muted/50"
                  >
                    {getStepIcon(log.step)}
                    <div className="flex-1">
                      <div className="font-medium">{log.message}</div>
                      {log.details && (
                        <div className="text-muted-foreground mt-1">
                          {JSON.stringify(log.details, null, 2)}
                        </div>
                      )}
                      <div className="text-muted-foreground text-[10px] mt-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Boot Logs */}
                {bootLogs.length > 0 && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <div className="font-semibold text-purple-600 mb-2">
                        🔥 Runtime Boot
                      </div>
                    </div>
                    {bootLogs.map((log, index) => (
                      <div key={`boot-${index}`} className="p-2 rounded bg-purple-500/10">
                        {log}
                      </div>
                    ))}
                  </>
                )}
                
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Boot Controls */}
        {!isGenerating && logs.length > 0 && (
          <div className="mt-4 flex gap-2">
            {bootStatus === 'idle' && (
              <Button onClick={handleBoot} className="flex-1 gap-2">
                <Globe className="w-4 h-4" />
                Start Preview
              </Button>
            )}
            {bootStatus === 'ready' && (
              <Button
                onClick={handleRestart}
                variant="outline"
                className="flex-1 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Restart
              </Button>
            )}
            {bootStatus === 'error' && (
              <Button
                onClick={handleBoot}
                variant="destructive"
                className="flex-1 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Boot
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Right Panel: Live Preview */}
      <div className="w-1/2">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <CardTitle className="text-lg">Live Preview</CardTitle>
              </div>
              {previewUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open(previewUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {!previewUrl ? (
              <div className="h-full flex items-center justify-center bg-muted/20">
                <div className="text-center space-y-4">
                  {bootStatus === 'idle' && (
                    <>
                      <Globe className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
                      <div>
                        <p className="text-lg font-medium">Preview Not Started</p>
                        <p className="text-sm text-muted-foreground">
                          {isGenerating
                            ? 'Generating your app...'
                            : 'Click "Start Preview" to boot the app'}
                        </p>
                      </div>
                    </>
                  )}
                  {bootStatus === 'booting' && (
                    <>
                      <Loader2 className="w-16 h-16 mx-auto text-purple-500 animate-spin" />
                      <div>
                        <p className="text-lg font-medium">Booting...</p>
                        <p className="text-sm text-muted-foreground">
                          Starting WebContainer runtime
                        </p>
                      </div>
                    </>
                  )}
                  {bootStatus === 'error' && (
                    <>
                      <XCircle className="w-16 h-16 mx-auto text-red-500" />
                      <div>
                        <p className="text-lg font-medium">Boot Failed</p>
                        <p className="text-sm text-muted-foreground">
                          Check the logs for details
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-0 rounded-b-lg"
                title="App Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
