"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

interface RoomBarProps {
  activeRoom: RoomType
  onRoomChange: (room: RoomType) => void
  rooms: Array<{ id: RoomType; name: string; icon: string }>
}

export function RoomSelector({ activeRoom, onRoomChange, rooms }: RoomBarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-12 bg-sidebar-background border-r border-border flex flex-col items-center py-2 shrink-0">
        {/* Logo */}
        <div className="mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            BS
          </div>
        </div>

        <div className="w-8 h-px bg-border mb-2" />

        {/* Room Navigation */}
        <div className="flex flex-col gap-1">
          {rooms.map((room, index) => (
            <Tooltip key={room.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 relative ${
                    activeRoom === room.id
                      ? "text-emerald-400 bg-emerald-500/10 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-6 before:bg-emerald-400 before:rounded-r"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  onClick={() => onRoomChange(room.id)}
                >
                  <span className="text-lg">{room.icon}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                <p>{room.name}</p>
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+{index + 1}</kbd>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}