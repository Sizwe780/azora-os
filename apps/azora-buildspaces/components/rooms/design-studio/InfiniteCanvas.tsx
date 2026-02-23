"use client";

import { useCallback, useEffect } from 'react';
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
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';
import 'reactflow/dist/style.css';

type FrameNodeData = {
    label: string
    width: number
    height: number
    content: React.ReactNode
}

const FrameNode = ({ data, selected }: { data: FrameNodeData; selected: boolean }) => {
    return (
        <div className={`bg-white dark:bg-slate-900 border-2 ${selected ? 'border-blue-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg shadow-sm min-w-[200px] min-h-[100px] relative group`}>
            <NodeResizer minWidth={100} minHeight={50} isVisible={selected} />
            <div className="px-3 py-1 border-b border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-950 rounded-t-lg flex justify-between">
                <span>{data.label}</span>
                <span className="opacity-0 group-hover:opacity-100">{data.width}x{data.height}</span>
            </div>
            <div className="p-4">
                {data.content}
            </div>
        </div>
    );
};

const nodeTypes = {
    frame: FrameNode,
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'frame',
        position: { x: 100, y: 100 },
        data: { label: 'Login Screen', width: 375, height: 667, content: <div className="space-y-2"><div className="h-8 bg-slate-100 rounded" /><div className="h-8 bg-slate-100 rounded" /><div className="h-10 bg-blue-500 rounded mt-4" /></div> },
        style: { width: 300, height: 500 }
    },
    {
        id: '2',
        type: 'frame',
        position: { x: 500, y: 100 },
        data: { label: 'Dashboard', width: 1024, height: 768, content: <div className="grid grid-cols-2 gap-2"><div className="h-20 bg-slate-100 rounded" /><div className="h-20 bg-slate-100 rounded" /><div className="col-span-2 h-40 bg-slate-100 rounded" /></div> },
        style: { width: 400, height: 300 }
    },
];

export default function InfiniteCanvas({ extraNodes = [] }: { extraNodes?: Node[] }) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Sync extra nodes
    useEffect(() => {
        if (extraNodes.length > 0) {
            setNodes((nds: Node[]) => {
                const newNodes = extraNodes.filter(en => !nds.find((n: Node) => n.id === en.id));
                return [...nds, ...newNodes];
            });
        }
    }, [extraNodes, setNodes]);

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
                nodeTypes={nodeTypes}
                fitView
                className="bg-slate-50 dark:bg-slate-950"
            >
                <Controls />
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            </ReactFlow>
        </div>
    );
}
