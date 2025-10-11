import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Task } from './TaskCard';

interface ActiveTaskViewProps {
    activeTask: Task;
    onComplete: () => void;
    onCancel: () => void;
}

export const ActiveTaskView: React.FC<ActiveTaskViewProps> = ({ activeTask, onComplete, onCancel }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }}
        className="space-y-8"
    >
        <div className="flex items-center gap-4">
            <activeTask.icon className="w-8 h-8 text-cyan-400" />
            <div>
                <h1 className="text-3xl font-bold text-white">Active Task: {activeTask.title}</h1>
                <p className="text-cyan-300">Follow the instructions below to earn your reward.</p>
            </div>
        </div>
        <div className="bg-gray-900/50 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-sm shadow-lg">
            <div className="flex justify-center mb-6">
                <div className="p-4 bg-cyan-500/20 rounded-full">
                    <activeTask.icon className="w-12 h-12 text-cyan-300" />
                </div>
            </div>
            <p className="text-center text-lg text-gray-300 mb-6">{activeTask.description}</p>
            <div className="flex justify-around items-center text-center mb-8 p-4 bg-gray-900 rounded-xl">
                <div>
                    <p className="text-sm text-gray-400">Reward</p>
                    <p className="text-2xl font-bold text-green-400">${activeTask.earnings.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Est. Time</p>
                    <p className="text-2xl font-bold text-white">{activeTask.time} min</p>
                </div>
            </div>
            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={onComplete}
                    className="w-full max-w-xs py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                    <CheckCircle /> Mark as Complete
                </button>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                    Cancel Task
                </button>
            </div>
        </div>
    </motion.div>
);
