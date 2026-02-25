"use client"

import { useState, useEffect, Suspense } from "react"
import dynamic from 'next/dynamic'
import { useSearchParams, useRouter } from "next/navigation"
import { WorkspaceHeader } from "@/components/workspace/workspace-header"
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar"

// Room loading fallback
const RoomLoader = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#0d1117]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500/40 border-t-emerald-400" />
      <p className="text-sm text-gray-500">Loading room...</p>
    </div>
  </div>
)

// Dynamic imports for heavy room components
const CodeChamber = dynamic(() => import("@/components/rooms/code-chamber").then(mod => mod.CodeChamber), { ssr: false, loading: RoomLoader })
const SpecChamber = dynamic(() => import("@/components/rooms/spec-chamber").then(mod => mod.SpecChamber), { ssr: false, loading: RoomLoader })
const DesignStudio = dynamic(() => import("@/components/rooms/design-studio"), { ssr: false, loading: RoomLoader })
const CommandDesk = dynamic(() => import("@/components/rooms/command-desk").then(mod => mod.CommandDesk), { ssr: false, loading: RoomLoader })
const KnowledgeOcean = dynamic(() => import("@/components/rooms/knowledge-ocean"), { ssr: false, loading: RoomLoader })
const TaskBoard = dynamic(() => import("@/components/rooms/task-board").then(mod => mod.TaskBoard), { ssr: false, loading: RoomLoader })
const AIStudio = dynamic(() => import("@/components/rooms/ai-studio"), { ssr: false, loading: RoomLoader })
const MakerLab = dynamic(() => import("@/components/rooms/maker-lab"), { ssr: false, loading: RoomLoader })
const InnovationTheater = dynamic(() => import("@/components/rooms/innovation-theater"), { ssr: false, loading: RoomLoader })
const CollaborationPod = dynamic(() => import("@/components/rooms/collaboration-pod"), { ssr: false, loading: RoomLoader })
const CollectibleShowcase = dynamic(() => import("@/components/rooms/collectible-showcase"), { ssr: false, loading: RoomLoader })
const Marketplace = dynamic(() => import("@/components/rooms/marketplace"), { ssr: false, loading: RoomLoader })
const DeepFocus = dynamic(() => import("@/components/rooms/deep-focus"), { ssr: false, loading: RoomLoader })

import { TerminalPanel } from "@/components/workspace/panels/terminal-panel"
import { PreviewPanel } from "@/components/workspace/panels/preview-panel"
import { RoomSelector } from "@/components/workspace/room-selector"
import { StatusBar } from "@/components/workspace/status-bar"
import { AIAssistantPanel } from "@/components/workspace/ai-assistant-panel"
import { Onboarding } from "@/components/workspace/onboarding"
import { CommandPalette } from "@/components/workspace/layout/command-palette"
import { AuthService, User } from "@/lib/services/auth-service"
import { WorkspaceProvider, useWorkspace, RoomType } from "@/lib/contexts/workspace-context"

function WorkspaceLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0d1117] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-gray-400">Initializing workspace...</p>
      </div>
    </div>
  )
}

function WorkspaceWithParams() {
  const searchParams = useSearchParams()
  const roomParam = searchParams?.get('room') as RoomType | null

  return (
    <WorkspaceProvider initialRoom={roomParam || undefined}>
      <WorkspaceContent />
    </WorkspaceProvider>
  )
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<WorkspaceLoader />}>
      <WorkspaceWithParams />
    </Suspense>
  )
}

function WorkspaceContent() {
  const { activeRoom, setActiveRoom } = useWorkspace()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authService] = useState(() => AuthService.getInstance())
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          console.log('[Workspace] No user found, redirecting to login')
          router.push('/auth/login?callbackUrl=/workspace')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [authService, router])

  // Global keyboard shortcuts for workspace
  useEffect(() => {
    const ROOM_SHORTCUTS: Record<string, RoomType> = {
      '1': 'code-chamber',
      '2': 'ai-studio',
      '3': 'design-studio',
      '4': 'command-desk',
      '5': 'spec-chamber',
      '6': 'task-board',
      '7': 'knowledge-ocean',
      '8': 'collaboration-pod',
      '9': 'innovation-theater',
      '0': 'deep-focus',
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Ctrl+Shift+P or Ctrl+K (without shift)
      if ((e.key === 'P' && e.ctrlKey && e.shiftKey) || (e.key === 'k' && e.ctrlKey && !e.shiftKey)) {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      // Toggle terminal: Ctrl+`
      if (e.key === '`' && e.ctrlKey) {
        e.preventDefault()
        setTerminalOpen((v) => !v)
      }
      // Toggle AI panel: Ctrl+Shift+A
      if (e.key === 'A' && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        setAiPanelOpen((v) => !v)
      }
      // Save: Ctrl+S
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('workspace:save'))
      }
      // Room shortcuts: Ctrl+1 through Ctrl+0
      if (e.ctrlKey && !e.shiftKey && !e.altKey && ROOM_SHORTCUTS[e.key]) {
        e.preventDefault()
        setActiveRoom(ROOM_SHORTCUTS[e.key])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveRoom])

  // Listen for command palette events
  useEffect(() => {
    const onToggleTerminal = () => setTerminalOpen((v) => !v)
    const onTogglePreview = () => setPreviewOpen((v) => !v)
    const onToggleAI = () => setAiPanelOpen((v) => !v)
    const onGotoRoom = (e: Event) => {
      const room = (e as CustomEvent).detail as RoomType
      if (room) setActiveRoom(room)
    }
    window.addEventListener('workspace:toggle-terminal', onToggleTerminal)
    window.addEventListener('workspace:toggle-preview', onTogglePreview)
    window.addEventListener('workspace:toggle-ai', onToggleAI)
    window.addEventListener('workspace:goto-room', onGotoRoom)
    return () => {
      window.removeEventListener('workspace:toggle-terminal', onToggleTerminal)
      window.removeEventListener('workspace:toggle-preview', onTogglePreview)
      window.removeEventListener('workspace:toggle-ai', onToggleAI)
      window.removeEventListener('workspace:goto-room', onGotoRoom)
    }
  }, [setActiveRoom])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d1117] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-gray-400">Initializing workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Code Chamber is a self-contained IDE — it renders full-bleed with its own
  // activity bar, sidebar, editor tabs, panel, and status bar. No outer chrome.
  const isFullbleedRoom = activeRoom === "code-chamber"

  const handleSave = () => {
    // Dispatch a custom event that rooms can listen to
    window.dispatchEvent(new CustomEvent("workspace:save"))
  }

  if (isFullbleedRoom) {
    return (
      <div className="flex h-screen w-full bg-[#0d1117] text-white overflow-hidden">
        <RoomSelector activeRoom={activeRoom} onRoomChange={(room) => setActiveRoom(room)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <CodeChamber />
        </div>
      </div>
    )
  }

  const renderActiveRoom = () => {
    switch (activeRoom) {
      case "spec-chamber": return <SpecChamber />
      case "design-studio": return <DesignStudio />
      case "ai-studio": return <AIStudio />
      case "command-desk": return <CommandDesk />
      case "maker-lab": return <MakerLab />
      case "collaboration-pod": return <CollaborationPod />
      case "innovation-theater": return <InnovationTheater />
      case "collectible-showcase": return <CollectibleShowcase />
      case "marketplace": return <Marketplace />
      case "deep-focus": return <DeepFocus />
      case "knowledge-ocean": return <KnowledgeOcean />
      case "task-board": return <TaskBoard />
      default: return <CodeChamber />
    }
  }

  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-white overflow-hidden">
      <RoomSelector activeRoom={activeRoom} onRoomChange={(room) => setActiveRoom(room)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <WorkspaceHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleAI={() => setAiPanelOpen(!aiPanelOpen)}
          onToggleTerminal={() => setTerminalOpen(!terminalOpen)}
          onTogglePreview={() => setPreviewOpen(!previewOpen)}
          onToggleKnowledge={() => setActiveRoom("knowledge-ocean")}
          onSave={handleSave}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          previewOpen={previewOpen}
          knowledgeOceanOpen={activeRoom === "knowledge-ocean"}
          activeRoom={activeRoom}
        />
        
        <div className="flex flex-1 overflow-hidden">
          {sidebarOpen && (
            <WorkspaceSidebar 
              activeFile=""
              onFileSelect={() => {}}
              activePanel="files"
            />
          )}
          
          <main className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-hidden">
              {renderActiveRoom()}
            </div>

            {terminalOpen && (
              <div className="h-64 border-t border-white/10 bg-[#0d1117]">
                <TerminalPanel onClose={() => setTerminalOpen(false)} />
              </div>
            )}
          </main>

          {previewOpen && (
            <div className="w-96 border-l border-white/10 bg-[#0d1117]">
              <PreviewPanel />
            </div>
          )}

          {aiPanelOpen && (
            <div className="w-80 border-l border-white/10 bg-[#0d1117]">
              <AIAssistantPanel />
            </div>
          )}
        </div>

        <StatusBar 
          activeFile=""
          agentCount={3}
          activeAgents={1}
        />
        
        <Onboarding />

        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
        />
      </div>
    </div>
  )
}
