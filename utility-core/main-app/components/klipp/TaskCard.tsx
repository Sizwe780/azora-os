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
    timeEstimate: string;
}

interface TaskCardProps {
  task: Task;
  onAccept: (task: Task) => void;
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onAccept }) => (
    <motion.div 
        variants={itemVariants}
        className="bg-gray-950/70 border border-cyan-500/20 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-lg shadow-2xl shadow-cyan-500/5 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-cyan-500/10"
    >
        <div>
            <h3 className="text-xl font-bold text-cyan-200 mb-2">{task.title}</h3>
            <p className="text-cyan-200/70 text-sm mb-4 h-20 overflow-hidden">{task.description}</p>
        </div>
        <div className="mt-4">
            <div className="flex justify-between items-center text-sm mb-4">
                <div className="flex items-center gap-2 text-green-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-lg">${task.earnings.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                    <Clock className="w-4 h-4" />
                    <span>{task.timeEstimate}</span>
                </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAccept(task)}
                className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-200 font-bold py-3 rounded-lg transition-colors"
            >
                Accept Task
            </motion.button>
        </div>
    </motion.div>
);
