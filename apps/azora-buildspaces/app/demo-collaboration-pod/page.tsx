'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Sparkles, Lock, Zap, Users, Video, MessageSquare, Share2, Pencil, Eye } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// Demo collaboration component with simulated users
function CollaborationDemo() {
    const [activeUsers] = useState([
        { id: 1, name: 'Thabo M.', color: '#10B981', cursor: { x: 150, y: 200 }, avatar: '👨🏾‍💻' },
        { id: 2, name: 'Amara K.', color: '#8B5CF6', cursor: { x: 400, y: 350 }, avatar: '👩🏾‍💻' },
        { id: 3, name: 'Kwame A.', color: '#F59E0B', cursor: { x: 600, y: 180 }, avatar: '👨🏿‍💻' },
    ])

    return (
        <div className="h-full flex">
            {/* Main Canvas Area */}
            <div className="flex-1 relative bg-muted/20 rounded-lg border overflow-hidden">
                {/* Simulated document */}
                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-4">Project Requirements Document</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>Welcome to the collaborative workspace! Multiple users can edit this document simultaneously.</p>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 text-emerald-400 text-sm">
                            ✨ This is a demo of real-time collaboration. In the full version, all changes sync instantly.
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Features</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Real-time cursor tracking</li>
                            <li>Collaborative editing with CRDT</li>
                            <li>Voice and video chat</li>
                            <li>Screen sharing</li>
                            <li>Comments and annotations</li>
                        </ul>
                    </div>
                </div>

                {/* Simulated cursors */}
                {activeUsers.map((user) => (
                    <div
                        key={user.id}
                        className="absolute pointer-events-none transition-all duration-300"
                        style={{ left: user.cursor.x, top: user.cursor.y }}
                    >
                        <div className="relative">
                            <div
                                className="w-4 h-4 rounded-full animate-pulse"
                                style={{ backgroundColor: user.color }}
                            />
                            <div
                                className="absolute left-4 top-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
                                style={{ backgroundColor: user.color }}
                            >
                                {user.avatar} {user.name}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar */}
            <div className="w-72 border-l p-4 space-y-4">
                {/* Active Users */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-500" />
                            Active Now ({activeUsers.length + 1})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm">
                                👤
                            </div>
                            <div>
                                <p className="text-sm font-medium">You</p>
                                <p className="text-xs text-muted-foreground">Editing</p>
                            </div>
                        </div>
                        {activeUsers.map((user) => (
                            <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                    style={{ backgroundColor: user.color + '30', border: `2px solid ${user.color}` }}
                                >
                                    {user.avatar}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">Viewing</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                            <Video className="w-4 h-4" /> Start Video Call
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                            <Share2 className="w-4 h-4" /> Share Screen
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                            <MessageSquare className="w-4 h-4" /> Open Chat
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function DemoCollaborationPodPage() {
    return (
        <div className="min-h-screen bg-[#0d1117] flex flex-col">
            {/* Demo Mode Banner */}
            <div className="bg-gradient-to-r from-green-500/20 via-primary/20 to-green-500/20 border-b border-green-500/30">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/features/collaboration-pod" className="text-muted-foreground hover:text-foreground transition flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm">Back to Features</span>
                        </Link>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                            <Sparkles className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-300 font-medium">Demo Mode</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                            <Lock className="w-4 h-4" />
                            <span>Simulated collaboration in demo</span>
                        </div>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white gap-2">
                            <Zap className="w-4 h-4" />
                            Get Full Access
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Demo Content */}
            <div className="flex-1 p-4">
                <div className="h-[600px]">
                    <CollaborationDemo />
                </div>
            </div>

            {/* Demo Footer */}
            <div className="bg-muted/30 border-t py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Unlock real-time collaboration</h3>
                            <p className="text-sm text-muted-foreground">Invite your team, edit together in real-time with video chat and screen sharing.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/pricing">
                                <Button variant="outline">View Pricing</Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button className="bg-green-500 hover:bg-green-600 text-white">
                                    Start Free Trial
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
