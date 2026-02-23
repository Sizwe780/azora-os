"use client"

import { useState, useEffect } from "react"
import {
    GitBranch,
    AlertCircle,
    Check,
    Bell,
    Wifi,
    Cpu,
    HardDrive,
    Zap,
    Clock,
    Globe,
    Shield,
    Activity,
    Settings,
    User
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWorkspace } from "@/lib/contexts/workspace-context"

export function StatusBar() {
    const { activeRoom } = useWorkspace()
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected')
    const [cpuUsage, setCpuUsage] = useState(45)
    const [memoryUsage, setMemoryUsage] = useState(67)
    const [currentTime, setCurrentTime] = useState(new Date())

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setCpuUsage(prev => Math.max(20, Math.min(90, prev + (Math.random() - 0.5) * 10)))
            setMemoryUsage(prev => Math.max(30, Math.min(95, prev + (Math.random() - 0.5) * 5)))
            setCurrentTime(new Date())
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const getConnectionColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'text-green-500'
            case 'connecting': return 'text-yellow-500'
            case 'disconnected': return 'text-red-500'
        }
    }

    const getConnectionIcon = () => {
        switch (connectionStatus) {
            case 'connected': return <Wifi className="w-3 h-3" />
            case 'connecting': return <Activity className="w-3 h-3 animate-pulse" />
            case 'disconnected': return <AlertCircle className="w-3 h-3" />
        }
    }

    return (
        <TooltipProvider>
            <div className="h-7 bg-gradient-to-r from-muted/80 to-muted border-t border-border/50 flex items-center justify-between px-4 text-xs select-none backdrop-blur-sm">
                {/* Left Section */}
                <div className="flex items-center gap-6">
                    {/* Git Branch */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 hover:bg-accent/50 px-2 py-1 rounded cursor-pointer transition-colors">
                                <GitBranch className="w-3.5 h-3.5" />
                                <span className="font-medium">main</span>
                                <Badge variant="outline" className="text-xs h-4 px-1">↑2 ↓0</Badge>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">Git Branch: main</div>
                                <div className="text-xs text-muted-foreground">2 commits ahead, 0 behind</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    {/* Issues */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-3 hover:bg-accent/50 px-2 py-1 rounded cursor-pointer transition-colors">
                                <div className="flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                    <span>0</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                                    <span>3</span>
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">Issues</div>
                                <div className="text-xs text-muted-foreground">0 errors, 3 warnings</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    {/* Connection Status */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={`flex items-center gap-1 hover:bg-accent/50 px-2 py-1 rounded cursor-pointer transition-colors ${getConnectionColor()}`}>
                                {getConnectionIcon()}
                                <span className="capitalize">{connectionStatus}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">Cloud Connection</div>
                                <div className="text-xs text-muted-foreground">Connected to Azora Cloud IDE</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Center Section - Current File Info */}
                <div className="flex items-center gap-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="hover:bg-accent/50 px-2 py-1 rounded cursor-pointer transition-colors">
                                Ln 42, Col 18
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">Cursor Position</div>
                                <div className="text-xs text-muted-foreground">Line 42, Column 18</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="hover:bg-accent/50 px-2 py-1 rounded cursor-pointer transition-colors">
                                UTF-8
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">Encoding</div>
                                <div className="text-xs text-muted-foreground">Unicode (UTF-8)</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="hover:bg-accent/50 px-2 py-1 rounded cursor-pointer transition-colors">
                                TypeScript React
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">Language Mode</div>
                                <div className="text-xs text-muted-foreground">TypeScript React (.tsx)</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Performance Metrics */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 hover:bg-accent/50 px-2 py-1 rounded cursor-pointer transition-colors">
                                <Cpu className="w-3 h-3" />
                                <span>{cpuUsage}%</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">CPU Usage</div>
                                <div className="text-xs text-muted-foreground">System performance: {cpuUsage}%</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 hover:bg-accent/50 px-2 py-1 rounded cursor-pointer transition-colors">
                                <HardDrive className="w-3 h-3" />
                                <span>{memoryUsage}%</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">Memory Usage</div>
                                <div className="text-xs text-muted-foreground">RAM usage: {memoryUsage}%</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    {/* Live Share / Collaboration */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 hover:bg-accent/50 px-2 py-1 rounded cursor-pointer transition-colors">
                                <User className="w-3 h-3" />
                                <span>1</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">Live Collaboration</div>
                                <div className="text-xs text-muted-foreground">1 active user in session</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    {/* Prettier/ESLint Status */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 hover:bg-accent/50 px-2 py-1 rounded cursor-pointer transition-colors text-green-500">
                                <Check className="w-3 h-3" />
                                <span>Prettier</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">Code Formatting</div>
                                <div className="text-xs text-muted-foreground">Prettier enabled, ESLint active</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    {/* Time */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 hover:bg-accent/50 px-2 py-1 rounded cursor-pointer transition-colors">
                                <Clock className="w-3 h-3" />
                                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">Local Time</div>
                                <div className="text-xs text-muted-foreground">{currentTime.toLocaleDateString()}</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    {/* Notifications */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-6 h-6 p-0 hover:bg-accent/50">
                                <Bell className="w-3 h-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm">
                                <div className="font-medium">Notifications</div>
                                <div className="text-xs text-muted-foreground">No new notifications</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )
}
