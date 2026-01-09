"use client"

/**
 * ConnectedEditor - Monaco Editor with Workspace Integration
 * 
 * Constitutional Compliance:
 * - SINGLE SOURCE OF TRUTH: Syncs with workspace context
 * - NO MOCKS: Real Monaco editor with real file content
 * - AGENT AWARE: Changes are visible to AI agents through context
 */

import React, { useEffect, useCallback } from 'react'
import { useWorkspace } from '@/lib/workspace/workspace-context'
import { CodeEditor } from './code-editor'
import { X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ConnectedEditor() {
  const {
    activeFilePath,
    activeFileContent,
    openFiles,
    openFile,
    closeFile,
    saveFile,
    updateActiveFileContent,
    isLoadingFile,
  } = useWorkspace()

  // Debounced auto-save
  useEffect(() => {
    if (!activeFilePath || !activeFileContent) return

    const timer = setTimeout(() => {
      saveFile(activeFilePath, activeFileContent).catch(err => {
        console.error('Auto-save failed:', err)
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [activeFilePath, activeFileContent, saveFile])

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        updateActiveFileContent(value)
      }
    },
    [updateActiveFileContent]
  )

  const handleManualSave = async () => {
    if (activeFilePath && activeFileContent) {
      try {
        await saveFile(activeFilePath, activeFileContent)
        console.log('File saved:', activeFilePath)
      } catch (error) {
        console.error('Save failed:', error)
      }
    }
  }

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'json':
        return 'json'
      case 'css':
        return 'css'
      case 'html':
        return 'html'
      case 'md':
        return 'markdown'
      case 'py':
        return 'python'
      case 'rs':
        return 'rust'
      case 'go':
        return 'go'
      default:
        return 'plaintext'
    }
  }

  const getFileName = (path: string) => {
    return path.split('/').pop() || path
  }

  if (isLoadingFile) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e] text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm">Loading file...</p>
        </div>
      </div>
    )
  }

  if (openFiles.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">No File Open</h3>
          <p className="text-gray-400 text-sm">
            Select a file from the explorer to start editing
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
      {/* File Tabs */}
      <div className="flex items-center border-b border-[#3e3e42] bg-[#252526] overflow-x-auto">
        {openFiles.map(filePath => {
          const fileName = getFileName(filePath)
          const isActive = filePath === activeFilePath

          return (
            <div
              key={filePath}
              className={`flex items-center gap-2 px-4 py-2 border-r border-[#3e3e42] cursor-pointer transition-colors ${
                isActive
                  ? 'bg-[#1e1e1e] text-white'
                  : 'bg-[#2d2d2d] text-gray-400 hover:text-white'
              }`}
              onClick={() => openFile(filePath)}
            >
              <span className="text-sm truncate max-w-[150px]">{fileName}</span>
              <button
                onClick={e => {
                  e.stopPropagation()
                  closeFile(filePath)
                }}
                className="hover:bg-white/10 rounded p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3e3e42] bg-[#252526]">
        <div className="text-xs text-gray-400">
          {activeFilePath && <span>{activeFilePath}</span>}
        </div>
        <Button
          onClick={handleManualSave}
          size="sm"
          variant="ghost"
          className="h-7 text-xs hover:bg-white/10"
        >
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        {activeFilePath && (
          <CodeEditor
            language={getLanguageFromPath(activeFilePath)}
            value={activeFileContent}
            onChange={handleEditorChange}
            height="100%"
            theme="vs-dark"
            showMinimap={false}
          />
        )}
      </div>
    </div>
  )
}
