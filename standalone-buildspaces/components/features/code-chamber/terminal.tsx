'use client'

import { useEffect, useRef, useState } from 'react'

interface TerminalProps {
  onCommand?: (command: string) => void
}

export function TerminalPanel({ onCommand }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState([
    '🚀 BuildSpaces Terminal v1.0',
    '> Ready for commands...',
    '',
  ])

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) return

    setOutput((prev) => [...prev, `$ ${cmd}`])
    setInput('')

    // Mock command execution
    const response = (() => {
      if (cmd === 'ls') return 'index.js  package.json  tsconfig.json  README.md'
      if (cmd === 'pwd') return '/home/buildspace/demo-project'
      if (cmd === 'npm run dev') return 'Started dev server on http://localhost:3000'
      if (cmd.startsWith('npm')) return `Installing packages...` 
      return `Command '${cmd}' not found. Type 'help' for available commands.`
    })()

    setOutput((prev) => [...prev, response, ''])
  }

  return (
    <div className="w-full h-full bg-[#1e1e1e] rounded-lg border border-white/10 p-4 flex flex-col">
      {/* Output Area */}
      <div className="flex-1 overflow-y-auto space-y-1 mb-4 font-mono text-sm text-gray-300">
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {line}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/10">
        <span className="text-green-500 font-mono text-sm">$</span>
        <input
          ref={terminalRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCommand(input)
            }
          }}
          placeholder="Enter command..."
          className="flex-1 bg-transparent text-gray-300 font-mono text-sm focus:outline-none"
          autoFocus
        />
      </div>
    </div>
  )
}
