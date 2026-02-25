"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, Download, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Agent {
    id: string
    name: string
    title: string
    capabilities: string[]
    status: string
    installed?: boolean
}

const RECOMMENDED_AGENTS: Agent[] = [
    { id: 'naledi', name: 'Naledi', title: 'UX Designer', capabilities: ['ui-design', 'prototype'], status: 'available', installed: false },
    { id: 'amara', name: 'Amara', title: 'Performance Specialist', capabilities: ['optimize', 'profiling'], status: 'available', installed: false },
]

export function ExtensionsView() {
    const [query, setQuery] = useState("")
    const [agents, setAgents] = useState<Agent[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadAgents = async () => {
            try {
                const response = await fetch("/api/agents/invoke")
                if (response.ok) {
                    const data = await response.json()
                    const loaded = (data.agents || []).map((a: Agent) => ({ ...a, installed: true }))
                    setAgents(loaded)
                }
            } catch {
                // Fallback to defaults
                setAgents([
                    { id: 'elara', name: 'Elara', title: 'XO Architect', capabilities: ['orchestrate', 'plan'], status: 'online', installed: true },
                    { id: 'sankofa', name: 'Sankofa', title: 'Code Architect', capabilities: ['code-review', 'generate-code'], status: 'online', installed: true },
                    { id: 'themba', name: 'Themba', title: 'Testing Specialist', capabilities: ['test-generation'], status: 'online', installed: true },
                ])
            } finally {
                setIsLoading(false)
            }
        }
        loadAgents()
    }, [])

    const filtered = agents.filter(a =>
        !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.title.toLowerCase().includes(query.toLowerCase())
    )
    const installed = filtered.filter(a => a.installed)
    const recommended = RECOMMENDED_AGENTS.filter(a =>
        !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.title.toLowerCase().includes(query.toLowerCase())
    )

    const getInitialColor = (name: string) => {
        const colors = ['from-emerald-500 to-teal-500', 'from-blue-500 to-indigo-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-red-500']
        return colors[name.charCodeAt(0) % colors.length]
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Agents & Extensions</p>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search agents..."
                        className="pl-8 h-8 text-sm"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-auto py-2">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {installed.length > 0 && (
                            <>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 px-3">Installed</h3>
                                {installed.map(agent => (
                                    <div key={agent.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded mx-1 cursor-pointer group">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getInitialColor(agent.name)} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                                            {agent.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{agent.name}</div>
                                            <div className="text-xs text-muted-foreground truncate">{agent.title}</div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {recommended.length > 0 && (
                            <>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-1 px-3">Recommended</h3>
                                {recommended.map(agent => (
                                    <div key={agent.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded mx-1 cursor-pointer group">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getInitialColor(agent.name)} opacity-60 flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                                            {agent.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{agent.name}</div>
                                            <div className="text-xs text-muted-foreground truncate">{agent.title}</div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0" title="Install">
                                            <Download className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
