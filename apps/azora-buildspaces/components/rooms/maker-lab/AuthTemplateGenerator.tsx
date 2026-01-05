"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Key, Users, CheckCircle2 } from "lucide-react";

export default function AuthTemplateGenerator({ projectName }: { projectName: string }) {
    const [config, setConfig] = useState({
        nextAuth: true,
        googleProvider: true,
        githubProvider: true,
        emailPassword: true,
        rbac: false,
        mfa: false
    });

    return (
        <div className="h-full flex flex-col p-4 space-y-6 overflow-y-auto">
            <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <h3 className="text-lg font-semibold">Authentication Setup</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={config.nextAuth ? "border-emerald-500/50 bg-emerald-500/5" : ""}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                NextAuth.js
                            </CardTitle>
                            <Switch 
                                checked={config.nextAuth} 
                                onCheckedChange={(v) => setConfig({...config, nextAuth: v})} 
                            />
                        </div>
                        <CardDescription>Standard authentication for Next.js</CardDescription>
                    </CardHeader>
                </Card>

                <Card className={config.rbac ? "border-emerald-500/50 bg-emerald-500/5" : ""}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                RBAC
                            </CardTitle>
                            <Switch 
                                checked={config.rbac} 
                                onCheckedChange={(v) => setConfig({...config, rbac: v})} 
                            />
                        </div>
                        <CardDescription>Role-Based Access Control</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Providers</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">G</div>
                            <div>
                                <div className="text-sm font-medium">Google</div>
                                <div className="text-xs text-muted-foreground">OAuth 2.0</div>
                            </div>
                        </div>
                        <Switch 
                            checked={config.googleProvider} 
                            onCheckedChange={(v) => setConfig({...config, googleProvider: v})} 
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                <Key className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-sm font-medium">GitHub</div>
                                <div className="text-xs text-muted-foreground">OAuth 2.0</div>
                            </div>
                        </div>
                        <Switch 
                            checked={config.githubProvider} 
                            onCheckedChange={(v) => setConfig({...config, githubProvider: v})} 
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t">
                <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Configure Auth Module
                </Button>
            </div>
        </div>
    );
}
