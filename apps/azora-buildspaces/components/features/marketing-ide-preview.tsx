import { Sparkles, Code2 } from "lucide-react"

/**
 * MarketingIdePreview - Static marketing component
 * 
 * This is a STATIC MARKETING ASSET showing a mock IDE interface.
 * For the REAL functional IDE, see:
 * - /app/workspace/page.tsx (full workspace)
 * - /components/rooms/code-chamber.tsx (real editor)
 * - /components/workspace/editor-panel.tsx (Monaco editor integration)
 */
export function MarketingIdePreview() {
  return (
    <section className="border-t border-white/5 bg-[#0d1117] px-4 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">
            From idea to{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              production
            </span>{" "}
            in minutes
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Just describe what you want to build. Elara and the team handle the rest.
          </p>
        </div>

        {/* IDE Mock */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#161b22] shadow-2xl">
          {/* Window controls */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="text-sm text-gray-400">buildspaces.azora.dev — Code Chamber</span>
            <div />
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-12 border-r border-white/10 bg-[#0d1117] p-2">
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white/5">
                <Code2 className="h-4 w-4" />
              </div>
            </div>

            {/* File Explorer */}
            <div className="w-48 border-r border-white/10 bg-[#0d1117] p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">Explorer</p>
              <div className="space-y-1 text-sm">
                <p className="text-gray-400">▼ src</p>
                <p className="ml-4 text-gray-300">├ page.tsx</p>
                <p className="ml-4 text-gray-300">├ layout.tsx</p>
                <p className="ml-4 text-gray-300">└ components/</p>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1">
              {/* Tabs */}
              <div className="flex border-b border-white/10 bg-[#0d1117]">
                <div className="border-b-2 border-emerald-500 bg-[#161b22] px-4 py-2 text-sm text-white">page.tsx</div>
                <div className="px-4 py-2 text-sm text-gray-500">layout.tsx</div>
              </div>

              {/* Code */}
              <div className="p-4 font-mono text-sm">
                <div className="space-y-1">
                  <p>
                    <span className="text-purple-400">export</span> <span className="text-blue-400">function</span>{" "}
                    <span className="text-yellow-400">Dashboard</span>() {"{"}
                  </p>
                  <p className="ml-4">
                    <span className="text-purple-400">return</span> (
                  </p>
                  <p className="ml-8">
                    <span className="text-gray-500">{"<"}</span>
                    <span className="text-emerald-400">div</span> <span className="text-cyan-400">className</span>=
                    <span className="text-orange-400">&quot;container&quot;</span>
                    <span className="text-gray-500">{">"}</span>
                  </p>
                  <p className="ml-12">
                    <span className="text-gray-500">{"<"}</span>
                    <span className="text-emerald-400">h1</span>
                    <span className="text-gray-500">{">"}</span>
                    <span className="text-white">Welcome to BuildSpaces</span>
                    <span className="text-gray-500">{"</"}</span>
                    <span className="text-emerald-400">h1</span>
                    <span className="text-gray-500">{">"}</span>
                  </p>
                  <p className="ml-8">
                    <span className="text-gray-500">{"</"}</span>
                    <span className="text-emerald-400">div</span>
                    <span className="text-gray-500">{">"}</span>
                  </p>
                  <p className="ml-4">)</p>
                  <p>{"}"}</p>
                </div>
              </div>
            </div>

            {/* AI Chat */}
            <div className="w-72 border-l border-white/10 bg-[#0d1117]">
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400" />
                  <div>
                    <p className="font-medium text-white">Elara</p>
                    <p className="text-xs text-emerald-400">XO Architect</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="rounded-lg bg-[#161b22] p-3">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-emerald-400">Building:</span> Dashboard with analytics charts...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
