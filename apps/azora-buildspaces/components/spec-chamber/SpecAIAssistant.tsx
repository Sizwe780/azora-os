"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Send, X } from "lucide-react"

interface SpecAIAssistantProps {
    specType: string
    specContent: string
    onClose: () => void
    onApplySuggestion: (suggestion: string) => void
}

export function SpecAIAssistant({ specType, specContent, onClose, onApplySuggestion }: SpecAIAssistantProps) {
    const [prompt, setPrompt] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)

    const generateSuggestion = async () => {
        if (!prompt.trim()) return

        setIsGenerating(true)
        try {
            // Simulate AI suggestion generation
            setTimeout(() => {
                const suggestion = `{\n  "title": "${prompt}",\n  "type": "${specType}",\n  "description": "AI-generated specification",\n  "properties": {\n    // Add your specification details here\n  }\n}`
                onApplySuggestion(suggestion)
                setIsGenerating(false)
                onClose()
            }, 2000)
        } catch (error) {
            console.error('AI suggestion failed:', error)
            setIsGenerating(false)
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">AI Spec Assistant</span>
                </div>
                <Button size="sm" variant="ghost" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex-1 p-4 space-y-4">
                <Textarea
                    placeholder="Describe what you want to add to your specification..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                />

                <Button
                    onClick={generateSuggestion}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full"
                >
                    <Send className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Suggestion'}
                </Button>
            </div>
        </div>
    )
}
