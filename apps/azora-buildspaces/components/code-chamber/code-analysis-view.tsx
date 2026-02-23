"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, AlertTriangle, CheckCircle, XCircle, TrendingUp } from "lucide-react"

interface CodeAnalysisViewProps {
    projectId: string
    activeFile: string | null
}

interface AnalysisResult {
    file: string
    complexity: number
    maintainability: number
    testCoverage: number
    issues: {
        critical: number
        warnings: number
        suggestions: number
    }
    metrics: {
        linesOfCode: number
        cyclomaticComplexity: number
        cognitiveComplexity: number
    }
}

export function CodeAnalysisView({ projectId, activeFile }: CodeAnalysisViewProps) {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    useEffect(() => {
        if (activeFile) {
            runAnalysis()
        }
    }, [activeFile])

    const runAnalysis = async () => {
        setIsAnalyzing(true)
        try {
            // Simulate code analysis - in real implementation, this would call analysis services
            const mockAnalysis: AnalysisResult = {
                file: activeFile || '',
                complexity: 65,
                maintainability: 78,
                testCoverage: 85,
                issues: {
                    critical: 2,
                    warnings: 5,
                    suggestions: 12
                },
                metrics: {
                    linesOfCode: 245,
                    cyclomaticComplexity: 8,
                    cognitiveComplexity: 12
                }
            }

            setAnalysis(mockAnalysis)
        } catch (error) {
            console.error('Analysis failed:', error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500'
        if (score >= 60) return 'text-yellow-500'
        return 'text-red-500'
    }

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-500/20'
        if (score >= 60) return 'bg-yellow-500/20'
        return 'bg-red-500/20'
    }

    if (!analysis) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Select a file to analyze</p>
                    {isAnalyzing && (
                        <div className="mt-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mx-auto"></div>
                            <p className="text-xs mt-2">Analyzing...</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Code Analysis</span>
                </div>
                <Button size="sm" variant="outline" onClick={runAnalysis} disabled={isAnalyzing}>
                    {isAnalyzing ? 'Analyzing...' : 'Re-run'}
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        <TabsTrigger value="issues">Issues</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {/* Overall Scores */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className={`p-4 rounded-lg border ${getScoreBgColor(analysis.complexity)}`}>
                                <div className="text-sm font-medium mb-2">Complexity</div>
                                <div className={`text-2xl font-bold ${getScoreColor(analysis.complexity)}`}>
                                    {analysis.complexity}%
                                </div>
                                <Progress value={analysis.complexity} className="mt-2" />
                            </div>

                            <div className={`p-4 rounded-lg border ${getScoreBgColor(analysis.maintainability)}`}>
                                <div className="text-sm font-medium mb-2">Maintainability</div>
                                <div className={`text-2xl font-bold ${getScoreColor(analysis.maintainability)}`}>
                                    {analysis.maintainability}%
                                </div>
                                <Progress value={analysis.maintainability} className="mt-2" />
                            </div>

                            <div className={`p-4 rounded-lg border ${getScoreBgColor(analysis.testCoverage)}`}>
                                <div className="text-sm font-medium mb-2">Test Coverage</div>
                                <div className={`text-2xl font-bold ${getScoreColor(analysis.testCoverage)}`}>
                                    {analysis.testCoverage}%
                                </div>
                                <Progress value={analysis.testCoverage} className="mt-2" />
                            </div>
                        </div>

                        {/* Issues Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <XCircle className="w-5 h-5 text-red-500" />
                                <div>
                                    <div className="text-lg font-bold text-red-500">{analysis.issues.critical}</div>
                                    <div className="text-xs text-muted-foreground">Critical</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                <div>
                                    <div className="text-lg font-bold text-yellow-500">{analysis.issues.warnings}</div>
                                    <div className="text-xs text-muted-foreground">Warnings</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                <div>
                                    <div className="text-lg font-bold text-blue-500">{analysis.issues.suggestions}</div>
                                    <div className="text-xs text-muted-foreground">Suggestions</div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="metrics" className="space-y-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 border rounded-lg">
                                <span className="text-sm font-medium">Lines of Code</span>
                                <Badge variant="outline">{analysis.metrics.linesOfCode}</Badge>
                            </div>

                            <div className="flex justify-between items-center p-3 border rounded-lg">
                                <span className="text-sm font-medium">Cyclomatic Complexity</span>
                                <Badge variant="outline">{analysis.metrics.cyclomaticComplexity}</Badge>
                            </div>

                            <div className="flex justify-between items-center p-3 border rounded-lg">
                                <span className="text-sm font-medium">Cognitive Complexity</span>
                                <Badge variant="outline">{analysis.metrics.cognitiveComplexity}</Badge>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="issues" className="space-y-4">
                        <div className="text-center text-muted-foreground py-8">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Detailed issue analysis coming soon</p>
                            <p className="text-xs mt-1">Issues will be displayed with line numbers and fix suggestions</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
