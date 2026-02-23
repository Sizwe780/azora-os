"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Smartphone, Monitor, Tablet, Eye } from "lucide-react"

interface PrototypePlayerProps {
    projectId?: string
}

interface PrototypeFlow {
    id: string
    name: string
    screens: Screen[]
    connections: Connection[]
}

interface Screen {
    id: string
    name: string
    thumbnail: string
    content: string
}

interface Connection {
    from: string
    to: string
    trigger: string
}

export function PrototypePlayer({ projectId }: PrototypePlayerProps) {
    const [flows, setFlows] = useState<PrototypeFlow[]>([])
    const [selectedFlow, setSelectedFlow] = useState<string | null>(null)
    const [currentScreen, setCurrentScreen] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')

    useEffect(() => {
        // Load prototype flows from API
        const loadFlows = async () => {
            if (!projectId) return

            try {
                const resp = await fetch(`/api/design/prototypes?projectId=${projectId}`)
                if (resp.ok) {
                    const data = await resp.json()
                    setFlows(data.flows || [])
                }
            } catch (error) {
                console.error('Failed to load prototype flows:', error)
            }
        }

        loadFlows()
    }, [projectId])

    const startPrototype = (flowId: string) => {
        const flow = flows.find(f => f.id === flowId)
        if (flow && flow.screens.length > 0) {
            setSelectedFlow(flowId)
            setCurrentScreen(flow.screens[0].id)
            setIsPlaying(true)
        }
    }

    const stopPrototype = () => {
        setSelectedFlow(null)
        setCurrentScreen(null)
        setIsPlaying(false)
    }

    const resetPrototype = () => {
        if (selectedFlow) {
            const flow = flows.find(f => f.id === selectedFlow)
            if (flow && flow.screens.length > 0) {
                setCurrentScreen(flow.screens[0].id)
            }
        }
    }

    const handleScreenInteraction = (trigger: string) => {
        if (!selectedFlow || !currentScreen) return

        const flow = flows.find(f => f.id === selectedFlow)
        if (!flow) return

        const connection = flow.connections.find(
            conn => conn.from === currentScreen && conn.trigger === trigger
        )

        if (connection) {
            setCurrentScreen(connection.to)
        }
    }

    const currentFlow = flows.find(f => f.id === selectedFlow)
    const currentScreenData = currentFlow?.screens.find(s => s.id === currentScreen)

    const getViewModeIcon = (mode: typeof viewMode) => {
        switch (mode) {
            case 'mobile': return <Smartphone className="w-4 h-4" />
            case 'tablet': return <Tablet className="w-4 h-4" />
            case 'desktop': return <Monitor className="w-4 h-4" />
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-medium">Prototype Player</span>
                </div>

                {isPlaying && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                            <Button
                                size="sm"
                                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                                onClick={() => setViewMode('mobile')}
                            >
                                <Smartphone className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                                onClick={() => setViewMode('tablet')}
                            >
                                <Tablet className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                                onClick={() => setViewMode('desktop')}
                            >
                                <Monitor className="w-4 h-4" />
                            </Button>
                        </div>

                        <Button size="sm" variant="outline" onClick={resetPrototype}>
                            <RotateCcw className="w-4 h-4" />
                        </Button>

                        <Button size="sm" variant="outline" onClick={stopPrototype}>
                            <Pause className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {!isPlaying ? (
                    /* Flow Selection */
                    <div className="p-4">
                        <h3 className="text-sm font-medium mb-4">Select a Prototype Flow</h3>

                        {flows.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No prototype flows available</p>
                                <p className="text-xs mt-1">Create interactions in your design to enable prototyping</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {flows.map((flow) => (
                                    <div
                                        key={flow.id}
                                        className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => startPrototype(flow.id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{flow.name}</span>
                                            <Badge variant="outline">
                                                {flow.screens.length} screens
                                            </Badge>
                                        </div>

                                        <div className="flex gap-2">
                                            {flow.screens.slice(0, 4).map((screen) => (
                                                <div
                                                    key={screen.id}
                                                    className="w-12 h-8 bg-muted rounded border overflow-hidden"
                                                >
                                                    <img
                                                        src={screen.thumbnail}
                                                        alt={screen.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                            {flow.screens.length > 4 && (
                                                <div className="w-12 h-8 bg-muted rounded border flex items-center justify-center">
                                                    <span className="text-xs text-muted-foreground">
                                                        +{flow.screens.length - 4}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Prototype Player */
                    <div className="h-full flex flex-col">
                        {/* Screen Display */}
                        <div className="flex-1 flex items-center justify-center p-4 bg-muted/20">
                            <div className={`relative border rounded-lg overflow-hidden shadow-lg ${
                                viewMode === 'mobile' ? 'w-64 h-[32rem]' :
                                viewMode === 'tablet' ? 'w-96 h-[32rem]' :
                                'w-full max-w-4xl h-[32rem]'
                            }`}>
                                {currentScreenData ? (
                                    <div
                                        className="w-full h-full bg-white cursor-pointer"
                                        onClick={() => handleScreenInteraction('tap')}
                                        dangerouslySetInnerHTML={{ __html: currentScreenData.content }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <Eye className="w-8 h-8 opacity-50" />
                                    </div>
                                )}

                                {/* Device Frame */}
                                {viewMode !== 'desktop' && (
                                    <div className="absolute inset-0 border-4 border-gray-800 rounded-lg pointer-events-none" />
                                )}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="h-16 border-t flex items-center justify-center gap-4 p-4">
                            <span className="text-sm text-muted-foreground">
                                {currentScreenData?.name || 'Loading...'}
                            </span>

                            {currentFlow && (
                                <div className="flex gap-2">
                                    {currentFlow.connections
                                        .filter(conn => conn.from === currentScreen)
                                        .map((connection) => (
                                            <Button
                                                key={connection.trigger}
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleScreenInteraction(connection.trigger)}
                                            >
                                                {connection.trigger}
                                            </Button>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
