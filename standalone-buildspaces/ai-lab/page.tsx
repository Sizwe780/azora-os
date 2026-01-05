"use client";

import { AppLayout, AccessibleCard, GradientText, Button, AIFamilyChat } from "@azora/shared-design";
import { Brain, Cpu, Database, Network, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

export default function AILabPage() {
    const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);

    const experiments = [
        { id: "nlp", name: "Natural Language Processing", icon: Brain, color: "from-purple-500 to-pink-500", status: "Active" },
        { id: "cv", name: "Computer Vision", icon: Zap, color: "from-blue-500 to-cyan-500", status: "Ready" },
        { id: "rl", name: "Reinforcement Learning", icon: Network, color: "from-green-500 to-emerald-500", status: "Paused" },
        { id: "gen", name: "Generative Models", icon: Sparkles, color: "from-orange-500 to-red-500", status: "New" }
    ];

    const metrics = [
        { label: "Models Trained", value: 15, icon: Cpu },
        { label: "Datasets", value: 8, icon: Database },
        { label: "Compute Hours", value: 124, icon: Zap }
    ];

    return (
        <AppLayout appName="AI Lab" userName="Builder">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold tracking-tighter">
                        <GradientText>AI Laboratory</GradientText>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Experiment with advanced AI models and datasets
                    </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {metrics.map((metric) => {
                        const Icon = metric.icon;
                        return (
                            <AccessibleCard key={metric.label} title={metric.label} className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-3xl font-bold text-primary">{metric.value}</div>
                                </div>
                            </AccessibleCard>
                        );
                    })}
                </div>

                {/* Experiments */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Experiments</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {experiments.map((exp) => {
                            const Icon = exp.icon;
                            return (
                                <AccessibleCard
                                    key={exp.id}
                                    title={exp.name}
                                    className={`p-6 cursor-pointer transition-all ${selectedExperiment === exp.id ? 'border-primary' : 'hover:border-primary/50'
                                        }`}
                                    onClick={() => setSelectedExperiment(exp.id)}
                                >
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${exp.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${exp.status === 'Active' ? 'bg-green-500/20 text-green-500' :
                                            exp.status === 'New' ? 'bg-blue-500/20 text-blue-500' :
                                                'bg-gray-700 text-gray-400'
                                            }`}>
                                            {exp.status}
                                        </span>
                                    </div>
                                    <Button variant={selectedExperiment === exp.id ? "primary" : "outline"} className="w-full">
                                        {selectedExperiment === exp.id ? "Selected" : "Open Lab"}
                                    </Button>
                                </AccessibleCard>
                            );
                        })}
                    </div>
                </div>

                {/* AI Assistant */}
                <AccessibleCard title="AI Lab Assistant" className="p-0 overflow-hidden">
                    <div className="h-96">
                        <AIFamilyChat
                            defaultAgent="nia"
                            availableAgents={['nia', 'elara', 'zuri']}
                        />
                    </div>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
