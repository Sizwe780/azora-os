"use client"

import { useEffect, useRef, useState } from "react"

interface XTerminalProps {
  onData?: (data: string) => void
  socket?: WebSocket | null
}

export function XTerminal({ onData, socket }: XTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<any>(null)
  const fitAddonRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!terminalRef.current) return

    let cleanup: (() => void) | undefined

    const initTerminal = async () => {
      try {
        const { Terminal } = await import("xterm")
        const { FitAddon } = await import("xterm-addon-fit")
        const { WebLinksAddon } = await import("xterm-addon-web-links")

        // Import xterm CSS
        await import("xterm/css/xterm.css")

        const fitAddon = new FitAddon()
        const webLinksAddon = new WebLinksAddon()

        const terminal = new Terminal({
          cursorBlink: true,
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          theme: {
            background: "#0d1117",
            foreground: "#c9d1d9",
            cursor: "#58a6ff",
            selectionBackground: "#264f78",
            black: "#0d1117",
            red: "#ff7b72",
            green: "#3fb950",
            yellow: "#d29922",
            blue: "#58a6ff",
            magenta: "#bc8cff",
            cyan: "#39d353",
            white: "#c9d1d9",
            brightBlack: "#484f58",
            brightRed: "#ffa198",
            brightGreen: "#56d364",
            brightYellow: "#e3b341",
            brightBlue: "#79c0ff",
            brightMagenta: "#d2a8ff",
            brightCyan: "#56d364",
            brightWhite: "#f0f6fc",
          },
          allowProposedApi: true,
        })

        terminal.loadAddon(fitAddon)
        terminal.loadAddon(webLinksAddon)

        if (!terminalRef.current) return // Safety check after async imports

        terminal.open(terminalRef.current!)
        
        // Wait for next frame to ensure dimensions are available
        requestAnimationFrame(() => {
          try {
            if (terminalRef.current && terminalRef.current.clientWidth > 0) {
              fitAddon.fit()
            }
          } catch (e) {
            console.warn("Failed to fit terminal:", e)
          }
        })
        
        xtermRef.current = terminal
        fitAddonRef.current = fitAddon

        // Welcome message
        terminal.writeln("\x1b[36m╔═══════════════════════════════════════╗\x1b[0m")
        terminal.writeln("\x1b[36m║\x1b[0m  \x1b[1;32mBuildSpaces Terminal\x1b[0m                  \x1b[36m║\x1b[0m")
        terminal.writeln("\x1b[36m║\x1b[0m  \x1b[90mPowered by Azora AI\x1b[0m                   \x1b[36m║\x1b[0m")
        terminal.writeln("\x1b[36m╚═══════════════════════════════════════╝\x1b[0m")
        terminal.writeln("")
        terminal.write("\x1b[32m❯\x1b[0m ")

        // Handle user input
        terminal.onData((data: string) => {
          if (onData) {
            onData(data)
          }
          // Local echo for demo when no socket
          if (!socket || socket.readyState !== WebSocket.OPEN) {
            if (data === "\r") {
              terminal.writeln("")
              terminal.write("\x1b[32m❯\x1b[0m ")
            } else if (data === "\u007F") {
              // Backspace
              terminal.write("\b \b")
            } else {
              terminal.write(data)
            }
          }
        })

        // Handle socket messages
        if (socket) {
          const handleMessage = (event: MessageEvent) => {
            terminal.write(event.data)
          }
          socket.addEventListener("message", handleMessage)
          cleanup = () => {
            socket.removeEventListener("message", handleMessage)
          }
        }

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
          if (!terminalRef.current) return;
          try {
            // Only fit if visible and has dimensions
            if (terminalRef.current.clientWidth > 0 && terminalRef.current.clientHeight > 0) {
               fitAddon.fit()
            }
          } catch (e) {
            // Ignore fit errors during resize
          }
        })
        
        if (terminalRef.current) {
          resizeObserver.observe(terminalRef.current)
        }

        setIsReady(true)

        return () => {
          resizeObserver.disconnect()
          try {
            terminal.dispose()
          } catch (e) {
            // Ignore dispose errors
          }
          if (cleanup) cleanup()
        }
      } catch (err) {
        console.error("Failed to initialize terminal:", err)
      }
    }

    const disposePromise = initTerminal()

    return () => {
      disposePromise.then((dispose) => dispose?.())
    }
  }, [onData, socket])

  return (
    <div
      ref={terminalRef}
      className="h-full w-full bg-[#0d1117]"
      style={{ padding: "4px 8px" }}
    />
  )
}
