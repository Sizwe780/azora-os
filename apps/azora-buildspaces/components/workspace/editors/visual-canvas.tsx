"use client"

import { useState, useCallback } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
} from '@reactflow/core';
import { MiniMap as MiniMapComponent } from '@reactflow/minimap';
import { Controls as ControlsComponent } from '@reactflow/controls';
import { Background as BackgroundComponent, BackgroundVariant } from '@reactflow/background';
import '@reactflow/core/dist/style.css';
import '@reactflow/minimap/dist/style.css';
import '@reactflow/controls/dist/style.css';

const initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'App Root' } },
    { id: '2', position: { x: 0, y: 100 }, data: { label: 'Layout' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export function VisualCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    return (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-900">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <ControlsComponent />
                <MiniMapComponent />
                <BackgroundComponent variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}
