"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Search, Filter, Star, Download, ExternalLink, Sparkles, Code2, Palette, Database, RefreshCw } from "lucide-react";

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    author: string;
    rating: number;
    downloads: number;
    price: string;
    tags: string[];
    icon: string;
    color: string;
}

export default function Marketplace() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTemplates = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);

            const response = await fetch(`/api/marketplace/templates?${params}`);
            if (response.ok) {
                const data = await response.json();
                setTemplates(data.templates || []);
            } else {
                throw new Error('Failed to load templates');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            // Fallback to empty array
            setTemplates([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, [searchQuery]);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Code2': return Code2;
            case 'Sparkles': return Sparkles;
            case 'Palette': return Palette;
            case 'Database': return Database;
            default: return Code2;
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col bg-background items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading marketplace...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex flex-col bg-background items-center justify-center">
                <p className="text-red-500 mb-4">Failed to load marketplace: {error}</p>
                <Button onClick={loadTemplates}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="p-6 border-b bg-muted/10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ShoppingBag className="w-6 h-6 text-primary" />
                            BuildSpaces Marketplace
                        </h1>
                        <p className="text-muted-foreground">Discover and share templates, agents, and components.</p>
                    </div>
                    <Button className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Publish Template
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search templates, agents, components..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {templates.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No templates found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to publish a template!'}
                        </p>
                        <Button>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Publish Template
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => {
                            const Icon = getIcon(template.icon);
                            return (
                                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-muted ${template.color}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{template.name}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">by {template.author}</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">{template.category}</Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pb-3">
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {template.description}
                                        </p>

                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {template.tags.slice(0, 3).map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {template.tags.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{template.tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span>{template.rating}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Download className="w-4 h-4" />
                                                    <span>{template.downloads}</span>
                                                </div>
                                            </div>
                                            <div className="font-medium text-foreground">
                                                {template.price}
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-0">
                                        <Button className="w-full" variant="outline">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}