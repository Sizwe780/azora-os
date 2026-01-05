"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Plus, Trash2, Save, Send, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface WorkflowStep {
    id: string;
    agent: string;
    prompt: string;
    output?: string;
    isExecuting?: boolean;
}

const INITIAL_STEPS: WorkflowStep[] = [
    {
        id: '1',
        agent: 'Elara',
        prompt: 'Analyze the project requirements and create a high-level architecture spec.',
        output: 'Architecture Spec: \n1. Frontend: Next.js 14\n2. Backend: Node.js + Prisma\n3. Auth: NextAuth.js'
    },
    {
        id: '2',
        agent: 'Sankofa',
        prompt: 'Generate the core authentication components based on the spec.',
    }
];

export default function AgentWorkflowEditor() {
    const [steps, setSteps] = useState<WorkflowStep[]>(INITIAL_STEPS);

    const addStep = () => {
        setSteps([...steps, {
            id: Date.now().toString(),
            agent: 'Sankofa',
            prompt: '',
        }]);
    };

    const deleteStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    const executeStep = async (id: string) => {
        setSteps(steps.map(s => {
            if (s.id === id) {
                return { ...s, isExecuting: true };
            }
            return s;
        }));

        try {
            const step = steps.find(s => s.id === id);
            const response = await fetch('/api/agents/invoke', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate-code',
                    context: step?.prompt,
                })
            });

            const data = await response.json();

            setSteps(steps.map(s => {
                if (s.id === id) {
                    return {
                        ...s,
                        isExecuting: false,
                        output: data.result || data.error
                    };
                }
                return s;
            }));
        } catch (error) {
            setSteps(steps.map(s => {
                if (s.id === id) {
                    return {
                        ...s,
                        isExecuting: false,
                        output: "Error: Failed to connect to agent."
                    };
                }
                return s;
            }));
        }
    };

    const updateStepPrompt = (id: string, prompt: string) => {
        setSteps(steps.map(s => s.id === id ? { ...s, prompt } : s));
    };

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-2 border-b flex items-center justify-between bg-card">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold px-2">Agent Workflow: Auth Scaffolding</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={addStep} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Step
                    </Button>
                    <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
                        <Save className="w-4 h-4" />
                        Save Workflow
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {steps.map((step, index) => (
                    <div key={step.id} className="group relative border rounded-lg bg-card shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-muted-foreground">STEP {index + 1}</span>
                                <select 
                                    className="bg-transparent text-sm font-medium focus:outline-none"
                                    value={step.agent}
                                    onChange={(e) => {
                                        const newSteps = [...steps];
                                        newSteps[index].agent = e.target.value;
                                        setSteps(newSteps);
                                    }}
                                >
                                    <option>Elara</option>
                                    <option>Sankofa</option>
                                    <option>Themba</option>
                                    <option>Jabari</option>
                                    <option>Nia</option>
                                    <option>Imani</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => executeStep(step.id)}>
                                    <Play className="w-3.5 h-3.5 text-green-500" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteStep(step.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-0 h-[150px]">
                            <MonacoEditor
                                height="100%"
                                language="markdown"
                                theme="vs-dark"
                                value={step.prompt}
                                onChange={(val) => updateStepPrompt(step.id, val || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: 'off',
                                    glyphMargin: false,
                                    folding: false,
                                    lineDecorationsWidth: 0,
                                    lineNumbersMinChars: 0,
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on'
                                }}
                            />
                        </div>

                        {step.output && (
                            <div className="p-4 bg-muted/10 border-t font-mono text-xs whitespace-pre-wrap">
                                <div className="flex items-center gap-2 mb-2 text-muted-foreground uppercase tracking-wider font-bold">
                                    <Send className="w-3 h-3" />
                                    Output
                                </div>
                                {step.output}
                            </div>
                        )}

                        {step.isExecuting && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm font-medium">Agent Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
