'use client'

import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import { SpecEditor } from '@/components/features/spec-chamber/spec-editor'
import { Button } from '@/components/ui/button'
import { CheckCircle2, BookOpen, Zap, BarChart3, Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SpecChamberPage() {
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
                <h1 className="text-3xl font-bold mb-2">Spec Chamber</h1>
                <p className="text-gray-400">
                  SPEC-driven development: Write specs, generate tests, validate requirements automatically
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.push('/demo-spec-chamber')} className="border-white/20 text-white hover:bg-white/10">
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
                    <p className="text-xs text-gray-400">Active Specs</p>
                    <p className="text-xl font-bold text-white">8</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs text-gray-400">Generated Tests</p>
                    <p className="text-xl font-bold text-white">127</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs text-gray-400">Validation Pass</p>
                    <p className="text-xl font-bold text-white">94%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-400">Coverage Avg</p>
                    <p className="text-xl font-bold text-white">78%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <SpecEditor />
          </div>

          {/* Features Info */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Spec Validation
              </h3>
              <p className="text-sm text-gray-400">
                Automatically validate specs for completeness, clarity, and adherence to standards. Catch gaps early.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Test Generation
              </h3>
              <p className="text-sm text-gray-400">
                Generate test cases automatically from specs. AI understands requirements and creates comprehensive test suites.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Coverage Tracking
              </h3>
              <p className="text-sm text-gray-400">
                Track test coverage against specs. Ensure all requirements are tested and measurable progress.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
