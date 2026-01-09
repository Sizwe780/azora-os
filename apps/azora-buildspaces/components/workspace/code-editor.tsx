"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import type { editor } from "monaco-editor"

/**
 * CodeEditor - Real Interactive Monaco Editor Component
 * 
 * Constitutional Compliance:
 * - NO MOCKS: This is a real, interactive Monaco Editor
 * - TRUTH: Accepts actual code input and allows real editing
 * - Built on microsoft/monaco-editor (BLUEPRINT.md Room 1: Code Chamber)
 * 
 * Usage:
 *   <CodeEditor 
 *     language="typescript"
 *     value={codeString}
 *     onChange={(newValue) => handleChange(newValue)}
 *   />
 */

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

export interface CodeEditorProps {
  /** Programming language for syntax highlighting (typescript, javascript, python, etc.) */
  language?: string
  /** Initial/controlled value of the editor */
  value?: string
  /** Callback when editor content changes */
  onChange?: (value: string | undefined) => void
  /** Height of the editor (default: 100%) */
  height?: string | number
  /** Width of the editor (default: 100%) */
  width?: string | number
  /** Theme (vs-dark, vs-light, hc-black) */
  theme?: string
  /** Read-only mode */
  readOnly?: boolean
  /** Show minimap */
  showMinimap?: boolean
  /** Line numbers (on, off, relative) */
  lineNumbers?: "on" | "off" | "relative"
  /** Custom Monaco editor options */
  options?: editor.IStandaloneEditorConstructionOptions
}

export function CodeEditor({
  language = "typescript",
  value = "",
  onChange,
  height = "100%",
  width = "100%",
  theme = "vs-dark",
  readOnly = false,
  showMinimap = false,
  lineNumbers = "on",
  options = {},
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor
  }

  function handleEditorChange(value: string | undefined) {
    if (onChange) {
      onChange(value)
    }
  }

  // Default editor options following VS Code conventions
  const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: showMinimap },
    fontSize: 14,
    lineNumbers,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: "on",
    padding: { top: 16, bottom: 16 },
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    fontLigatures: true,
    cursorBlinking: "smooth",
    smoothScrolling: true,
    renderLineHighlight: "all",
    bracketPairColorization: { enabled: true },
    readOnly,
    contextmenu: true,
    folding: true,
    foldingStrategy: "auto",
    showFoldingControls: "always",
    matchBrackets: "always",
    renderWhitespace: "selection",
    scrollbar: {
      vertical: "visible",
      horizontal: "visible",
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
  }

  return (
    <div className="w-full h-full" style={{ height, width }}>
      <MonacoEditor
        height={height}
        width={width}
        language={language}
        theme={theme}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          ...defaultOptions,
          ...options,
        }}
        loading={
          <div className="flex items-center justify-center h-full w-full bg-[#1e1e1e] text-gray-400">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="text-sm">Loading Monaco Editor...</p>
            </div>
          </div>
        }
      />
    </div>
  )
}
