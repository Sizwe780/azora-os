"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Server, Trash2, Code } from "lucide-react";

interface Endpoint {
    id: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
}

export default function APIEndpointGenerator({ projectName }: { projectName: string }) {
    const [endpoints, setEndpoints] = useState<Endpoint[]>([
        { id: "1", method: "GET", path: "/api/users", description: "Get all users" },
        { id: "2", method: "POST", path: "/api/users", description: "Create a new user" }
    ]);

    const addEndpoint = () => {
        const newEndpoint: Endpoint = {
            id: Date.now().toString(),
            method: "GET",
            path: "/api/new-endpoint",
            description: "New endpoint description"
        };
        setEndpoints([...endpoints, newEndpoint]);
    };

    const removeEndpoint = (id: string) => {
        setEndpoints(endpoints.filter(e => e.id !== id));
    };

    return (
        <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-500" />
                    <h3 className="text-lg font-semibold">API Endpoints</h3>
                </div>
                <Button size="sm" onClick={addEndpoint}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Endpoint
                </Button>
            </div>

            <div className="grid gap-4">
                {endpoints.map((endpoint) => (
                    <Card key={endpoint.id}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <Badge className={
                                endpoint.method === 'GET' ? 'bg-green-500' :
                                endpoint.method === 'POST' ? 'bg-blue-500' :
                                endpoint.method === 'PUT' ? 'bg-yellow-500' : 'bg-red-500'
                            }>
                                {endpoint.method}
                            </Badge>
                            <div className="flex-1">
                                <Input 
                                    value={endpoint.path} 
                                    onChange={(e) => {
                                        const newEndpoints = [...endpoints];
                                        const index = newEndpoints.findIndex(en => en.id === endpoint.id);
                                        newEndpoints[index].path = e.target.value;
                                        setEndpoints(newEndpoints);
                                    }}
                                    className="font-mono text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <Input 
                                    value={endpoint.description} 
                                    onChange={(e) => {
                                        const newEndpoints = [...endpoints];
                                        const index = newEndpoints.findIndex(en => en.id === endpoint.id);
                                        newEndpoints[index].description = e.target.value;
                                        setEndpoints(newEndpoints);
                                    }}
                                    placeholder="Description"
                                />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeEndpoint(endpoint.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t">
                <Button className="w-full gap-2">
                    <Code className="w-4 h-4" />
                    Generate API Routes
                </Button>
            </div>
        </div>
    );
}
