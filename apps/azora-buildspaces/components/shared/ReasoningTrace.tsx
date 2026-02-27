import { useState, useEffect, useRef } from 'react'
import GhostLoader from '@/components/shared/GhostLoader'
import { useCitadelStore } from '@/lib/store/use-citadel-store'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@radix-ui/react-accordion'
import { Brain, Hammer, Eye, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// We emit a lightweight trace step as the orchestrator works through a
// workflow. `action` steps are special – they mark the beginning of a
// potentially long-running operation and are used by the UI to display a
// ghost skeleton until the corresponding observation/result arrives.
export interface TraceStep {
  id: string
  type: 'thought' | 'action' | 'observation' | 'result'
  text: string
  timestamp: string
}

interface ReasoningTraceProps {
  /**
   * Stream of trace steps.  This component assumes data arrives in order.
   * If omitted we fall back to the global store (used by the command desk when
   * the HTTP stream has already been consumed).
   */
  stream?: AsyncIterable<TraceStep>

  /**
   * Which skeleton should be shown when an action is pending.  The caller
   * (e.g. command desk vs. code chamber) knows the appropriate shape.
   */
  skeleton?: 'code' | 'message'

  /**
   * Optional initial set of steps.  Used primarily during testing or when
   * the parent already has trace data and wants to hydrate the component
   * synchronously. If provided it takes precedence over the store.
   */
  initialSteps?: TraceStep[]
  /**
   * Optional override for last-synced timestamp. Used primarily in tests
   * or scenarios where the store value isn't easily accessible.
   */
  lastSyncedOverride?: string
}

export default function ReasoningTrace({ stream, skeleton = 'code', initialSteps, lastSyncedOverride }: ReasoningTraceProps) {
  // subscribe to global store if no stream and no explicit initialSteps
  const storeSteps = useCitadelStore((s) => s.activeTrace)
  const lastSynced =
    lastSyncedOverride ?? useCitadelStore((s) => s.lastSynced)
  const [steps, setSteps] = useState<TraceStep[]>(() => {
    if (stream) return []
    if (initialSteps) return initialSteps
    return storeSteps
  })
  useEffect(() => {
    if (!stream) {
      setSteps(storeSteps)
    }
  }, [storeSteps, stream])
  const containerRef = useRef<HTMLDivElement>(null)
  // initialize indicator state to true if we already know of a sync time
  const [showSync, setShowSync] = useState(!!(lastSynced || lastSyncedOverride))

  // pulse when store reports a new sync timestamp (or override changes)
  useEffect(() => {
    if (lastSynced || lastSyncedOverride) {
      setShowSync(true)
      const timer = setTimeout(() => setShowSync(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [lastSynced, lastSyncedOverride])

  useEffect(() => {
    let cancelled = false
    // if there's an explicit stream, consume it; otherwise store subscription handles updates
    if (!stream) return
    ;(async () => {
      for await (const step of stream) {
        if (cancelled) break
        setSteps((prev) => [...prev, step])
        // auto-scroll to bottom
        containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
      }
    })()
    return () => { cancelled = true }
  }, [stream])

  const iconFor = (type: TraceStep['type']) => {
    switch (type) {
      case 'thought': return <Brain className="w-4 h-4 text-yellow-400" />
      case 'action': return <Hammer className="w-4 h-4 text-blue-400" />
      case 'observation': return <Eye className="w-4 h-4 text-purple-400" />
      case 'result': return <CheckCircle2 className="w-4 h-4 text-green-400" />
    }
  }

  return (
    <div className="relative">
      {/* cloud sync indicator */}
      <AnimatePresence>
        {showSync && (
          <motion.div
            key="sync-dot"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full"
            data-testid="sync-dot"
          />
        )}
      </AnimatePresence>
      <div ref={containerRef} className="h-full overflow-y-auto bg-zinc-900 text-zinc-100 p-2">
      <Accordion type="multiple" className="space-y-1">
        <AnimatePresence>
          {steps.map((step) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              <AccordionItem value={step.id} className="border border-zinc-800 rounded">
                <AccordionTrigger className="flex items-center justify-between py-1 px-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {iconFor(step.type)}
                    <span className="text-xs font-medium capitalize">{step.type}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{new Date(step.timestamp).toLocaleTimeString()}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-2 text-[13px] font-mono whitespace-pre-wrap">
                  {step.text}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}

          {/* if the last step is an action and begins with "Starting" we consider it
              pending and render a ghost skeleton of the requested variant */}
          {steps.length > 0 &&
            steps[steps.length - 1].type === 'action' &&
            steps[steps.length - 1].text.startsWith('Starting') && (
              <motion.div
                key="ghost"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="px-4 pb-2"
              >
                <GhostLoader variant={skeleton} />
              </motion.div>
          )}
        </AnimatePresence>
      </Accordion>
    </div>
    </div>
  )
}
