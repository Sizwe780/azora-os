'use client'

import AIStudio from '@/components/rooms/ai-studio'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Lock, Zap, Brain, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function DemoAIStudioPage() {
    return (
        <div className="min-h-screen bg-[#0d1117] flex flex-col">
            {/* Demo Mode Banner */}
            <div className="bg-gradient-to-r from-purple-500/20 via-primary/20 to-purple-500/20 border-b border-purple-500/30">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/features/ai-studio" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm">Back to Features</span>
                        </Link>
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-purple-300 font-medium">Demo Mode</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                            <Lock className="w-4 h-4" />
                            <span>Limited to 10 messages in demo</span>
                        </div>
                        <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white gap-2">
                            <Zap className="w-4 h-4" />
                            Get Full Access
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="border-b border-white/10 py-4 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Brain className="w-5 h-5 text-purple-400" />
                            <div>
                                <p className="text-xs text-gray-400">AI Agents</p>
                                <p className="text-xl font-bold text-white">5</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                            <div>
                                <p className="text-xs text-gray-400">Demo Messages</p>
                                <p className="text-xl font-bold text-white">10</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-emerald-400" />
                            <div>
                                <p className="text-xs text-gray-400">Response Time</p>
                                <p className="text-xl font-bold text-white">&lt;2s</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <div>
                                <p className="text-xs text-gray-400">AI Models</p>
                                <p className="text-xl font-bold text-white">GPT-4</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Demo Content */}
            <div className="flex-1 p-4">
                <div className="max-w-5xl mx-auto h-[600px]">
                    <AIStudio />
                </div>
            </div>

            {/* Demo Footer */}
            <div className="bg-[#161b22] border-t border-white/10 py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Unlock unlimited AI conversations</h3>
                            <p className="text-sm text-gray-400">Get unlimited access to all 5 AI agents with code execution and file editing.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/pricing">
                                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                    View Pricing
                                </Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button className="bg-purple-500 hover:bg-purple-600 text-white">
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
