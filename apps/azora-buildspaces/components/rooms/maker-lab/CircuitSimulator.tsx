"use client";

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
} from 'reactflow';
import { MiniMap } from '@reactflow/minimap';
import '@reactflow/minimap/dist/style.css';
import 'reactflow/dist/style.css';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Plus,
    Play,
    RotateCcw,
    Zap,
    Cpu,
    Lightbulb,
    Thermometer,
    Wifi,
    Battery,
    Speaker,
    Mic,
    Camera,
    Gauge,
    Activity,
    Settings
} from "lucide-react";

// Component palette
const componentTypes = [
    { id: 'esp32', name: 'ESP32', icon: Cpu, category: 'Microcontrollers', color: '#10b981' },
    { id: 'arduino', name: 'Arduino Uno', icon: Cpu, category: 'Microcontrollers', color: '#059669' },
    { id: 'raspberry-pi', name: 'Raspberry Pi', icon: Cpu, category: 'Microcontrollers', color: '#dc2626' },
    { id: 'led', name: 'LED', icon: Lightbulb, category: 'Outputs', color: '#f59e0b' },
    { id: 'rgb-led', name: 'RGB LED', icon: Lightbulb, category: 'Outputs', color: '#ef4444' },
    { id: 'servo', name: 'Servo Motor', icon: Gauge, category: 'Actuators', color: '#8b5cf6' },
    { id: 'dc-motor', name: 'DC Motor', icon: Activity, category: 'Actuators', color: '#06b6d4' },
    { id: 'temp-sensor', name: 'Temperature Sensor', icon: Thermometer, category: 'Sensors', color: '#f97316' },
    { id: 'light-sensor', name: 'Light Sensor', icon: Lightbulb, category: 'Sensors', color: '#eab308' },
    { id: 'motion-sensor', name: 'Motion Sensor', icon: Activity, category: 'Sensors', color: '#84cc16' },
    { id: 'wifi-module', name: 'WiFi Module', icon: Wifi, category: 'Communication', color: '#3b82f6' },
    { id: 'bluetooth', name: 'Bluetooth', icon: Wifi, category: 'Communication', color: '#6366f1' },
    { id: 'battery', name: 'Battery', icon: Battery, category: 'Power', color: '#22c55e' },
    { id: 'speaker', name: 'Speaker', icon: Speaker, category: 'Outputs', color: '#ec4899' },
    { id: 'microphone', name: 'Microphone', icon: Mic, category: 'Inputs', color: '#a855f7' },
    { id: 'camera', name: 'Camera', icon: Camera, category: 'Sensors', color: '#14b8a6' },
]

// Custom node component
interface ComponentNodeData {
    type: string
    label: string
    inputs?: number
}

function ComponentNode({ data }: { data: ComponentNodeData }) {
    const component = componentTypes.find(c => c.id === data.type);

    return (
        <div className="px-4 py-2 shadow-lg rounded-lg bg-white border-2 border-gray-200 min-w-[120px]">
            <div className="flex items-center gap-2 mb-1">
                {component && <component.icon className="w-4 h-4" style={{ color: component.color }} />}
                <span className="text-sm font-medium text-gray-900">{data.label}</span>
            </div>
            <div className="text-xs text-gray-500">{component?.category}</div>
            <div className="flex gap-1 mt-2">
                {Array.from({ length: data.inputs || 2 }).map((_, i) => (
                    <div key={`in-${i}`} className="w-2 h-2 bg-blue-500 rounded-full"></div>
                ))}
            </div>
        </div>
    );
}

const nodeTypes = {
    component: ComponentNode,
};

const initialNodes: Node[] = [
    {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'ESP32', type: 'esp32', inputs: 3 },
        type: 'component'
    },
    {
        id: '2',
        position: { x: 400, y: 100 },
        data: { label: 'LED', type: 'led', inputs: 1 },
        type: 'component'
    },
    {
        id: '3',
        position: { x: 250, y: 250 },
        data: { label: 'Temp Sensor', type: 'temp-sensor', inputs: 1 },
        type: 'component'
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
];

export default function CircuitSimulator() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isSimulating, setIsSimulating] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [simulationLogs, setSimulationLogs] = useState<string[]>(['Circuit simulator ready.']);
    const nextIdRef = useRef(initialNodes.length + 1);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
        [setEdges],
    );

    const addComponent = (componentType: string) => {
        const component = componentTypes.find(c => c.id === componentType);
        if (!component) return;

        const idNumber = nextIdRef.current++;
        const id = `${idNumber}`;
        const position = {
            x: 100 + ((idNumber * 97) % 400),
            y: 100 + ((idNumber * 61) % 300)
        };

        const newNode: Node = {
            id,
            position,
            data: {
                label: component.name,
                type: componentType,
                inputs: component.category === 'Sensors' ? 1 : component.category === 'Outputs' ? 1 : 3
            },
            type: 'component'
        };

        setNodes((nds: Node[]) => [...nds, newNode]);
        setSimulationLogs(prev => [...prev, `Added ${component.name} to circuit`]);
    };

    const toggleSimulation = () => {
        setIsSimulating(!isSimulating);
        if (!isSimulating) {
            setSimulationLogs(prev => [...prev, 'Starting circuit simulation...']);
            // Simulate some circuit activity
            setTimeout(() => {
                setSimulationLogs(prev => [...prev, 'ESP32 initialized', 'LED blinking at 1Hz', 'Temperature reading: 23.5°C']);
            }, 1000);
        } else {
            setSimulationLogs(prev => [...prev, 'Simulation stopped']);
        }
    };

    const resetCircuit = () => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        setIsSimulating(false);
        setSimulationLogs(['Circuit reset to default configuration']);
    };

    const categories = ['all', ...Array.from(new Set(componentTypes.map(c => c.category)))];

    const filteredComponents = selectedCategory === 'all'
        ? componentTypes
        : componentTypes.filter(c => c.category === selectedCategory);

    return (
        <div className="h-full flex">
            {/* Component Palette */}
            <div className="w-64 border-r bg-gray-50 p-4 flex flex-col">
                <h3 className="font-semibold mb-4 text-gray-900">Component Library</h3>

                {/* Category Filter */}
                <div className="mb-4">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </option>
                        ))}
                    </select>
                </div>

                <ScrollArea className="flex-1">
                    <div className="space-y-2">
                        {filteredComponents.map((component) => (
                            <Card
                                key={component.id}
                                className="p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => addComponent(component.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <component.icon className="w-5 h-5" style={{ color: component.color }} />
                                    <div className="flex-1">
                                        <div className="font-medium text-sm text-gray-900">{component.name}</div>
                                        <Badge variant="outline" className="text-xs mt-1">
                                            {component.category}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Circuit Canvas */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="p-2 border-b flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={toggleSimulation}
                            className={isSimulating ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                        >
                            {isSimulating ? <RotateCcw className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            {isSimulating ? "Stop" : "Start"} Simulation
                        </Button>
                        <Button size="sm" variant="outline" onClick={resetCircuit}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant={isSimulating ? "default" : "secondary"}>
                            {isSimulating ? "Running" : "Stopped"}
                        </Badge>
                        <span className="text-sm text-gray-600">
                            {nodes.length} components, {edges.length} connections
                        </span>
                    </div>
                </div>

                {/* React Flow Canvas */}
                <div className="flex-1">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-gray-100"
                    >
                        <Controls />
                        <MiniMap />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    </ReactFlow>
                </div>
            </div>

            {/* Simulation Panel */}
            <div className="w-80 border-l bg-white p-4 flex flex-col">
                <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Simulation Output
                </h3>

                <ScrollArea className="flex-1">
                    <div className="space-y-2">
                        {simulationLogs.map((log, index) => (
                            <div key={index} className="text-sm p-2 bg-gray-50 rounded border-l-2 border-blue-500">
                                {log}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">Circuit Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Power Draw</div>
                            <div className="font-semibold">2.3W</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Efficiency</div>
                            <div className="font-semibold">94%</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Temperature</div>
                            <div className="font-semibold">45°C</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Signal Strength</div>
                            <div className="font-semibold">Good</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
