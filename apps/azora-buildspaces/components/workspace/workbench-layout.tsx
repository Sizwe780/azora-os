"use client"

/**
 * WorkbenchLayout - Resizable Split-Pane IDE Layout
 * 
 * Constitutional Compliance:
 * - NO MOCKS: Real resizable panels using react-resizable-panels
 * - PERSISTENT: Layout preferences saved to localStorage
 * - Built per BLUEPRINT.md Room 1: Code Chamber specifications
 * 
 * Layout Structure:
 * ┌─────────────────────────────────────────────────┐
 * │  Sidebar  │   Main Editor   │   Agent Rail      │
 * │  (Files)  │   (Monaco)      │   (Elara)         │
 * │           ├─────────────────┤                   │
 * │           │  Panel (Term)   │                   │
 * └─────────────────────────────────────────────────┘
 */

import React from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useWorkspace } from '@/lib/workspace/workspace-context'
import { GripVertical, GripHorizontal } from 'lucide-react'

interface WorkbenchLayoutProps {
  /** Left sidebar content (file explorer) */
  sidebarContent: React.ReactNode
  /** Main editor area content */
  editorContent: React.ReactNode
  /** Bottom panel content (terminal, output, etc.) */
  panelContent?: React.ReactNode
  /** Right agent rail content (AI assistant) */
  agentRailContent?: React.ReactNode
}

export function WorkbenchLayout({
  sidebarContent,
  editorContent,
  panelContent,
  agentRailContent,
}: WorkbenchLayoutProps) {
  const { layoutPreferences } = useWorkspace()

  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <PanelGroup direction="horizontal" className="h-full">
        {/* Sidebar (File Explorer) */}
        {layoutPreferences.sidebarVisible && (
          <>
            <Panel
              defaultSize={20}
              minSize={15}
              maxSize={35}
              className="bg-[#252526] border-r border-[#3e3e42]"
            >
              {sidebarContent}
            </Panel>
            <ResizeHandle direction="vertical" />
          </>
        )}

        {/* Main Content Area (Editor + Panel) */}
        <Panel defaultSize={layoutPreferences.agentRailVisible ? 60 : 80} minSize={40}>
          <PanelGroup direction="vertical">
            {/* Editor */}
            <Panel defaultSize={layoutPreferences.panelVisible ? 70 : 100} minSize={30}>
              <div className="h-full w-full bg-[#1e1e1e]">{editorContent}</div>
            </Panel>

            {/* Bottom Panel (Terminal/Output) */}
            {layoutPreferences.panelVisible && panelContent && (
              <>
                <ResizeHandle direction="horizontal" />
                <Panel defaultSize={30} minSize={10} maxSize={50} className="bg-[#1e1e1e]">
                  {panelContent}
                </Panel>
              </>
            )}
          </PanelGroup>
        </Panel>

        {/* Agent Rail (AI Assistant) */}
        {layoutPreferences.agentRailVisible && agentRailContent && (
          <>
            <ResizeHandle direction="vertical" />
            <Panel
              defaultSize={20}
              minSize={15}
              maxSize={35}
              className="bg-[#252526] border-l border-[#3e3e42]"
            >
              {agentRailContent}
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  )
}

/**
 * Resize Handle Component
 * Visual indicator for resizable panel boundaries
 */
function ResizeHandle({ direction }: { direction: 'horizontal' | 'vertical' }) {
  return (
    <PanelResizeHandle
      className={`group relative ${
        direction === 'vertical'
          ? 'w-1 hover:w-2 transition-all'
          : 'h-1 hover:h-2 transition-all'
      } bg-[#3e3e42] hover:bg-emerald-500/50 flex items-center justify-center`}
    >
      <div
        className={`absolute ${
          direction === 'vertical' ? 'w-full h-8' : 'w-8 h-full'
        } flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
      >
        {direction === 'vertical' ? (
          <GripVertical className="w-4 h-4 text-gray-400" />
        ) : (
          <GripHorizontal className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </PanelResizeHandle>
  )
}
