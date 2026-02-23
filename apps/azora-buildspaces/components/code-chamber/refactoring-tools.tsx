"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wrench, RefreshCw, Shuffle } from "lucide-react"

interface RefactoringToolsProps {
    activeFile: string | null
    fileMap: any
}

export function RefactoringTools({ activeFile, fileMap }: RefactoringToolsProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    <span className="text-sm font-medium">Refactoring</span>
                </div>
            </div>

            <div className="flex-1 p-4">
                <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Extract Function
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        <Shuffle className="w-4 h-4 mr-2" />
                        Rename Symbol
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        <Wrench className="w-4 h-4 mr-2" />
                        Inline Variable
                    </Button>
                </div>

                <div className="mt-8 text-center text-muted-foreground">
                    <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Advanced refactoring tools</p>
                    <p className="text-xs mt-1">Automated code transformations and improvements</p>
                </div>
            </div>
        </div>
    )
}
