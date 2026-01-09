"use client";

import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Database, 
    Server, 
    Shield, 
    CreditCard, 
    Mail, 
    HardDrive, 
    AlertTriangle, 
    FileText, 
    Settings, 
    Share2, 
    Play,
    Download,
    Upload,
    Code,
    Globe,
    Lock,
    Zap,
    Sparkles
} from "lucide-react";

import DatabaseDesigner from "./maker-lab/DatabaseDesigner";
import APIEndpointGenerator from "./maker-lab/APIEndpointGenerator";
import AuthTemplateGenerator from "./maker-lab/AuthTemplateGenerator";
import DeploymentConfig from "./maker-lab/DeploymentConfig";
import { SparkInterface } from "./maker-lab/spark-interface";

export default function MakerLab() {
    const [activeView, setActiveView] = useState("spark");
    const [projectName, setProjectName] = useState("My Full-Stack App");
    const [projectDescription, setProjectDescription] = useState("");

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Toolbar */}
            <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-2 py-1 bg-orange-500/10 text-orange-500 rounded-md border border-orange-500/20">
                        <Code className="w-4 h-4" />
                        <span className="text-sm font-medium">Maker Lab</span>
                    </div>
                    <span className="text-muted-foreground text-sm">/</span>
                    <span className="text-sm font-medium">Project: {projectName}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Play className="w-4 h-4" />
                        Deploy
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Project Configuration */}
            <div className="border-b p-4 bg-muted/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                            id="project-name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Enter project name"
                        />
                    </div>
                    <div>
                        <Label htmlFor="project-desc">Description</Label>
                        <Input
                            id="project-desc"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="Project description"
                        />
                    </div>
                </div>
            </div>

            {/* Main Workbench */}
            <div className="flex-1 overflow-hidden">
                {activeView === "spark" ? (
                    // Spark Engine takes full screen
                    <SparkInterface />
                ) : (
                    <ResizablePanelGroup direction="horizontal">

                        {/* Left Panel: Development Tools */}
                        <ResizablePanel defaultSize={60} minSize={30}>
                            <div className="h-full flex flex-col">
                                <Tabs value={activeView} onValueChange={setActiveView} className="h-full flex flex-col">
                                    <div className="border-b px-4 bg-muted/10">
                                        <TabsList className="h-10 bg-transparent p-0">
                                            <TabsTrigger
                                                value="spark"
                                                className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none h-full px-4 gap-2"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Spark Engine
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="database"
                                                className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full px-4 gap-2"
                                            >
                                                <Database className="w-4 h-4" />
                                                Database Designer
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="api"
                                                className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full px-4 gap-2"
                                            >
                                                <Server className="w-4 h-4" />
                                                API Endpoints
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="auth"
                                                className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full px-4 gap-2"
                                            >
                                                <Shield className="w-4 h-4" />
                                                Authentication
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="deployment"
                                                className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full px-4 gap-2"
                                            >
                                                <Globe className="w-4 h-4" />
                                                Deployment
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="database" className="flex-1 m-0 p-0 overflow-hidden relative">
                                        <DatabaseDesigner projectName={projectName} />
                                    </TabsContent>

                                    <TabsContent value="api" className="flex-1 m-0 p-0 overflow-hidden relative">
                                        <APIEndpointGenerator projectName={projectName} />
                                    </TabsContent>

                                    <TabsContent value="auth" className="flex-1 m-0 p-0 overflow-hidden relative">
                                        <AuthTemplateGenerator projectName={projectName} />
                                    </TabsContent>

                                    <TabsContent value="deployment" className="flex-1 m-0 p-0 overflow-hidden relative">
                                        <DeploymentConfig projectName={projectName} />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* Right Panel: Generated Code & Config */}
                        <ResizablePanel defaultSize={40} minSize={20}>
                            <div className="h-full flex flex-col border-l">
                                <div className="h-10 border-b flex items-center px-4 bg-muted/10 gap-2">
                                    <Code className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Generated Code</span>
                                    <Badge variant="outline" className="ml-auto">Ready</Badge>
                                </div>
                                <div className="flex-1 overflow-hidden p-4">
                                    <div className="space-y-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    Project Structure
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-xs font-mono">
                                                <div className="space-y-1">
                                                    <div>📁 {projectName}/</div>
                                                    <div className="ml-4">📁 src/</div>
                                                    <div className="ml-8">📁 components/</div>
                                                    <div className="ml-8">📁 pages/</div>
                                                    <div className="ml-8">📁 api/</div>
                                                    <div className="ml-4">📁 prisma/</div>
                                                    <div className="ml-8">📄 schema.prisma</div>
                                                    <div className="ml-4">📄 package.json</div>
                                                    <div className="ml-4">📄 next.config.js</div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <Zap className="w-4 h-4" />
                                                    Quick Actions
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <Button size="sm" className="w-full justify-start" variant="outline">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download Project
                                                </Button>
                                                <Button size="sm" className="w-full justify-start" variant="outline">
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Start Development Server
                                                </Button>
                                                <Button size="sm" className="w-full justify-start" variant="outline">
                                                    <Globe className="w-4 h-4 mr-2" />
                                                    Deploy to Vercel
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>

                    </ResizablePanelGroup>
                )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>

                </ResizablePanelGroup>
            </div>
        </div>
    );
}
