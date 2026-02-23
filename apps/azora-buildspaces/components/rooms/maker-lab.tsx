"use client";

import { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
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
    Sparkles,
    Cpu,
    Radio,
    Wifi,
    Bluetooth,
    Usb,
    Battery,
    Thermometer,
    Activity,
    CircuitBoard,
    Microchip,
    Wrench,
    TestTube,
    BarChart3,
    Eye,
    Smartphone
} from "lucide-react";

import DatabaseDesigner from "./maker-lab/DatabaseDesigner";
import APIEndpointGenerator from "./maker-lab/APIEndpointGenerator";
import AuthTemplateGenerator from "./maker-lab/AuthTemplateGenerator";
import DeploymentConfig from "./maker-lab/DeploymentConfig";
import { SparkInterface } from "./maker-lab/spark-interface";
import CircuitSimulator from "./maker-lab/CircuitSimulator";
import FirmwareEditor from "./maker-lab/FirmwareEditor";
import ComponentViewer from "./maker-lab/ComponentViewer";

export default function MakerLab() {
    const [activeView, setActiveView] = useState("overview");
    const [projectName, setProjectName] = useState("IoT Smart Device");
    const [projectDescription, setProjectDescription] = useState("");
    const [selectedBoard, setSelectedBoard] = useState("esp32");
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationData, setSimulationData] = useState<any>(null);

    const boards = [
        { id: "esp32", name: "ESP32", description: "WiFi & Bluetooth SoC" },
        { id: "esp8266", name: "ESP8266", description: "WiFi SoC" },
        { id: "arduino", name: "Arduino Uno", description: "Classic microcontroller board" },
        { id: "raspberry", name: "Raspberry Pi", description: "Single-board computer" },
        { id: "particle", name: "Particle Photon", description: "IoT development board" }
    ]

    const startSimulation = async () => {
        setIsSimulating(true)
        try {
            const resp = await fetch("/api/maker-lab/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ board: selectedBoard, project: projectName }),
            })
            if (resp.ok) {
                const data = await resp.json()
                setSimulationData(data)
            } else {
                console.error("Simulation request failed:", resp.status)
            }
        } catch (error) {
            console.error('Simulation failed:', error)
        } finally {
            setIsSimulating(false)
        }
    }

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Enhanced Toolbar */}
            <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/20">
                        <CircuitBoard className="w-5 h-5" />
                        <span className="text-sm font-medium">Maker Lab</span>
                    </div>

                    <span className="text-muted-foreground">/</span>

                    <span className="text-sm font-medium">{projectName}</span>

                    {/* Hardware Status */}
                    <div className="flex items-center gap-2 ml-4">
                        <div className={`w-2 h-2 rounded-full ${
                            simulationData ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                        }`} />
                        <span className="text-xs text-muted-foreground">
                            {simulationData ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Board Selection */}
                    <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {boards.map(board => (
                                <SelectItem key={board.id} value={board.id}>
                                    {board.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Action Buttons */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={startSimulation}
                        disabled={isSimulating}
                        className="gap-2"
                    >
                        <Play className="w-4 h-4" />
                        {isSimulating ? 'Testing...' : 'Test Hardware'}
                    </Button>

                    <Button size="sm" variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Flash
                    </Button>

                    <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600">
                        <Upload className="w-4 h-4" />
                        Deploy
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <Tabs value={activeView} onValueChange={setActiveView} className="h-full">
                    <TabsList className="grid w-full grid-cols-7 h-12 rounded-none border-b">
                        <TabsTrigger value="overview" className="gap-2">
                            <Eye className="w-4 h-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="circuit" className="gap-2">
                            <CircuitBoard className="w-4 h-4" />
                            Circuit
                        </TabsTrigger>
                        <TabsTrigger value="firmware" className="gap-2">
                            <Microchip className="w-4 h-4" />
                            Firmware
                        </TabsTrigger>
                        <TabsTrigger value="sensors" className="gap-2">
                            <Activity className="w-4 h-4" />
                            Sensors
                        </TabsTrigger>
                        <TabsTrigger value="iot" className="gap-2">
                            <Radio className="w-4 h-4" />
                            IoT
                        </TabsTrigger>
                        <TabsTrigger value="testing" className="gap-2">
                            <TestTube className="w-4 h-4" />
                            Testing
                        </TabsTrigger>
                        <TabsTrigger value="deploy" className="gap-2">
                            <Globe className="w-4 h-4" />
                            Deploy
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="h-full m-0 p-4">
                        <div className="grid grid-cols-3 gap-4 h-full">
                            {/* Project Settings */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Project Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Project Name</Label>
                                            <Input
                                                value={projectName}
                                                onChange={(e) => setProjectName(e.target.value)}
                                                placeholder="Enter project name"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button
                                            className="w-full justify-start gap-2"
                                            variant="outline"
                                            onClick={() => setActiveView('circuit')}
                                        >
                                            <CircuitBoard className="w-4 h-4" />
                                            Design Circuit
                                        </Button>

                                        <Button
                                            className="w-full justify-start gap-2"
                                            variant="outline"
                                            onClick={() => setActiveView('firmware')}
                                        >
                                            <Microchip className="w-4 h-4" />
                                            Write Firmware
                                        </Button>

                                        <Button
                                            className="w-full justify-start gap-2"
                                            variant="outline"
                                            onClick={() => setActiveView('sensors')}
                                        >
                                            <Thermometer className="w-4 h-4" />
                                            Configure Sensors
                                        </Button>

                                        <Button
                                            className="w-full justify-start gap-2"
                                            variant="outline"
                                            onClick={() => setActiveView('testing')}
                                        >
                                            <TestTube className="w-4 h-4" />
                                            Run Tests
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Connectivity</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Wifi className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm">WiFi</span>
                                            <Badge variant="outline" className="ml-auto">Enabled</Badge>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Bluetooth className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm">Bluetooth</span>
                                            <Badge variant="outline" className="ml-auto">Enabled</Badge>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Usb className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm">USB</span>
                                            <Badge variant="outline" className="ml-auto">Connected</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
