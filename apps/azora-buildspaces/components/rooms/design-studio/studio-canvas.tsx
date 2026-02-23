"use client"

/**
 * Studio Canvas - Infinite Canvas for UI Design
 * 
 * Constitutional Compliance:
 * - UBUNTU PHILOSOPHY: Enforces mobile responsiveness by default
 * - A11Y COMPLIANCE: Automatic accessibility checks on all components
 * - NO MOCK: Real components, not screenshots
 * 
 * Uses reactflow for the infinite canvas with drag-and-drop UI elements.
 */

import React, { useCallback, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Connection,
} from 'reactflow'
import type { NodeTypes } from '@reactflow/core'
import { MiniMap } from '@reactflow/minimap'
import '@reactflow/minimap/dist/style.css'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react'

// Custom node component for UI elements
function ComponentNode({ data }: { data: any }) {
  const hasA11yIssue = !data.a11yCompliant
  const hasResponsiveIssue = !data.mobileResponsive

  return (
    <Card className="p-4 min-w-[200px] border-2 hover:border-emerald-500 transition-colors">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">{data.label}</span>
          {hasA11yIssue && (
            <div title="A11y Issue">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
          )}
          {hasResponsiveIssue && (
            <div title="Not Mobile Responsive">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
          )}
        </div>

        {/* Preview of actual component */}
        <div className="bg-muted rounded p-2 text-xs">
          {data.preview || <Button size="sm" className="w-full">Preview</Button>}
        </div>

        {/* Component metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          {data.width && <div>Width: {data.width}px</div>}
          {data.height && <div>Height: {data.height}px</div>}
          {hasResponsiveIssue && (
            <div className="text-orange-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Fixed width breaks on mobile
            </div>
          )}
          {hasA11yIssue && (
            <div className="text-yellow-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Missing ARIA labels
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

const nodeTypes: NodeTypes = {
  component: ComponentNode,
}

interface StudioCanvasProps {
  onNodeSelect?: (node: Node) => void
  initialNodes?: Node[]
}

export function StudioCanvas({ onNodeSelect, initialNodes = [] }: StudioCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node)
    },
    [onNodeSelect]
  )

  // Add a new component to the canvas
  const addComponent = (type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'component',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        width: type === 'button' ? 120 : type === 'card' ? 300 : 200,
        height: type === 'button' ? 40 : type === 'card' ? 200 : 100,
        a11yCompliant: false, // Will be checked automatically
        mobileResponsive: type !== 'card', // Cards with fixed width not responsive
        preview: getComponentPreview(type),
      },
    }

    // Constitutional Check: Accessibility
    newNode.data.a11yCompliant = checkA11yCompliance(newNode)
    
    // Ubuntu Philosophy: Mobile Responsiveness
    newNode.data.mobileResponsive = checkMobileResponsiveness(newNode)

    setNodes((nds: Node[]) => [...nds, newNode])
  }

  // Check accessibility compliance
  const checkA11yCompliance = (node: Node): boolean => {
    // Check if component has proper ARIA labels, roles, etc.
    // For now, simple check - in production, this would be more comprehensive
    const data = node.data
    return !!(data.ariaLabel || data.role || data.alt)
  }

  // Check mobile responsiveness
  const checkMobileResponsiveness = (node: Node): boolean => {
    // Constitutional: Ubuntu Philosophy - Mobile users cannot be excluded
    const data = node.data
    
    // Fixed width components break on mobile
    if (data.width && typeof data.width === 'number' && data.width > 400) {
      return false
    }

    return true
  }

  // Get real component preview (NO MOCK)
  const getComponentPreview = (type: string) => {
    switch (type) {
      case 'button':
        return <Button size="sm" className="w-full">Click Me</Button>
      case 'card':
        return (
          <Card className="p-2">
            <div className="text-xs">Card Content</div>
          </Card>
        )
      case 'input':
        return <input className="w-full border rounded px-2 py-1 text-xs" placeholder="Input field" />
      default:
        return <div className="text-xs">Component</div>
    }
  }

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return 375
      case 'tablet':
        return 768
      case 'desktop':
        return 1920
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-background">
        <div className="flex items-center gap-2">
          <Button onClick={() => addComponent('button')} size="sm" variant="outline">
            Add Button
          </Button>
          <Button onClick={() => addComponent('card')} size="sm" variant="outline">
            Add Card
          </Button>
          <Button onClick={() => addComponent('input')} size="sm" variant="outline">
            Add Input
          </Button>
        </div>

        {/* Viewport Mode Selector */}
        <div className="flex items-center gap-1 border rounded p-1">
          <Button
            size="sm"
            variant={viewportMode === 'mobile' ? 'default' : 'ghost'}
            className="h-7 px-2"
            onClick={() => setViewportMode('mobile')}
          >
            <Smartphone className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant={viewportMode === 'tablet' ? 'default' : 'ghost'}
            className="h-7 px-2"
            onClick={() => setViewportMode('tablet')}
          >
            <Tablet className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant={viewportMode === 'desktop' ? 'default' : 'ghost'}
            className="h-7 px-2"
            onClick={() => setViewportMode('desktop')}
          >
            <Monitor className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>

        {/* Viewport Overlay (shows responsive breakpoint) */}
        <div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/90 border rounded px-3 py-1 text-xs"
        >
          Viewport: {viewportMode} ({getViewportWidth()}px)
        </div>
      </div>
    </div>
  )
}
