"use client";

import { useState, useCallback } from "react";
import ReactFlow, { 
    Background, 
    Controls, 
    useNodesState, 
    useEdgesState, 
    addEdge, 
    Connection, 
    Edge, 
    Node,
    BackgroundVariant
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Plus, Save, Database, Table } from "lucide-react";

const initialNodes: Node[] = [
    {
        id: "user",
        type: "default",
        data: { label: "User (id, email, password, name)" },
        position: { x: 100, y: 100 },
        style: { background: "#1e293b", color: "#fff", border: "1px solid #3b82f6", borderRadius: "8px" }
    },
    {
        id: "post",
        type: "default",
        data: { label: "Post (id, title, content, authorId)" },
        position: { x: 400, y: 100 },
        style: { background: "#1e293b", color: "#fff", border: "1px solid #3b82f6", borderRadius: "8px" }
    }
];

const initialEdges: Edge[] = [
    { id: "e-user-post", source: "user", target: "post", label: "1:N", animated: true }
];

export default function DatabaseDesigner({ projectName }: { projectName: string }) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const addTable = () => {
        const id = `table_${Date.now()}`;
        const newNode: Node = {
            id,
            data: { label: "NewTable (id, created_at)" },
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            style: { background: "#1e293b", color: "#fff", border: "1px solid #3b82f6", borderRadius: "8px" }
        };
        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Schema Designer</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={addTable}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Table
                    </Button>
                    <Button size="sm" variant="default">
                        <Save className="w-4 h-4 mr-2" />
                        Save Schema
                    </Button>
                </div>
            </div>
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}
