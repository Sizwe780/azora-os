/**
 * Spark Interface - Main Maker Lab UI
 * Integrates SparkInput, LivePreview, and Version History
 * 
 * Constitutional Compliance:
 * - TRUTH: Real generation, real preview, real version control
 * - UBUNTU: Empowering users to prototype rapidly
 * - SELF-HEALING: Version history allows safe experimentation
 * 
 * This is the complete "GitHub Spark" experience for Azora.
 */

'use client'

import { useState, useEffect } from 'react'
import { SparkInput } from './spark-input'
import { LivePreview } from './live-preview'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  History,
  Code2,
  ChevronRight,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { createSparkGenerator, AppMode, GenerationLog } from '@/lib/engines/spark-generator'
import { getHistoryManager, AppSnapshot } from '@/lib/maker/history-manager'
import { useRouter } from 'next/navigation'

export function SparkInterface() {
  const [projectId] = useState(() => `spark-${Date.now()}`)
  const [isGenerating, setIsGenerating] = useState(false)
  const [logs, setLogs] = useState<GenerationLog[]>([])
  const [projectRoot, setProjectRoot] = useState('')
  const [snapshots, setSnapshots] = useState<AppSnapshot[]>([])
  const [currentVersion, setCurrentVersion] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const router = useRouter()

  const historyManager = getHistoryManager(projectId, 'Spark Project')

  // Load snapshots when they change
  useEffect(() => {
    setSnapshots(historyManager.getSnapshots())
    setCurrentVersion(historyManager.getCurrentVersion())
  }, [isGenerating])

  /**
   * Handle app generation from prompt
   */
  const handleGenerate = async (prompt: string, mode: AppMode) => {
    setIsGenerating(true)
    setLogs([])

    try {
      const generator = createSparkGenerator(projectId)
      
      // Subscribe to logs
      const logsInterval = setInterval(() => {
        setLogs([...generator.getLogs()])
      }, 500)

      // Generate the project
      const result = await generator.generate(prompt, mode, [historyManager.getState()])
      
      clearInterval(logsInterval)
      setLogs(result.logs)
      setProjectRoot(result.projectRoot)

      if (result.success) {
        // Create a snapshot
        await historyManager.createSnapshot(
          prompt,
          `Generated ${mode} app`,
          result.projectRoot
        )
        setSnapshots(historyManager.getSnapshots())
        setCurrentVersion(historyManager.getCurrentVersion())
      }
    } catch (error) {
      console.error('[SparkInterface] Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Restore a previous version
   */
  const handleRestoreVersion = async (version: number) => {
    try {
      setIsGenerating(true)
      await historyManager.restoreSnapshot(version, projectRoot)
      setCurrentVersion(version)
      
      // Add log entry
      setLogs((prev) => [
        ...prev,
        {
          step: 'complete',
          message: `✅ Restored to version ${version}`,
          timestamp: Date.now(),
        },
      ])
    } catch (error) {
      console.error('[SparkInterface] Restore failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Eject to Code Chamber
   * Transfer the current project to the full workspace
   */
  const handleEjectToCodeChamber = () => {
    // Navigate to workspace with this project
    router.push(`/workspace?room=code-chamber&project=${projectId}`)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left: Input or Preview */}
        <div className="flex-1 flex flex-col">
          {!projectRoot ? (
            // Show SparkInput initially
            <SparkInput
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          ) : (
            // Show LivePreview after generation
            <LivePreview
              logs={logs}
              projectRoot={projectRoot}
              isGenerating={isGenerating}
            />
          )}
        </div>

        {/* Right: Version History Sidebar (collapsible) */}
        {snapshots.length > 0 && (
          <div
            className={`border-l transition-all duration-300 ${
              showHistory ? 'w-80' : 'w-12'
            }`}
          >
            {!showHistory ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-12 w-12"
                onClick={() => setShowHistory(true)}
                aria-label="Show version history"
              >
                <History className="w-4 h-4" />
              </Button>
            ) : (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    <span className="font-medium">Version History</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(false)}
                  >
                    ×
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-2">
                    {[...snapshots].reverse().map((snapshot) => (
                      <Card
                        key={snapshot.id}
                        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                          snapshot.version === currentVersion
                            ? 'border-purple-500 bg-purple-500/5'
                            : ''
                        }`}
                        onClick={() => handleRestoreVersion(snapshot.version)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  snapshot.version === currentVersion
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                v{snapshot.version}
                              </Badge>
                              {snapshot.version === currentVersion && (
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm font-medium truncate">
                              {snapshot.description}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {snapshot.prompt}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(snapshot.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {projectRoot && (
        <div className="border-t p-4 bg-muted/20">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                v{currentVersion}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {snapshots.length} version{snapshots.length !== 1 ? 's' : ''} saved
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setProjectRoot('')
                  setLogs([])
                }}
              >
                New Project
              </Button>
              
              {/* The Eject Button - Key Feature */}
              <Button
                onClick={handleEjectToCodeChamber}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Code2 className="w-4 h-4" />
                Open in Code Chamber
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
