"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Home, File, Folder, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFileSystem } from "@/lib/stores/file-system"
import { useWorkspace } from "@/lib/contexts/workspace-context"

export function BreadcrumbNavigation() {
    const { fileMap, activeFileId } = useFileSystem()
    const { activeRoom } = useWorkspace()
    const [breadcrumbs, setBreadcrumbs] = useState<any[]>([])

    useEffect(() => {
        if (activeFileId && fileMap[activeFileId]) {
            const buildBreadcrumbs = (fileId: string, path: any[] = []): any[] => {
                const file = fileMap[fileId]
                if (!file) return path

                const currentPath = [{ id: fileId, name: file.name, type: file.type }, ...path]

                if (file.parentId) {
                    return buildBreadcrumbs(file.parentId, currentPath)
                }

                return currentPath
            }

            const crumbs = buildBreadcrumbs(activeFileId)
            setBreadcrumbs(crumbs)
        } else {
            setBreadcrumbs([])
        }
    }, [activeFileId, fileMap])

    const getIcon = (type: string) => {
        switch (type) {
            case 'folder': return <Folder className="w-4 h-4" />
            case 'file': return <File className="w-4 h-4" />
            default: return <File className="w-4 h-4" />
        }
    }

    const getRoomDisplayName = () => {
        switch (activeRoom) {
            case 'code-chamber': return 'Code Chamber'
            case 'design-studio': return 'Design Studio'
            case 'spec-chamber': return 'Spec Chamber'
            case 'maker-lab': return 'Maker Lab'
            case 'ai-studio': return 'AI Studio'
            case 'command-desk': return 'Command Desk'
            default: return 'Workspace'
        }
    }

    return (
        <div className="h-8 bg-muted/30 border-b border-border/50 flex items-center px-4 gap-1 text-sm select-none">
            {/* Home/Room */}
            <Button variant="ghost" size="sm" className="h-6 px-2 gap-1 hover:bg-accent/50">
                <Home className="w-3 h-3" />
                <span className="text-xs">{getRoomDisplayName()}</span>
            </Button>

            <ChevronRight className="w-3 h-3 text-muted-foreground" />

            {/* Breadcrumb Path */}
            {breadcrumbs.length > 0 ? (
                breadcrumbs.map((crumb, index) => (
                    <div key={crumb.id} className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 gap-1 hover:bg-accent/50"
                        >
                            {getIcon(crumb.type)}
                            <span className="text-xs max-w-32 truncate">{crumb.name}</span>
                        </Button>
                        {index < breadcrumbs.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        )}
                    </div>
                ))
            ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <File className="w-3 h-3" />
                    <span className="text-xs">No file selected</span>
                </div>
            )}

            {/* Git Branch Info */}
            {breadcrumbs.length > 0 && (
                <>
                    <div className="flex-1" />
                    <Badge variant="outline" className="text-xs h-5 px-2 gap-1">
                        <GitBranch className="w-3 h-3" />
                        main
                    </Badge>
                </>
            )}
        </div>
    )
}
