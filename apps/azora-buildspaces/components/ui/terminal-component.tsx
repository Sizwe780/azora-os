"use client"

import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

interface TerminalComponentProps {
    onData?: (data: string) => void
    initialContent?: string[]
}

export function TerminalComponent({ onData, initialContent = [] }: TerminalComponentProps) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<Terminal | null>(null)

    useEffect(() => {
        if (!terminalRef.current) return

        const term = new Terminal({
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

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)

        term.open(terminalRef.current)
        fitAddon.fit()

        initialContent.forEach(line => term.writeln(line))
        term.write('\r\n$ ')

        term.onData(data => {
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

        const handleResize = () => fitAddon.fit()
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            term.dispose()
        }
    }, [])

    return (
        <div ref={terminalRef} className="h-full w-full overflow-hidden" />
    )
}
