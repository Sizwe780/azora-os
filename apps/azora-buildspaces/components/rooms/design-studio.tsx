"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
    RefreshCw,
    ZoomIn,
    ZoomOut,
    Download,
    ChevronDown,
    ChevronRight,
    Search,
    Plus,
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

// ─── Design Token Data ───────────────────────────────────────────────────────
const DESIGN_COLORS = [
    { name: "Primary",   hex: "#ec4899" },
    { name: "Secondary", hex: "#8b5cf6" },
    { name: "Accent",    hex: "#06b6d4" },
    { name: "Success",   hex: "#22c55e" },
    { name: "Warning",   hex: "#f59e0b" },
    { name: "Danger",    hex: "#ef4444" },
    { name: "Surface",   hex: "#1e293b" },
    { name: "Muted",     hex: "#64748b" },
];
const DESIGN_TYPOGRAPHY = [
    { name: "Display", size: "3rem",    weight: "700" },
    { name: "Heading", size: "1.5rem",  weight: "600" },
    { name: "Body",    size: "1rem",    weight: "400" },
    { name: "Caption", size: "0.75rem", weight: "400" },
];
const DESIGN_SPACING = [4, 8, 12, 16, 24, 32, 48, 64];

// ─── Frame Templates ─────────────────────────────────────────────────────────
const FRAME_TEMPLATES = [
    { label: "Mobile (375×812)",   width: 375,  height: 812  },
    { label: "Tablet (768×1024)",  width: 768,  height: 1024 },
    { label: "Desktop (1440×900)", width: 1440, height: 900  },
] as const;

// ─── Sample Components ────────────────────────────────────────────────────────
const SAMPLE_COMPONENTS = [
    { name: "Button",  category: "Basic",      icon: "🔘" },
    { name: "Input",   category: "Form",       icon: "📝" },
    { name: "Card",    category: "Layout",     icon: "🃏" },
    { name: "Modal",   category: "Overlay",    icon: "🪟" },
    { name: "Nav",     category: "Navigation", icon: "🧭" },
    { name: "Footer",  category: "Layout",     icon: "🦶" },
    { name: "Hero",    category: "Marketing",  icon: "🦸" },
    { name: "Form",    category: "Form",       icon: "📋" },
    { name: "Table",   category: "Data",       icon: "📊" },
    { name: "Badge",   category: "Basic",      icon: "🏷️" },
    { name: "Avatar",  category: "Basic",      icon: "👤" },
    { name: "Tooltip", category: "Overlay",    icon: "💬" },
];

// ─── Export Dialog (Upgrade 5) ────────────────────────────────────────────────
type ExportFormat = "PNG" | "SVG" | "PDF";
type ExportScale  = "1x" | "2x" | "3x";

function ExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
    const [format, setFormat]       = useState<ExportFormat>("PNG");
    const [scale, setScale]         = useState<ExportScale>("1x");
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        await new Promise(r => setTimeout(r, 1200));
        if (format === "PNG") {
            const blob = new Blob(["placeholder-png-data"], { type: "image/png" });
            const url  = window.URL.createObjectURL(blob);
            const a    = document.createElement("a");
            a.href     = url;
            a.download = `design-export-${scale}.png`;
            a.click();
            window.URL.revokeObjectURL(url);
        }
        setIsExporting(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export Design
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium">Format</p>
                        <div className="flex gap-2">
                            {(["PNG", "SVG", "PDF"] as ExportFormat[]).map(f => (
                                <Button key={f} variant={format === f ? "default" : "outline"} size="sm"
                                    className={format === f ? "bg-pink-500 hover:bg-pink-600" : ""}
                                    onClick={() => setFormat(f)}>
                                    {f}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium">Scale</p>
                        <div className="flex gap-2">
                            {(["1x", "2x", "3x"] as ExportScale[]).map(s => (
                                <Button key={s} variant={scale === s ? "default" : "outline"} size="sm"
                                    className={scale === s ? "bg-pink-500 hover:bg-pink-600" : ""}
                                    onClick={() => setScale(s)}>
                                    {s}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>Cancel</Button>
                    <Button onClick={handleExport} disabled={isExporting} className="gap-2 bg-pink-500 hover:bg-pink-600">
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isExporting ? "Exporting…" : `Export ${format}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Design Tokens Panel (Upgrade 3) ─────────────────────────────────────────
function DesignTokensPanel() {
    const [open, setOpen]           = useState(true);
    const [tokensTab, setTokensTab] = useState<"colors" | "typography" | "spacing">("colors");

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium hover:bg-muted/30 border-b">
                    <span className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-pink-500" /> Design Tokens
                    </span>
                    {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="p-3 space-y-3">
                    <div className="flex gap-1 text-xs">
                        {(["colors", "typography", "spacing"] as const).map(t => (
                            <button key={t} onClick={() => setTokensTab(t)}
                                className={`px-2 py-1 rounded capitalize transition-colors ${
                                    tokensTab === t
                                        ? "bg-pink-500/20 text-pink-400 font-medium"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {tokensTab === "colors" && (
                        <div className="grid grid-cols-2 gap-1.5">
                            {DESIGN_COLORS.map(color => (
                                <div key={color.name} className="flex items-center gap-2 p-1.5 rounded-md bg-muted/20 hover:bg-muted/40">
                                    <div className="w-6 h-6 rounded-md shrink-0 border border-black/10" style={{ backgroundColor: color.hex }} />
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-medium truncate">{color.name}</div>
                                        <div className="text-[9px] font-mono text-muted-foreground">{color.hex}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tokensTab === "typography" && (
                        <div className="space-y-2">
                            {DESIGN_TYPOGRAPHY.map(t => (
                                <div key={t.name} className="flex items-center justify-between p-2 rounded-md bg-muted/20">
                                    <span style={{ fontSize: `clamp(0.6rem, ${t.size}, 1.5rem)`, fontWeight: Number(t.weight) }}>Aa</span>
                                    <div className="text-right">
                                        <div className="text-xs font-medium">{t.name}</div>
                                        <div className="text-[10px] text-muted-foreground">{t.size} / {t.weight}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tokensTab === "spacing" && (
                        <div className="space-y-1.5">
                            {DESIGN_SPACING.map(s => (
                                <div key={s} className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground w-8 shrink-0">{s}px</span>
                                    <div className="h-3 bg-pink-500/40 rounded-sm" style={{ width: `${Math.min(s * 2, 160)}px` }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

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

    // Upgrade 1: Zoom controls
    const [zoomLevel, setZoomLevel] = useState(100);

    // Upgrade 2: Active frame size label
    const [activeFrameLabel, setActiveFrameLabel] = useState<string | null>(null);

    // Upgrade 4: Component search
    const [componentSearch, setComponentSearch] = useState('');

    // Upgrade 5: Export dialog
    const [showExportDialog, setShowExportDialog] = useState(false);

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

    // Upgrade 2: Add frame from template
    const addFrameFromTemplate = (tpl: typeof FRAME_TEMPLATES[number] | { label: string; width: number; height: number }) => {
        const id = `frame-${Date.now()}`;
        const newNode = {
            id,
            type: 'frame',
            position: { x: 100 + importedNodes.length * 40, y: 100 },
            data: {
                label: tpl.label,
                width: tpl.width,
                height: tpl.height,
                content: (
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-pink-500 uppercase tracking-wider">{tpl.label}</div>
                        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400">
                            {tpl.width} × {tpl.height}
                        </div>
                    </div>
                ),
            },
            style: { width: tpl.width, height: tpl.height },
        };
        setImportedNodes(prev => [...prev, newNode]);
        setActiveFrameLabel(tpl.label);
    };

    // Upgrade 1: Zoom helpers
    const zoomIn  = () => setZoomLevel(z => Math.min(z + 10, 300));
    const zoomOut = () => setZoomLevel(z => Math.max(z - 10, 10));
    const zoomReset = () => setZoomLevel(100);

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
                    {/* Upgrade 2: New Frame dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1">
                                <Plus className="w-4 h-4" /> New Frame <ChevronDown className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {FRAME_TEMPLATES.map(tpl => (
                                <DropdownMenuItem key={tpl.label} onClick={() => addFrameFromTemplate(tpl)}>
                                    {tpl.label}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => addFrameFromTemplate({ label: "Custom Frame", width: 800, height: 600 })}>
                                Custom…
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                    </Button>

                    <Button size="sm" variant="outline" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>

                    {/* Upgrade 5: Export button */}
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowExportDialog(true)}>
                        <Download className="w-4 h-4" />
                        Export
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
                                <div className="h-full relative overflow-hidden">
                                    {/* Upgrade 2: Active frame indicator */}
                                    {activeFrameLabel && (
                                        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded-md border border-pink-500/30">
                                            {activeFrameLabel}
                                        </div>
                                    )}
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                        </div>
                                    ) : (
                                        <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left', width: `${10000 / zoomLevel}%`, height: `${10000 / zoomLevel}%` }}>
                                            <InfiniteCanvas
                                                extraNodes={importedNodes}
                                            />
                                        </div>
                                    )}
                                    {/* Upgrade 1: Zoom toolbar */}
                                    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 bg-background/90 border rounded-lg px-2 py-1 shadow-sm backdrop-blur-sm">
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={zoomOut} aria-label="Zoom out">
                                            <ZoomOut className="w-3.5 h-3.5" />
                                        </Button>
                                        <span className="text-xs font-mono w-10 text-center select-none">{zoomLevel}%</span>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={zoomIn} aria-label="Zoom in">
                                            <ZoomIn className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-7 px-1.5 text-xs" onClick={zoomReset}>100%</Button>
                                    </div>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            {/* Right Sidebar */}
                            <ResizablePanel defaultSize={20} minSize={15}>
                                <div className="h-full border-l bg-muted/10 overflow-y-auto">
                                    <Tabs defaultValue="properties" className="h-full">
                                        <TabsList className="grid w-full grid-cols-2 h-10 rounded-none">
                                            <TabsTrigger value="properties">Properties</TabsTrigger>
                                            <TabsTrigger value="code">Code</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="properties" className="m-0">
                                            <ColorPalette />
                                            {/* Upgrade 3: Design Tokens Panel */}
                                            <DesignTokensPanel />
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

                    <TabsContent value="components" className="h-full m-0 p-4 overflow-y-auto">
                        {/* Upgrade 4: Component Search */}
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search components…"
                                    value={componentSearch}
                                    onChange={e => setComponentSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {SAMPLE_COMPONENTS.filter(c =>
                                    c.name.toLowerCase().includes(componentSearch.toLowerCase()) ||
                                    c.category.toLowerCase().includes(componentSearch.toLowerCase())
                                ).map(comp => (
                                    <div key={comp.name}
                                        className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                                        <span className="text-lg">{comp.icon}</span>
                                        <div>
                                            <div className="text-xs font-medium">{comp.name}</div>
                                            <div className="text-[10px] text-muted-foreground">{comp.category}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4">
                                <ComponentLibrary />
                            </div>
                        </div>
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

            {/* Upgrade 5: Export Dialog */}
            <ExportDialog open={showExportDialog} onOpenChange={setShowExportDialog} />
        </div>
    );
}
