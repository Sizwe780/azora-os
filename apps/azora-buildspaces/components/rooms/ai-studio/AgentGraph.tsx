"use client";

import { useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
    {
        id: 'elara',
        position: { x: 250, y: 0 },
        data: { label: 'Elara (Orchestrator)' },
        style: { background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px' }
    },
    {
        id: 'sankofa',
        position: { x: 50, y: 150 },
        data: { label: 'Sankofa (Code)' },
        style: { background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px' }
    },
    {
        id: 'themba',
        position: { x: 250, y: 150 },
        data: { label: 'Themba (Backend)' },
        style: { background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', padding: '10px' }
    },
    {
        id: 'jabari',
        position: { x: 450, y: 150 },
        data: { label: 'Jabari (Security)' },
        style: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '10px' }
    },
    {
        id: 'knowledge',
        position: { x: 250, y: 300 },
        data: { label: 'Knowledge Ocean (Vector DB)' },
        style: { background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '10px' }
    },
];

const initialEdges: Edge[] = [
    { id: 'e1', source: 'elara', target: 'sankofa', animated: true, label: 'delegate' },
    { id: 'e2', source: 'elara', target: 'themba', animated: true, label: 'delegate' },
    { id: 'e3', source: 'elara', target: 'jabari', animated: true, label: 'delegate' },
    { id: 'e4', source: 'sankofa', target: 'knowledge', animated: true, label: 'query' },
    { id: 'e5', source: 'themba', target: 'knowledge', animated: true, label: 'query' },
    { id: 'e6', source: 'jabari', target: 'knowledge', animated: true, label: 'query' },
];

export default function AgentGraph() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
        [setEdges],
    );

    return (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-950">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls />
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            </ReactFlow>
        </div>
    );
}
