"use client"
import {
  PanelLeftClose,
  PanelRightClose,
  Terminal,
  Save,
  GitBranch,
  Cloud,
  ChevronDown,
  Search,
  Command,
  Eye,
  BookOpen,
  Play,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

interface WorkspaceHeaderProps {
  onToggleSidebar: () => void
  onToggleAI: () => void
  onToggleTerminal: () => void
  onTogglePreview: () => void
  onToggleKnowledge: () => void
  onSave?: () => void
  onOpenCommandPalette?: () => void
  previewOpen: boolean
  knowledgeOceanOpen: boolean
  agentActivity?: { agent: string; action: string; time: string }[]
  currentProject?: string | null
  activeRoom?: string
}

export function WorkspaceHeader({
  onToggleSidebar,
  onToggleAI,
  onToggleTerminal,
  onTogglePreview,
  onToggleKnowledge,
  onSave,
  onOpenCommandPalette,
  previewOpen,
  knowledgeOceanOpen,
  agentActivity = [],
  currentProject,
  activeRoom,
}: WorkspaceHeaderProps) {
  const handleSearchClick = () => {
    if (onOpenCommandPalette) {
      onOpenCommandPalette()
    }
  }

  const handleRun = () => {
    onToggleTerminal()
  }

  const handleDeploy = async () => {
    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: currentProject || "default" }),
      })
      if (response.ok) {
        onToggleTerminal()
      }
    } catch {
      onToggleTerminal()
    }
  }

  return (
    <header className="h-12 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-2 shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleSidebar}>
          <PanelLeftClose className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted text-sm transition-colors">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-medium">
                {currentProject ? `${currentProject}` : 'No Project'}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground capitalize">
                {activeRoom?.replace(/-/g, ' ') || 'Code Chamber'}
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuItem>
              <GitBranch className="w-4 h-4 mr-2" />
              main branch
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Switch project...</DropdownMenuItem>
            <DropdownMenuItem>Create new project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Agent Activity Ticker */}
        <div className="hidden xl:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 overflow-hidden max-w-xs">
          <div className="flex -space-x-1.5 shrink-0">
            {["E", "S", "T"].map((letter, i) => (
              <motion.div
                key={letter}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-5 h-5 rounded-full border-2 border-background flex items-center justify-center ${
                  i === 0
                    ? "bg-gradient-to-br from-primary to-emerald-400"
                    : i === 1
                      ? "bg-gradient-to-br from-accent to-purple-400"
                      : "bg-gradient-to-br from-amber-500 to-orange-400"
                }`}
              >
                <span className="text-[8px] font-bold text-background">{letter}</span>
              </motion.div>
            ))}
          </div>
          <div className="overflow-hidden">
            <motion.div
              key={agentActivity[0]?.action}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-xs text-muted-foreground truncate"
            >
              <span className="text-primary font-medium">{agentActivity[0]?.agent}</span> {agentActivity[0]?.action}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex items-center">
        <button
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted hover:border-border text-sm text-muted-foreground transition-all w-72"
          onClick={handleSearchClick}
        >
          <Search className="w-4 h-4" />
          <span>Search files, symbols...</span>
          <kbd className="ml-auto px-1.5 py-0.5 rounded bg-background/80 text-[10px] font-medium border border-border">
            <Command className="w-3 h-3 inline mr-0.5" />K
          </kbd>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" onClick={onSave} title="Save (Ctrl+S)">
          <Save className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${knowledgeOceanOpen ? "bg-accent/20 text-accent" : ""}`}
          onClick={onToggleKnowledge}
          title="Knowledge Ocean"
        >
          <BookOpen className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${previewOpen ? "bg-primary/20 text-primary" : ""}`}
          onClick={onTogglePreview}
          title="Preview"
        >
          <Eye className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleTerminal} title="Terminal (Ctrl+`)">
          <Terminal className="w-4 h-4" />
        </Button>

        <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

        <Button size="sm" className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 hidden sm:flex gap-1.5" onClick={handleRun} title="Run project">
          <Play className="w-3.5 h-3.5" />
          Run
        </Button>

        <Button size="sm" variant="outline" className="h-8 hidden sm:flex gap-1.5 bg-transparent" onClick={handleDeploy} title="Deploy project">
          <Cloud className="w-3.5 h-3.5" />
          Deploy
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleAI} title="AI Assistant">
          <PanelRightClose className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
