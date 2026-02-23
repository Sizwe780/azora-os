/**
 * Keyboard Shortcuts — Industry-leading keyboard navigation
 * 
 * Competing with: VS Code (Ctrl+K shortcuts), Linear (keyboard-first),
 * Figma (shortcuts panel), Notion (slash commands + shortcuts)
 * 
 * Our edge: Constitutional AI context-aware shortcuts that adapt per room
 */

'use client'

import { useEffect, useCallback, useState } from 'react'

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  room?: string // null = global
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const [showPanel, setShowPanel] = useState(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Toggle shortcuts panel with Ctrl+/
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault()
        setShowPanel((prev) => !prev)
        return
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { showPanel, setShowPanel }
}

// Global shortcuts available in every room
export const GLOBAL_SHORTCUTS = [
  { key: '/', ctrl: true, description: 'Show keyboard shortcuts' },
  { key: 'k', ctrl: true, description: 'Quick command palette' },
  { key: 'b', ctrl: true, description: 'Toggle sidebar' },
  { key: 'n', ctrl: true, shift: true, description: 'New task' },
  { key: 'f', ctrl: true, shift: true, description: 'Global search' },
]

// Room-specific shortcuts
export const ROOM_SHORTCUTS: Record<string, { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean; description: string }[]> = {
  'code-chamber': [
    { key: 's', ctrl: true, description: 'Save file' },
    { key: 'p', ctrl: true, description: 'Quick open file' },
    { key: 'f', ctrl: true, description: 'Find in file' },
    { key: '`', ctrl: true, description: 'Toggle terminal' },
    { key: 'i', ctrl: true, shift: true, description: 'AI refactor' },
  ],
  'command-desk': [
    { key: 'Enter', description: 'Send message' },
    { key: 'Enter', shift: true, description: 'New line' },
    { key: 'n', ctrl: true, description: 'New chat' },
    { key: 'e', ctrl: true, description: 'Export conversation' },
    { key: '/', description: 'Slash command' },
  ],
  'task-board': [
    { key: 'n', ctrl: true, description: 'New task' },
    { key: 'v', ctrl: true, description: 'Toggle view mode' },
    { key: 'f', ctrl: true, description: 'Filter tasks' },
    { key: 'p', ctrl: true, shift: true, description: 'AI prioritize' },
  ],
  'innovation-theater': [
    { key: 'ArrowRight', description: 'Next slide' },
    { key: 'ArrowLeft', description: 'Previous slide' },
    { key: 'l', ctrl: true, description: 'Go live' },
    { key: 'g', ctrl: true, shift: true, description: 'AI generate slides' },
    { key: 'p', description: 'Toggle presenter mode' },
  ],
  'deep-focus': [
    { key: ' ', description: 'Start/pause timer' },
    { key: 'r', description: 'Reset timer' },
    { key: 'z', ctrl: true, description: 'Toggle zen mode' },
  ],
  'design-studio': [
    { key: 'i', ctrl: true, description: 'Import from Figma' },
    { key: 'a', ctrl: true, description: 'Accessibility audit' },
  ],
  'ai-studio': [
    { key: 'r', ctrl: true, description: 'Run workflow' },
    { key: 's', ctrl: true, description: 'Save workflow' },
    { key: 'e', ctrl: true, description: 'Stop workflow' },
  ],
  'spec-chamber': [
    { key: 'v', ctrl: true, description: 'Validate spec' },
    { key: 'g', ctrl: true, shift: true, description: 'Generate code from spec' },
  ],
  'knowledge-ocean': [
    { key: 'f', ctrl: true, description: 'Search' },
    { key: 'a', ctrl: true, shift: true, description: 'Ask AI' },
  ],
  'collaboration-pod': [
    { key: 'm', ctrl: true, shift: true, description: 'Generate meeting summary' },
  ],
  'collectible-showcase': [
    { key: 'a', ctrl: true, description: 'View achievements' },
  ],
  'maker-lab': [
    { key: 'r', ctrl: true, description: 'Run simulation' },
  ],
}
