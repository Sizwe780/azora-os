"use client";

import { AppLayout, GradientText, Button, AIFamilyChat } from "@azora/shared-design";
import { Plus, Save, Download, Layers, Box, Database, ArrowRight } from "lucide-react";
import { useState, useCallback } from "react";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes: Node[] = [
    {
        id: "1",
        type: "input",
        data: { label: "User Interface" },
        position: { x: 250, y: 25 },
    },
    {
        id: "2",
        data: { label: "API Gateway" },
        position: { x: 250, y: 125 },
    },
    {
        id: "3",
        data: { label: "Business Logic" },
        position: { x: 250, y: 225 },
    },
    {
        id: "4",
        type: "output",
        data: { label: "Database" },
        position: { x: 250, y: 325 },
    },
];

const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e2-3", source: "2", target: "3", animated: true },
    { id: "e3-4", source: "3", target: "4", animated: true },
];

export default function DesignStudio() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedTool, setSelectedTool] = useState<string>("select");

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const tools = [
        { id: "component", name: "Component", icon: Box },
        { id: "api", name: "API", icon: ArrowRight },
        { id: "database", name: "Database", icon: Database },
        { id: "layer", name: "Layer", icon: Layers },
    ];

    return (
        <AppLayout appName="Design Studio" userName="Builder">
            <div className="h-[calc(100vh-4rem)] flex flex-col">
                {/* Toolbar */}
                <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">
                            <GradientText>Design Studio</GradientText>
                        </h1>
                        <div className="flex items-center gap-2">
                            {tools.map((tool) => {
                                const Icon = tool.icon;
                                return (
                                    <button
                                        key={tool.id}
                                        onClick={() => setSelectedTool(tool.id)}
                                        className={`p-2 rounded-lg transition-all ${selectedTool === tool.id
                                                ? "bg-primary text-white"
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                            }`}
                                        title={tool.name}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        <Button variant="primary" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Node
                        </Button>
                    </div>
                </div>

                {/* Canvas and Sidebar */}
                <div className="flex-1 flex">
                    <div className="flex-1 bg-gray-950">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            fitView
                        >
                            <Controls />
                            <MiniMap />
                            <Background gap={12} size={1} />
                        </ReactFlow>
                    </div>

                    {/* Properties and AI Panel */}
                    <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
                        {/* Properties */}
                        <div className="p-4 border-b border-gray-800">
                            <h3 className="text-sm font-bold mb-3">Properties</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Node Type</label>
                                    <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                                        <option>Component</option>
                                        <option>Service</option>
                                        <option>Database</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Label</label>
                                    <input
                                        type="text"
                                        placeholder="Enter label..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* IMANI AI Assistant */}
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-gray-800">
                                <h3 className="font-bold">IMANI - Creative Director</h3>
                                <p className="text-xs text-gray-400">Your AI design partner</p>
                            </div>
                            <div className="flex-1">
                                <AIFamilyChat
                                    defaultAgent="imani"
                                    availableAgents={['imani', 'elara']}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
