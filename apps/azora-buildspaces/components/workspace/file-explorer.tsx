"use client"

/**
 * FileExplorer - Real File Tree Navigator
 * 
 * Constitutional Compliance:
 * - NO MOCKS: Lists actual files from the VFS
 * - INTERACTIVE: Clicking a file opens it in the editor
 * - SINGLE SOURCE OF TRUTH: Connected to workspace context
 */

import React, { useState } from 'react'
import { useWorkspace } from '@/lib/workspace/workspace-context'
import type { FileNode } from '@/lib/workspace/file-system'
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  Image as ImageIcon,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FileExplorer() {
  const { fileTree, openFile, refreshFileTree, projectName, isLoadingProject } = useWorkspace()
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/']))

  const toggleDirectory = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx':
      case 'ts':
      case 'jsx':
      case 'js':
        return <FileCode className="w-4 h-4 text-blue-400" />
      case 'json':
        return <FileJson className="w-4 h-4 text-yellow-400" />
      case 'md':
        return <FileText className="w-4 h-4 text-gray-400" />
      case 'png':
      case 'jpg':
      case 'svg':
      case 'gif':
        return <ImageIcon className="w-4 h-4 text-purple-400" />
      default:
        return <File className="w-4 h-4 text-gray-400" />
    }
  }

  const renderFileNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedDirs.has(node.path)
    const indent = depth * 12

    if (node.type === 'directory') {
      return (
        <div key={node.path}>
          <button
            onClick={() => toggleDirectory(node.path)}
            className="flex items-center gap-2 w-full px-2 py-1 hover:bg-white/5 text-left text-sm text-gray-300 rounded transition-colors"
            style={{ paddingLeft: `${indent + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => renderFileNode(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <button
        key={node.path}
        onClick={() => openFile(node.path)}
        className="flex items-center gap-2 w-full px-2 py-1 hover:bg-white/5 text-left text-sm text-gray-300 rounded transition-colors group"
        style={{ paddingLeft: `${indent + 28}px` }}
      >
        {getFileIcon(node.name)}
        <span className="truncate group-hover:text-white">{node.name}</span>
      </button>
    )
  }

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3e3e42]">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          {projectName || 'Explorer'}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshFileTree}
            className="h-6 w-6 p-0 hover:bg-white/10"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-white/10"
            title="New file"
          >
            <Plus className="w-3 h-3 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto py-2">
        {fileTree.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4 text-center">
            <p className="text-sm text-gray-500">No files in project</p>
          </div>
        ) : (
          <div className="px-1">{fileTree.map(node => renderFileNode(node))}</div>
        )}
      </div>
    </div>
  )
}
