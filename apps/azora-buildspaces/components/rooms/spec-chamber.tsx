"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SpecValidator, SpecType } from "@azora/spec-kit"
import Editor from "@monaco-editor/react"
import {
    FileJson,
    CheckCircle2,
    AlertCircle,
    Play,
    Save,
    Wand2,
    LayoutTemplate,
    Code2,
    FileText,
    Settings,
    Download,
    Upload,
    Lightbulb
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function SpecChamber() {
    const [content, setContent] = useState(SpecValidator.generateTemplate("component"))
    const [validationResult, setValidationResult] = useState<{ valid: boolean; errors?: any[] } | null>(null)
    const [activeType, setActiveType] = useState<SpecType>("component")
    const [generatedCode, setGeneratedCode] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [activeTab, setActiveTab] = useState("editor")

    const specTemplates = [
        {
            type: "component" as SpecType,
            name: "React Component",
            description: "UI component with props and state",
            icon: <LayoutTemplate className="w-4 h-4" />,
            complexity: "Medium"
        },
        {
            type: "api" as SpecType,
            name: "REST API Endpoint",
            description: "HTTP API with request/response schemas",
            icon: <Settings className="w-4 h-4" />,
            complexity: "High"
        },
        {
            type: "workflow" as SpecType,
            name: "Business Workflow",
            description: "Multi-step process with conditions",
            icon: <FileText className="w-4 h-4" />,
            complexity: "High"
        }
    ]

    const handleValidate = () => {
        const result = SpecValidator.validate(content, "yaml")
        setValidationResult(result)
    }

    const handleTemplateChange = (type: SpecType) => {
        setActiveType(type)
        setContent(SpecValidator.generateTemplate(type))
        setValidationResult(null)
        setGeneratedCode("")
    }

    const handleGenerateCode = async () => {
        setIsGenerating(true)
        setGeneratedCode("// Generating code from spec using Sankofa AI...")
        
        try {
            const spec = SpecValidator.validate(content, "yaml")
            if (!spec.valid || !spec.spec) {
                throw new Error("Invalid specification. Please fix errors before generating code.")
            }

            const response = await fetch('/api/agents/invoke', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate-code',
                    context: `Generate a ${activeType} based on this specification: ${content}`,
                    language: 'typescript'
                })
            })

            const data = await response.json()
            
            if (data.error) {
                throw new Error(data.error)
            }

            setGeneratedCode(data.result || "// No code was generated. Please check the specification.")
            setActiveTab("generated")
        } catch (error) {
            setGeneratedCode(`// Error generating code: ${error instanceof Error ? error.message : String(error)}`)
        } finally {
            setIsGenerating(false)
        }
    }

    const generateReactComponent = (spec: any) => {
        const { name, requirements = [] } = spec
        return `import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ${name}Props {
  ${requirements.map((req: string) => `// ${req}`).join('\n  ')}
}

export const ${name}: React.FC<${name}Props> = (props) => {
  const [state, setState] = useState({})

  useEffect(() => {
    // Component initialization
    ${requirements.map((req: string) => `// TODO: ${req}`).join('\n    ')}
  }, [])

  return (
    <div className="${name.toLowerCase()}-container">
      <h2>${name}</h2>
      ${requirements.map((req: string, i: number) =>
        `<div key={${i}}>${req}</div>`
      ).join('\n      ')}
      <Button>Action</Button>
    </div>
  )
}

export default ${name}`
    }

    const generateAPIEndpoint = (spec: any) => {
        const { name, requirements = [] } = spec
        return `import express from 'express'
import { z } from 'zod'

const router = express.Router()

// Validation schemas
const ${name}RequestSchema = z.object({
  ${requirements.map((req: string) => `// ${req}`).join('\n  ')}
})

const ${name}ResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string()
})

// ${name} endpoint
router.post('/${name.toLowerCase()}', async (req, res) => {
  try {
    const validatedData = ${name}RequestSchema.parse(req.body)

    // Business logic here
    ${requirements.map((req: string) => `// TODO: ${req}`).join('\n    ')}

    const response = ${name}ResponseSchema.parse({
      success: true,
      data: {},
      message: '${name} processed successfully'
    })

    res.json(response)
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      message: error.message
    })
  }
})

export default router`
    }

    const generateWorkflow = (spec: any) => {
        const { name, requirements = [] } = spec
        return `import { WorkflowEngine } from '@/lib/workflows'

export class ${name}Workflow {
  private engine: WorkflowEngine

  constructor() {
    this.engine = new WorkflowEngine()
  }

  async execute(input: any) {
    const steps = [
      ${requirements.map((req: string, i: number) =>
        `{ id: 'step-${i + 1}', name: '${req}', action: this.${req.toLowerCase().replace(/\s+/g, '')}.bind(this) }`
      ).join(',\n      ')}
    ]

    return await this.engine.run(steps, input)
  }

  ${requirements.map((req: string) => `
  private async ${req.toLowerCase().replace(/\s+/g, '')}(data: any) {
    // TODO: Implement ${req}
    console.log('Executing: ${req}')
    return data
  }`).join('\n')}
}

export default ${name}Workflow`
    }

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
            {/* Header */}
            <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                        <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg">Spec Chamber</h1>
                        <p className="text-xs text-zinc-400">Define and validate project requirements</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleValidate} className="gap-2 border-zinc-700 hover:bg-zinc-800">
                        <Play className="w-4 h-4" />
                        Validate
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleGenerateCode}
                        disabled={!validationResult?.valid || isGenerating}
                        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isGenerating ? (
                            <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full" />
                        ) : (
                            <Wand2 className="w-4 h-4" />
                        )}
                        {isGenerating ? "Generating..." : "Generate Code"}
                    </Button>
                    <Button size="sm" className="gap-2 bg-zinc-700 hover:bg-zinc-600">
                        <Save className="w-4 h-4" />
                        Save Spec
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-zinc-800 bg-zinc-900/30 p-4 flex flex-col gap-4">
                    <div>
                        <h3 className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Templates</h3>
                        <div className="space-y-2">
                            {specTemplates.map((template) => (
                                <button
                                    key={template.type}
                                    onClick={() => handleTemplateChange(template.type)}
                                    className={`w-full flex items-start gap-3 p-3 rounded-md text-left transition-colors ${
                                        activeType === template.type
                                            ? "bg-purple-500/10 border border-purple-500/20"
                                            : "hover:bg-zinc-800/50"
                                        }`}
                                >
                                    <div className="text-purple-400 mt-0.5">{template.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-zinc-200 truncate">
                                            {template.name}
                                        </div>
                                        <div className="text-xs text-zinc-400 mt-1">
                                            {template.description}
                                        </div>
                                        <Badge variant="outline" className="text-xs mt-2">
                                            {template.complexity}
                                        </Badge>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Requirements Summary */}
                    {validationResult?.valid && validationResult.spec && (
                        <div>
                            <h3 className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Requirements</h3>
                            <div className="space-y-2">
                                {validationResult.spec.requirements?.map((req: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-zinc-800/30">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-zinc-300">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {validationResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg border ${validationResult.valid
                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                    : "bg-red-500/10 border-red-500/20"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {validationResult.valid ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                )}
                                <span className="text-sm font-medium">
                                    {validationResult.valid ? "Valid Spec" : "Validation Errors"}
                                </span>
                            </div>
                            {!validationResult.valid && validationResult.errors && (
                                <div className="space-y-1">
                                    {validationResult.errors.slice(0, 3).map((error: any, i: number) => (
                                        <div key={i} className="text-xs text-red-300">
                                            • {error.message || error}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="border-b border-zinc-800 px-4 py-2">
                            <TabsList className="bg-zinc-800/50">
                                <TabsTrigger value="editor" className="gap-2">
                                    <FileJson className="w-4 h-4" />
                                    Spec Editor
                                </TabsTrigger>
                                <TabsTrigger value="generated" className="gap-2" disabled={!generatedCode}>
                                    <Code2 className="w-4 h-4" />
                                    Generated Code
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="editor" className="flex-1 m-0">
                            <div className="h-full">
                                <Editor
                                    height="100%"
                                    language="yaml"
                                    value={content}
                                    onChange={(value) => setContent(value || "")}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: "on",
                                        roundedSelection: false,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                    }}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="generated" className="flex-1 m-0">
                            <div className="h-full relative">
                                {isGenerating ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center space-y-4">
                                            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                                            <div className="text-sm text-zinc-400">Generating code from spec...</div>
                                            <Progress value={66} className="w-48 mx-auto" />
                                        </div>
                                    </div>
                                ) : (
                                    <Editor
                                        height="100%"
                                        language="typescript"
                                        value={generatedCode}
                                        theme="vs-dark"
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            lineNumbers: "on",
                                            roundedSelection: false,
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            readOnly: true,
                                        }}
                                    />
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
