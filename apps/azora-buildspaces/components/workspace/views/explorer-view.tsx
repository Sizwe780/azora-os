"use client"

import { useFileSystem } from "@/lib/stores/file-system"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, MoreVertical, GitBranch, FileText, Settings, Image, Code, Database, Upload, FolderInput } from "lucide-react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface FileNode {
    id: string
    name: string
    type: 'file' | 'directory'
    children?: string[]
    parentId?: string | null
    path: string
    isOpen?: boolean
    gitStatus?: 'modified' | 'added' | 'deleted' | 'untracked'
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
        case 'md':
            return <FileText className="w-4 h-4 text-gray-400" />
        case 'sql':
        case 'db':
            return <Database className="w-4 h-4 text-green-400" />
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'svg':
        case 'gif':
            return <Image className="w-4 h-4 text-purple-400" />
        default:
            return <File className="w-4 h-4 text-gray-400" />
    }
}

const getGitStatusColor = (status?: string) => {
    switch (status) {
        case 'modified': return 'bg-yellow-500'
        case 'added': return 'bg-green-500'
        case 'deleted': return 'bg-red-500'
        case 'untracked': return 'bg-blue-500'
        default: return 'transparent'
    }
}

export function ExplorerView() {
    const { fileMap, openFile, activeFileId, createFile, createDirectory, deleteNode, rootId } = useFileSystem()
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([rootId || '']))
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUploadFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        for (const file of Array.from(files)) {
            const text = await file.text()
            await createFile(rootId || null, file.name, text)
        }
        // Reset input so same file can be re-uploaded
        if (fileInputRef.current) fileInputRef.current.value = ""
    }, [createFile, rootId])

    const handleOpenFromDisk = () => {
        fileInputRef.current?.click()
    }

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders)
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId)
        } else {
            newExpanded.add(folderId)
        }
        setExpandedFolders(newExpanded)
    }

    const renderFileTree = (parentId: string | null = null, depth = 0): React.ReactNode[] => {
        const children = Object.values(fileMap).filter(file => file.parentId === parentId)

        return children.map((file) => {
            const isExpanded = expandedFolders.has(file.id)
            const hasChildren = file.type === 'directory' && file.children && file.children.length > 0
            const isActive = activeFileId === file.id

            return (
                <div key={file.id}>
                    <div
                        className={`flex items-center gap-1.5 px-2 py-1 text-sm cursor-pointer select-none transition-colors group ${
                            isActive
                                ? "bg-accent/20 text-accent"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                        style={{ paddingLeft: `${depth * 12 + 8}px` }}
                        onClick={() => {
                            if (file.type === 'directory') {
                                toggleFolder(file.id)
                            } else {
                                openFile(file.id)
                            }
                        }}
                    >
                        {/* Expand/Collapse Icon */}
                        {file.type === 'directory' && (
                            <div className="w-4 h-4 flex items-center justify-center">
                                {hasChildren && (
                                    isExpanded ?
                                        <ChevronDown className="w-3 h-3" /> :
                                        <ChevronRight className="w-3 h-3" />
                                )}
                            </div>
                        )}

                        {/* File/Folder Icon */}
                        {file.type === 'directory' ? (
                            isExpanded ?
                                <FolderOpen className="w-4 h-4 text-blue-400" /> :
                                <Folder className="w-4 h-4 text-blue-400" />
                        ) : (
                            getFileIcon(file.name)
                        )}

                        {/* File Name */}
                        <span className="truncate flex-1">{file.name}</span>

                        {/* Git Status Indicator */}
                        {(file as any).gitStatus && (
                            <div className={`w-2 h-2 rounded-full ${getGitStatusColor((file as any).gitStatus)}`} />
                        )}

                        {/* Context Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {file.type === 'directory' ? (
                                    <>
                                        <DropdownMenuItem onClick={() => createFile(file.id, 'new-file.txt')}>
                                            <File className="w-4 h-4 mr-2" />
                                            New File
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => createDirectory(file.id, 'new-folder')}>
                                            <Folder className="w-4 h-4 mr-2" />
                                            New Folder
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => deleteNode(file.id)} className="text-red-600">
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem onClick={() => openFile(file.id)}>
                                            Open
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Rename</DropdownMenuItem>
                                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => deleteNode(file.id)} className="text-red-600">
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Render children if expanded */}
                    {file.type === 'directory' && isExpanded && hasChildren && (
                        <div>
                            {renderFileTree(file.id, depth + 1)}
                        </div>
                    )}
                </div>
            )
        })
    }

    return (
        <div className="flex flex-col h-full">
            {/* Hidden file input for upload */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleUploadFiles}
                aria-label="Upload files"
            />

            {/* Header */}
            <div className="p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Explorer</span>
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleOpenFromDisk} title="Upload files">
                        <Upload className="w-3.5 h-3.5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-6 h-6">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => createFile(rootId || null, 'new-file.txt')}>
                                <File className="w-4 h-4 mr-2" />
                                New File
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => createDirectory(rootId || null, 'new-folder')}>
                                <Folder className="w-4 h-4 mr-2" />
                                New Folder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleOpenFromDisk}>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Files
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Git Status Summary */}
            <div className="px-2 pb-2">
                <div className="flex items-center gap-2 text-xs">
                    <GitBranch className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">main</span>
                    <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">+2</Badge>
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-yellow-500/10 text-yellow-600">~1</Badge>
                    </div>
                </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-auto">
                {renderFileTree()}
            </div>
        </div>
    )
}
