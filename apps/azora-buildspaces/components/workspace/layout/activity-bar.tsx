"use client"

import {
    Files,
    Search,
    GitBranch,
    Box,
    MessageSquare,
    Settings,
    User,
    Cpu,
    Zap,
    Sparkles,
    Code2,
    Palette,
    Database,
    Cloud,
    Shield,
    BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkbench, SidebarView } from "@/lib/stores/workbench-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWorkspace } from "@/lib/contexts/workspace-context"

export function ActivityBar() {
    const { activeSidebarView, setSidebarView, isSidebarVisible, toggleSidebar } = useWorkbench()
    const { activeRoom } = useWorkspace()

    const items: { view: SidebarView; icon: any; label: string; badge?: string }[] = [
        { view: 'explorer', icon: Files, label: 'Explorer', badge: 'Ctrl+Shift+E' },
        { view: 'search', icon: Search, label: 'Search', badge: 'Ctrl+Shift+F' },
        { view: 'git', icon: GitBranch, label: 'Source Control', badge: 'Ctrl+Shift+G' },
        { view: 'extensions', icon: Box, label: 'Extensions', badge: 'Ctrl+Shift+X' },
        { view: 'chat', icon: MessageSquare, label: 'AI Assistant', badge: 'Ctrl+Shift+A' },
        { view: 'ai-assistant', icon: Sparkles, label: 'AI Code Assistant', badge: 'Ctrl+Shift+I' },
        { view: 'code-analysis', icon: BarChart3, label: 'Code Analysis', badge: 'Ctrl+Shift+C' },
        { view: 'refactoring', icon: Zap, label: 'Refactoring', badge: 'Ctrl+Shift+R' },
    ]

    const roomSpecificItems = () => {
        switch (activeRoom) {
            case 'design-studio':
                return [
                    { view: 'explorer' as SidebarView, icon: Palette, label: 'Design Assets', badge: 'Ctrl+Shift+D' },
                    { view: 'search' as SidebarView, icon: Search, label: 'Search Designs', badge: 'Ctrl+Shift+F' },
                ]
            case 'maker-lab':
                return [
                    { view: 'explorer' as SidebarView, icon: Cpu, label: 'Hardware', badge: 'Ctrl+Shift+H' },
                    { view: 'search' as SidebarView, icon: Database, label: 'IoT Data', badge: 'Ctrl+Shift+T' },
                ]
            case 'spec-chamber':
                return [
                    { view: 'explorer' as SidebarView, icon: Shield, label: 'Specifications', badge: 'Ctrl+Shift+S' },
                    { view: 'search' as SidebarView, icon: Cloud, label: 'Requirements', badge: 'Ctrl+Shift+Q' },
                ]
            default:
                return items
        }
    }

    const displayItems = roomSpecificItems()

    const handleClick = (view: SidebarView) => {
        if (activeSidebarView === view && isSidebarVisible) {
            toggleSidebar()
        } else {
            setSidebarView(view)
        }
    }

    return (
        <TooltipProvider>
            <div className="w-14 flex flex-col items-center py-3 bg-gradient-to-b from-background to-muted/20 border-r border-border/50 h-full shadow-sm">
                {/* Logo/Brand */}
                <div className="mb-4">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                        <Code2 className="w-4 h-4 text-primary-foreground" />
                    </div>
                </div>

                {/* Activity Items */}
                <div className="flex-1 space-y-1">
                    {displayItems.map((item) => (
                        <Tooltip key={item.view}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "w-10 h-10 rounded-lg transition-all duration-200 relative group",
                                        activeSidebarView === item.view && isSidebarVisible
                                            ? "bg-primary/20 text-primary shadow-sm border border-primary/30"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    )}
                                    onClick={() => handleClick(item.view)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {activeSidebarView === item.view && isSidebarVisible && (
                                        <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r-full shadow-sm" />
                                    )}
                                    {/* Hover effect */}
                                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/5 to-transparent transition-opacity" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="ml-2">
                                <div className="text-sm">
                                    <div className="font-medium">{item.label}</div>
                                    {item.badge && (
                                        <div className="text-xs text-muted-foreground mt-0.5">{item.badge}</div>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="mt-auto space-y-1">
                    {/* User Avatar */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-lg hover:bg-accent/50"
                            >
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-medium text-white">
                                    U
                                </div>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="ml-2">
                            <div className="text-sm">
                                <div className="font-medium">User Profile</div>
                                <div className="text-xs text-muted-foreground">Account & Settings</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    {/* Settings */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-lg hover:bg-accent/50"
                            >
                                <Settings className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="ml-2">
                            <div className="text-sm">
                                <div className="font-medium">Settings</div>
                                <div className="text-xs text-muted-foreground">Preferences & Configuration</div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )
}
