'use client'

import { useEffect, useRef, useState } from 'react'
import * as Y from 'yjs'
import { MonacoBinding } from 'y-monaco'
import { WebsocketProvider } from 'y-websocket'
import Editor from '@monaco-editor/react'
import { editor as monacoEditor } from 'monaco-editor'

interface CollaborativeEditorProps {
  projectId: string
  userId: string
  userName: string
  language?: string
}

export function CollaborativeEditor({
  projectId,
  userId,
  userName,
  language = 'javascript',
}: CollaborativeEditorProps) {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null)
  const yDocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const bindingRef = useRef<MonacoBinding | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleEditorMount = async (editor: monacoEditor.IStandaloneCodeEditor) => {
    editorRef.current = editor

    // Initialize Yjs document
    const yDoc = new Y.Doc()
    yDocRef.current = yDoc

    const yText = yDoc.getText('shared-code')

    // Initialize WebSocket provider (development mode - uses ws://localhost:1234)
    // In production, this would connect to your actual backend
    try {
      const provider = new WebsocketProvider(
        'ws://localhost:1234',
        `project-${projectId}`,
        yDoc,
        {
          connect: false, // Don't auto-connect in dev
        }
      )
      providerRef.current = provider

      // Set awareness data (for cursor tracking)
      const awareness = provider.awareness
      awareness.setLocalState({
        user: {
          name: userName,
          color: `hsl(${Math.random() * 360}, 75%, 50%)`,
        },
      })

      // Monitor connection
      provider.on('status', ({ status }: { status: string }) => {
        setIsConnected(status === 'connected')
        console.log(`[Y.js] Connection status: ${status}`)
      })

      // Bind Monaco to Yjs
      const binding = new MonacoBinding(
        yText,
        editor.getModel() as monacoEditor.ITextModel,
        new Set([editor]),
        awareness as any
      )
      bindingRef.current = binding

      console.log(`[Collab] Editor bound for project: ${projectId}`)
    } catch (error) {
      console.error('[Collab] Failed to initialize collaboration:', error)
      // Fall back to local-only editing
      setIsConnected(false)
    }
  }

  if (!mounted) {
    return <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center text-gray-400">Loading...</div>
  }

  return (
    <div className="w-full h-full relative">
      {/* Status indicator */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded bg-black/50 border border-white/20">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
        <span className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Local Mode'}</span>
      </div>

      <div className="w-full h-full border border-white/10 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue='// Collaborative editor ready\n// Changes are synced in real-time'
          theme="vs-dark"
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  )
}
