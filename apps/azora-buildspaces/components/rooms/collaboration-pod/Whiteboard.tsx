"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pen, Eraser, Square, Circle, Type, Undo, Redo, Download, Upload, Users, Palette, Minus, Plus } from "lucide-react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

interface WhiteboardProps {
    ydoc: Y.Doc;
    provider: WebsocketProvider;
}

interface Path {
    id: string;
    points: { x: number; y: number }[];
    color: string;
    size: number;
    tool: string;
}

export default function Whiteboard({ ydoc, provider }: WhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen');
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState([5]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [collaborators, setCollaborators] = useState<any[]>([]);

    const sharedPaths = ydoc.getArray<Path>("whiteboard-paths");

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            sharedPaths.forEach((path) => {
                if (path.points.length < 2) return;
                ctx.beginPath();
                ctx.strokeStyle = path.tool === 'eraser' ? '#ffffff' : path.color;
                ctx.lineWidth = path.size;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.moveTo(path.points[0].x, path.points[0].y);
                for (let i = 1; i < path.points.length; i++) {
                    ctx.lineTo(path.points[i].x, path.points[i].y);
                }
                ctx.stroke();
            });
        };

        sharedPaths.observe(render);
        render();

        // Awareness for cursors
        provider.awareness.on("change", () => {
            const states = Array.from(provider.awareness.getStates().entries());
            setCollaborators(states.map(([id, state]: [number, any]) => ({
                id,
                name: state.user?.name || "Anonymous",
                color: state.user?.color || "#3b82f6",
                cursor: state.cursor
            })).filter(c => c.cursor));
        });

        return () => {
            sharedPaths.unobserve(render);
        };
    }, [ydoc, provider]);

    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        const newPath: Path = {
            id: Math.random().toString(36).substr(2, 9),
            points: [{ x, y }],
            color,
            size: brushSize[0],
            tool
        };
        sharedPaths.push([newPath]);
    };

    const draw = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update cursor position in awareness
        provider.awareness.setLocalStateField("cursor", { x, y });

        if (!isDrawing) return;

        const lastPath = sharedPaths.get(sharedPaths.length - 1);
        if (lastPath) {
            lastPath.points.push({ x, y });
            // We need to re-push or update the array to trigger observation
            // In Yjs, modifying an object inside an array doesn't always trigger observation
            // So we replace the last element
            sharedPaths.delete(sharedPaths.length - 1);
            sharedPaths.push([lastPath]);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const tools = [
        { id: 'pen', icon: Pen, label: 'Pen' },
        { id: 'eraser', icon: Eraser, label: 'Eraser' },
        { id: 'rectangle', icon: Square, label: 'Rectangle' },
        { id: 'circle', icon: Circle, label: 'Circle' },
        { id: 'text', icon: Type, label: 'Text' },
    ];

    const colors = [
        '#000000', '#ffffff', '#ef4444', '#10b981', '#3b82f6',
        '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280', '#374151'
    ];

    return (
        <div className="h-full flex flex-col bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-white">Team Whiteboard</h3>
                    <Badge variant="secondary" className="bg-blue-600">{collaborators.length} Active</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {collaborators.map((user) => (
                            <Avatar key={user.id} className="w-8 h-8 border-2 border-slate-800">
                                <AvatarFallback className="text-xs" style={{ backgroundColor: user.color }}>
                                    {user.name[0]}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Invite
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-slate-800/50">
                {/* Tools */}
                <div className="flex gap-1">
                    {tools.map((t) => (
                        <Button
                            key={t.id}
                            variant={tool === t.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTool(t.id as any)}
                            className="w-10 h-10 p-0"
                        >
                            <t.icon className="w-4 h-4" />
                        </Button>
                    ))}
                </div>

                {/* Colors */}
                <div className="flex gap-1">
                    {colors.map((c) => (
                        <button
                            key={c}
                            className={`w-8 h-8 rounded border-2 ${color === c ? 'border-white' : 'border-slate-600'}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>

                {/* Brush Size */}
                <div className="flex items-center gap-2 min-w-32">
                    <Minus className="w-4 h-4 text-slate-400" />
                    <Slider
                        value={brushSize}
                        onValueChange={setBrushSize}
                        max={50}
                        min={1}
                        step={1}
                        className="flex-1"
                    />
                    <Plus className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400 w-8">{brushSize[0]}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-1 ml-auto">
                    <Button variant="outline" size="sm" onClick={() => sharedPaths.delete(0, sharedPaths.length)}>
                        Clear
                    </Button>
                    <Button variant="outline" size="sm">
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                        <Redo className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-white overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={800}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full cursor-crosshair"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                />

                {/* Collaborator Cursors */}
                {collaborators.map((user) => (
                    <div
                        key={user.id}
                        className="absolute pointer-events-none z-10"
                        style={{
                            left: user.cursor.x,
                            top: user.cursor.y,
                            transform: 'translate(-2px, -2px)'
                        }}
                    >
                        <div
                            className="w-4 h-4 border-2 border-white rounded-full shadow-lg"
                            style={{ backgroundColor: user.color }}
                        />
                        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {user.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}