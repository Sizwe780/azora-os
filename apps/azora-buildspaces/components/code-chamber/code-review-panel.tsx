"use client"

import { Badge } from "@/components/ui/badge"
import { GitBranch, GitCommit, GitPullRequest } from "lucide-react"

interface CodeReviewPanelProps {
    projectId: string
    activeFile: string | null
}

export function CodeReviewPanel({ projectId, activeFile }: CodeReviewPanelProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4" />
                    <span className="text-sm font-medium">Code Review</span>
                </div>
            </div>

            <div className="flex-1 p-4">
                <div className="text-center text-muted-foreground py-8">
                    <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Automated code review tools</p>
                    <p className="text-xs mt-1">PR analysis, commit quality, and review suggestions</p>
                </div>
            </div>
        </div>
    )
}
