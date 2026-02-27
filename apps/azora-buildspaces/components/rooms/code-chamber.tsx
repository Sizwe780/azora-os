"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useFileSystem } from "@/lib/stores/file-system"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import {
    Files, Search, GitBranch, Box, Play, Bug,
    ChevronRight, ChevronDown, X, FileCode, Plus,
    CheckCircle,
    FolderOpen, File, FileText, Settings, Image, Code,
    Database, Sparkles, Wifi, WifiOff,
    Bot, SquareTerminal, CircleDot, FolderClosed,
    Trash2, RefreshCw, Globe
} from "lucide-react"
import { XTerminal } from "@/components/workspace/panels/x-terminal"
import * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"
import { MonacoBinding } from "y-monaco"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

// ─── Types ──────────────────────────────────────────────────────────────
type SidebarView = "explorer" | "search" | "git" | "extensions" | "ai"
type PanelView = "terminal" | "output" | "problems" | "debug"

interface CodeChamberProps {
    id?: string
}

// ─── File Icon Helper ───────────────────────────────────────────────────
function getFileIcon(name: string) {
    const ext = name.split(".").pop()?.toLowerCase()
    switch (ext) {
        case "tsx": case "jsx": return <Code className="w-3.5 h-3.5 text-blue-400" />
        case "ts": case "js": return <FileCode className="w-3.5 h-3.5 text-yellow-400" />
        case "css": case "scss": return <FileText className="w-3.5 h-3.5 text-pink-400" />
        case "json": return <Settings className="w-3.5 h-3.5 text-amber-400" />
        case "md": return <FileText className="w-3.5 h-3.5 text-slate-400" />
        case "sql": return <Database className="w-3.5 h-3.5 text-green-400" />
        case "png": case "jpg": case "svg": return <Image className="w-3.5 h-3.5 text-purple-400" />
        default: return <File className="w-3.5 h-3.5 text-slate-500" />
    }
}

function getLanguage(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase()
    switch (ext) {
        case "tsx": return "typescript"
        case "jsx": return "javascript"
        case "ts": return "typescript"
        case "js": return "javascript"
        case "css": return "css"
        case "scss": return "scss"
        case "json": return "json"
        case "md": return "markdown"
        case "html": return "html"
        case "sql": return "sql"
        case "py": return "python"
        case "rs": return "rust"
        case "go": return "go"
        default: return "plaintext"
    }
}

// ═══════════════════════════════════════════════════════════════════════
// ACTIVITY BAR — VS Code left rail
// ═══════════════════════════════════════════════════════════════════════
function IDEActivityBar({
    activeView,
    onViewChange,
    sidebarVisible,
}: {
    activeView: SidebarView
    onViewChange: (v: SidebarView) => void
    sidebarVisible: boolean
}) {
    const items: { view: SidebarView; icon: typeof Files; label: string; shortcut: string }[] = [
        { view: "explorer", icon: Files, label: "Explorer", shortcut: "⇧⌘E" },
        { view: "search", icon: Search, label: "Search", shortcut: "⇧⌘F" },
        { view: "git", icon: GitBranch, label: "Source Control", shortcut: "⌃⇧G" },
        { view: "extensions", icon: Box, label: "Extensions", shortcut: "⇧⌘X" },
        { view: "ai", icon: Sparkles, label: "Elara AI", shortcut: "⇧⌘I" },
    ]

    return (
        <div className="w-12 flex flex-col items-center py-1 bg-[#0d1117] border-r border-[#1b1f27] shrink-0 select-none">
            {items.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.view && sidebarVisible
                return (
                    <Tooltip key={item.view}>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onViewChange(item.view)}
                                className={cn(
                                    "w-12 h-11 flex items-center justify-center relative transition-colors",
                                    isActive ? "text-white" : "text-[#484f58] hover:text-[#8b949e]"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r" />
                                )}
                                <Icon className="w-[22px] h-[22px]" strokeWidth={1.5} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                            {item.label} <span className="text-[#484f58] ml-2">{item.shortcut}</span>
                        </TooltipContent>
                    </Tooltip>
                )
            })}

            <div className="flex-1" />

            <Tooltip>
                <TooltipTrigger asChild>
                    <button className="w-12 h-11 flex items-center justify-center text-[#484f58] hover:text-[#8b949e] transition-colors">
                        <Settings className="w-[22px] h-[22px]" strokeWidth={1.5} />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">Settings</TooltipContent>
            </Tooltip>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// EXPLORER SIDEBAR — Zustand file-system store
// ═══════════════════════════════════════════════════════════════════════
function ExplorerSidebar() {
    const { fileMap, openFile, activeFileId, rootId, createFile, createDirectory, deleteNode } = useFileSystem()
    const [expanded, setExpanded] = useState<Set<string>>(new Set())
    const [newFileName, setNewFileName] = useState("")
    const [creatingIn, setCreatingIn] = useState<string | null>(null)

    useEffect(() => {
        if (rootId) setExpanded(prev => new Set(prev).add(rootId))
    }, [rootId])

    const toggle = (id: string) => {
        setExpanded(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const handleCreate = async (parentId: string) => {
        if (!newFileName.trim()) { setCreatingIn(null); return }
        const isDir = newFileName.endsWith("/")
        if (isDir) {
            await createDirectory(parentId, newFileName.slice(0, -1))
        } else {
            const newId = await createFile(parentId, newFileName, "")
            openFile(newId)
        }
        setNewFileName("")
        setCreatingIn(null)
    }

    const renderNode = (nodeId: string, depth: number): React.ReactNode => {
        const node = fileMap[nodeId]
        if (!node) return null
        const isDir = node.type === "directory"
        const isOpen = expanded.has(nodeId)
        const isActive = activeFileId === nodeId

        return (
            <div key={nodeId}>
                <div
                    className={cn(
                        "flex items-center gap-1 px-1 py-[3px] cursor-pointer text-[13px] leading-[22px] group select-none",
                        isActive ? "bg-[#1f6feb26] text-white" : "text-[#c9d1d9] hover:bg-[#1f1f1f]"
                    )}
                    style={{ paddingLeft: `${depth * 16 + 4}px` }}
                    onClick={() => (isDir ? toggle(nodeId) : openFile(nodeId))}
                >
                    {isDir ? (
                        <>
                            {isOpen ? <ChevronDown className="w-4 h-4 shrink-0 text-[#484f58]" /> : <ChevronRight className="w-4 h-4 shrink-0 text-[#484f58]" />}
                            {isOpen ? <FolderOpen className="w-4 h-4 shrink-0 text-[#54aeff]" /> : <FolderClosed className="w-4 h-4 shrink-0 text-[#768390]" />}
                        </>
                    ) : (
                        <>
                            <span className="w-4 shrink-0" />
                            {getFileIcon(node.name)}
                        </>
                    )}
                    <span className="truncate ml-1 flex-1">{node.name}</span>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        {isDir && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setCreatingIn(nodeId)
                                    setExpanded(prev => new Set(prev).add(nodeId))
                                }}
                                className="p-0.5 rounded hover:bg-[#30363d]"
                            >
                                <Plus className="w-3.5 h-3.5 text-[#8b949e]" />
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); deleteNode(nodeId) }}
                            className="p-0.5 rounded hover:bg-[#30363d]"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-[#8b949e]" />
                        </button>
                    </div>
                </div>

                {creatingIn === nodeId && (
                    <div className="flex items-center gap-1 px-1 py-[3px]" style={{ paddingLeft: `${(depth + 1) * 16 + 4}px` }}>
                        <File className="w-3.5 h-3.5 text-[#8b949e] shrink-0" />
                        <input
                            autoFocus
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreate(nodeId)
                                if (e.key === "Escape") { setCreatingIn(null); setNewFileName("") }
                            }}
                            onBlur={() => handleCreate(nodeId)}
                            className="flex-1 bg-[#0d1117] border border-[#1f6feb] rounded px-1.5 py-0.5 text-[13px] text-white outline-none"
                            placeholder="filename (end with / for folder)"
                        />
                    </div>
                )}

                {isDir && isOpen && node.children?.map(childId => renderNode(childId, depth + 1))}
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-[#0d1117] text-[#c9d1d9]">
            <div className="h-9 flex items-center justify-between px-4 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e] shrink-0">
                <span>Explorer</span>
                <div className="flex items-center gap-1">
                    <button onClick={() => rootId && setCreatingIn(rootId)} className="p-1 rounded hover:bg-[#30363d] transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-[#30363d] transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
                {rootId ? (
                    fileMap[rootId]?.children?.map(childId => renderNode(childId, 0))
                ) : (
                    <div className="p-4 text-center text-[13px] text-[#484f58]">No project loaded</div>
                )}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// SEARCH SIDEBAR
// ═══════════════════════════════════════════════════════════════════════
function SearchSidebar() {
    const [query, setQuery] = useState("")
    const { fileMap, openFile } = useFileSystem()
    const [results, setResults] = useState<{ fileId: string; line: number; text: string }[]>([])

    useEffect(() => {
        if (!query.trim()) { setResults([]); return }
        const matches: typeof results = []
        Object.entries(fileMap).forEach(([id, node]) => {
            if (node.type !== "file" || !node.content) return
            node.content.split("\n").forEach((line, idx) => {
                if (line.toLowerCase().includes(query.toLowerCase())) {
                    matches.push({ fileId: id, line: idx + 1, text: line.trim() })
                }
            })
        })
        setResults(matches.slice(0, 50))
    }, [query, fileMap])

    return (
        <div className="h-full flex flex-col bg-[#0d1117]">
            <div className="h-9 flex items-center px-4 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e] shrink-0">Search</div>
            <div className="px-3 pb-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search files..."
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-[#484f58] outline-none focus:border-[#1f6feb] transition-colors"
                />
            </div>
            <div className="flex-1 overflow-y-auto px-2">
                {results.length === 0 && query && <p className="text-[13px] text-[#484f58] px-2 py-4 text-center">No results</p>}
                {results.map((r, i) => (
                    <button key={`${r.fileId}-${r.line}-${i}`} className="w-full text-left px-2 py-1.5 text-[13px] hover:bg-[#1f1f1f] rounded transition-colors" onClick={() => openFile(r.fileId)}>
                        <div className="text-[#c9d1d9] truncate">{r.text}</div>
                        <div className="text-[11px] text-[#484f58]">{fileMap[r.fileId]?.name}:{r.line}</div>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// GIT SIDEBAR
// ═══════════════════════════════════════════════════════════════════════
function GitSidebar() {
    return (
        <div className="h-full flex flex-col bg-[#0d1117]">
            <div className="h-9 flex items-center px-4 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e] shrink-0">Source Control</div>
            <div className="px-3 pb-3">
                <input placeholder="Message (⌘Enter to commit)" className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-[#484f58] outline-none focus:border-[#1f6feb] transition-colors" />
            </div>
            <div className="px-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8b949e] mb-2">Changes</div>
                <div className="text-[13px] text-[#484f58] text-center py-8">
                    <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No changes detected</p>
                    <p className="text-[11px] mt-1">Working tree clean</p>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// EXTENSIONS SIDEBAR
// ═══════════════════════════════════════════════════════════════════════
function ExtensionsSidebar() {
    const extensions = [
        { name: "Elara AI", publisher: "Azora", desc: "AI-powered code assistant", icon: "🤖" },
        { name: "Ubuntu Theme", publisher: "Azora", desc: "Official dark theme", icon: "🎨" },
        { name: "ESLint", publisher: "Microsoft", desc: "Linting for JavaScript", icon: "📏" },
        { name: "Prettier", publisher: "Prettier", desc: "Code formatter", icon: "✨" },
        { name: "Tailwind CSS", publisher: "Tailwind Labs", desc: "IntelliSense for Tailwind", icon: "🌊" },
    ]

    return (
        <div className="h-full flex flex-col bg-[#0d1117]">
            <div className="h-9 flex items-center px-4 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e] shrink-0">Extensions</div>
            <div className="px-3 pb-2">
                <input placeholder="Search extensions..." className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-[#484f58] outline-none focus:border-[#1f6feb] transition-colors" />
            </div>
            <div className="flex-1 overflow-y-auto">
                {extensions.map((ext) => (
                    <div key={ext.name} className="flex items-start gap-3 px-3 py-2.5 hover:bg-[#1f1f1f] cursor-pointer transition-colors">
                        <span className="text-xl mt-0.5">{ext.icon}</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-medium text-white truncate">{ext.name}</span>
                                <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                            </div>
                            <div className="text-[11px] text-[#484f58] truncate">{ext.publisher}</div>
                            <div className="text-[12px] text-[#8b949e] truncate">{ext.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// ELARA AI SIDEBAR
// ═══════════════════════════════════════════════════════════════════════
function AISidebar() {
    const { fileMap, openFiles, readFile, writeFile } = useFileSystem()
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
        { role: "assistant", content: "Hi! I'm Elara, your AI coding assistant. I can help you write, debug, and understand code. What would you like to work on?" },
    ])
    const [input, setInput] = useState("")
    const [isRefactoring, setIsRefactoring] = useState(false)

    const send = async () => {
        if (!input.trim() || isRefactoring) return
        const userPrompt = input
        setMessages(prev => [...prev, { role: "user", content: userPrompt }])
        setInput("")
        setIsRefactoring(true)

        try {
            // Gather context from open files
            const filesContext = openFiles.map(id => ({
                path: fileMap[id]?.name || id,
                content: readFile(id) || ""
            }))

            const res = await fetch("/api/code-chamber/refactor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: userPrompt, files: filesContext })
            })

            if (res.ok) {
                const data = await res.json()
                if (data.changes && data.changes.length > 0) {
                    let changeLog = "I've applied the following changes:\n"
                    data.changes.forEach((change: any) => {
                        // Find the file id by name
                        const fileId = Object.keys(fileMap).find(id => fileMap[id]?.name === change.path)
                        if (fileId && change.content !== null) {
                            writeFile(fileId, change.content)
                            changeLog += `- Updated \`${change.path}\`\n`
                            } else if (change.content === null) {
                                changeLog += `- Deleted \`${change.path}\`\n`
                            } else {
                                // The backend now returns actual file creations and the
                                // editor will create the file in the virtual filesystem.
                                changeLog += `- Created \`${change.path}\`\n`
                        }
                    })
                    setMessages(prev => [...prev, { role: "assistant", content: changeLog }])
                } else {
                    setMessages(prev => [...prev, { role: "assistant", content: "No changes were needed based on your request." }])
                }
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error while trying to refactor the code." }])
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, an unexpected error occurred." }])
        } finally {
            setIsRefactoring(false)
        }
    }

    return (
        <div className="h-full flex flex-col bg-[#0d1117]">
            <div className="h-9 flex items-center px-4 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e] shrink-0">
                <Sparkles className="w-3.5 h-3.5 mr-2 text-emerald-400" />Elara AI
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg, i) => (
                    <div key={i} className={cn("text-[13px] leading-relaxed", msg.role === "user" ? "text-white" : "text-[#c9d1d9]")}>
                        <div className="flex items-center gap-2 mb-1">
                            {msg.role === "assistant" ? (
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0"><Bot className="w-3 h-3 text-black" /></div>
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-[#30363d] flex items-center justify-center shrink-0"><span className="text-[10px] font-bold text-white">Y</span></div>
                            )}
                            <span className="text-[11px] font-medium text-[#8b949e]">{msg.role === "assistant" ? "Elara" : "You"}</span>
                        </div>
                        <div className="pl-7 whitespace-pre-wrap">{msg.content}</div>
                    </div>
                ))}
                {isRefactoring && (
                    <div className="text-[13px] text-[#8b949e] pl-7 animate-pulse">Elara is thinking and refactoring...</div>
                )}
            </div>
            <div className="p-3 border-t border-[#1b1f27]">
                <div className="flex items-center gap-2">
                    <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask Elara to refactor..." disabled={isRefactoring} className="flex-1 bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-[#484f58] outline-none focus:border-[#1f6feb] transition-colors disabled:opacity-50" />
                    <Button size="sm" onClick={send} disabled={isRefactoring} className="h-7 bg-[#238636] hover:bg-[#2ea043] border-0 text-white disabled:opacity-50">Send</Button>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// PANEL TABS
// ═══════════════════════════════════════════════════════════════════════
function PanelTabs({ activePanel, onPanelChange, onClose }: { activePanel: PanelView; onPanelChange: (v: PanelView) => void; onClose: () => void }) {
    const tabs: { view: PanelView; label: string }[] = [
        { view: "problems", label: "PROBLEMS" },
        { view: "output", label: "OUTPUT" },
        { view: "debug", label: "DEBUG CONSOLE" },
        { view: "terminal", label: "TERMINAL" },
    ]
    return (
        <div className="flex items-center justify-between h-9 border-t border-[#1b1f27] bg-[#0d1117] px-2 select-none shrink-0">
            <div className="flex items-center">
                {tabs.map((tab) => (
                    <button key={tab.view} onClick={() => onPanelChange(tab.view)} className={cn("px-3 h-9 text-[11px] font-medium uppercase tracking-wider border-t-2 transition-colors", activePanel === tab.view ? "border-[#1f6feb] text-white" : "border-transparent text-[#484f58] hover:text-[#8b949e]")}>
                        {tab.label}
                    </button>
                ))}
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-[#30363d] text-[#484f58] hover:text-[#8b949e] transition-colors"><X className="w-4 h-4" /></button>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// STATUS BAR
// ═══════════════════════════════════════════════════════════════════════
function IDEStatusBar({ activeFile, onTogglePanel }: { activeFile: string | null; panelVisible: boolean; onTogglePanel: () => void }) {
    const lang = activeFile ? getLanguage(activeFile) : "plaintext"
    return (
        <div className="h-6 bg-[#0d1117] border-t border-[#1b1f27] flex items-center justify-between px-3 text-[11px] text-[#484f58] select-none shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#8b949e] transition-colors"><GitBranch className="w-3 h-3" /><span>main</span></div>
                <div className="flex items-center gap-1.5"><CircleDot className="w-3 h-3" /><span>0 errors, 0 warnings</span></div>
            </div>
            <div className="flex items-center gap-4">
                <span className="cursor-pointer hover:text-[#8b949e] transition-colors">Ln 1, Col 1</span>
                <span className="cursor-pointer hover:text-[#8b949e] transition-colors">Spaces: 2</span>
                <span className="cursor-pointer hover:text-[#8b949e] transition-colors">UTF-8</span>
                <span className="cursor-pointer hover:text-[#8b949e] transition-colors capitalize">{lang}</span>
                <button onClick={onTogglePanel} className="flex items-center gap-1 cursor-pointer hover:text-[#8b949e] transition-colors"><SquareTerminal className="w-3 h-3" /></button>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// WELCOME TAB
// ═══════════════════════════════════════════════════════════════════════
function WelcomeTab({ onProjectSelect }: { onProjectSelect: (id: string) => void }) {
    return (
        <div className="h-full overflow-y-auto bg-[#0d1117]">
            <div className="max-w-3xl mx-auto py-16 px-8">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Code className="w-8 h-8 text-black" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Code Chamber</h1>
                        <p className="text-[#8b949e] text-sm mt-1">Your AI-powered development workspace</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-12">
                    <button onClick={() => onProjectSelect("nextjs-app")} className="group flex items-center gap-4 p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#1f6feb]/50 transition-all text-left">
                        <Plus className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                        <div><div className="text-white font-medium">New Project</div><div className="text-[13px] text-[#8b949e]">Start from a template</div></div>
                    </button>
                    <button className="group flex items-center gap-4 p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#1f6feb]/50 transition-all text-left">
                        <GitBranch className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                        <div><div className="text-white font-medium">Clone Repository</div><div className="text-[13px] text-[#8b949e]">Clone from Git URL</div></div>
                    </button>
                </div>

                <div className="mb-12">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e] mb-4">Quick Start Templates</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { name: "Next.js App", icon: "⚛️", desc: "React + TypeScript", id: "nextjs-app" },
                            { name: "Express API", icon: "🚀", desc: "Node.js REST API", id: "express-api" },
                            { name: "Python ML", icon: "🧠", desc: "Machine learning", id: "python-ml" },
                            { name: "Solidity DApp", icon: "⛓️", desc: "Web3 + Hardhat", id: "solidity-dapp" },
                            { name: "React Native", icon: "📱", desc: "Mobile app", id: "react-native" },
                            { name: "Rust CLI", icon: "🦀", desc: "Command line tool", id: "rust-cli" },
                        ].map((t) => (
                            <button key={t.id} onClick={() => onProjectSelect(t.id)} className="flex items-center gap-3 p-4 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-[#1f6feb]/50 transition-all text-left group">
                                <span className="text-2xl">{t.icon}</span>
                                <div>
                                    <div className="text-[13px] font-medium text-white group-hover:text-[#58a6ff] transition-colors">{t.name}</div>
                                    <div className="text-[11px] text-[#484f58]">{t.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e] mb-4">Keyboard Shortcuts</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
                        {[["⌘P", "Quick Open File"], ["⇧⌘P", "Command Palette"], ["⌘S", "Save File"], ["⇧⌘F", "Search in Files"], ["⌘`", "Toggle Terminal"], ["⌘B", "Toggle Sidebar"]].map(([key, label]) => (
                            <div key={key} className="flex items-center justify-between py-1.5">
                                <span className="text-[#c9d1d9]">{label}</span>
                                <kbd className="px-2 py-0.5 rounded bg-[#161b22] border border-[#30363d] text-[11px] text-[#8b949e] font-mono">{key}</kbd>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN CODE CHAMBER — self-contained VS Code-grade IDE workbench
// ═══════════════════════════════════════════════════════════════════════
export function CodeChamber({ id }: CodeChamberProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const projectId = useMemo(() => {
        if (id && id.trim().length > 0) return id
        const queryProject = searchParams?.get('projectId') || searchParams?.get('project')
        if (queryProject) return queryProject
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('citadel-active-project')
            if (stored) return stored
        }
        const parts = pathname?.split("/").filter(Boolean) ?? []
        return parts[parts.length - 1] || "default"
    }, [id, pathname, searchParams])

    useEffect(() => {
        if (typeof window !== 'undefined' && projectId) {
            localStorage.setItem('citadel-active-project', projectId)
        }
    }, [projectId])

    const { rootId, activeFileId, openFiles, fileMap, loadProject, openFile, closeFile, setActiveFile, readFile, writeFile } = useFileSystem()

    const [sidebarView, setSidebarView] = useState<SidebarView>("explorer")
    const [sidebarVisible, setSidebarVisible] = useState(true)
    const [panelView, setPanelView] = useState<PanelView>("terminal")
    const [panelVisible, setPanelVisible] = useState(true)

    // Yjs Collaboration State
    const [yDoc, setYDoc] = useState<Y.Doc | null>(null)
    const [provider, setProvider] = useState<WebrtcProvider | null>(null)
    const [binding, setBinding] = useState<MonacoBinding | null>(null)
    const [editorInstance, setEditorInstance] = useState<any>(null)

    // Initialize Yjs Doc and Provider per file
    useEffect(() => {
        if (!activeFileId || !projectId) return

        const doc = new Y.Doc()
        // Unique room name per project and file
        const roomName = `azora-buildspaces-${projectId}-${activeFileId.replace(/[^a-zA-Z0-9-]/g, '-')}`
        
        const webrtcProvider = new WebrtcProvider(roomName, doc, {
            signaling: [
                'wss://signaling.yjs.dev',
                'wss://y-webrtc-signaling-eu.herokuapp.com',
                'wss://y-webrtc-signaling-us.herokuapp.com'
            ]
        })

        setYDoc(doc)
        setProvider(webrtcProvider)

        return () => {
            webrtcProvider.destroy()
            doc.destroy()
            setYDoc(null)
            setProvider(null)
            setBinding(null)
        }
    }, [activeFileId, projectId])

    // Bind Monaco to Yjs
    useEffect(() => {
        if (!editorInstance || !yDoc || !provider || !activeFileId) return

        const type = yDoc.getText(activeFileId)
        const model = editorInstance.getModel()
        
        if (!model) return

        // If the Yjs document is empty but we have local content, initialize it
        const localContent = readFile(activeFileId)
        if (type.length === 0 && localContent) {
            type.insert(0, localContent)
        }

        const monacoBinding = new MonacoBinding(type, model, new Set([editorInstance]), provider.awareness)
        setBinding(monacoBinding)

        return () => {
            monacoBinding.destroy()
            setBinding(null)
        }
    }, [editorInstance, yDoc, provider, activeFileId, readFile])

    useEffect(() => { if (projectId) loadProject(projectId) }, [projectId, loadProject])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "`") { e.preventDefault(); setPanelVisible(p => !p) }
            if ((e.metaKey || e.ctrlKey) && e.key === "b") { e.preventDefault(); setSidebarVisible(s => !s) }
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault()
                if (activeFileId) { const c = readFile(activeFileId); if (c !== undefined) writeFile(activeFileId, c) }
            }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [activeFileId, readFile, writeFile])

    const activeFileName = activeFileId ? fileMap[activeFileId]?.name || "" : ""
    const activeFileContent = activeFileId ? readFile(activeFileId) || "" : ""

    const handleEditorMount = useCallback((editor: any, monaco: any) => {
        setEditorInstance(editor)

        // Register inline AI completion provider (like Cursor/Copilot ghost text)
        const disposable = monaco.languages.registerInlineCompletionsProvider("*", {
            provideInlineCompletions: async (model: any, position: any, context: any, token: any) => {
                // Only trigger after typing pauses (debounce in the provider itself)
                const lineContent = model.getLineContent(position.lineNumber)
                const textBeforeCursor = model.getValueInRange({
                    startLineNumber: Math.max(1, position.lineNumber - 20),
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                })

                // Don't trigger on empty lines or very short context
                if (textBeforeCursor.trim().length < 10) return { items: [] }

                try {
                    const resp = await fetch("/api/code-chamber/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            prefix: textBeforeCursor,
                            language: model.getLanguageId(),
                            filename: activeFileName,
                        }),
                        signal: token.onCancellationRequested ? AbortSignal.timeout(5000) : undefined,
                    })
                    if (!resp.ok) return { items: [] }
                    const data = await resp.json()
                    if (!data.completion) return { items: [] }

                    return {
                        items: [{
                            insertText: data.completion,
                            range: {
                                startLineNumber: position.lineNumber,
                                startColumn: position.column,
                                endLineNumber: position.lineNumber,
                                endColumn: position.column,
                            },
                        }],
                    }
                } catch {
                    return { items: [] }
                }
            },
            freeInlineCompletions: () => {},
        })

        // Add Ctrl+Shift+I shortcut for "Explain Selection"
        editor.addAction({
            id: "elara-explain",
            label: "Elara: Explain Selection",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI],
            contextMenuGroupId: "1_modification",
            contextMenuOrder: 1.5,
            run: async (ed: any) => {
                const selection = ed.getSelection()
                const selectedText = ed.getModel()?.getValueInRange(selection)
                if (!selectedText) return
                // The AI sidebar would pick this up — for now show inline
                const decoration = ed.createDecorationsCollection([{
                    range: selection,
                    options: {
                        className: "elara-highlight",
                        glyphMarginClassName: "elara-glyph",
                        after: { content: " 🧠 Analyzing...", inlineClassName: "elara-inline-hint" },
                    },
                }])
                setTimeout(() => decoration.clear(), 3000)
            },
        })

        // Cleanup
        return () => disposable.dispose()
    }, [activeFileName])

    const handleEditorChange = useCallback((value: string | undefined) => {
        if (activeFileId && value !== undefined) writeFile(activeFileId, value)
    }, [activeFileId, writeFile])

    const handleSidebarViewChange = useCallback((v: SidebarView) => {
        if (sidebarView === v && sidebarVisible) setSidebarVisible(false)
        else { setSidebarView(v); if (!sidebarVisible) setSidebarVisible(true) }
    }, [sidebarView, sidebarVisible])

    const renderSidebar = () => {
        switch (sidebarView) {
            case "explorer": return <ExplorerSidebar />
            case "search": return <SearchSidebar />
            case "git": return <GitSidebar />
            case "extensions": return <ExtensionsSidebar />
            case "ai": return <AISidebar />
            default: return <ExplorerSidebar />
        }
    }

    const renderPanel = () => {
        switch (panelView) {
            case "terminal": return <div className="h-full bg-[#0d1117]"><XTerminal /></div>
            case "problems": return <div className="h-full bg-[#0d1117] p-4"><div className="text-[13px] text-[#484f58] text-center py-8"><CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500/40" /><p>No problems detected</p></div></div>
            case "output": return <div className="h-full bg-[#0d1117] p-4 font-mono text-[13px] text-[#c9d1d9]"><div className="text-[#8b949e]">[Output] Ready.</div></div>
            case "debug": return <div className="h-full bg-[#0d1117] p-4"><div className="text-[13px] text-[#484f58] text-center py-8"><Bug className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>No debug session active</p><p className="text-[11px] mt-1">Start debugging with F5</p></div></div>
            default: return null
        }
    }

    return (
        <TooltipProvider delayDuration={300}>
            <div className="h-full w-full flex flex-col bg-[#0d1117] overflow-hidden">
                {/* Title Bar */}
                <div className="h-9 flex items-center justify-between px-3 bg-[#010409] border-b border-[#1b1f27] shrink-0 select-none">
                    <div className="flex items-center gap-3 text-[13px]">
                        <div className="flex items-center gap-2 text-[#c9d1d9]">
                            <Code className="w-4 h-4 text-emerald-400" />
                            <span className="font-medium">Code Chamber</span>
                        </div>
                        <span className="text-[#30363d]">—</span>
                        <span className="text-[#8b949e] truncate max-w-[300px]">{activeFileName || "No file open"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-[#8b949e] hover:text-white hover:bg-[#30363d] gap-1.5">
                            <Play className="w-3 h-3 text-emerald-400" />Run
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-[#8b949e] hover:text-white hover:bg-[#30363d] gap-1.5">
                            <Globe className="w-3 h-3 text-[#54aeff]" />Deploy
                        </Button>
                    </div>
                </div>

                {/* Workbench */}
                <div className="flex-1 flex overflow-hidden min-h-0">
                    <IDEActivityBar activeView={sidebarView} onViewChange={handleSidebarViewChange} sidebarVisible={sidebarVisible} />

                    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                        <ResizablePanelGroup direction="horizontal" className="flex-1">
                            {sidebarVisible && (
                                <>
                                    <ResizablePanel defaultSize={20} minSize={12} maxSize={40} className="min-w-[200px]">
                                        {renderSidebar()}
                                    </ResizablePanel>
                                    <ResizableHandle className="w-px bg-[#1b1f27] hover:bg-[#1f6feb] transition-colors data-[resize-handle-active]:bg-[#1f6feb]" />
                                </>
                            )}

                            <ResizablePanel defaultSize={sidebarVisible ? 80 : 100}>
                                <ResizablePanelGroup direction="vertical">
                                    <ResizablePanel defaultSize={panelVisible ? 65 : 100} minSize={30}>
                                        <div className="h-full flex flex-col bg-[#0d1117]">
                                            {/* Editor Tabs */}
                                            <div className="flex items-center bg-[#010409] border-b border-[#1b1f27] overflow-x-auto shrink-0 scrollbar-none min-h-[35px]">
                                                {openFiles.map((fId) => {
                                                    const file = fileMap[fId]
                                                    if (!file) return null
                                                    const isActive = activeFileId === fId
                                                    return (
                                                        <button key={fId} onClick={() => setActiveFile(fId)} className={cn("group flex items-center gap-2 h-[35px] px-3 text-[13px] border-r border-[#1b1f27] transition-colors shrink-0", isActive ? "bg-[#0d1117] text-white border-t-2 border-t-[#1f6feb]" : "bg-[#010409] text-[#8b949e] hover:text-[#c9d1d9] border-t-2 border-t-transparent")}>
                                                            {getFileIcon(file.name)}
                                                            <span>{file.name}</span>
                                                            <button onClick={(e) => { e.stopPropagation(); closeFile(fId) }} className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[#30363d] transition-all"><X className="w-3 h-3" /></button>
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            {/* Editor / Welcome */}
                                            <div className="flex-1 min-h-0 relative">
                                                {activeFileId ? (
                                                    <>
                                                        {provider && (
                                                            <div className="absolute top-2 right-6 z-10 flex items-center gap-2 px-2 py-1 rounded-md bg-[#161b22] border border-[#30363d] text-[11px] text-[#8b949e] shadow-sm">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                <span>Live Collaboration Active</span>
                                                            </div>
                                                        )}
                                                        <MonacoEditor
                                                            height="100%"
                                                            path={activeFileId}
                                                            language={getLanguage(activeFileName)}
                                                            theme="vs-dark"
                                                            value={activeFileContent}
                                                            onChange={handleEditorChange}
                                                            onMount={handleEditorMount}
                                                            options={{
                                                                minimap: { enabled: true, maxColumn: 80 },
                                                                fontSize: 13,
                                                                lineNumbers: "on",
                                                                scrollBeyondLastLine: false,
                                                                automaticLayout: true,
                                                                tabSize: 2,
                                                                wordWrap: "off",
                                                                padding: { top: 8 },
                                                                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                                                                fontLigatures: true,
                                                                cursorBlinking: "smooth",
                                                                cursorSmoothCaretAnimation: "on",
                                                                smoothScrolling: true,
                                                                renderLineHighlight: "all",
                                                                bracketPairColorization: { enabled: true },
                                                                guides: { bracketPairs: true },
                                                                suggest: { showMethods: true, showFunctions: true },
                                                                stickyScroll: { enabled: true },
                                                                renderWhitespace: "boundary",
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    <WelcomeTab onProjectSelect={(templateId) => loadProject(templateId)} />
                                                )}
                                            </div>
                                        </div>
                                    </ResizablePanel>

                                    {panelVisible && (
                                        <>
                                            <ResizableHandle className="h-px bg-[#1b1f27] hover:bg-[#1f6feb] transition-colors data-[resize-handle-active]:bg-[#1f6feb]" />
                                            <ResizablePanel defaultSize={35} minSize={10} maxSize={80}>
                                                <div className="h-full flex flex-col">
                                                    <PanelTabs activePanel={panelView} onPanelChange={setPanelView} onClose={() => setPanelVisible(false)} />
                                                    <div className="flex-1 overflow-hidden">{renderPanel()}</div>
                                                </div>
                                            </ResizablePanel>
                                        </>
                                    )}
                                </ResizablePanelGroup>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                </div>

                {/* Status Bar */}
                <IDEStatusBar activeFile={activeFileName} panelVisible={panelVisible} onTogglePanel={() => setPanelVisible(!panelVisible)} />
            </div>
        </TooltipProvider>
    )
}

export default CodeChamber
