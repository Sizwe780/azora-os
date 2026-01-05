"use client";

import { useState, useEffect } from 'react';
import { Zap, BookOpen, Users, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Prediction {
    type: 'RESOURCE' | 'KNOWLEDGE' | 'COLLABORATION' | 'RISK';
    confidence: number;
    suggestion: {
        message: string;
        action: string;
        reason: string;
    };
}

export function PredAISensorOverlay() {
    const [predictions, setPredictions] = useState<Prediction[]>([]);

    // Poll the Citadel PredAISensor Service
    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                // In a real app, we'd send the actual context (code, activity)
                const response = await fetch('http://localhost:3015/predict/resources', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: 'user-123',
                        currentActivity: {
                            type: 'MODEL_TRAINING_SETUP', // Mocking current activity for demo
                            code: 'import torch'
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.predictions && data.predictions.length > 0) {
                        data.predictions.forEach((pred: Prediction) => {
                            // Avoid duplicates
                            setPredictions(prev => {
                                if (prev.some(p => p.suggestion.message === pred.suggestion.message)) return prev;
                                return [...prev, pred];
                            });

                            // Auto-dismiss
                            setTimeout(() => {
                                setPredictions(prev => prev.filter(p => p.suggestion.message !== pred.suggestion.message));
                            }, 10000);
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to contact Citadel PredAISensor:", error);
            }
        };

        const interval = setInterval(fetchPredictions, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const addPrediction = (pred: Prediction) => {
        setPredictions(prev => [...prev, pred]);
        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            setPredictions(prev => prev.filter(p => p !== pred));
        }, 8000);
    };

    const removePrediction = (index: number) => {
        setPredictions(prev => prev.filter((_, i) => i !== index));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'RESOURCE': return <Zap className="w-5 h-5 text-yellow-400" />;
            case 'KNOWLEDGE': return <BookOpen className="w-5 h-5 text-blue-400" />;
            case 'COLLABORATION': return <Users className="w-5 h-5 text-green-400" />;
            default: return <AlertTriangle className="w-5 h-5 text-red-400" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'RESOURCE': return 'border-yellow-500/50 bg-yellow-500/10';
            case 'KNOWLEDGE': return 'border-blue-500/50 bg-blue-500/10';
            case 'COLLABORATION': return 'border-green-500/50 bg-green-500/10';
            default: return 'border-red-500/50 bg-red-500/10';
        }
    };

    return (
        <div className="fixed bottom-20 right-8 z-50 flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {predictions.map((pred, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className={`pointer-events-auto w-80 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${getColor(pred.type)}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 mb-1">
                                {getIcon(pred.type)}
                                <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                                    Citadel PredAI
                                </span>
                            </div>
                            <button
                                onClick={() => removePrediction(index)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-sm font-medium text-white mt-1">
                            {pred.suggestion.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                {pred.confidence * 100}% Confidence
                            </span>
                            <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">
                                Accept
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
