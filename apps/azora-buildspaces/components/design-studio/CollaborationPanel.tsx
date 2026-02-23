"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, MessageCircle, Video, Mic, MicOff, X } from "lucide-react"

interface CollaborationPanelProps {
    projectId?: string
    onClose: () => void
}

interface Collaborator {
    id: string
    name: string
    avatar?: string
    status: 'online' | 'away' | 'offline'
    cursor?: { x: number; y: number }
    selection?: { start: number; end: number }
}

export function CollaborationPanel({ projectId, onClose }: CollaborationPanelProps) {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([])
    const [message, setMessage] = useState("")
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)

    useEffect(() => {
        // Load collaborators from API
        const loadCollaborators = async () => {
            if (!projectId) return

            try {
                const resp = await fetch(`/api/collaboration/${projectId}/members`)
                if (resp.ok) {
                    const data = await resp.json()
                    setCollaborators(data.members || [])
                }
            } catch (error) {
                console.error('Failed to load collaborators:', error)
            }
        }

        loadCollaborators()

        // Mock real-time updates
        const interval = setInterval(() => {
            setCollaborators(prev => prev.map(collab => ({
                ...collab,
                cursor: Math.random() > 0.7 ? {
                    x: Math.random() * 1000,
                    y: Math.random() * 600
                } : undefined
            })))
        }, 2000)

        return () => clearInterval(interval)
    }, [projectId])

    const sendMessage = async () => {
        if (!message.trim() || !projectId) return

        try {
            await fetch(`/api/collaboration/${projectId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message })
            })
            setMessage("")
        } catch (error) {
            console.error('Failed to send message:', error)
        }
    }

    const toggleVoice = () => {
        setIsVoiceEnabled(!isVoiceEnabled)
    }

    const getStatusColor = (status: Collaborator['status']) => {
        switch (status) {
            case 'online': return 'bg-green-500'
            case 'away': return 'bg-yellow-500'
            case 'offline': return 'bg-gray-500'
        }
    }

    return (
        <div className="w-80 bg-background border rounded-lg shadow-lg">
            {/* Header */}
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Collaboration</span>
                    <Badge variant="outline" className="text-xs">
                        {collaborators.filter(c => c.status === 'online').length} online
                    </Badge>
                </div>
                <Button size="sm" variant="ghost" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Collaborators */}
            <div className="p-4 border-b">
                <h4 className="text-sm font-medium mb-3">Team Members</h4>
                <div className="space-y-2">
                    {collaborators.map((collaborator) => (
                        <div key={collaborator.id} className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-xs">
                                        {collaborator.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(collaborator.status)}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                    {collaborator.name}
                                </div>
                                <div className="text-xs text-muted-foreground capitalize">
                                    {collaborator.status}
                                    {collaborator.cursor && (
                                        <span className="ml-1">• Editing</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Voice Controls */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Voice Chat</span>
                    <Button
                        size="sm"
                        variant={isVoiceEnabled ? "default" : "outline"}
                        onClick={toggleVoice}
                        className="gap-2"
                    >
                        {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        {isVoiceEnabled ? 'Mute' : 'Unmute'}
                    </Button>
                </div>
            </div>

            {/* Chat */}
            <div className="p-4">
                <h4 className="text-sm font-medium mb-3">Chat</h4>
                <div className="space-y-3">
                    {/* Mock chat messages */}
                    <div className="text-xs text-muted-foreground">
                        <div className="mb-2">
                            <span className="font-medium">Alice:</span> Great work on that button design!
                        </div>
                        <div className="mb-2">
                            <span className="font-medium">Bob:</span> Thanks! I'll adjust the spacing.
                        </div>
                    </div>

                    {/* Message input */}
                    <div className="flex gap-2">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button size="sm" onClick={sendMessage} disabled={!message.trim()}>
                            <MessageCircle className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
