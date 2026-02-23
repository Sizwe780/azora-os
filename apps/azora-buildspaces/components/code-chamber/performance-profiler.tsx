"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Square, RefreshCw, TrendingUp } from "lucide-react"

interface PerformanceProfilerProps {
    projectId: string
}

export function PerformanceProfiler({ projectId }: PerformanceProfilerProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Performance Profiler</span>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                        <Play className="w-4 h-4 mr-1" />
                        Start
                    </Button>
                    <Button size="sm" variant="outline">
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                    </Button>
                </div>
            </div>

            <div className="flex-1 p-4">
                <div className="text-center text-muted-foreground py-8">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Performance profiling tools</p>
                    <p className="text-xs mt-1">Memory usage, CPU profiling, and optimization suggestions</p>
                </div>
            </div>
        </div>
    )
}
