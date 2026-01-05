"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Palette,
    MousePointer2,
    Type,
    Layers,
    Image as ImageIcon,
    Share2,
    Settings,
    MessageSquarePlus,
    Figma,
    Download,
    Upload,
    Code2,
    Zap,
    Eye,
    Copy,
    RotateCcw,
    Move,
    Square,
    Circle,
    Triangle,
    Minus,
    Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function DesignStudio() {
    const [selectedTool, setSelectedTool] = useState("select")
    const [annotations, setAnnotations] = useState<{ x: number, y: number, text: string }[]>([])
    const [activeTab, setActiveTab] = useState("design")
    const [isGeneratingCode, setIsGeneratingCode] = useState(false)
    const [generatedCode, setGeneratedCode] = useState("")
    const [components, setComponents] = useState([
        { id: "button", name: "Button", category: "UI", preview: "bg-blue-500 text-white px-4 py-2 rounded" },
        { id: "input", name: "Input", category: "Form", preview: "border border-gray-300 px-3 py-2 rounded" },
        { id: "card", name: "Card", category: "Layout", preview: "bg-white border border-gray-200 rounded-lg p-4 shadow" },
        { id: "avatar", name: "Avatar", category: "UI", preview: "w-10 h-10 bg-gray-300 rounded-full" },
        { id: "badge", name: "Badge", category: "UI", preview: "bg-red-500 text-white px-2 py-1 rounded-full text-xs" },
        { id: "tabs", name: "Tabs", category: "Navigation", preview: "flex border-b border-gray-200" },
        { id: "modal", name: "Modal", category: "Overlay", preview: "bg-white border rounded-lg shadow-lg p-6" },
        { id: "dropdown", name: "Dropdown", category: "UI", preview: "border border-gray-300 rounded px-3 py-2" },
        { id: "table", name: "Table", category: "Data", preview: "border border-gray-200 rounded" },
        { id: "chart", name: "Chart", category: "Data", preview: "bg-gray-100 rounded flex items-center justify-center" },
        { id: "form", name: "Form", category: "Form", preview: "space-y-4 p-4 border rounded" },
        { id: "navigation", name: "Navigation", category: "Navigation", preview: "bg-gray-800 text-white p-4" },
    ])

    const designTools = [
        { id: "select", icon: MousePointer2, name: "Select" },
        { id: "move", icon: Move, name: "Move" },
        { id: "rectangle", icon: Square, name: "Rectangle" },
        { id: "circle", icon: Circle, name: "Circle" },
        { id: "triangle", icon: Triangle, name: "Triangle" },
        { id: "line", icon: Minus, name: "Line" },
        { id: "text", icon: Type, name: "Text" },
        { id: "comment", icon: MessageSquarePlus, name: "Comment" },
        { id: "image", icon: ImageIcon, name: "Image" },
    ]

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (selectedTool === "comment") {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            setAnnotations([...annotations, { x, y, text: "New comment" }])
        }
    }

    const handleFigmaImport = () => {
        // Simulate Figma import
        console.log("Importing from Figma...")
    }

    const handleGenerateCode = () => {
        setIsGeneratingCode(true)
        // Simulate design-to-code conversion
        setTimeout(() => {
            setGeneratedCode(`import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'

export default function GeneratedComponent() {
  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="w-12 h-12">
          <Avatar.Image src="/avatar.jpg" alt="User" />
          <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">John Doe</h3>
          <p className="text-sm text-muted-foreground">Software Engineer</p>
        </div>
      </div>
      <Button className="w-full">View Profile</Button>
    </Card>
  )
}`)
            setIsGeneratingCode(false)
            setActiveTab("code")
        }, 3000)
    }

    const handleComponentDrag = (componentId: string) => {
        // Handle component drag to canvas
        console.log("Dragging component:", componentId)
        // In a real implementation, this would add the component to the canvas
    }

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 relative overflow-hidden">
            {/* Background Gradients (Silk Effect) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
            </div>

            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/5 backdrop-blur-xl z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
                        <Palette className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg tracking-tight">Design Studio</h1>
                        <p className="text-xs text-zinc-400">Interactive Prototyping & Annotation</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleFigmaImport} className="gap-2 border-white/10 hover:bg-white/5">
                        <Figma className="w-4 h-4" />
                        Import from Figma
                    </Button>
                    <Button size="sm" onClick={handleGenerateCode} disabled={isGeneratingCode} className="gap-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                        <Code2 className="w-4 h-4" />
                        {isGeneratingCode ? "Generating..." : "Generate Code"}
                    </Button>
                    <div className="flex items-center bg-zinc-900/50 rounded-full p-1 border border-white/5">
                        <div className="flex -space-x-2 px-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-900 bg-zinc-800" />
                            ))}
                        </div>
                        <span className="text-xs text-zinc-400 px-2">3 active</span>
                    </div>
                    <Button size="sm" variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden z-10">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="border-b border-white/5 px-4 py-2">
                        <TabsList className="bg-white/5">
                            <TabsTrigger value="design" className="gap-2">
                                <Palette className="w-4 h-4" />
                                Design
                            </TabsTrigger>
                            <TabsTrigger value="components" className="gap-2">
                                <Layers className="w-4 h-4" />
                                Components
                            </TabsTrigger>
                            <TabsTrigger value="code" className="gap-2" disabled={!generatedCode}>
                                <Code2 className="w-4 h-4" />
                                Generated Code
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="design" className="flex-1 m-0 flex">
                        {/* Toolbar */}
                        <div className="w-16 border-r border-white/5 bg-white/5 backdrop-blur-md flex flex-col items-center py-6 gap-2">
                            {designTools.map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => setSelectedTool(tool.id)}
                                    className={`p-3 rounded-xl transition-all duration-300 group relative ${
                                        selectedTool === tool.id
                                            ? "bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/25 scale-110"
                                            : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                                    }`}
                                    title={tool.name}
                                >
                                    <tool.icon className="w-5 h-5" />
                                </button>
                            ))}
                        </div>

                        {/* Canvas */}
                        <div className="flex-1 bg-zinc-900/50 relative overflow-hidden flex items-center justify-center">
                            <div
                                className="w-[900px] h-[700px] bg-zinc-950 rounded-lg shadow-2xl border border-white/5 relative cursor-crosshair group"
                                onClick={handleCanvasClick}
                            >
                                {/* Grid Pattern */}
                                <div className="absolute inset-0 opacity-20"
                                    style={{ backgroundImage: "radial-gradient(#444 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                                />

                                {/* Canvas Content Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-zinc-500">
                                        <Palette className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <h3 className="text-lg font-medium mb-2">Start Designing</h3>
                                        <p className="text-sm">Select a tool and click on the canvas to begin</p>
                                    </div>
                                </div>

                                {/* Annotations */}
                                <AnimatePresence>
                                    {annotations.map((annotation, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute w-4 h-4 bg-yellow-400 rounded-full cursor-pointer"
                                            style={{ left: annotation.x - 8, top: annotation.y - 8 }}
                                            title={annotation.text}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                {annotation.text}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Properties Panel */}
                        <div className="w-64 border-l border-white/5 bg-white/5 backdrop-blur-md p-4">
                            <h3 className="text-sm font-medium mb-4">Properties</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-zinc-400 block mb-2">Background</label>
                                    <div className="flex gap-2">
                                        <div className="w-6 h-6 rounded bg-white border border-zinc-600 cursor-pointer"></div>
                                        <div className="w-6 h-6 rounded bg-gray-100 border border-zinc-600 cursor-pointer"></div>
                                        <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-600 cursor-pointer"></div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 block mb-2">Border Radius</label>
                                    <input type="range" min="0" max="20" className="w-full" />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 block mb-2">Shadow</label>
                                    <select className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm">
                                        <option>None</option>
                                        <option>Small</option>
                                        <option>Medium</option>
                                        <option>Large</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="components" className="flex-1 m-0">
                        <div className="flex-1 flex">
                            {/* Component Library */}
                            <div className="flex-1 p-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold mb-2">Component Library</h2>
                                    <p className="text-zinc-400">Drag components onto your design canvas</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {components.map((component) => (
                                        <Card key={component.id} className="cursor-move hover:shadow-lg transition-shadow">
                                            <CardHeader className="pb-2">
                                                <Badge variant="outline" className="w-fit text-xs">
                                                    {component.category}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent>
                                                <div className={`h-16 rounded border flex items-center justify-center text-xs ${component.preview}`}>
                                                    {component.name}
                                                </div>
                                                <p className="text-sm font-medium mt-2">{component.name}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="code" className="flex-1 m-0">
                        <div className="flex-1 p-6">
                            {isGeneratingCode ? (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-4"></div>
                                    <div className="text-sm text-zinc-400 mb-2">Converting design to code...</div>
                                    <Progress value={75} className="w-48" />
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold">Generated React Component</h2>
                                        <Button size="sm" className="gap-2">
                                            <Copy className="w-4 h-4" />
                                            Copy Code
                                        </Button>
                                    </div>
                                    <pre className="bg-zinc-900 p-4 rounded-lg text-sm overflow-auto max-h-96">
                                        <code>{generatedCode}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
