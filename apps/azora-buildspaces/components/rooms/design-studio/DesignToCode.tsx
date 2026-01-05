"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Eye, Copy, Download, Check, Loader2, Sparkles } from "lucide-react";
import Editor from "@monaco-editor/react";

interface DesignToCodeProps {
    frameData: any;
    onClose: () => void;
}

export default function DesignToCode({ frameData, onClose }: DesignToCodeProps) {
    const [code, setCode] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateCode = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/design/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ frameData })
            });
            const data = await response.json();
            if (data.code) {
                setCode(data.code);
            }
        } catch (error) {
            console.error("Generation failed", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-5xl h-[80vh] bg-slate-900 border-white/10 flex flex-col overflow-hidden">
                <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-white">AI Design-to-Code</CardTitle>
                            <p className="text-xs text-slate-400">Generating React components from {frameData.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!code && (
                            <Button 
                                onClick={generateCode} 
                                disabled={isGenerating}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing Design...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Code
                                    </>
                                )}
                            </Button>
                        )}
                        <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
                            Close
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden">
                    {!code ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border border-white/5">
                                <Code2 className="w-10 h-10 text-slate-500" />
                            </div>
                            <div className="max-w-md space-y-2">
                                <h3 className="text-xl font-semibold text-white">Ready to transform your design?</h3>
                                <p className="text-slate-400">
                                    Our AI agent will analyze the layout, colors, and components of your Figma frame to generate a production-ready React component.
                                </p>
                            </div>
                            <Button 
                                size="lg" 
                                onClick={generateCode} 
                                disabled={isGenerating}
                                className="bg-blue-600 hover:bg-blue-700 px-8"
                            >
                                {isGenerating ? "Processing..." : "Start Generation"}
                            </Button>
                        </div>
                    ) : (
                        <Tabs defaultValue="code" className="h-full flex flex-col">
                            <div className="px-4 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
                                <TabsList className="bg-transparent border-none">
                                    <TabsTrigger value="code" className="data-[state=active]:bg-white/5">
                                        <Code2 className="w-4 h-4 mr-2" />
                                        Code
                                    </TabsTrigger>
                                    <TabsTrigger value="preview" className="data-[state=active]:bg-white/5">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview
                                    </TabsTrigger>
                                </TabsList>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-slate-400">
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-slate-400">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <TabsContent value="code" className="flex-1 m-0 p-0 overflow-hidden">
                                <Editor
                                    height="100%"
                                    defaultLanguage="typescript"
                                    theme="vs-dark"
                                    value={code}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        padding: { top: 20 }
                                    }}
                                />
                            </TabsContent>

                            <TabsContent value="preview" className="flex-1 m-0 p-4 bg-slate-950 overflow-auto">
                                <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-md mx-auto">
                                    {/* In a real app, we would use a sandboxed iframe or dynamic component rendering */}
                                    <div className="p-8 text-center space-y-4">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                            <Eye className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h4 className="text-slate-900 font-bold">Live Preview</h4>
                                        <p className="text-slate-500 text-sm">
                                            The generated component is ready. In the full version, you can interact with it here.
                                        </p>
                                        <div className="pt-4 border-t border-slate-100">
                                            <div className="text-xs text-slate-400 mb-2 uppercase font-bold">Detected Elements</div>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                <span className="px-2 py-1 bg-slate-100 rounded text-[10px]">Card</span>
                                                <span className="px-2 py-1 bg-slate-100 rounded text-[10px]">Input x2</span>
                                                <span className="px-2 py-1 bg-slate-100 rounded text-[10px]">Button</span>
                                                <span className="px-2 py-1 bg-slate-100 rounded text-[10px]">Lucide Icons</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
