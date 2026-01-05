"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Search, Filter, Star, Download, ExternalLink, Sparkles, Code2, Palette, Database } from "lucide-react";

const TEMPLATES = [
    {
        id: '1',
        name: 'SaaS Starter Kit',
        description: 'Next.js 14 + Prisma + NextAuth + Stripe integration.',
        category: 'Full-Stack',
        author: 'Azora Team',
        rating: 4.9,
        downloads: '1.2k',
        price: 'Free',
        tags: ['Next.js', 'Prisma', 'Stripe'],
        icon: Code2,
        color: 'text-blue-500'
    },
    {
        id: '2',
        name: 'AI Agent Workflow',
        description: 'Pre-configured Elara workflow for automated code reviews.',
        category: 'AI',
        author: 'Sankofa',
        rating: 5.0,
        downloads: '850',
        price: '50 AZR',
        tags: ['AI', 'Elara', 'Automation'],
        icon: Sparkles,
        color: 'text-purple-500'
    },
    {
        id: '3',
        name: 'Modern Dashboard UI',
        description: 'Beautiful Tailwind CSS dashboard with 50+ components.',
        category: 'Design',
        author: 'Naledi',
        rating: 4.8,
        downloads: '2.5k',
        price: 'Free',
        tags: ['Tailwind', 'React', 'UI'],
        icon: Palette,
        color: 'text-pink-500'
    },
    {
        id: '4',
        name: 'E-commerce Schema',
        description: 'Optimized PostgreSQL schema for high-scale retail.',
        category: 'Database',
        author: 'Themba',
        rating: 4.7,
        downloads: '600',
        price: '20 AZR',
        tags: ['Postgres', 'SQL', 'Schema'],
        icon: Database,
        color: 'text-orange-500'
    }
];

export default function Marketplace() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTemplates = TEMPLATES.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTemplates.map((template) => (
                        <Card key={template.id} className="group hover:border-primary/50 transition-colors overflow-hidden flex flex-col">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                                        {template.category}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-yellow-500">
                                        <Star className="w-3 h-3 fill-current" />
                                        {template.rating}
                                    </div>
                                </div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <template.icon className={`w-5 h-5 ${template.color}`} />
                                    {template.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {template.description}
                                </p>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {template.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-[10px]">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-muted/5 p-4 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">by {template.author}</span>
                                    <span className="text-sm font-bold">{template.price}</span>
                                </div>
                                <Button size="sm" variant="secondary" className="gap-2">
                                    <Download className="w-3.5 h-3.5" />
                                    Get
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
