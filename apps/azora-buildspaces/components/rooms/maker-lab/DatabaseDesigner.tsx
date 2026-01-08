"use client";

import { useState, useCallback, useEffect } from "react";
// Preview: visual-only; reactflow types may not be available in all environments
// @ts-ignore - reactflow is an optional dev dependency for the visual designer
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
import { Plus, Save, Database, Table, RefreshCw, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableSchema {
  id: string;
  name: string;
  columns: ColumnSchema[];
  position: { x: number; y: number };
}

interface ColumnSchema {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
}

const initialNodes: Node[] = [
    // Start with empty state - tables will be loaded from database or created dynamically
];

const initialEdges: Edge[] = [];

export default function DatabaseDesigner({ projectName }: { projectName: string }) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [tables, setTables] = useState<TableSchema[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateTable, setShowCreateTable] = useState(false);
    const [newTableName, setNewTableName] = useState("");

    // Load existing schema from database
    useEffect(() => {
        loadSchema();
    }, [projectName]);

    const loadSchema = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/maker-lab/schema?project=${encodeURIComponent(projectName)}`);
            if (response.ok) {
                const data = await response.json();
                setTables(data.tables || []);

                // Convert tables to ReactFlow nodes
                const flowNodes: Node[] = (data.tables || []).map((table: TableSchema) => ({
                    id: table.id,
                    data: {
                        label: (
                            <div className="p-2 bg-slate-800 border border-slate-600 rounded text-white text-sm">
                                <div className="font-bold mb-2">{table.name}</div>
                                {table.columns.map(col => (
                                    <div key={col.id} className="text-xs">
                                        {col.primaryKey && '🔑 '}{col.name}: {col.type}
                                        {col.foreignKey && ' → ' + col.foreignKey.table + '.' + col.foreignKey.column}
                                    </div>
                                ))}
                            </div>
                        )
                    },
                    position: table.position,
                    style: { background: "#1e293b", color: "#fff", border: "1px solid #3b82f6", borderRadius: "8px" }
                }));
                setNodes(flowNodes);
            }
        } catch (error) {
            console.error('Failed to load schema:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
        [setEdges]
    );

    const addTable = () => {
        setShowCreateTable(true);
    };

    const createTable = async () => {
        if (!newTableName.trim()) return;

        try {
            const response = await fetch('/api/maker-lab/schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project: projectName,
                    table: {
                        name: newTableName,
                        columns: [
                            { name: 'id', type: 'SERIAL', primaryKey: true, nullable: false },
                            { name: 'created_at', type: 'TIMESTAMP', nullable: false },
                            { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
                        ],
                        position: { x: Math.random() * 400, y: Math.random() * 400 }
                    }
                })
            });

            if (response.ok) {
                setNewTableName("");
                setShowCreateTable(false);
                loadSchema(); // Reload schema
            }
        } catch (error) {
            console.error('Failed to create table:', error);
        }
    };

    const saveSchema = async () => {
        try {
            const response = await fetch('/api/maker-lab/schema', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project: projectName,
                    tables,
                    nodes,
                    edges
                })
            });

            if (response.ok) {
                alert('Schema saved successfully!');
            }
        } catch (error) {
            console.error('Failed to save schema:', error);
            alert('Failed to save schema');
        }
    };

    const exportSchema = () => {
        const schema = {
            project: projectName,
            tables,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}-schema.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Schema Designer</span>
                    {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={addTable}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Table
                    </Button>
                    <Button size="sm" variant="outline" onClick={exportSchema}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button size="sm" variant="default" onClick={saveSchema}>
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

            {/* Create Table Dialog */}
            <Dialog open={showCreateTable} onOpenChange={setShowCreateTable}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Table</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="table-name">Table Name</Label>
                            <Input
                                id="table-name"
                                value={newTableName}
                                onChange={(e) => setNewTableName(e.target.value)}
                                placeholder="Enter table name"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowCreateTable(false)}>
                                Cancel
                            </Button>
                            <Button onClick={createTable}>
                                Create Table
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
