"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GitBranch, Play, Square, RotateCcw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

interface GitHubActionsPanelProps {
    projectId?: string
}

interface WorkflowRun {
    id: number
    name: string
    status: 'completed' | 'in_progress' | 'queued' | 'waiting'
    conclusion: 'success' | 'failure' | 'cancelled' | null
    created_at: string
    updated_at: string
    html_url: string
}

interface Workflow {
    id: number
    name: string
    path: string
    state: 'active' | 'disabled_manually'
}

export function GitHubActionsPanel({ projectId }: GitHubActionsPanelProps) {
    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [runs, setRuns] = useState<WorkflowRun[]>([])
    const [activeTab, setActiveTab] = useState("workflows")

    useEffect(() => {
        loadWorkflows()
        loadRuns()
    }, [projectId])

    const loadWorkflows = async () => {
        try {
            // Mock workflow data - in real implementation, this would call GitHub API
            setWorkflows([
                { id: 1, name: "CI/CD Pipeline", path: ".github/workflows/ci-cd.yml", state: "active" },
                { id: 2, name: "Buildspaces Tests", path: ".github/workflows/buildspaces.yml", state: "active" },
                { id: 3, name: "Security Scan", path: ".github/workflows/security.yml", state: "active" },
                { id: 4, name: "Production Deploy", path: ".github/workflows/production.yml", state: "active" }
            ])
        } catch (error) {
            console.error('Failed to load workflows:', error)
        }
    }

    const loadRuns = async () => {
        try {
            // Mock recent runs data
            setRuns([
                {
                    id: 12345,
                    name: "CI/CD Pipeline",
                    status: "completed",
                    conclusion: "success",
                    created_at: "2024-01-15T10:30:00Z",
                    updated_at: "2024-01-15T10:45:00Z",
                    html_url: "https://github.com/example/repo/actions/runs/12345"
                },
                {
                    id: 12344,
                    name: "Buildspaces Tests",
                    status: "completed",
                    conclusion: "failure",
                    created_at: "2024-01-15T09:00:00Z",
                    updated_at: "2024-01-15T09:15:00Z",
                    html_url: "https://github.com/example/repo/actions/runs/12344"
                },
                {
                    id: 12343,
                    name: "Security Scan",
                    status: "in_progress",
                    conclusion: null,
                    created_at: "2024-01-15T08:30:00Z",
                    updated_at: "2024-01-15T08:30:00Z",
                    html_url: "https://github.com/example/repo/actions/runs/12343"
                }
            ])
        } catch (error) {
            console.error('Failed to load runs:', error)
        }
    }

    const triggerWorkflow = async (workflowId: number) => {
        try {
            // In real implementation, this would trigger a GitHub workflow dispatch
            console.log(`Triggering workflow ${workflowId}`)
        } catch (error) {
            console.error('Failed to trigger workflow:', error)
        }
    }

    const getStatusIcon = (status: WorkflowRun['status'], conclusion: WorkflowRun['conclusion']) => {
        if (status === 'in_progress') return <Clock className="w-4 h-4 text-blue-500" />
        if (conclusion === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />
        if (conclusion === 'failure') return <XCircle className="w-4 h-4 text-red-500" />
        if (conclusion === 'cancelled') return <Square className="w-4 h-4 text-gray-500" />
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }

    const getStatusColor = (status: WorkflowRun['status'], conclusion: WorkflowRun['conclusion']) => {
        if (status === 'in_progress') return 'bg-blue-500/20 text-blue-400'
        if (conclusion === 'success') return 'bg-green-500/20 text-green-400'
        if (conclusion === 'failure') return 'bg-red-500/20 text-red-400'
        if (conclusion === 'cancelled') return 'bg-gray-500/20 text-gray-400'
        return 'bg-yellow-500/20 text-yellow-400'
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-12 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    <span className="text-sm font-medium">GitHub Actions</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList className="grid w-full grid-cols-2 h-10 rounded-none">
                        <TabsTrigger value="workflows">Workflows</TabsTrigger>
                        <TabsTrigger value="runs">Recent Runs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="workflows" className="h-full m-0 p-4">
                        <ScrollArea className="h-full">
                            <div className="space-y-4">
                                {workflows.map((workflow) => (
                                    <Card key={workflow.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm">{workflow.name}</CardTitle>
                                                <Badge variant={workflow.state === 'active' ? 'default' : 'secondary'}>
                                                    {workflow.state === 'active' ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {workflow.path}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => triggerWorkflow(workflow.id)}
                                                    disabled={workflow.state !== 'active'}
                                                    className="gap-2"
                                                >
                                                    <Play className="w-3 h-3" />
                                                    Run
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="runs" className="h-full m-0 p-4">
                        <ScrollArea className="h-full">
                            <div className="space-y-3">
                                {runs.map((run) => (
                                    <Card key={run.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(run.status, run.conclusion)}
                                                    <div>
                                                        <div className="text-sm font-medium">{run.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(run.created_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusColor(run.status, run.conclusion)}>
                                                        {run.status === 'in_progress' ? 'Running' :
                                                         run.conclusion === 'success' ? 'Success' :
                                                         run.conclusion === 'failure' ? 'Failed' :
                                                         run.conclusion === 'cancelled' ? 'Cancelled' : 'Unknown'}
                                                    </Badge>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => window.open(run.html_url, '_blank')}
                                                    >
                                                        View
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
