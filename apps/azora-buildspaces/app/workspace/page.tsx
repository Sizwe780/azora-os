"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { WorkspaceHeader } from "@/components/workspace/workspace-header"
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar"
import { CodeChamber } from "@/components/rooms/code-chamber"
import { SpecChamber } from "@/components/rooms/spec-chamber"
import DesignStudio from "@/components/rooms/design-studio"
import { CommandDesk } from "@/components/rooms/command-desk"
import { TerminalPanel } from "@/components/workspace/panels/terminal-panel"
import { PreviewPanel } from "@/components/workspace/panels/preview-panel"
import { KnowledgeOcean } from "@/components/rooms/knowledge-ocean"
import { RoomSelector } from "@/components/workspace/room-selector"
import { StatusBar } from "@/components/workspace/status-bar"
import { AIAssistantPanel } from "@/components/workspace/ai-assistant-panel"
import { TaskBoard } from "@/components/rooms/task-board"
import { Onboarding } from "@/components/workspace/onboarding"
import AIStudio from "@/components/rooms/ai-studio"
import MakerLab from "@/components/rooms/maker-lab"
import InnovationTheater from "@/components/rooms/innovation-theater"
import CollaborationPod from "@/components/rooms/collaboration-pod"
import CollectibleShowcase from "@/components/rooms/collectible-showcase"
import Marketplace from "@/components/rooms/marketplace"
import DeepFocus from "@/components/rooms/deep-focus"
import { AuthService, User } from "@/lib/services/auth-service"
import { WorkspaceProvider, useWorkspace, RoomType } from "@/lib/contexts/workspace-context"

export default function WorkspacePage() {
  const searchParams = useSearchParams()
  const roomParam = searchParams.get('room') as RoomType | null

  return (
    <WorkspaceProvider initialRoom={roomParam || undefined}>
      <WorkspaceContent />
    </WorkspaceProvider>
  )
}

function WorkspaceContent() {
  const { activeRoom, setActiveRoom } = useWorkspace()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authService] = useState(() => AuthService.getInstance())
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          router.push('/auth/login?callbackUrl=/workspace')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [authService, router])

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

  const renderActiveRoom = () => {
    switch (activeRoom) {
      case "code-chamber": return <CodeChamber />
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
    <div className="flex h-screen w-full flex-col bg-[#0d1117] text-white overflow-hidden">
      <WorkspaceHeader 
        activeRoom={activeRoom} 
        onRoomChange={setActiveRoom}
        user={user}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleAI={() => setAiPanelOpen(!aiPanelOpen)}
        onToggleTerminal={() => setTerminalOpen(!terminalOpen)}
        onTogglePreview={() => setPreviewOpen(!previewOpen)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeRoom={activeRoom}
          onRoomChange={setActiveRoom}
        />
        
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
            <AIAssistantPanel 
              isOpen={aiPanelOpen} 
              onToggle={() => setAiPanelOpen(!aiPanelOpen)} 
            />
          </div>
        )}
      </div>

      <StatusBar 
        onTerminalToggle={() => setTerminalOpen(!terminalOpen)}
        terminalOpen={terminalOpen}
      />
      
      <Onboarding />
    </div>
  )
}
