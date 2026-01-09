"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Eye, Copy, Download, Check, Loader2, Sparkles } from "lucide-react";
import Editor from "@monaco-editor/react";

interface DesignToCodeProps {
    frameData: any;
    onClose: () => void;
    projectId?: string;
}

export default function DesignToCode({ frameData, onClose, projectId }: DesignToCodeProps) {
    const [code, setCode] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateCode = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/design/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    frameId: frameData.id,
                    projectId: projectId,
                    context: "Generate production-ready React + Tailwind components based on this Figma frame."
                })
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
                        <div className="p-2 bg-pink-600/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                            <CardTitle className="text-white">AI Design-to-Code</CardTitle>
                            <p className="text-xs text-slate-400">Transforming {frameData.name} into code</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                                <h3 className="text-xl font-semibold text-white">Synthesizing {frameData.name}</h3>
                                <p className="text-slate-400">
                                    Elara is ready to analyze the design tokens and structure to generate clean, accessible React code.
                                </p>
                            </div>
                            <Button 
                                size="lg" 
                                onClick={generateCode} 
                                disabled={isGenerating}
                                className="bg-pink-600 hover:bg-pink-700 px-8"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing Design...
                                    </>
                                ) : "Generate React Components"}
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
                                </TabsList>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-slate-400">
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
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
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
