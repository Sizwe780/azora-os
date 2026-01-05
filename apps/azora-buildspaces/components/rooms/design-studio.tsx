"use client";

import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Palette, Play, Share2, Settings, Smartphone, Monitor, Tablet } from "lucide-react";

import InfiniteCanvas from "./design-studio/InfiniteCanvas";
import ComponentLibrary from "./design-studio/ComponentLibrary";
import ColorPalette from "./design-studio/ColorPalette";
import FigmaImportDialog from "./design-studio/FigmaImportDialog";
import DesignToCode from "./design-studio/DesignToCode";

export default function DesignStudio() {
    const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [importedNodes, setImportedNodes] = useState<any[]>([]);
    const [activeGenerationFrame, setActiveGenerationFrame] = useState<any>(null);

    const handleFigmaImport = (data: any) => {
        const newNode = {
            id: data.id,
            type: 'frame',
            position: { x: 200, y: 200 },
            data: { 
                label: data.name, 
                width: data.width, 
                height: data.height, 
                content: (
                    <div className="space-y-4">
                        <div className="text-xs font-bold text-pink-500 uppercase tracking-wider">Figma Import</div>
                        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400">Button Component</div>
                        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400">Input Field</div>
                        <Button 
                            size="sm" 
                            className="w-full bg-pink-500 text-[10px] h-7"
                            onClick={() => setActiveGenerationFrame(data)}
                        >
                            Generate Code
                        </Button>
                    </div>
                ) 
            },
            style: { width: 300, height: 400 }
        };
        setImportedNodes(prev => [...prev, newNode]);
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Toolbar */}
            <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-2 py-1 bg-pink-500/10 text-pink-500 rounded-md border border-pink-500/20">
                        <Palette className="w-4 h-4" />
                        <span className="text-sm font-medium">Design Studio</span>
                    </div>
                    <span className="text-muted-foreground text-sm">/</span>
                    <span className="text-sm font-medium">Project: Azora Mobile App</span>
                </div>

                <div className="flex items-center gap-4">
                    <FigmaImportDialog onImport={handleFigmaImport} />
                    
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
                        <Button
                            size="icon"
                            variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
                            className="h-7 w-7"
                            onClick={() => setViewMode('desktop')}
                        >
                            <Monitor className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant={viewMode === 'tablet' ? 'secondary' : 'ghost'}
                            className="h-7 w-7"
                            onClick={() => setViewMode('tablet')}
                        >
                            <Tablet className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
                            className="h-7 w-7"
                            onClick={() => setViewMode('mobile')}
                        >
                            <Smartphone className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button size="sm" className="gap-2 bg-pink-500 hover:bg-pink-600 text-white">
                        <Play className="w-4 h-4" />
                        Preview
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">

                    {/* Left Panel: Components */}
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
                        <ComponentLibrary />
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Middle Panel: Canvas */}
                    <ResizablePanel defaultSize={60} minSize={30}>
                        <div className="h-full relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                            <InfiniteCanvas extraNodes={importedNodes} />

                            {/* Viewport Overlay */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-xs backdrop-blur pointer-events-none">
                                {viewMode === 'desktop' && '1920 x 1080'}
                                {viewMode === 'tablet' && '768 x 1024'}
                                {viewMode === 'mobile' && '375 x 812'}
                            </div>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Right Panel: Properties & Colors */}
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
                        <ColorPalette />
                    </ResizablePanel>

                </ResizablePanelGroup>
            </div>

            {activeGenerationFrame && (
                <DesignToCode 
                    frameData={activeGenerationFrame} 
                    onClose={() => setActiveGenerationFrame(null)} 
                />
            )}
        </div>
    );
}
