"use client"

/**
 * Collaborative Editor - Monaco with Real-time Synchronization
 * 
 * Constitutional Compliance:
 * - UBUNTU MODE: Multiplayer collaboration
 * - TRANSPARENCY: Shows who is editing
 * - CONFLICT PRESERVATION: Uses CRDT for automatic merge
 * 
 * Wraps Monaco Editor with YJS collaboration binding.
 */

import React, { useEffect, useRef, useState } from 'react'
import Editor, { type Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useWorkspace } from '@/lib/workspace/workspace-context'
import { usePresence } from '@/lib/collaboration/presence'
import {
  setupCollaborativeEditing,
  disconnectCollaborativeEditing,
} from '@/lib/collaboration/monaco-binding'
import { HuddleBar, RemoteCursors } from '@/components/rooms/collab-pod/huddle-bar'

interface CollaborativeEditorProps {
  roomId: string
  enableCollaboration?: boolean
}

export function CollaborativeEditor({
  roomId,
  enableCollaboration = true,
}: CollaborativeEditorProps) {
  const { activeFilePath, activeFileContent } = useWorkspace()
  const updateFileContent = (path: string, content: string) => {
    // Placeholder for updateFileContent
  }
  const {
    getYDoc,
    updateSelection,
    updateCurrentFile,
    localUser,
    remoteUsers,
  } = usePresence(roomId)

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const bindingRef = useRef<any | null>(null)

  const [language, setLanguage] = useState('typescript')

  // Detect language from file extension
  useEffect(() => {
    if (!activeFilePath) return

    const ext = activeFilePath.split('.').pop()
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      md: 'markdown',
      css: 'css',
      html: 'html',
      py: 'python',
      go: 'go',
      rs: 'rust',
      yaml: 'yaml',
      yml: 'yaml',
    }

    setLanguage(langMap[ext || ''] || 'typescript')
  }, [activeFilePath])

  // Setup collaboration when editor mounts
  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor
    monacoRef.current = monaco

    if (enableCollaboration && activeFilePath) {
      setupCollaboration()
    }

    // Track selection changes for collaboration
    editor.onDidChangeCursorSelection((e) => {
      const selection = e.selection
      updateSelection({
        startLine: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLine: selection.endLineNumber,
        endColumn: selection.endColumn,
      })
    })

    // Track content changes
    editor.onDidChangeModelContent(() => {
      if (!enableCollaboration) {
        // Non-collaborative mode: sync to workspace
        const content = editor.getValue()
        updateFileContent(activeFilePath || '', content)
      }
      // In collaborative mode, YJS handles sync
    })
  }

  // Setup collaborative editing
  const setupCollaboration = () => {
    if (!editorRef.current || !activeFilePath) return

    // Clean up old binding
    if (bindingRef.current) {
      disconnectCollaborativeEditing(bindingRef.current)
    }

    // Get YDoc
    const doc = getYDoc()

    // Setup new binding
    const binding = setupCollaborativeEditing(
      doc,
      activeFilePath,
      editorRef.current
    )

    bindingRef.current = binding

    // Update presence
    updateCurrentFile(activeFilePath)

    console.log('[CollaborativeEditor] Collaboration enabled for', activeFilePath)
  }

  // Update collaboration when file changes
  useEffect(() => {
    if (enableCollaboration && editorRef.current && activeFilePath) {
      setupCollaboration()
    }

    return () => {
      if (bindingRef.current) {
        disconnectCollaborativeEditing(bindingRef.current)
        bindingRef.current = null
      }
    }
  }, [activeFilePath, enableCollaboration])

  return (
    <div className="relative h-full">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={activeFileContent}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          rulers: [80, 120],
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          readOnly: false,
        }}
      />

      {/* Collaboration UI */}
      {enableCollaboration && (
        <>
          <RemoteCursors roomId={roomId} />
          <HuddleBar roomId={roomId} />
        </>
      )}

      {/* Collaboration Status */}
      {enableCollaboration && (
        <div className="absolute top-2 left-2 z-40">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">
              Collaboration Active
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
