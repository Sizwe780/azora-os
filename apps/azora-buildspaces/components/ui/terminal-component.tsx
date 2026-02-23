"use client"

import React, { useEffect, useRef } from 'react'
import 'xterm/css/xterm.css'

interface TerminalComponentProps {
    onData?: (data: string) => void
    initialContent?: string[]
}

export function TerminalComponent({ onData, initialContent = [] }: TerminalComponentProps) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<any>(null)

    useEffect(() => {
        if (!terminalRef.current) return

        let term: any = null
        let fitAddon: any = null

        const initTerminal = async () => {
            const { Terminal } = await import('xterm')
            const { FitAddon } = await import('xterm-addon-fit')

            term = new Terminal({
                cursorBlink: true,
                theme: {
                    background: '#0d1117',
                    foreground: '#e6edf3',
                    cursor: '#10b981',
                    selectionBackground: '#10b98140',
                },
                fontSize: 14,
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            })

            fitAddon = new FitAddon()
            term.loadAddon(fitAddon)

            term.open(terminalRef.current!)
            fitAddon.fit()

            initialContent.forEach(line => term.writeln(line))
            term.write('\r\n$ ')

            term.onData((data: string) => {
                if (data === '\r') {
                    term.write('\r\n$ ')
                } else if (data === '\u007f') { // Backspace
                    term.write('\b \b')
                } else {
                    term.write(data)
                }
                onData?.(data)
            })

            xtermRef.current = term
        }

        initTerminal()

        const handleResize = () => fitAddon?.fit()
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            term?.dispose()
        }
    }, [])

    return (
        <div ref={terminalRef} className="h-full w-full overflow-hidden" />
    )
}
