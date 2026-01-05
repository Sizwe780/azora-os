"use client";

import { AppLayout, GradientText, Button, AIFamilyChat } from "@azora/shared-design";
import { Play, Save, FolderOpen, Terminal, FileCode } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { PredAISensorOverlay } from "../components/PredAISensorOverlay";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function CodeChamber() {
    const [code, setCode] = useState(`// Welcome to the Code Chamber
// Your AI-powered development environment

function greet(name: string): string {
  return \`Hello, \${name}! Welcome to Azora BuildSpaces.\`;
}

console.log(greet("Builder"));
`);

    const [language, setLanguage] = useState("typescript");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput("Running code...");
        
        try {
            // In a production environment, this would call a secure sandbox service
            // For now, we'll use a dedicated API endpoint that handles execution
            const response = await fetch('/api/buildspaces/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            });

            const data = await response.json();
            
            if (data.error) {
                setOutput(`Error: ${data.error}`);
            } else {
                setOutput(data.output || "Code executed successfully (no output).");
            }
        } catch (error) {
            setOutput(`Execution failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <AppLayout appName="Code Chamber" userName="Builder">
            <div className="h-[calc(100vh-4rem)] flex flex-col">
                {/* Toolbar */}
                <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">
                            <GradientText>Code Chamber</GradientText>
                        </h1>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
                        >
                            <option value="typescript">TypeScript</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="rust">Rust</option>
                            <option value="go">Go</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <FolderOpen className="w-4 h-4 mr-2" />
                            Open
                        </Button>
                        <Button variant="outline" size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleRunCode}>
                            <Play className="w-4 h-4 mr-2" />
                            Run
                        </Button>
                    </div>
                </div>

                {/* Editor and Sidebar */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor */}
                    <div className="flex-1 border-r border-gray-800">
                        <MonacoEditor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            options={{
                                minimap: { enabled: true },
                                fontSize: 14,
                                lineNumbers: "on",
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                            }}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="w-96 bg-gray-900 flex flex-col">
                        {/* File Explorer */}
                        <div className="border-b border-gray-800 p-4">
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <FileCode className="w-4 h-4" />
                                Files
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div className="p-2 hover:bg-gray-800 rounded cursor-pointer text-primary">
                                    📄 index.ts
                                </div>
                                <div className="p-2 hover:bg-gray-800 rounded cursor-pointer text-gray-400">
                                    📄 utils.ts
                                </div>
                                <div className="p-2 hover:bg-gray-800 rounded cursor-pointer text-gray-400">
                                    📄 types.ts
                                </div>
                            </div>
                        </div>

                        {/* Terminal Output */}
                        <div className="border-b border-gray-800 p-4">
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Output
                            </h3>
                            <div className="bg-black rounded-lg p-3 font-mono text-xs h-32 overflow-auto">
                                {output || (
                                    <span className="text-gray-500">
                                        Click "Run" to execute your code...
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* SANKOFA AI Assistant */}
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-gray-800">
                                <h3 className="font-bold">SANKOFA - Code Architect</h3>
                                <p className="text-xs text-gray-400">Your AI pair programmer</p>
                            </div>
                            <div className="flex-1">
                                <AIFamilyChat
                                    defaultAgent="sankofa"
                                    availableAgents={['sankofa', 'elara']}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PredAISensorOverlay />
        </AppLayout>
    );
}
