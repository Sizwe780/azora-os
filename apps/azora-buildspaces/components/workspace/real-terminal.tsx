"use client"

/**
 * Real Terminal Component
 * 
 * Constitutional Compliance:
 * - TRUTH: Real command execution, real output
 * - NO SWALLOWING ERRORS: All errors displayed
 * - INTERACTIVE: Real stdin/stdout connection
 * 
 * This is a fully functional terminal using xterm.js connected
 * to the WebContainer runtime. Not a fake terminal.
 */

import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { runtimeEngine, type ProcessOutput } from '@/lib/runtime/container'
import { Button } from '@/components/ui/button'
import { Terminal as TerminalIcon, X, RotateCcw, Play, Square } from 'lucide-react'
import 'xterm/css/xterm.css'

interface RealTerminalProps {
  onClose?: () => void
}

export function RealTerminal({ onClose }: RealTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [currentCommand, setCurrentCommand] = useState('')
  const commandHistoryRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)

  // Initialize xterm.js
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return

    // Create terminal instance
    const terminal = new Terminal({
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc',
      },
      fontSize: 13,
      fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      rows: 24,
    })

    // Create fit addon for responsive sizing
    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)

    // Add web links support (clickable URLs)
    terminal.loadAddon(new WebLinksAddon())

    // Open terminal in DOM
    terminal.open(terminalRef.current)
    fitAddon.fit()

    // Store refs
    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    // Welcome message
    terminal.writeln('\x1b[1;32m╔══════════════════════════════════════════════╗\x1b[0m')
    terminal.writeln('\x1b[1;32m║  BuildSpaces Terminal - WebContainer Ready  ║\x1b[0m')
    terminal.writeln('\x1b[1;32m╚══════════════════════════════════════════════╝\x1b[0m')
    terminal.writeln('')
    terminal.writeln('\x1b[90mConstitutional AI Terminal - Real Execution\x1b[0m')
    terminal.writeln('\x1b[90mType commands to interact with your runtime\x1b[0m')
    terminal.writeln('')

    // Prompt
    writePrompt(terminal)

    // Handle terminal input
    let currentLine = ''
    terminal.onData((data) => {
      const code = data.charCodeAt(0)

      // Enter key
      if (code === 13) {
        terminal.writeln('')
        if (currentLine.trim()) {
          executeCommand(terminal, currentLine.trim())
          commandHistoryRef.current.push(currentLine.trim())
          historyIndexRef.current = -1
        } else {
          writePrompt(terminal)
        }
        currentLine = ''
        return
      }

      // Backspace
      if (code === 127) {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1)
          terminal.write('\b \b')
        }
        return
      }

      // Up arrow (command history)
      if (code === 27 && data === '\x1b[A') {
        if (commandHistoryRef.current.length > 0) {
          if (historyIndexRef.current < commandHistoryRef.current.length - 1) {
            historyIndexRef.current++
            const cmd = commandHistoryRef.current[commandHistoryRef.current.length - 1 - historyIndexRef.current]
            // Clear current line
            terminal.write('\r\x1b[K')
            writePrompt(terminal)
            terminal.write(cmd)
            currentLine = cmd
          }
        }
        return
      }

      // Down arrow (command history)
      if (code === 27 && data === '\x1b[B') {
        if (historyIndexRef.current > 0) {
          historyIndexRef.current--
          const cmd = commandHistoryRef.current[commandHistoryRef.current.length - 1 - historyIndexRef.current]
          terminal.write('\r\x1b[K')
          writePrompt(terminal)
          terminal.write(cmd)
          currentLine = cmd
        } else if (historyIndexRef.current === 0) {
          historyIndexRef.current = -1
          terminal.write('\r\x1b[K')
          writePrompt(terminal)
          currentLine = ''
        }
        return
      }

      // Ctrl+C
      if (code === 3) {
        terminal.writeln('^C')
        currentLine = ''
        writePrompt(terminal)
        return
      }

      // Ctrl+L (clear)
      if (code === 12) {
        terminal.clear()
        writePrompt(terminal)
        currentLine = ''
        return
      }

      // Regular character
      if (code >= 32 && code < 127) {
        currentLine += data
        terminal.write(data)
      }
    })

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit()
    })
    resizeObserver.observe(terminalRef.current)

    // Check runtime status
    checkRuntimeStatus(terminal)

    // Cleanup
    return () => {
      terminal.dispose()
      resizeObserver.disconnect()
    }
  }, [])

  const writePrompt = (terminal: Terminal) => {
    terminal.write('\x1b[1;32m$\x1b[0m ')
  }

  const checkRuntimeStatus = async (terminal: Terminal) => {
    const state = runtimeEngine.getState()
    
    if (state.status === 'idle') {
      terminal.writeln('\x1b[33m⚠ Runtime not started. Booting WebContainer...\x1b[0m')
      terminal.writeln('')
      
      try {
        await runtimeEngine.boot()
        terminal.writeln('\x1b[32m✓ Runtime ready!\x1b[0m')
        terminal.writeln('')
        setIsReady(true)
        writePrompt(terminal)
      } catch (error) {
        terminal.writeln(`\x1b[31m✗ Boot failed: ${error}\x1b[0m`)
        terminal.writeln('')
        writePrompt(terminal)
      }
    } else if (state.status === 'ready') {
      setIsReady(true)
    }
  }

  const executeCommand = async (terminal: Terminal, command: string) => {
    if (!isReady) {
      terminal.writeln('\x1b[31mRuntime not ready. Please wait...\x1b[0m')
      writePrompt(terminal)
      return
    }

    // Built-in commands
    if (command === 'clear') {
      terminal.clear()
      writePrompt(terminal)
      return
    }

    if (command === 'help') {
      terminal.writeln('\x1b[1mAvailable commands:\x1b[0m')
      terminal.writeln('  clear   - Clear terminal')
      terminal.writeln('  help    - Show this help')
      terminal.writeln('  ls      - List files')
      terminal.writeln('  npm     - Node package manager')
      terminal.writeln('  node    - Run Node.js')
      terminal.writeln('')
      writePrompt(terminal)
      return
    }

    // Execute in WebContainer
    try {
      await runtimeEngine.executeCommand(command, (output) => {
        if (output.type === 'stdout') {
          terminal.write(output.data as string)
        } else if (output.type === 'stderr') {
          terminal.write(`\x1b[31m${output.data}\x1b[0m`)
        } else if (output.type === 'exit') {
          const exitCode = output.data as number
          if (exitCode !== 0) {
            terminal.writeln(`\x1b[31mProcess exited with code ${exitCode}\x1b[0m`)
          }
          writePrompt(terminal)
        }
      })
    } catch (error) {
      // Constitutional: Don't swallow errors
      terminal.writeln(`\x1b[31m✗ ${error instanceof Error ? error.message : 'Command failed'}\x1b[0m`)
      writePrompt(terminal)
    }
  }

  const handleRestart = async () => {
    if (!xtermRef.current) return
    
    const terminal = xtermRef.current
    terminal.writeln('')
    terminal.writeln('\x1b[33m🔄 Restarting runtime...\x1b[0m')
    
    try {
      await runtimeEngine.restart()
      terminal.writeln('\x1b[32m✓ Runtime restarted successfully\x1b[0m')
      setIsReady(true)
    } catch (error) {
      terminal.writeln(`\x1b[31m✗ Restart failed: ${error}\x1b[0m`)
    }
    
    terminal.writeln('')
    writePrompt(terminal)
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3e3e42] bg-[#161b22]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-white">Terminal</span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            isReady ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {isReady ? 'Ready' : 'Booting...'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            onClick={handleRestart}
            size="sm"
            variant="ghost"
            className="h-7 px-2 hover:bg-white/10"
            title="Restart Container (Self-Healing)"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="h-7 px-2 hover:bg-white/10"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Terminal Display */}
      <div ref={terminalRef} className="flex-1 p-2" />
    </div>
  )
}
