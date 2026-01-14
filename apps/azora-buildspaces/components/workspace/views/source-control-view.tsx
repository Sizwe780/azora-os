"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Check,
    Plus,
    Minus,
    GitBranch,
    GitCommit,
    GitMerge,
    RefreshCw,
    MoreVertical,
    FileText,
    Folder,
    Code,
    Settings,
    Loader2,
    AlertCircle
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GitChange {
    id: string
    file: string
    status: 'modified' | 'added' | 'deleted' | 'untracked'
    staged: boolean
}

interface GitCommit {
    id: string
    message: string
    author: string
    date: string
    files: number
}

interface GitStatus {
    branch: string
    hasChanges: boolean
    stagedFiles: string[]
    unstagedFiles: string[]
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'modified': return <Code className="w-4 h-4 text-yellow-500" />
        case 'added': return <Plus className="w-4 h-4 text-green-500" />
        case 'deleted': return <Minus className="w-4 h-4 text-red-500" />
        case 'untracked': return <FileText className="w-4 h-4 text-blue-400" />
        default: return <FileText className="w-4 h-4 text-gray-400" />
    }
}

const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
        case 'tsx':
        case 'ts':
        case 'jsx':
        case 'js':
            return <Code className="w-4 h-4 text-blue-400" />
        case 'json':
            return <Settings className="w-4 h-4 text-yellow-400" />
        default:
            return <FileText className="w-4 h-4 text-gray-400" />
    }
}

export function SourceControlView() {
    const [commitMessage, setCommitMessage] = useState('')
    const [activeTab, setActiveTab] = useState('changes')
    const [changes, setChanges] = useState<GitChange[]>([])
    const [commits, setCommits] = useState<GitCommit[]>([])
    const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch Git status from API
    useEffect(() => {
        fetchGitStatus()
    }, [])

    const fetchGitStatus = async () => {
        setIsLoading(true)
        setError(null)
        try {
            // Use a default project ID for now - in production, this would come from context
            const response = await fetch('/api/projects/current/git/status')
            if (response.ok) {
                const status: GitStatus = await response.json()
                setGitStatus(status)

                // Convert Git status to changes format
                const newChanges: GitChange[] = [
                    ...status.stagedFiles.map((file, idx) => ({
                        id: `staged-${idx}`,
                        file,
                        status: 'modified' as const,
                        staged: true
                    })),
                    ...status.unstagedFiles.map((file, idx) => ({
                        id: `unstaged-${idx}`,
                        file,
                        status: file.startsWith('??') ? 'untracked' as const : 'modified' as const,
                        staged: false
                    }))
                ]
                setChanges(newChanges)
            } else {
                setError('Not a Git repository or Git is unavailable')
            }
        } catch (err) {
            console.error('Failed to fetch Git status:', err)
            setError('Failed to connect to Git service')
        } finally {
            setIsLoading(false)
        }
    }

    const stagedChanges = changes.filter(c => c.staged)
    const unstagedChanges = changes.filter(c => !c.staged)

    const handleStage = async (changeId: string) => {
        const change = changes.find(c => c.id === changeId)
        if (!change) return

        try {
            const response = await fetch('/api/projects/current/git/stage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: [change.file] })
            })
            if (response.ok) {
                await fetchGitStatus()
            }
        } catch (err) {
            console.error('Failed to stage file:', err)
        }
    }

    const handleUnstage = async (changeId: string) => {
        const change = changes.find(c => c.id === changeId)
        if (!change) return

        try {
            const response = await fetch('/api/projects/current/git/unstage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: [change.file] })
            })
            if (response.ok) {
                await fetchGitStatus()
            }
        } catch (err) {
            console.error('Failed to unstage file:', err)
        }
    }

    const handleCommit = async () => {
        if (commitMessage.trim() && stagedChanges.length > 0) {
            try {
                const response = await fetch('/api/projects/current/git/commit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: commitMessage })
                })
                if (response.ok) {
                    setCommitMessage('')
                    await fetchGitStatus()
                }
            } catch (err) {
                console.error('Failed to commit:', err)
            }
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{gitStatus?.branch || 'main'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={fetchGitStatus}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-6 h-6">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <GitBranch className="w-4 h-4 mr-2" />
                                    Create Branch
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <GitMerge className="w-4 h-4 mr-2" />
                                    Merge Branch
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Pull
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <GitBranch className="w-4 h-4 mr-2" />
                                    Push
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Commit Input */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Commit message..."
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                handleCommit()
                            }
                        }}
                    />
                    <Button
                        size="sm"
                        onClick={handleCommit}
                        disabled={!commitMessage.trim() || stagedChanges.length === 0}
                        className="px-3"
                    >
                        <Check className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 mx-3 mt-3">
                    <TabsTrigger value="changes" className="text-xs">
                        Changes ({changes.length})
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs">
                        History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="changes" className="flex-1 mt-0">
                    <ScrollArea className="h-full">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                <AlertCircle className="w-8 h-8 opacity-20 mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">{error}</p>
                            </div>
                        ) : (
                            <div className="p-3 space-y-4">
                                {/* Staged Changes */}
                                {stagedChanges.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                            Staged Changes ({stagedChanges.length})
                                        </h4>
                                        <div className="space-y-1">
                                            {stagedChanges.map((change) => (
                                                <div key={change.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                                                    {getStatusIcon(change.status)}
                                                    {getFileIcon(change.file)}
                                                    <span className="text-sm flex-1 truncate">{change.file}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleUnstage(change.id)}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Unstaged Changes */}
                                {unstagedChanges.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                            Changes ({unstagedChanges.length})
                                        </h4>
                                        <div className="space-y-1">
                                            {unstagedChanges.map((change) => (
                                                <div key={change.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                                                    {getStatusIcon(change.status)}
                                                    {getFileIcon(change.file)}
                                                    <span className="text-sm flex-1 truncate">{change.file}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStage(change.id)}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {changes.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                        <GitBranch className="w-8 h-8 opacity-20 mb-2" />
                                        <p className="text-sm">No changes detected.</p>
                                        <p className="text-xs">Your working directory is clean.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="history" className="flex-1 mt-0">
                    <ScrollArea className="h-full">
                        <div className="p-3 space-y-3">
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <GitCommit className="w-8 h-8 opacity-20 mb-2" />
                                <p className="text-sm">Commit history</p>
                                <p className="text-xs">Git commit log will be displayed here</p>
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    )
}
