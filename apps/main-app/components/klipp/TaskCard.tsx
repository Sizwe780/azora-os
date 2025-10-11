import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock } from 'lucide-react';

export interface Task {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: React.ElementType;
    earnings: number;
    time: number;
}

interface TaskCardProps {
    task: Task;
    onAccept: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onAccept }) => (
    <motion.div 
        className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm shadow-lg"
        whileHover={{ y: -5 }}
    >
        <div>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                    <task.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-xs font-semibold bg-cyan-900/70 text-cyan-300 px-3 py-1 rounded-full">{task.category}</span>
            </div>
            <h3 className="text-xl font-bold text-white">{task.title}</h3>
            <p className="text-sm text-gray-400 mt-2 mb-4 h-10">{task.description}</p>
        </div>
        <div>
            <div className="flex items-center justify-between text-sm border-t border-gray-700/50 pt-4">
                <span className="flex items-center gap-2 text-green-400 font-bold"><DollarSign size={16} /> ${task.earnings.toFixed(2)}</span>
                <span className="flex items-center gap-2 text-gray-400"><Clock size={16} /> {task.time} min</span>
            </div>
            <button
                onClick={() => onAccept(task)}
                className="w-full mt-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform transform-gpu"
            >
                Accept Task
            </button>
        </div>
    </motion.div>
);
