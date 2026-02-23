"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Palette,
    Play,
    Share2,
    Settings,
    Smartphone,
    Monitor,
    Tablet,
    Loader2,
    Users,
    GitBranch,
    Layers,
    Zap,
    Eye,
    Code,
    Save,
    Undo,
    Redo,
    Sparkles,
    Wand2,
    Accessibility,
    Layout,
    RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import InfiniteCanvas from "./design-studio/InfiniteCanvas";
import ComponentLibrary from "./design-studio/ComponentLibrary";
import ColorPalette from "./design-studio/ColorPalette";
import FigmaImportDialog from "./design-studio/FigmaImportDialog";
import DesignToCode from "./design-studio/DesignToCode";
import DesignSystemManager from "./design-studio/DesignSystemManager";
import VersionHistory from "./design-studio/VersionHistory";
import CollaborationPanel from "./design-studio/CollaborationPanel";
import PrototypePlayer from "./design-studio/PrototypePlayer";
import { useWorkspace } from "@/lib/contexts/workspace-context";

export default function DesignStudio() {
    const { activeRoom } = useWorkspace();
    const pathname = usePathname();
    const projectId = useMemo(() => {
        const parts = pathname?.split("/").filter(Boolean) ?? []
        return parts[parts.length - 1] || "default"
    }, [pathname])
    const activeProject = useMemo(() => ({ id: projectId, name: projectId }), [projectId]);
    
    const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [importedNodes, setImportedNodes] = useState<any[]>([]);
    const [activeGenerationFrame, setActiveGenerationFrame] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('canvas');
    const [collaborators, setCollaborators] = useState(3);
    const [isSaved, setIsSaved] = useState(true);
    const [showCollaboration, setShowCollaboration] = useState(false);

    // AI Design Generation
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResult, setAiResult] = useState<any>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiAction, setAiAction] = useState<'generate-component' | 'generate-palette' | 'audit-accessibility' | 'suggest-layout'>('generate-component');

    const runAiAction = async () => {
        if (isGeneratingAI) return;
        setIsGeneratingAI(true);
        setAiResult(null);
        try {
            const resp = await fetch('/api/design/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: aiAction, prompt: aiPrompt || 'A modern dashboard card component', framework: 'react-tailwind' }),
            });
            if (resp.ok) {
                setAiResult(await resp.json());
            }
        } catch (err) {
            console.error('AI design action failed:', err);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // Load project design frames from API
    useEffect(() => {
        const loadFrames = async () => {
            if (!activeProject?.id) return;
            setIsLoading(true);
            try {
                const resp = await fetch(`/api/design/frames?projectId=${activeProject.id}`);
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.frames) {
                        const nodes = data.frames.map((frame: any) => ({
                            id: frame.id,
                            type: 'frame',
                            position: frame.position || { x: 200, y: 200 },
                            data: {
                                label: frame.name,
                                width: frame.width,
                                height: frame.height,
                                content: (
                                    <div className="space-y-4">
                                        <div className="text-xs font-bold text-pink-500 uppercase tracking-wider">Design Frame</div>
                                        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400">
                                            {frame.name} Preview
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full bg-pink-500 text-[10px] h-7"
                                            onClick={() => setActiveGenerationFrame(frame)}
                                        >
                                            Generate Code
                                        </Button>
                                    </div>
                                )
                            },
                            style: { width: frame.width, height: frame.height }
                        }));
                        setImportedNodes(nodes);
                    }
                }
            } catch (error) {
                console.error('Failed to load frames:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadFrames();
    }, [activeProject?.id]);

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
            {/* Enhanced Toolbar */}
            <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-pink-500/10 text-pink-500 rounded-lg border border-pink-500/20">
                        <Palette className="w-5 h-5" />
                        <span className="text-sm font-medium">Design Studio</span>
                    </div>

                    <span className="text-muted-foreground">/</span>

                    <span className="text-sm font-medium">{activeProject?.name || 'Untitled Project'}</span>

                    {/* Collaboration Status */}
                    <div className="flex items-center gap-2 ml-4">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowCollaboration(!showCollaboration)}
                            className="gap-2"
                        >
                            <Users className="w-4 h-4" />
                            {collaborators} online
                        </Button>

                        {/* Save Status */}
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${isSaved ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                            <span className="text-xs text-muted-foreground">
                                {isSaved ? 'Saved' : 'Saving...'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Undo/Redo */}
                    <div className="flex items-center gap-1 mr-2">
                        <Button size="sm" variant="ghost">
                            <Undo className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                            <Redo className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg mr-2">
                        <Button
                            size="sm"
                            variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('desktop')}
                        >
                            <Monitor className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('tablet')}
                        >
                            <Tablet className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('mobile')}
                        >
                            <Smartphone className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                    </Button>

                    <Button size="sm" variant="outline" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>

                    <Button size="sm" className="gap-2 bg-pink-500 hover:bg-pink-600">
                        <Save className="w-4 h-4" />
                        Publish
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList className="grid w-full grid-cols-6 h-12 rounded-none border-b">
                        <TabsTrigger value="canvas" className="gap-2">
                            <Layers className="w-4 h-4" />
                            Canvas
                        </TabsTrigger>
                        <TabsTrigger value="components" className="gap-2">
                            <Zap className="w-4 h-4" />
                            Components
                        </TabsTrigger>
                        <TabsTrigger value="ai-generate" className="gap-2">
                            <Sparkles className="w-4 h-4" />
                            AI Generate
                        </TabsTrigger>
                        <TabsTrigger value="design-system" className="gap-2">
                            <Palette className="w-4 h-4" />
                            Design System
                        </TabsTrigger>
                        <TabsTrigger value="prototype" className="gap-2">
                            <Play className="w-4 h-4" />
                            Prototype
                        </TabsTrigger>
                        <TabsTrigger value="version-history" className="gap-2">
                            <GitBranch className="w-4 h-4" />
                            History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="canvas" className="h-full m-0">
                        <ResizablePanelGroup direction="horizontal">
                            {/* Left Sidebar */}
                            <ResizablePanel defaultSize={20} minSize={15}>
                                <div className="h-full border-r bg-muted/10">
                                    <Tabs defaultValue="layers" className="h-full">
                                        <TabsList className="grid w-full grid-cols-2 h-10 rounded-none">
                                            <TabsTrigger value="layers">Layers</TabsTrigger>
                                            <TabsTrigger value="assets">Assets</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="layers" className="h-full m-0 p-4">
                                            <div className="text-center text-muted-foreground py-8">
                                                <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Layer management</p>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="assets" className="h-full m-0 p-4">
                                            <ComponentLibrary />
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            {/* Main Canvas */}
                            <ResizablePanel defaultSize={60} minSize={30}>
                                <div className="h-full relative">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                        </div>
                                    ) : (
                                        <InfiniteCanvas
                                            extraNodes={importedNodes}
                                        />
                                    )}
                                </div>
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            {/* Right Sidebar */}
                            <ResizablePanel defaultSize={20} minSize={15}>
                                <div className="h-full border-l bg-muted/10">
                                    <Tabs defaultValue="properties" className="h-full">
                                        <TabsList className="grid w-full grid-cols-2 h-10 rounded-none">
                                            <TabsTrigger value="properties">Properties</TabsTrigger>
                                            <TabsTrigger value="code">Code</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="properties" className="h-full m-0 p-4">
                                            <ColorPalette />
                                        </TabsContent>
                                        <TabsContent value="code" className="h-full m-0 p-4">
                                            <DesignToCode
                                                frameData={activeGenerationFrame}
                                                onClose={() => setActiveGenerationFrame(null)}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </TabsContent>

                    <TabsContent value="components" className="h-full m-0 p-4">
                        <ComponentLibrary />
                    </TabsContent>

                    <TabsContent value="ai-generate" className="h-full m-0 p-6 overflow-y-auto">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-400 text-xs font-medium">
                                    <Sparkles className="w-3.5 h-3.5" /> AI-Powered Design
                                </div>
                                <h2 className="text-lg font-semibold">Generate with AI</h2>
                                <p className="text-sm text-muted-foreground">Describe what you need and let AI create it for you</p>
                            </div>

                            {/* Action Selector */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { key: 'generate-component' as const, icon: Wand2, label: 'Component', desc: 'React + Tailwind with accessibility' },
                                    { key: 'generate-palette' as const, icon: Palette, label: 'Color Palette', desc: 'WCAG AA compliant palettes' },
                                    { key: 'audit-accessibility' as const, icon: Accessibility, label: 'A11y Audit', desc: 'WCAG 2.2 compliance check' },
                                    { key: 'suggest-layout' as const, icon: Layout, label: 'Layout', desc: 'Responsive layout suggestions' },
                                ].map(a => (
                                    <button
                                        key={a.key}
                                        onClick={() => setAiAction(a.key)}
                                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                            aiAction === a.key
                                                ? 'border-pink-500/50 bg-pink-500/10 text-pink-400'
                                                : 'border-border/50 hover:border-border bg-muted/20 text-muted-foreground'
                                        }`}
                                    >
                                        <a.icon className="w-5 h-5 shrink-0" />
                                        <div>
                                            <div className="text-sm font-medium">{a.label}</div>
                                            <div className="text-xs opacity-60">{a.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Prompt Input */}
                            <div className="space-y-2">
                                <Textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder={
                                        aiAction === 'generate-component' ? 'e.g. A pricing card with monthly/yearly toggle, feature list, and CTA button'
                                        : aiAction === 'generate-palette' ? 'e.g. A warm, earthy color palette for a wellness app'
                                        : aiAction === 'audit-accessibility' ? 'Paste your component HTML/JSX here to audit...'
                                        : 'e.g. A two-column dashboard with sidebar navigation, header, and main content area'
                                    }
                                    className="min-h-[80px] resize-none"
                                />
                                <Button
                                    onClick={runAiAction}
                                    disabled={isGeneratingAI}
                                    className="w-full gap-2 bg-pink-500 hover:bg-pink-600"
                                >
                                    {isGeneratingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {isGeneratingAI ? 'Generating…' : 'Generate'}
                                </Button>
                            </div>

                            {/* AI Result */}
                            {aiResult && (
                                <div className="space-y-3">
                                    {aiResult.code && (
                                        <div className="rounded-lg border bg-muted/20 overflow-hidden">
                                            <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">Generated Code</span>
                                                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => navigator.clipboard.writeText(aiResult.code)}>Copy</Button>
                                            </div>
                                            <pre className="p-3 text-xs overflow-x-auto max-h-60"><code>{aiResult.code}</code></pre>
                                        </div>
                                    )}
                                    {aiResult.colors && (
                                        <div className="space-y-2">
                                            <span className="text-xs font-medium text-muted-foreground">Palette</span>
                                            <div className="flex gap-2">
                                                {aiResult.colors.map((c: any, i: number) => (
                                                    <div key={i} className="flex-1 text-center">
                                                        <div className="h-16 rounded-lg mb-1" style={{ backgroundColor: c.hex }} />
                                                        <div className="text-[10px] text-muted-foreground">{c.name}</div>
                                                        <div className="text-[10px] font-mono text-muted-foreground/60">{c.hex}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {aiResult.issues && (
                                        <div className="space-y-2">
                                            <span className="text-xs font-medium text-muted-foreground">Accessibility Issues ({aiResult.issues.length})</span>
                                            {aiResult.issues.map((issue: any, i: number) => (
                                                <div key={i} className="p-2 rounded-lg border bg-muted/20 text-xs">
                                                    <span className={`font-medium ${issue.severity === 'critical' ? 'text-red-400' : issue.severity === 'major' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                                        [{issue.severity}]
                                                    </span>{' '}
                                                    {issue.description}
                                                    {issue.fix && <div className="mt-1 text-muted-foreground">Fix: {issue.fix}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {aiResult.layout && (
                                        <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                                            <span className="text-xs font-medium text-muted-foreground">Layout: {aiResult.layout.name}</span>
                                            <p className="text-xs text-muted-foreground/80">{aiResult.layout.description}</p>
                                            {aiResult.layout.code && (
                                                <pre className="p-2 bg-muted/30 rounded text-xs overflow-x-auto max-h-40"><code>{aiResult.layout.code}</code></pre>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="design-system" className="h-full m-0 p-4">
                        <DesignSystemManager />
                    </TabsContent>

                    <TabsContent value="prototype" className="h-full m-0 p-4">
                        <PrototypePlayer />
                    </TabsContent>

                    <TabsContent value="version-history" className="h-full m-0 p-4">
                        <VersionHistory />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Collaboration Panel Overlay */}
            {showCollaboration && (
                <div className="absolute top-14 right-4 w-80 bg-background border rounded-lg shadow-lg z-50">
                    <CollaborationPanel
                        onClose={() => setShowCollaboration(false)}
                    />
                </div>
            )}

            {/* Figma Import Dialog */}
            <FigmaImportDialog
                open={false}
                onOpenChange={() => {}}
                onImport={handleFigmaImport}
            />
        </div>
    );
}
