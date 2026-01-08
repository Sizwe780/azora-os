'use client'

import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import KnowledgeOcean from "@/components/rooms/knowledge-ocean"
import { Button } from '@/components/ui/button'
import { BookOpen, Search, Database, Layers, Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function KnowledgeOceanPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
            <Navbar />

            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Knowledge Ocean</h1>
                                <p className="text-gray-400">
                                    Explore, search, and navigate your entire codebase with AI-powered semantic understanding
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" onClick={() => router.push('/demo-knowledge-ocean')} className="border-white/20 text-white hover:bg-white/10">
                                    <Play className="w-4 h-4 mr-2" />
                                    Try Demo
                                </Button>
                                <Link href="/features" className="text-emerald-400 hover:text-emerald-300">
                                    ← Back to features
                                </Link>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Indexed Files</p>
                                        <p className="text-xl font-bold text-white">1,247</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <Search className="w-5 h-5 text-emerald-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Searches Today</p>
                                        <p className="text-xl font-bold text-white">89</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <Database className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Knowledge Nodes</p>
                                        <p className="text-xl font-bold text-white">3,891</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <Layers className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Connections</p>
                                        <p className="text-xl font-bold text-white">12.4k</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Component */}
                    <div className="h-[600px]">
                        <KnowledgeOcean onSwitchToCommand={() => router.push('/features/command-desk')} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
