import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import { GitBranch } from 'lucide-react'

export default async function CriticalReposPage() {
  // Prefer canonical docs location, fall back to legacy root file for backward compatibility
  const candidatePaths = [
    path.resolve(process.cwd(), '../../..', 'docs', 'buildspaces', 'BUILDSPACES_CRITICAL_REPOS.md'),
    path.resolve(process.cwd(), '../../..', 'BUILDSPACES_CRITICAL_REPOS.md')
  ]
  let md = ''
  let foundPath: string | null = null
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      foundPath = p
      break
    }
  }
  try {
    if (foundPath) md = fs.readFileSync(foundPath, 'utf-8')
    else md = 'Could not find BUILDSPACES_CRITICAL_REPOS.md; expected at docs/buildspaces/BUILDSPACES_CRITICAL_REPOS.md'
  } catch (err) {
    md = `Failed to read ${foundPath ?? 'BUILDSPACES_CRITICAL_REPOS.md'}`
  }

  // Simple parser: find lines that start with "###" followed by a numeric index and bold repo name
  const repoBlocks = [] as { title: string; url?: string; purpose?: string; tier?: string }[]
  const lines = md.split('\n')
  let current: any = null
  for (const line of lines) {
    const heading = line.match(/^###\s*\d+\.\s*\*\*(.*?)\*\*/)
    if (heading) {
      if (current) repoBlocks.push(current)
      current = { title: heading[1].trim() }
      continue
    }
    if (!current) continue
    const urlMatch = line.match(/\*\*URL\*\*: (https?:\/\/.+)$/)
    if (urlMatch) current.url = urlMatch[1].trim()
    const purposeMatch = line.match(/\*\*Purpose\*\*: (.+)$/)
    if (purposeMatch) current.purpose = purposeMatch[1].trim()
    const tierMatch = line.match(/^##\s+(.*?)\s+TIER/i)
    if (tierMatch && !current.tier) current.tier = tierMatch[1].trim()
  }
  if (current) repoBlocks.push(current)

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Critical Repos</h1>
              <p className="text-gray-400">Repository integration map for BuildSpaces — quick links and actions.</p>
            </div>
            <Link href="/features" className="text-emerald-400 hover:text-emerald-300">← Back to features</Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {repoBlocks.map((r, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <GitBranch className="w-5 h-5 text-sky-400" />
                  <h3 className="font-semibold">{r.title}</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">{r.purpose ?? '—'}</p>
                <div className="flex items-center gap-2">
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded text-sm">Open on GitHub</a>
                  ) : (
                    <button className="px-3 py-2 bg-gray-600/20 rounded text-sm" disabled>URL missing</button>
                  )}
                  {r.url && (
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(`git clone ${r.url?.replace('https://github.com/', 'git@github.com:')}.git`)
                      }}
                      className="px-3 py-2 bg-white/5 rounded text-sm"
                    >
                      Copy Clone Cmd
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-sm text-gray-400">
            <p>Note: This page surfaces the canonical list at <code>docs/buildspaces/BUILDSPACES_CRITICAL_REPOS.md</code> (or the legacy root file if present) and provides quick actions to review and clone repositories. For programmatic integration (Prisma, YJS, OpenAI, etc.), add configuration in <code>apps/azora-buildspaces</code> and create services under <code>services/</code>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
