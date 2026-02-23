'use client'

import MakerLab from '@/components/rooms/maker-lab'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Lock, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DemoMakerLabPage() {
    return (
        <div className="min-h-screen bg-[#0d1117] flex flex-col">
            {/* Demo Mode Banner */}
            <div className="bg-gradient-to-r from-orange-500/20 via-primary/20 to-orange-500/20 border-b border-orange-500/30">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/features/maker-lab" className="text-muted-foreground hover:text-foreground transition flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm">Back to Features</span>
                        </Link>
                        <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 rounded-full border border-orange-500/30">
                            <Sparkles className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-orange-300 font-medium">Demo Mode</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                            <Lock className="w-4 h-4" />
                            <span>Some features limited in demo</span>
                        </div>
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                            <Zap className="w-4 h-4" />
                            Get Full Access
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Demo Content */}
            <div className="flex-1">
                <MakerLab />
            </div>

            {/* Demo Footer */}
            <div className="bg-muted/30 border-t py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Unlock the full Maker Lab</h3>
                            <p className="text-sm text-muted-foreground">Deploy prototypes to staging, connect real databases, and scale to production.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/pricing">
                                <Button variant="outline">View Pricing</Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
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
