"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipForward, SkipBack, Smartphone, Monitor, Tablet, Maximize2 } from "lucide-react";

type DevicePreview = "desktop" | "tablet" | "mobile";

export default function PrototypePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [currentScreen, setCurrentScreen] = useState(0);
  const totalScreens = 5;

  const deviceWidths: Record<DevicePreview, string> = {
    desktop: "w-full",
    tablet: "w-[768px] mx-auto",
    mobile: "w-[375px] mx-auto",
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
            Prototype
          </Badge>
          <span className="text-xs text-gray-500">
            Screen {currentScreen + 1} of {totalScreens}
          </span>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-gray-400 hover:text-white"
            onClick={() => setCurrentScreen(Math.max(0, currentScreen - 1))}
          >
            <SkipBack className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-gray-400 hover:text-white"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-gray-400 hover:text-white"
            onClick={() => setCurrentScreen(Math.min(totalScreens - 1, currentScreen + 1))}
          >
            <SkipForward className="w-3 h-3" />
          </Button>
        </div>

        {/* Device selector */}
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-0.5">
          {([
            { id: "desktop" as DevicePreview, icon: Monitor },
            { id: "tablet" as DevicePreview, icon: Tablet },
            { id: "mobile" as DevicePreview, icon: Smartphone },
          ]).map(({ id, icon: Icon }) => (
            <Button
              key={id}
              size="sm"
              variant="ghost"
              className={`h-6 w-6 p-0 ${device === id ? "text-white bg-white/10" : "text-gray-500"}`}
              onClick={() => setDevice(id)}
            >
              <Icon className="w-3 h-3" />
            </Button>
          ))}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className={`${deviceWidths[device]} h-full rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center transition-all duration-300`}>
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto border border-white/10">
              <Maximize2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Prototype Preview</p>
              <p className="text-xs text-gray-600 mt-1">
                Add frames to your canvas to preview interactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
