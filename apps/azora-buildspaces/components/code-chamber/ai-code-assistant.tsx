"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Send, Lightbulb, Code, Bug, Zap } from "lucide-react"
import { useFileSystem } from "@/lib/stores/file-system"

interface AICodeAssistantProps {
    activeFile: string | null
    onClose: () => void
}

interface Suggestion {
    id: string
    type: 'improvement' | 'bug' | 'optimization' | 'feature'
    title: string
    description: string
    code?: string
    confidence: number
}

export function AICodeAssistant({ activeFile, onClose }: AICodeAssistantProps) {
    const [prompt, setPrompt] = useState("")
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const { fileMap } = useFileSystem()

    useEffect(() => {
        if (activeFile) {
            analyzeCurrentFile()
        }
    }, [activeFile])

    const analyzeCurrentFile = async () => {
        if (!activeFile) return

        setIsAnalyzing(true)
        try {
            // Simulate AI analysis - in real implementation, this would call an AI service
            const mockSuggestions: Suggestion[] = [
                {
                    id: '1',
                    type: 'improvement',
                    title: 'Add error handling',
                    description: 'Consider adding try-catch blocks for better error handling',
                    confidence: 0.85
                },
                {
                    id: '2',
                    type: 'optimization',
                    title: 'Optimize performance',
                    description: 'Use memoization for expensive calculations',
                    confidence: 0.72
                },
                {
                    id: '3',
                    type: 'bug',
                    title: 'Potential null reference',
                    description: 'Check for null values before accessing properties',
                    confidence: 0.91
                }
            ]

            setSuggestions(mockSuggestions)
        } catch (error) {
            console.error('AI analysis failed:', error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const generateCode = async () => {
        if (!prompt.trim()) return

        // Simulate AI code generation
        const newSuggestion: Suggestion = {
            id: Date.now().toString(),
            type: 'feature',
            title: 'Generated code',
            description: prompt,
            code: `// Generated code based on: ${prompt}\n\nfunction exampleFunction() {\n    // TODO: Implement functionality\n    return null;\n}`,
            confidence: 0.88
        }

        setSuggestions(prev => [newSuggestion, ...prev])
        setPrompt("")
    }

    const getTypeIcon = (type: Suggestion['type']) => {
        switch (type) {
            case 'bug': return <Bug className="w-4 h-4 text-red-500" />
            case 'improvement': return <Lightbulb className="w-4 h-4 text-yellow-500" />
            case 'optimization': return <Zap className="w-4 h-4 text-blue-500" />
            case 'feature': return <Code className="w-4 h-4 text-green-500" />
        }
    }

    const getTypeColor = (type: Suggestion['type']) => {
        switch (type) {
            case 'bug': return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'improvement': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'optimization': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'feature': return 'bg-green-500/20 text-green-400 border-green-500/30'
        }
    }

    return (
        <div className="h-full flex flex-col bg-background/95 backdrop-blur">
            {/* Header */}
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">AI Code Assistant</span>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    ×
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {/* Suggestions List */}
                <div className="h-2/3 overflow-y-auto p-4 space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium">AI Suggestions</h3>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={analyzeCurrentFile}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                        </Button>
                    </div>

                    {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    {getTypeIcon(suggestion.type)}
                                    <span className="text-sm font-medium">{suggestion.title}</span>
                                </div>
                                <Badge className={`text-xs ${getTypeColor(suggestion.type)}`}>
                                    {Math.round(suggestion.confidence * 100)}%
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                            {suggestion.code && (
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    <code>{suggestion.code}</code>
                                </pre>
                            )}
                        </div>
                    ))}

                    {suggestions.length === 0 && !isAnalyzing && (
                        <div className="text-center text-muted-foreground py-8">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No suggestions yet. Open a file to get AI assistance.</p>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="h-1/3 border-t p-4">
                    <div className="space-y-3">
                        <Textarea
                            placeholder="Describe what you want to implement..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-[80px] resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    generateCode()
                                }
                            }}
                        />
                        <Button
                            onClick={generateCode}
                            disabled={!prompt.trim()}
                            className="w-full gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Generate Code
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
