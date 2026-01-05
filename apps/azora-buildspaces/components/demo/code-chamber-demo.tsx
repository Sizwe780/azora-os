"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Terminal,
  X,
  Plus,
  Settings,
  Search,
  GitBranch,
  Play,
  Save,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import { CitadelLogo } from "@/components/ui/citadel-logo"

interface FileNode {
  name: string
  type: "file" | "folder"
  children?: FileNode[]
  content?: string
  language?: string
}

const defaultFileTree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "app",
        type: "folder",
        children: [
          {
            name: "page.tsx",
            type: "file",
            language: "typescript",
            content: `export default function Home() {\n  return (\n    <main className="flex min-h-screen flex-col items-center justify-center">\n      <h1 className="text-4xl font-bold">Welcome to BuildSpaces</h1>\n      <p className="mt-4 text-gray-600">Start building amazing things</p>\n    </main>\n  )\n}`,
          },
          {
            name: "layout.tsx",
            type: "file",
            language: "typescript",
            content: `import type { Metadata } from "next"\nimport "./globals.css"\n\nexport const metadata: Metadata = {\n  title: "BuildSpaces App",\n  description: "Built with Citadel BuildSpaces",\n}\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  )\n}`,
          },
          {
            name: "globals.css",
            type: "file",
            language: "css",
            content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --foreground-rgb: 0, 0, 0;\n  --background-rgb: 255, 255, 255;\n}\n\nbody {\n  color: rgb(var(--foreground-rgb));\n  background: rgb(var(--background-rgb));\n}`,
          },
        ],
      },
      {
        name: "components",
        type: "folder",
        children: [
          {
            name: "button.tsx",
            type: "file",
            language: "typescript",
            content: `interface ButtonProps {\n  children: React.ReactNode\n  variant?: "primary" | "secondary"\n  onClick?: () => void\n}\n\nexport function Button({ children, variant = "primary", onClick }: ButtonProps) {\n  return (\n    <button\n      onClick={onClick}\n      className={\`px-4 py-2 rounded-lg font-medium \${variant === "primary" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-800"}\`}\n    >\n      {children}\n    </button>\n  )\n}`,
          },
          {
            name: "card.tsx",
            type: "file",
            language: "typescript",
            content: `interface CardProps {\n  title: string\n  description: string\n  children?: React.ReactNode\n}\n\nexport function Card({ title, description, children }: CardProps) {\n  return (\n    <div className="rounded-xl border border-gray-200 p-6 shadow-sm">\n      <h3 className="text-lg font-semibold">{title}</h3>\n      <p className="mt-2 text-gray-600">{description}</p>\n      {children && <div className="mt-4">{children}</div>}\n    </div>\n  )\n}`,
          },
        ],
      },
      {
        name: "lib",
        type: "folder",
        children: [
          {
            name: "utils.ts",
            type: "file",
            language: "typescript",
            content: `import { clsx, type ClassValue } from "clsx"\nimport { twMerge } from "tailwind-merge"\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs))\n}`,
          },
        ],
      },
    ],
  },
  {
    name: "package.json",
    type: "file",
    language: "json",
    content: `{\n  "name": "buildspaces-app",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start",\n    "lint": "next lint"\n  },\n  "dependencies": {\n    "next": "14.0.0",\n    "react": "18.2.0",\n    "react-dom": "18.2.0"\n  }\n}`,
  },
  {
    name: "tsconfig.json",
    type: "file",
    language: "json",
    content: `{\n  "compilerOptions": {\n    "target": "es5",\n    "lib": ["dom", "dom.iterable", "esnext"],\n    "allowJs": true,\n    "skipLibCheck": true,\n    "strict": true,\n    "forceConsistentCasingInFileNames": true,\n    "noEmit": true,\n    "esModuleInterop": true,\n    "module": "esnext",\n    "moduleResolution": "bundler",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "jsx": "preserve",\n    "incremental": true,\n    "paths": {\n      "@/*": ["./*"]\n    }\n  },\n  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],\n  "exclude": ["node_modules"]\n}`,
  },
  { name: ".gitignore", type: "file", content: `node_modules\n.next\n.env.local\n.env\n.DS_Store` },
  {
    name: "README.md",
    type: "file",
    language: "markdown",
    content: `# BuildSpaces App\n\nThis project was created with Citadel BuildSpaces.\n\n## Getting Started\n\n\`\`\`bash\nnpm run dev\n\`\`\`\n\nOpen [http://localhost:3000](http://localhost:3000) to see your app.`,
  },
]

function FileTreeItem({
  node,
  depth = 0,
  onSelect,
  selectedFile,
}: {
  node: FileNode
  depth?: number
  onSelect: (node: FileNode) => void
  selectedFile: string | null
}) {
  const [isOpen, setIsOpen] = useState(depth < 2)

  const isSelected = selectedFile === node.name

  if (node.type === "folder") {
    return (
      <div>
        <div
          className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-white/5 rounded text-sm ${isSelected ? "bg-white/10" : ""}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          {isOpen ? <FolderOpen className="h-4 w-4 text-amber-400" /> : <Folder className="h-4 w-4 text-amber-400" />}
          <span className="text-gray-300">{node.name}</span>
        </div>
        {isOpen &&
          node.children?.map((child, i) => (
            <FileTreeItem key={i} node={child} depth={depth + 1} onSelect={onSelect} selectedFile={selectedFile} />
          ))}
      </div>
    )
  }

  const getFileIcon = (name: string) => {
    if (name.endsWith(".tsx") || name.endsWith(".ts")) return "text-blue-400"
    if (name.endsWith(".css")) return "text-pink-400"
    if (name.endsWith(".json")) return "text-yellow-400"
    if (name.endsWith(".md")) return "text-gray-400"
    return "text-gray-400"
  }

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-white/5 rounded text-sm ${isSelected ? "bg-emerald-500/20 text-emerald-400" : ""}`}
      style={{ paddingLeft: `${depth * 12 + 28}px` }}
      onClick={() => onSelect(node)}
    >
      <File className={`h-4 w-4 ${getFileIcon(node.name)}`} />
      <span className="text-gray-300">{node.name}</span>
    </div>
  )
}

function CodeEditor({ content, language }: { content: string; language?: string }) {
  const lines = content.split("\n")

  const getTokenColor = (token: string, lang?: string) => {
    const keywords = [
      "import",
      "export",
      "from",
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "interface",
      "type",
      "default",
      "async",
      "await",
      "class",
      "extends",
      "implements",
    ]
    const types = ["string", "number", "boolean", "void", "null", "undefined", "React", "ReactNode", "Metadata"]

    if (keywords.includes(token)) return "text-pink-400"
    if (types.includes(token)) return "text-cyan-400"
    if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) return "text-emerald-400"
    if (token.startsWith("//") || token.startsWith("/*")) return "text-gray-500"
    if (!isNaN(Number(token))) return "text-amber-400"
    return "text-gray-300"
  }

  return (
    <div className="font-mono text-sm overflow-auto h-full">
      {lines.map((line, i) => (
        <div key={i} className="flex hover:bg-white/5">
          <span className="w-12 text-right pr-4 text-gray-600 select-none">{i + 1}</span>
          <pre className="flex-1">
            <code>
              {line.split(/(\s+|[{}()[\].,;:=<>]|"[^"]*"|'[^']*'|`[^`]*`)/).map((token, j) => (
                <span key={j} className={getTokenColor(token, language)}>
                  {token}
                </span>
              ))}
            </code>
          </pre>
        </div>
      ))}
    </div>
  )
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function CodeChamber() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [openTabs, setOpenTabs] = useState<FileNode[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "Welcome to BuildSpaces Terminal",
    "Type 'help' for available commands",
    "",
    "$ npm run dev",
    "ready - started server on 0.0.0.0:3000, url: http://localhost:3000",
    "event - compiled client and server successfully in 234 ms (18 modules)",
    "",
  ])
  const [terminalInput, setTerminalInput] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm Elara, your AI coding assistant. I can help you write code, debug issues, or explain concepts. What would you like to build today?",
      timestamp: new Date(),
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [showChat, setShowChat] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (node: FileNode) => {
    if (node.type === "file") {
      setSelectedFile(node)
      setActiveTab(node.name)
      if (!openTabs.find((t) => t.name === node.name)) {
        setOpenTabs([...openTabs, node])
      }
    }
  }

  const closeTab = (name: string) => {
    const newTabs = openTabs.filter((t) => t.name !== name)
    setOpenTabs(newTabs)
    if (activeTab === name) {
      setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1].name : null)
      setSelectedFile(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null)
    }
  }

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!terminalInput.trim()) return

    const newLines = [...terminalLines, `$ ${terminalInput}`]

    // Simulate command responses
    if (terminalInput === "help") {
      newLines.push(
        "Available commands:",
        "  npm run dev    - Start development server",
        "  npm run build  - Build for production",
        "  npm run lint   - Run linter",
        "  clear          - Clear terminal",
        "",
      )
    } else if (terminalInput === "clear") {
      setTerminalLines(["Terminal cleared", ""])
      setTerminalInput("")
      return
    } else if (terminalInput.startsWith("npm")) {
      newLines.push("Executing...", "")
    } else {
      newLines.push(`Command not found: ${terminalInput}`, "")
    }

    setTerminalLines(newLines)
    setTerminalInput("")
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = { role: "user", content: chatInput, timestamp: new Date() }
    setChatMessages([...chatMessages, userMessage])
    setChatInput("")

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can help you with that! Let me analyze your code and suggest some improvements.",
        "Great question! Here's how we can implement that feature...",
        "I see what you're trying to do. Let me generate some code for you.",
        "That's a common pattern in React. Here's the best practice approach...",
      ]
      const aiResponse: ChatMessage = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalLines])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatMessages])

  return (
    <div
      className={`flex flex-col bg-[#0d1117] ${isFullscreen ? "fixed inset-0 z-50" : "h-[800px]"} rounded-xl overflow-hidden border border-white/10`}
    >
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/10">
        <div className="flex items-center gap-3">
          <CitadelLogo size="sm" />
          <span className="text-sm font-medium text-white">Code Chamber</span>
          <span className="text-xs text-gray-500">buildspaces-app</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-gray-400 hover:text-white">
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-gray-400 hover:text-white">
            <Play className="h-4 w-4 mr-1" /> Run
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-gray-400 hover:text-white"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-12 bg-[#0d1117] border-r border-white/10 flex flex-col items-center py-2 gap-2">
          <button className="p-2 rounded-lg bg-white/5 text-emerald-400">
            <File className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5">
            <GitBranch className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5">
            <Settings className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <button
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5"
            onClick={() => setShowChat(!showChat)}
          >
            <AfricanAgentAvatar agent="elara" size="sm" showGlow={false} showAura={false} />
          </button>
        </div>

        {/* File explorer */}
        <div className="w-56 bg-[#0d1117] border-r border-white/10 overflow-auto">
          <div className="p-2 text-xs uppercase tracking-wider text-gray-500 font-medium">Explorer</div>
          {defaultFileTree.map((node, i) => (
            <FileTreeItem key={i} node={node} onSelect={handleFileSelect} selectedFile={activeTab} />
          ))}
        </div>

        {/* Main editor area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex items-center bg-[#0d1117] border-b border-white/10 overflow-x-auto">
            {openTabs.map((tab) => (
              <div
                key={tab.name}
                className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer border-r border-white/5 ${activeTab === tab.name ? "bg-[#1e2228] text-white" : "text-gray-400 hover:text-white"}`}
                onClick={() => {
                  setActiveTab(tab.name)
                  setSelectedFile(tab)
                }}
              >
                <File className="h-4 w-4" />
                {tab.name}
                <X
                  className="h-3 w-3 hover:bg-white/10 rounded"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.name)
                  }}
                />
              </div>
            ))}
            <button className="p-2 text-gray-500 hover:text-white">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Editor content */}
          <div className="flex-1 bg-[#1e2228] overflow-auto">
            {selectedFile ? (
              <CodeEditor content={selectedFile.content || ""} language={selectedFile.language} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <CitadelLogo size="lg" className="mx-auto mb-4" />
                  <p>Select a file to start editing</p>
                </div>
              </div>
            )}
          </div>

          {/* Terminal */}
          {terminalOpen && (
            <div className="h-48 bg-[#0d1117] border-t border-white/10">
              <div className="flex items-center justify-between px-4 py-1 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-gray-400">Terminal</span>
                </div>
                <button className="text-gray-500 hover:text-white" onClick={() => setTerminalOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div ref={terminalRef} className="h-32 overflow-auto p-2 font-mono text-sm">
                {terminalLines.map((line, i) => (
                  <div key={i} className={line.startsWith("$") ? "text-emerald-400" : "text-gray-400"}>
                    {line}
                  </div>
                ))}
                <form onSubmit={handleTerminalSubmit} className="flex items-center">
                  <span className="text-emerald-400">$ </span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-white ml-1"
                    autoFocus
                  />
                </form>
              </div>
            </div>
          )}
        </div>

        {/* AI Chat panel */}
        {showChat && (
          <div className="w-80 bg-[#0d1117] border-l border-white/10 flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <AfricanAgentAvatar agent="elara" size="sm" />
              <div>
                <p className="text-sm font-medium text-white">Elara</p>
                <p className="text-xs text-emerald-400">XO Architect</p>
              </div>
            </div>
            <div ref={chatRef} className="flex-1 overflow-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-emerald-500/20 text-emerald-100" : "bg-white/5 text-gray-300"}`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Elara anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/50"
                />
                <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                  Send
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
