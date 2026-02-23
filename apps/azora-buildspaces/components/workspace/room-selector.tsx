"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Code2,
  Brain,
  Palette,
  Zap,
  Shield,
  Users,
  Target,
  Search,
  Presentation,
  Focus,
  Wrench,
  Trophy,
  Store,
  Home,
} from "lucide-react"
import { useRouter } from "next/navigation"

type RoomType =
  | "code-chamber"
  | "spec-chamber"
  | "design-studio"
  | "ai-studio"
  | "command-desk"
  | "maker-lab"
  | "collaboration-pod"
  | "innovation-theater"
  | "deep-focus"
  | "knowledge-ocean"
  | "task-board"
  | "collectible-showcase"
  | "marketplace"

const ROOMS: Array<{ id: RoomType; name: string; icon: React.ElementType; shortcut: number }> = [
  { id: "code-chamber", name: "Code Chamber", icon: Code2, shortcut: 1 },
  { id: "ai-studio", name: "AI Studio", icon: Brain, shortcut: 2 },
  { id: "design-studio", name: "Design Studio", icon: Palette, shortcut: 3 },
  { id: "command-desk", name: "Command Desk", icon: Zap, shortcut: 4 },
  { id: "spec-chamber", name: "Spec Chamber", icon: Shield, shortcut: 5 },
  { id: "task-board", name: "Task Board", icon: Target, shortcut: 6 },
  { id: "knowledge-ocean", name: "Knowledge Ocean", icon: Search, shortcut: 7 },
  { id: "collaboration-pod", name: "Collaboration Pod", icon: Users, shortcut: 8 },
  { id: "innovation-theater", name: "Innovation Theater", icon: Presentation, shortcut: 9 },
  { id: "deep-focus", name: "Deep Focus", icon: Focus, shortcut: 0 },
  { id: "maker-lab", name: "Maker Lab", icon: Wrench, shortcut: -1 },
  { id: "collectible-showcase", name: "Collectible Showcase", icon: Trophy, shortcut: -1 },
]

interface RoomBarProps {
  activeRoom: RoomType | string
  onRoomChange: (room: RoomType) => void
}

export function RoomSelector({ activeRoom, onRoomChange }: RoomBarProps) {
  const router = useRouter()

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-12 bg-[#0a0e14] border-r border-white/[0.06] flex flex-col items-center py-2 shrink-0">
        {/* Logo / Dashboard */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => router.push("/dashboard")}
              className="mb-3 w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              BS
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Dashboard</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-7 h-px bg-white/[0.08] mb-2" />

        {/* Room Navigation */}
        <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto scrollbar-none">
          {ROOMS.map((room) => {
            const Icon = room.icon
            const isActive = activeRoom === room.id
            return (
              <Tooltip key={room.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 relative rounded-lg ${
                      isActive
                        ? "text-emerald-400 bg-emerald-500/10 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:bg-emerald-400 before:rounded-r"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                    }`}
                    onClick={() => onRoomChange(room.id)}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                  <p>{room.name}</p>
                  {room.shortcut >= 0 && (
                    <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded font-mono">⌘{room.shortcut}</kbd>
                  )}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        <div className="w-7 h-px bg-white/[0.08] my-2" />

        {/* Marketplace */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-lg ${
                activeRoom === "marketplace"
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
              }`}
              onClick={() => onRoomChange("marketplace" as RoomType)}
            >
              <Store className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Marketplace</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}