'use client'

import React, { useCallback } from 'react'
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from 'reactflow'
import { MiniMap } from '@reactflow/minimap'
import { Controls } from '@reactflow/controls'
import { Background } from '@reactflow/background'
import 'reactflow/dist/style.css'

const initialNodes = [
  { id: '1', position: { x: 250, y: 5 }, data: { label: 'Start' } },
  { id: '2', position: { x: 100, y: 100 }, data: { label: 'Process Data' } },
  { id: '3', position: { x: 400, y: 100 }, data: { label: 'Validate Input' } },
  { id: '4', position: { x: 250, y: 200 }, data: { label: 'End' } },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-4', source: '3', target: '4' },
]

export function VisualBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-zinc-950"
      >
        <Controls className="bg-zinc-800 border-zinc-700 fill-zinc-300" />
        <MiniMap className="bg-zinc-900" maskColor="rgba(255, 255, 255, 0.1)" />
        <Background color="#3f3f46" gap={16} />
      </ReactFlow>
    </div>
  )
}
