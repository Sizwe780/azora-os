"use client"

import { useEffect, useRef } from "react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebLinksAddon } from "xterm-addon-web-links"
import "xterm/css/xterm.css"

interface XTerminalProps {
    onData?: (data: string) => void
    socket?: WebSocket | null
}

export function XTerminal({ onData, socket }: XTerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<Terminal | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)

    useEffect(() => {
        if (!terminalRef.current || xtermRef.current) { return }

        // Initialize Terminal
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            theme: {
                background: "#09090b", // zinc-950
                foreground: "#fafafa", // zinc-50
                cursor: "#22d3ee", // cyan-400
                selectionBackground: "#27272a", // zinc-800
                black: "#09090b",
                red: "#ef4444",
                green: "#22c55e",
                yellow: "#eab308",
                blue: "#3b82f6",
                magenta: "#d946ef",
                cyan: "#06b6d4",
                white: "#fafafa",
                brightBlack: "#52525b",
                brightRed: "#f87171",
                brightGreen: "#4ade80",
                brightYellow: "#facc15",
                brightBlue: "#60a5fa",
                brightMagenta: "#e879f9",
                brightCyan: "#22d3ee",
                brightWhite: "#ffffff",
            },
            allowProposedApi: true,
        })

        // Load Addons
        const fitAddon = new FitAddon()
        const webLinksAddon = new WebLinksAddon()

        term.loadAddon(fitAddon)
        term.loadAddon(webLinksAddon)

        // Open Terminal
        term.open(terminalRef.current)
        fitAddon.fit()

        // Handle Input
        term.onData((data) => {
            if (onData) {
                onData(data)
            }
        })

        // Handle Resize
        const handleResize = () => fitAddon.fit()
        window.addEventListener("resize", handleResize)

        // Store refs
        xtermRef.current = term
        fitAddonRef.current = fitAddon

        return () => {
            window.removeEventListener("resize", handleResize)
            term.dispose()
        }
    }, [onData])

    // Handle incoming data from WebSocket
    useEffect(() => {
        if (!socket || !xtermRef.current) return

        const handleMessage = (event: MessageEvent) => {
            xtermRef.current?.write(event.data)
        }

        socket.addEventListener("message", handleMessage)

        return () => {
            socket.removeEventListener("message", handleMessage)
        }
    }, [socket])

    return (
        <div
            className="h-full w-full overflow-hidden bg-zinc-950 p-2"
            ref={terminalRef}
        />
    )
}
