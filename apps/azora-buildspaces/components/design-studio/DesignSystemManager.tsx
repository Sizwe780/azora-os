"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Settings, Palette, Type, Zap, Save } from "lucide-react"

interface DesignSystemManagerProps {
    projectId?: string
}

interface DesignToken {
    id: string
    name: string
    category: 'color' | 'typography' | 'spacing' | 'effect'
    value: string
    usage: string
}

export function DesignSystemManager({ projectId }: DesignSystemManagerProps) {
    const [tokens, setTokens] = useState<DesignToken[]>([])
    const [activeTab, setActiveTab] = useState('colors')

    useEffect(() => {
        // Load design tokens from API
        const loadTokens = async () => {
            if (!projectId) return

            try {
                const resp = await fetch(`/api/design/design-system?projectId=${projectId}`)
                if (resp.ok) {
                    const data = await resp.json()
                    setTokens(data.tokens || [])
                }
            } catch (error) {
                console.error('Failed to load design tokens:', error)
            }
        }

        loadTokens()
    }, [projectId])

    const addToken = (category: DesignToken['category']) => {
        const newToken: DesignToken = {
            id: Date.now().toString(),
            name: `New ${category}`,
            category,
            value: category === 'color' ? '#000000' : category === 'typography' ? '16px' : '8px',
            usage: 'Description'
        }
        setTokens(prev => [...prev, newToken])
    }

    const updateToken = (id: string, updates: Partial<DesignToken>) => {
        setTokens(prev => prev.map(token =>
            token.id === id ? { ...token, ...updates } : token
        ))
    }

    const deleteToken = (id: string) => {
        setTokens(prev => prev.filter(token => token.id !== id))
    }

    const saveTokens = async () => {
        if (!projectId) return

        try {
            await fetch(`/api/design/design-system`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, tokens })
            })
        } catch (error) {
            console.error('Failed to save design tokens:', error)
        }
    }

    const renderTokenEditor = (token: DesignToken) => (
        <Card key={token.id} className="mb-3">
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Input
                            value={token.name}
                            onChange={(e) => updateToken(token.id, { name: e.target.value })}
                            className="font-medium"
                            placeholder="Token name"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteToken(token.id)}
                        >
                            Delete
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Value</Label>
                            <Input
                                value={token.value}
                                onChange={(e) => updateToken(token.id, { value: e.target.value })}
                                placeholder="Token value"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Usage</Label>
                            <Input
                                value={token.usage}
                                onChange={(e) => updateToken(token.id, { usage: e.target.value })}
                                placeholder="Usage description"
                            />
                        </div>
                    </div>

                    {token.category === 'color' && (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded border"
                                style={{ backgroundColor: token.value }}
                            />
                            <span className="text-sm font-mono">{token.value}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )

    const filteredTokens = tokens.filter(token => token.category === activeTab)

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Design System</span>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={saveTokens}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList className="grid w-full grid-cols-4 h-10 rounded-none">
                        <TabsTrigger value="color" className="gap-2">
                            <Palette className="w-4 h-4" />
                            Colors
                        </TabsTrigger>
                        <TabsTrigger value="typography" className="gap-2">
                            <Type className="w-4 h-4" />
                            Typography
                        </TabsTrigger>
                        <TabsTrigger value="spacing" className="gap-2">
                            <Zap className="w-4 h-4" />
                            Spacing
                        </TabsTrigger>
                        <TabsTrigger value="effect" className="gap-2">
                            <Settings className="w-4 h-4" />
                            Effects
                        </TabsTrigger>
                    </TabsList>

                    {(['color', 'typography', 'spacing', 'effect'] as const).map((category) => (
                        <TabsContent key={category} value={category} className="h-full m-0 p-4 overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium capitalize">{category} Tokens</h3>
                                <Button
                                    size="sm"
                                    onClick={() => addToken(category)}
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Token
                                </Button>
                            </div>

                            {filteredTokens.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No {category} tokens yet</p>
                                    <p className="text-xs mt-1">Add your first token to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredTokens.map(renderTokenEditor)}
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}
