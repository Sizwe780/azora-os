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
        id: 'input',
        position: { x: 250, y: 0 },
        data: { label: 'Input Layer (28x28)' },
        style: { background: '#3b82f6', color: 'white', border: 'none' }
    },
    {
        id: 'conv1',
        position: { x: 250, y: 100 },
        data: { label: 'Conv2d (32, 3x3)' },
        style: { background: '#8b5cf6', color: 'white', border: 'none' }
    },
    {
        id: 'pool1',
        position: { x: 250, y: 200 },
        data: { label: 'MaxPool2d (2x2)' },
        style: { background: '#ec4899', color: 'white', border: 'none' }
    },
    {
        id: 'conv2',
        position: { x: 250, y: 300 },
        data: { label: 'Conv2d (64, 3x3)' },
        style: { background: '#8b5cf6', color: 'white', border: 'none' }
    },
    {
        id: 'pool2',
        position: { x: 250, y: 400 },
        data: { label: 'MaxPool2d (2x2)' },
        style: { background: '#ec4899', color: 'white', border: 'none' }
    },
    {
        id: 'flatten',
        position: { x: 250, y: 500 },
        data: { label: 'Flatten' },
        style: { background: '#f59e0b', color: 'white', border: 'none' }
    },
    {
        id: 'fc1',
        position: { x: 250, y: 600 },
        data: { label: 'Linear (128)' },
        style: { background: '#10b981', color: 'white', border: 'none' }
    },
    {
        id: 'output',
        position: { x: 250, y: 700 },
        data: { label: 'Output (10)' },
        style: { background: '#3b82f6', color: 'white', border: 'none' }
    },
];

const initialEdges: Edge[] = [
    { id: 'e1', source: 'input', target: 'conv1', animated: true },
    { id: 'e2', source: 'conv1', target: 'pool1', animated: true },
    { id: 'e3', source: 'pool1', target: 'conv2', animated: true },
    { id: 'e4', source: 'conv2', target: 'pool2', animated: true },
    { id: 'e5', source: 'pool2', target: 'flatten', animated: true },
    { id: 'e6', source: 'flatten', target: 'fc1', animated: true },
    { id: 'e7', source: 'fc1', target: 'output', animated: true },
];

export default function ModelVisualizer() {
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
                <Background variant={BackgroundVariant.Lines} gap={20} size={1} />
            </ReactFlow>
        </div>
    );
}
