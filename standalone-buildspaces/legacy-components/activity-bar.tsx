"use client"

import { Files, Search, GitBranch, Puzzle, Settings, Sparkles, Database, Palette, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

interface ActivityBarProps {
  activePanel: string
  onPanelChange: (panel: "files" | "search" | "git" | "extensions") => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

const topItems = [
  { id: "files", icon: Files, label: "Explorer" },
  { id: "search", icon: Search, label: "Search" },
  { id: "git", icon: GitBranch, label: "Source Control" },
  { id: "extensions", icon: Puzzle, label: "Extensions" },
]

const bottomItems = [
  { id: "ai-lab", icon: Brain, label: "AI Lab", href: "/ai-lab" },
  { id: "design", icon: Palette, label: "Design Studio", href: "/design-studio" },
  { id: "data", icon: Database, label: "Data Forge", href: "/data-forge" },
  { id: "settings", icon: Settings, label: "Settings" },
]

export function ActivityBar({ activePanel, onPanelChange, sidebarOpen, onToggleSidebar }: ActivityBarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-12 bg-sidebar-background border-r border-border flex flex-col items-center py-2 shrink-0">
        {/* Logo */}
        <Link href="/" className="mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-background" />
          </div>
        </Link>

        <div className="w-8 h-px bg-border mb-2" />

        {/* Top Actions */}
        <div className="flex flex-col gap-1">
          {topItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 relative ${
                    activePanel === item.id && sidebarOpen
                      ? "text-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-6 before:bg-primary before:rounded-r"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => {
                    if (activePanel === item.id && sidebarOpen) {
                      onToggleSidebar()
                    } else {
                      onPanelChange(item.id as any)
                      if (!sidebarOpen) onToggleSidebar()
                    }
                  }}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="flex-1" />

        {/* Bottom Actions */}
        <div className="flex flex-col gap-1">
          {bottomItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                {item.href ? (
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-foreground"
                    >
                      <item.icon className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
                    <item.icon className="w-5 h-5" />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
