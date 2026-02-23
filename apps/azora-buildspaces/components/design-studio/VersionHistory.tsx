"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GitBranch, GitCommit, Clock, User, Eye, RotateCcw } from "lucide-react"

interface VersionHistoryProps {
    projectId?: string
}

interface Version {
    id: string
    timestamp: Date
    author: string
    message: string
    type: 'save' | 'publish' | 'branch' | 'merge'
    thumbnail?: string
}

export function VersionHistory({ projectId }: VersionHistoryProps) {
    const [versions, setVersions] = useState<Version[]>([])
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

    useEffect(() => {
        // Load version history from API
        const loadVersions = async () => {
            if (!projectId) return

            try {
                const resp = await fetch(`/api/design/versions?projectId=${projectId}`)
                if (resp.ok) {
                    const data = await resp.json()
                    setVersions(data.versions || [])
                }
            } catch (error) {
                console.error('Failed to load version history:', error)
            }
        }

        loadVersions()
    }, [projectId])

    const restoreVersion = async (versionId: string) => {
        if (!projectId) return

        try {
            await fetch(`/api/design/versions/${versionId}/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId })
            })
        } catch (error) {
            console.error('Failed to restore version:', error)
        }
    }

    const getTypeIcon = (type: Version['type']) => {
        switch (type) {
            case 'save': return <GitCommit className="w-4 h-4" />
            case 'publish': return <Eye className="w-4 h-4" />
            case 'branch': return <GitBranch className="w-4 h-4" />
            case 'merge': return <RotateCcw className="w-4 h-4" />
        }
    }

    const getTypeColor = (type: Version['type']) => {
        switch (type) {
            case 'save': return 'bg-blue-500/20 text-blue-400'
            case 'publish': return 'bg-green-500/20 text-green-400'
            case 'branch': return 'bg-purple-500/20 text-purple-400'
            case 'merge': return 'bg-orange-500/20 text-orange-400'
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    <span className="text-sm font-medium">Version History</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {versions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No version history yet</p>
                        <p className="text-xs mt-1">Versions will appear here as you work</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {versions.map((version) => (
                            <div
                                key={version.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                    selectedVersion === version.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                                }`}
                                onClick={() => setSelectedVersion(version.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${getTypeColor(version.type)}`}>
                                            {getTypeIcon(version.type)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium">{version.message}</span>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {version.type}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {version.author}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(version.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {version.thumbnail && (
                                            <div className="w-16 h-12 bg-muted rounded border overflow-hidden">
                                                <img
                                                    src={version.thumbnail}
                                                    alt="Version preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                restoreVersion(version.id)
                                            }}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
