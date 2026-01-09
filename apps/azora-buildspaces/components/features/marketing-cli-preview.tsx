import { Button } from "@/components/ui/button"

/**
 * MarketingCLIPreview - Static marketing component
 * 
 * This is a STATIC MARKETING ASSET showing mock CLI interactions.
 * For REAL terminal functionality, see:
 * - /components/workspace/panels/terminal-panel.tsx (real terminal with xterm)
 * - /components/workspace/x-terminal.tsx (xterm integration)
 */
export function MarketingCLIPreview() {
  return (
    <section id="cli" className="border-t border-white/5 bg-gradient-to-b from-[#161b22] to-[#0d1117] px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Terminal Mock */}
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl">
              {/* Window controls */}
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>

              {/* Terminal content */}
              <div className="p-6 font-mono text-sm">
                <div className="mb-4 text-gray-500">
                  <span className="text-gray-400">┌</span>
                  <span className="mx-2">Welcome to BuildSpaces</span>
                  <span className="text-gray-400">┐</span>
                </div>

                <div className="mb-6 flex justify-center gap-2 text-4xl">
                  <span className="text-pink-400">B</span>
                  <span className="text-pink-400">U</span>
                  <span className="text-pink-400">I</span>
                  <span className="text-pink-400">L</span>
                  <span className="text-pink-400">D</span>
                  <span className="text-cyan-400 ml-4">S</span>
                  <span className="text-cyan-400">P</span>
                  <span className="text-cyan-400">A</span>
                  <span className="text-cyan-400">C</span>
                  <span className="text-cyan-400">E</span>
                  <span className="text-cyan-400">S</span>
                </div>

                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="text-emerald-400">$</span> buildspaces init my-project
                  </p>
                  <p className="text-gray-500">✓ Project scaffolded successfully</p>
                  <p>
                    <span className="text-emerald-400">$</span> buildspaces agent start elara
                  </p>
                  <p className="text-gray-500">✓ Elara is now orchestrating your workspace</p>
                  <p>
                    <span className="text-emerald-400">$</span> buildspaces deploy --prod
                  </p>
                  <p className="text-emerald-400">✓ Deployed to production at buildspaces.app/my-project</p>
                </div>

                <div className="mt-6 flex items-center">
                  <span className="text-emerald-400">$</span>
                  <span className="ml-2 animate-pulse">▋</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1 text-sm text-gray-300">
              Public preview
            </span>

            <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              Your terminal&apos;s new{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                sidekick
              </span>
            </h2>

            <p className="mb-8 text-lg text-gray-400">
              BuildSpaces CLI reads, writes, and runs code where you work. Code faster, smarter, together.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-white text-black hover:bg-gray-200">Install now</Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                See plans & pricing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
