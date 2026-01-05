'use client'

import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { editor as monacoEditor } from 'monaco-editor'

interface EditorProps {
  language?: string
  defaultValue?: string
  onChange?: (value: string | undefined) => void
  theme?: 'vs' | 'vs-dark' | 'hc-black'
  readOnly?: boolean
}

export function CodeEditor({
  language = 'javascript',
  defaultValue = '// Start coding here\nconsole.log("Hello BuildSpaces!");',
  onChange,
  theme = 'vs-dark',
  readOnly = false,
}: EditorProps) {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleEditorMount = (editor: monacoEditor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on',
      formatOnPaste: true,
      formatOnType: true,
      autoIndent: 'full',
    })
  }

  if (!mounted) {
    return (
      <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-gray-400">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full border border-white/10 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={defaultValue}
        theme={theme}
        onMount={handleEditorMount}
        onChange={onChange}
        options={{
          readOnly,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          bracketPairColorization: {
            enabled: true,
          },
        }}
      />
    </div>
  )
}
