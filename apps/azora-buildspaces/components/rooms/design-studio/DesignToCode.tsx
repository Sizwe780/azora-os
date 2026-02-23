"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Eye, Copy, Download, Check, Loader2, Sparkles, Accessibility } from "lucide-react";
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
    const [a11yResults, setA11yResults] = useState<any>(null);
    const [isCheckingA11y, setIsCheckingA11y] = useState(false);

    const checkAccessibility = async () => {
        if (!code) return;
        setIsCheckingA11y(true);
        try {
            const response = await fetch("/api/design/a11y-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            });
            const data = await response.json();
            setA11yResults(data.results);
        } catch (error) {
            console.error("A11y check failed", error);
        } finally {
            setIsCheckingA11y(false);
        }
    };

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
                                        React Code
                                    </TabsTrigger>
                                    <TabsTrigger value="a11y" className="data-[state=active]:bg-white/5">
                                        <Accessibility className="w-4 h-4 mr-2" />
                                        Accessibility
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

                            <TabsContent value="a11y" className="flex-1 m-0 p-6 overflow-y-auto bg-slate-900">
                                <div className="max-w-3xl mx-auto space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Accessibility Check</h3>
                                            <p className="text-sm text-slate-400">Validate WCAG 2.2 compliance for the generated code.</p>
                                        </div>
                                        <Button 
                                            onClick={checkAccessibility} 
                                            disabled={isCheckingA11y}
                                            className="bg-pink-600 hover:bg-pink-700"
                                        >
                                            {isCheckingA11y ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</>
                                            ) : "Run Check"}
                                        </Button>
                                    </div>

                                    {a11yResults && (
                                        <div className="space-y-4">
                                            {a11yResults.length === 0 ? (
                                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                                                    <Check className="w-5 h-5 text-green-400" />
                                                    <span className="text-green-200">No accessibility issues found!</span>
                                                </div>
                                            ) : (
                                                a11yResults.map((issue: any, i: number) => (
                                                    <div key={i} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                        <h4 className="font-medium text-red-400 mb-1">{issue.rule}</h4>
                                                        <p className="text-sm text-red-200/80">{issue.description}</p>
                                                        {issue.suggestion && (
                                                            <div className="mt-3 p-3 bg-slate-800/50 rounded border border-white/5">
                                                                <p className="text-xs text-slate-300 font-mono">{issue.suggestion}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
