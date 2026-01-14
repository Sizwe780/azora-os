"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Globe,
    Server,
    Database,
    Cloud,
    Container,
    Github,
    Play,
    Settings,
    Download,
    Upload,
    CheckCircle,
    AlertCircle,
    Zap,
    Plus
} from "lucide-react";

interface DeploymentConfigProps {
    projectName: string;
}

interface DeploymentTarget {
    id: string;
    name: string;
    provider: string;
    status: 'configured' | 'ready' | 'deployed';
    config: Record<string, any>;
}

export default function DeploymentConfig({ projectName }: DeploymentConfigProps) {
    const { data: session } = useSession();
    const [targets, setTargets] = useState<DeploymentTarget[]>([
        {
            id: "vercel",
            name: "Vercel",
            provider: "vercel",
            status: "ready",
            config: {
                framework: "nextjs",
                buildCommand: "npm run build",
                outputDirectory: ".next",
                installCommand: "npm install"
            }
        },
        {
            id: "netlify",
            name: "Netlify",
            provider: "netlify",
            status: "configured",
            config: {
                buildCommand: "npm run build",
                publishDirectory: "out",
                functionsDirectory: "netlify/functions"
            }
        },
        {
            id: "railway",
            name: "Railway",
            provider: "railway",
            status: "ready",
            config: {
                serviceType: "web",
                port: "3000",
                buildCommand: "npm run build",
                startCommand: "npm start"
            }
        }
    ]);

    const [selectedTarget, setSelectedTarget] = useState<string>("vercel");
    const [envVars, setEnvVars] = useState([
        { key: "DATABASE_URL", value: "postgresql://...", required: true },
        { key: "NEXTAUTH_SECRET", value: "your-secret-key", required: true },
        { key: "NEXTAUTH_URL", value: "https://your-domain.com", required: true }
    ]);

    const [dockerConfig, setDockerConfig] = useState({
        baseImage: "node:18-alpine",
        workingDir: "/app",
        expose: "3000",
        buildCommand: "npm run build",
        startCommand: "npm start"
    });

    const updateTargetConfig = (targetId: string, key: string, value: any) => {
        setTargets(targets.map(target =>
            target.id === targetId
                ? { ...target, config: { ...target.config, [key]: value } }
                : target
        ));
    };

    const addEnvVar = () => {
        setEnvVars([...envVars, { key: "", value: "", required: false }]);
    };

    const updateEnvVar = (index: number, field: string, value: string) => {
        setEnvVars(envVars.map((env, i) =>
            i === index ? { ...env, [field]: value } : env
        ));
    };

    const removeEnvVar = (index: number) => {
        setEnvVars(envVars.filter((_, i) => i !== index));
    };

    const generateDockerfile = () => {
        return `FROM ${dockerConfig.baseImage}

WORKDIR ${dockerConfig.workingDir}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN ${dockerConfig.buildCommand}

# Expose port
EXPOSE ${dockerConfig.expose}

# Start the application
CMD ["${dockerConfig.startCommand}"]`;
    };

    const generateGitHubActions = () => {
        return `name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: \${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: \${{ secrets.ORG_ID }}
        vercel-project-id: \${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'`;
    };

    const generateKubernetes = () => {
        return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${projectName}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${projectName}
  template:
    metadata:
      labels:
        app: ${projectName}
    spec:
      containers:
      - name: ${projectName}
        image: ${projectName}:latest
        ports:
        - containerPort: 3000
        env:
        ${envVars.filter(env => env.required).map(env =>
            `- name: ${env.key}\n          value: "${env.value}"`
        ).join('\n        ')}
---
apiVersion: v1
kind: Service
metadata:
  name: ${projectName}-service
spec:
  selector:
    app: ${projectName}
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer`;
    };

    const selectedTargetData = targets.find(t => t.id === selectedTarget);

    return (
        <div className="h-full flex">
            {/* Targets Sidebar */}
            <div className="w-64 border-r bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Deployment Targets</h3>
                    <Button size="sm">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="space-y-2">
                    {targets.map(target => (
                        <Card
                            key={target.id}
                            className={`cursor-pointer transition-colors ${selectedTarget === target.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                                }`}
                            onClick={() => setSelectedTarget(target.id)}
                        >
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    {target.provider === 'vercel' && <Globe className="w-4 h-4" />}
                                    {target.provider === 'netlify' && <Cloud className="w-4 h-4" />}
                                    {target.provider === 'railway' && <Server className="w-4 h-4" />}
                                    <span className="font-medium text-sm">{target.name}</span>
                                </div>
                                <Badge
                                    variant={target.status === 'ready' ? 'default' :
                                        target.status === 'configured' ? 'secondary' : 'outline'}
                                    className="text-xs"
                                >
                                    {target.status}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Main Configuration */}
            <div className="flex-1 p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Deployment Configuration</h2>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={async () => {
                                const payload = {
                                    dockerfile: generateDockerfile(),
                                    github_actions: generateGitHubActions(),
                                    kubernetes: generateKubernetes(),
                                    projectName
                                }

                                const res = await fetch('/api/export', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ payload, userId: session?.user?.id || 'dev_user' })
                                })

                                const json = await res.json()
                                if (!res.ok) {
                                    alert(`Export blocked: ${json.message || json.error}`)
                                } else {
                                    // For demo, trigger file download
                                    const blob = new Blob([JSON.stringify(json.export, null, 2)], { type: 'application/json' })
                                    const url = URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = `${projectName || 'export'}.json`
                                    a.click()
                                    URL.revokeObjectURL(url)
                                }
                            }}>
                                <Download className="w-4 h-4 mr-2" />
                                Export Config
                            </Button>
                            <Button size="sm" onClick={async () => {
                                const payload = { environment: 'staging', buildType: 'production', projectName }

                                const res = await fetch('/api/deploy', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ...payload, userId: session?.user?.id || 'dev_user' })
                                })

                                const json = await res.json()
                                if (!res.ok) {
                                    alert(`Deploy blocked: ${json.message || json.error}`)
                                } else {
                                    alert('Deploy started')
                                }
                            }}>
                                <Play className="w-4 h-4 mr-2" />
                                Deploy Now
                            </Button>
                        </div>
                    </div>

                    {selectedTargetData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Target Configuration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        {selectedTargetData.name} Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(selectedTargetData.config).map(([key, value]) => (
                                        <div key={key}>
                                            <Label className="text-sm capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </Label>
                                            <Input
                                                value={value}
                                                onChange={(e) => updateTargetConfig(selectedTargetData.id, key, e.target.value)}
                                                placeholder={`Enter ${key}`}
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Environment Variables */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Database className="w-4 h-4" />
                                        Environment Variables
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {envVars.map((env, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    placeholder="KEY"
                                                    value={env.key}
                                                    onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Input
                                                    placeholder="value"
                                                    value={env.value}
                                                    onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => removeEnvVar(index)}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                        <Button size="sm" variant="outline" onClick={addEnvVar} className="w-full">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Variable
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Generated Configuration Files */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Container className="w-4 h-4" />
                                    Dockerfile
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-48">
                                    <code>{generateDockerfile()}</code>
                                </pre>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Github className="w-4 h-4" />
                                    GitHub Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-48">
                                    <code>{generateGitHubActions()}</code>
                                </pre>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Server className="w-4 h-4" />
                                    Kubernetes Manifest
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-48">
                                    <code>{generateKubernetes()}</code>
                                </pre>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Quick Deploy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full justify-start" variant="outline">
                                    <Globe className="w-4 h-4 mr-2" />
                                    Deploy to Vercel
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Cloud className="w-4 h-4 mr-2" />
                                    Deploy to Netlify
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Server className="w-4 h-4 mr-2" />
                                    Deploy to Railway
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Container className="w-4 h-4 mr-2" />
                                    Build Docker Image
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
