'use client'

import { CommandDesk } from '@/components/rooms/command-desk'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Lock, Zap } from 'lucide-react'
import Link from 'next/link'
import { WorkspaceProvider } from '@/lib/contexts/workspace-context'

export default function DemoCommandDeskPage() {
    return (
        <WorkspaceProvider initialRoom="command-desk">
            <div className="min-h-screen bg-[#0d1117] flex flex-col">
                {/* Demo Mode Banner */}
                <div className="bg-gradient-to-r from-amber-500/20 via-primary/20 to-amber-500/20 border-b border-amber-500/30">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/features/command-desk" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm">Back to Features</span>
                            </Link>
                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span className="text-sm text-amber-300 font-medium">Demo Mode</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                                <Lock className="w-4 h-4" />
                                <span>Limited commands in demo</span>
                            </div>
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                                <Zap className="w-4 h-4" />
                                Get Full Access
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Demo Content */}
                <div className="flex-1 p-4">
                    <div className="h-[700px]">
                        <CommandDesk />
                    </div>
                </div>

                {/* Demo Footer */}
                <div className="bg-[#161b22] border-t border-white/10 py-6">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Unlock full Command Desk</h3>
                                <p className="text-sm text-gray-400">Get unlimited AI orchestration, task automation, and multi-agent workflows.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/pricing">
                                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                        View Pricing
                                    </Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                                        Start Free Trial
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WorkspaceProvider>
    )
}
