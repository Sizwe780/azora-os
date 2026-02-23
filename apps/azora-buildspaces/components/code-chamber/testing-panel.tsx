"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, TestTube, CheckCircle, XCircle } from "lucide-react"

interface TestingPanelProps {
    projectId: string
    activeFile: string | null
}

export function TestingPanel({ projectId, activeFile }: TestingPanelProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <TestTube className="w-4 h-4" />
                    <span className="text-sm font-medium">Testing</span>
                </div>
                <Button size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Run Tests
                </Button>
            </div>

            <div className="flex-1 p-4">
                <div className="text-center text-muted-foreground py-8">
                    <TestTube className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Integrated testing environment</p>
                    <p className="text-xs mt-1">Unit tests, integration tests, and test coverage</p>
                </div>
            </div>
        </div>
    )
}
