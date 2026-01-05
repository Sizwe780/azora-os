"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Brain,
    Play,
    Pause,
    Square,
    TrendingUp,
    Database,
    Zap,
    Settings,
    Download,
    Upload,
    BarChart3,
    Activity,
    Cpu,
    Network,
    Layers,
    Eye,
    Code,
    Globe,
    Server,
    Cloud,
    Monitor,
    Smartphone,
    Bot,
    Users,
    MessageSquare,
    Target,
    CheckCircle,
    AlertTriangle,
    Clock,
    Star,
    GitBranch,
    Terminal,
    FileText,
    PieChart,
    LineChart,
    Gauge,
    Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AIAssistantPanel } from "./ai-assistant-panel"
import { AgentActivityFeed } from "./agent-activity-feed"
import { ConstitutionalDashboard } from "@/components/constitutional/ConstitutionalDashboard"

interface Model {
    id: string
    name: string
    type: "classification" | "generation" | "vision" | "speech"
    status: "training" | "ready" | "deployed" | "failed"
    accuracy: number
    loss: number
    epochs: number
    dataset: string
    created: Date
}

interface Deployment {
    id: string
    modelId: string
    environment: "development" | "staging" | "production"
    status: "deploying" | "running" | "stopped" | "failed"
    endpoint: string
    requests: number
    latency: number
    uptime: number
}

const mockModels: Model[] = [
    {
        id: "1",
        name: "Code Assistant v2.1",
        type: "generation",
        status: "deployed",
        accuracy: 0.94,
        loss: 0.12,
        epochs: 150,
        dataset: "GitHub Code Dataset",
        created: new Date("2024-12-01")
    },
    {
        id: "2",
        name: "Image Classifier",
        type: "vision",
        status: "training",
        accuracy: 0.87,
        loss: 0.23,
        epochs: 75,
        dataset: "ImageNet Subset",
        created: new Date("2024-12-10")
    },
    {
        id: "3",
        name: "Sentiment Analyzer",
        type: "classification",
        status: "ready",
        accuracy: 0.91,
        loss: 0.15,
        epochs: 100,
        dataset: "Twitter Sentiment",
        created: new Date("2024-12-05")
    }
]

const mockDeployments: Deployment[] = [
    {
        id: "1",
        modelId: "1",
        environment: "production",
        status: "running",
        endpoint: "https://api.azora.ai/code-assist/v2",
        requests: 125430,
        latency: 245,
        uptime: 99.8
    },
    {
        id: "2",
        modelId: "3",
        environment: "staging",
        status: "running",
        endpoint: "https://staging.azora.ai/sentiment/v1",
        requests: 5432,
        latency: 180,
        uptime: 98.5
    }
]

export function AIStudio() {
    const [activeTab, setActiveTab] = useState("overview")
    const [selectedModel, setSelectedModel] = useState<Model | null>(null)
    const [trainingInProgress, setTrainingInProgress] = useState(false)
    const [activeAgentsCount, setActiveAgentsCount] = useState(0)
    const [pilotStatus, setPilotStatus] = useState<"online" | "offline">("offline")

    // Fetch Azora Pilot Status
    useState(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('http://localhost:8000/health');
                if (res.ok) {
                    const data = await res.json();
                    setActiveAgentsCount(data.agents_loaded.length);
                    setPilotStatus("online");
                } else {
                    setPilotStatus("offline");
                }
            } catch (e) {
                setPilotStatus("offline");
            }
        };
        fetchStatus();
        // Poll every 30s
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "training": return "bg-yellow-500"
            case "ready": return "bg-green-500"
            case "deployed": return "bg-blue-500"
            case "failed": return "bg-red-500"
            case "running": return "bg-green-500"
            case "stopped": return "bg-gray-500"
            case "deploying": return "bg-yellow-500"
            default: return "bg-gray-500"
        }
    }

    const getModelTypeIcon = (type: string) => {
        switch (type) {
            case "generation": return <Code className="w-4 h-4" />
            case "vision": return <Eye className="w-4 h-4" />
            case "classification": return <Target className="w-4 h-4" />
            case "speech": return <MessageSquare className="w-4 h-4" />
            default: return <Brain className="w-4 h-4" />
        }
    }

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/5 backdrop-blur-xl z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
                        <Brain className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg tracking-tight">AI Studio</h1>
                        <p className="text-xs text-zinc-400">Model Training & Deployment Hub</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                        <Upload className="w-4 h-4" />
                        Import Model
                    </Button>
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                        <Plus className="w-4 h-4" />
                        New Training Job
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="border-b border-white/5 px-6 py-2">
                        <TabsList className="bg-white/5">
                            <TabsTrigger value="overview" className="gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="models" className="gap-2">
                                <Brain className="w-4 h-4" />
                                Models
                            </TabsTrigger>
                            <TabsTrigger value="training" className="gap-2">
                                <Activity className="w-4 h-4" />
                                Training
                            </TabsTrigger>
                            <TabsTrigger value="deployments" className="gap-2">
                                <Cloud className="w-4 h-4" />
                                Deployments
                            </TabsTrigger>
                            <TabsTrigger value="agents" className="gap-2">
                                <Bot className="w-4 h-4" />
                                AI Agents
                            </TabsTrigger>
                            <TabsTrigger value="constitutional" className="gap-2">
                                <Settings className="w-4 h-4" />
                                Constitutional AI
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="flex-1 m-0 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Metrics Cards */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Active Models</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{activeAgentsCount}</div>
                                    <p className="text-xs text-zinc-500">
                                        {pilotStatus === "online" ? "System Online" : "System Offline"}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/5 border-white/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Training Jobs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">3</div>
                                    <p className="text-xs text-zinc-500">2 running, 1 queued</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/5 border-white/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Deployments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">8</div>
                                    <p className="text-xs text-zinc-500">99.2% uptime</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/5 border-white/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">API Requests</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">1.2M</div>
                                    <p className="text-xs text-zinc-500">+15% from last week</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5" />
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-64">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm">Model "Code Assistant v2.1" deployed to production</p>
                                                    <p className="text-xs text-zinc-500">2 hours ago</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm">Training job "Image Classifier" completed</p>
                                                    <p className="text-xs text-zinc-500">4 hours ago</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm">New training job "Speech Recognition" started</p>
                                                    <p className="text-xs text-zinc-500">6 hours ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Performance Overview */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Performance Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>Average Accuracy</span>
                                                <span>92.4%</span>
                                            </div>
                                            <Progress value={92.4} className="h-2" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>API Response Time</span>
                                                <span>245ms</span>
                                            </div>
                                            <Progress value={75} className="h-2" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>System Uptime</span>
                                                <span>99.8%</span>
                                            </div>
                                            <Progress value={99.8} className="h-2" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="models" className="flex-1 m-0 p-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">AI Models</h2>
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Create Model
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mockModels.map((model) => (
                                    <Card key={model.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getModelTypeIcon(model.type)}
                                                    <CardTitle className="text-lg">{model.name}</CardTitle>
                                                </div>
                                                <Badge className={`${getStatusColor(model.status)} text-white`}>
                                                    {model.status}
                                                </Badge>
                                            </div>
                                            <CardDescription>{model.type} • {model.dataset}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-zinc-400">Accuracy</p>
                                                        <p className="font-semibold">{(model.accuracy * 100).toFixed(1)}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-zinc-400">Loss</p>
                                                        <p className="font-semibold">{model.loss.toFixed(3)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-zinc-400">Epochs</p>
                                                        <p className="font-semibold">{model.epochs}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-zinc-400">Created</p>
                                                        <p className="font-semibold">{model.created.toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="flex-1">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="flex-1">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Export
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="training" className="flex-1 m-0 p-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Training Jobs</h2>
                                <Button className="gap-2" onClick={() => setTrainingInProgress(!trainingInProgress)}>
                                    {trainingInProgress ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    {trainingInProgress ? "Pause Training" : "Start Training"}
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Training Progress */}
                                <Card className="bg-white/5 border-white/10">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="w-5 h-5" />
                                            Current Training: Image Classifier
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Epoch 75/100</span>
                                                    <span>75%</span>
                                                </div>
                                                <Progress value={75} className="h-3" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-zinc-400">Accuracy</p>
                                                    <p className="font-semibold text-green-400">87.3%</p>
                                                </div>
                                                <div>
                                                    <p className="text-zinc-400">Loss</p>
                                                    <p className="font-semibold text-red-400">0.234</p>
                                                </div>
                                                <div>
                                                    <p className="text-zinc-400">ETA</p>
                                                    <p className="font-semibold">2h 15m</p>
                                                </div>
                                                <div>
                                                    <p className="text-zinc-400">GPU Usage</p>
                                                    <p className="font-semibold">94%</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" disabled={!trainingInProgress}>
                                                    <Pause className="w-4 h-4 mr-2" />
                                                    Pause
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <Square className="w-4 h-4 mr-2" />
                                                    Stop
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Training History */}
                                <Card className="bg-white/5 border-white/10">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="w-5 h-5" />
                                            Training History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-64">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                                    <div>
                                                        <p className="font-medium">Code Assistant v2.1</p>
                                                        <p className="text-sm text-zinc-400">Completed • 94.2% accuracy</p>
                                                    </div>
                                                    <Badge className="bg-green-500">Completed</Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                                    <div>
                                                        <p className="font-medium">Sentiment Analyzer</p>
                                                        <p className="text-sm text-zinc-400">Completed • 91.1% accuracy</p>
                                                    </div>
                                                    <Badge className="bg-green-500">Completed</Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                                    <div>
                                                        <p className="font-medium">Image Classifier</p>
                                                        <p className="text-sm text-zinc-400">In Progress • 87.3% accuracy</p>
                                                    </div>
                                                    <Badge className="bg-yellow-500">Training</Badge>
                                                </div>
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="deployments" className="flex-1 m-0 p-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Model Deployments</h2>
                                <Button className="gap-2">
                                    <Cloud className="w-4 h-4" />
                                    New Deployment
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {mockDeployments.map((deployment) => (
                                    <Card key={deployment.id} className="bg-white/5 border-white/10">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Server className="w-5 h-5" />
                                                    {deployment.environment === "production" ? "Production" : "Staging"}
                                                </CardTitle>
                                                <Badge className={`${getStatusColor(deployment.status)} text-white`}>
                                                    {deployment.status}
                                                </Badge>
                                            </div>
                                            <CardDescription className="font-mono text-xs">{deployment.endpoint}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                                <div>
                                                    <p className="text-zinc-400">Requests</p>
                                                    <p className="font-semibold">{deployment.requests.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-zinc-400">Latency</p>
                                                    <p className="font-semibold">{deployment.latency}ms</p>
                                                </div>
                                                <div>
                                                    <p className="text-zinc-400">Uptime</p>
                                                    <p className="font-semibold">{deployment.uptime}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-zinc-400">Status</p>
                                                    <p className="font-semibold text-green-400">Healthy</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="flex-1">
                                                    <Monitor className="w-4 h-4 mr-2" />
                                                    Monitor
                                                </Button>
                                                <Button size="sm" variant="outline" className="flex-1">
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Config
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="agents" className="flex-1 m-0 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* AI Assistant Panel */}
                            <div className="lg:col-span-2">
                                <AIAssistantPanel />
                            </div>

                            {/* Agent Activity Feed */}
                            <div>
                                <AgentActivityFeed />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="constitutional" className="flex-1 m-0 p-6">
                        <ConstitutionalDashboard />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}