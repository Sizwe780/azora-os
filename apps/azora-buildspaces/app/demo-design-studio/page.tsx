'use client'

import DesignStudio from '@/components/rooms/design-studio'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Lock, Zap } from 'lucide-react'
import Link from 'next/link'
import { WorkspaceProvider } from '@/lib/contexts/workspace-context'

export default function DemoDesignStudioPage() {
    return (
        <WorkspaceProvider initialRoom="design-studio">
            <div className="min-h-screen bg-[#0d1117] flex flex-col">
                {/* Demo Mode Banner */}
                <div className="bg-gradient-to-r from-pink-500/20 via-primary/20 to-pink-500/20 border-b border-pink-500/30">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/features/design-studio" className="text-muted-foreground hover:text-foreground transition flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm">Back to Features</span>
                            </Link>
                            <div className="flex items-center gap-2 px-3 py-1 bg-pink-500/20 rounded-full border border-pink-500/30">
                                <Sparkles className="w-4 h-4 text-pink-400" />
                                <span className="text-sm text-pink-300 font-medium">Demo Mode</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                                <Lock className="w-4 h-4" />
                                <span>Some features limited in demo</span>
                            </div>
                            <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white gap-2">
                                <Zap className="w-4 h-4" />
                                Get Full Access
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Demo Content */}
                <div className="flex-1">
                    <DesignStudio />
                </div>

                {/* Demo Footer */}
                <div className="bg-muted/30 border-t py-6">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Unlock the full Design Studio</h3>
                                <p className="text-sm text-muted-foreground">Get Figma integration, component export, and design system management.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/pricing">
                                    <Button variant="outline">View Pricing</Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button className="bg-pink-500 hover:bg-pink-600 text-white">
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
