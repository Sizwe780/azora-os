import React from 'react';
import { motion } from 'framer-motion';

interface PhaseCardProps {
    phase: string;
    timeline: string;
    title: string;
    description: string;
    revenue: string;
    color: string;
    index: number;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({ phase, timeline, title, description, revenue, color, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: index * 0.15, duration: 0.6 }}
        className={`p-8 bg-gray-900/50 border border-gray-700/50 rounded-2xl flex flex-col md:flex-row items-start gap-6 overflow-hidden relative backdrop-blur-sm`}
    >
        <div className={`absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b ${color}`}></div>
        <div className="flex-1 pl-4">
            <div className="flex items-center gap-4 mb-4">
                <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${color}`}>{phase}</span>
                <span className="text-xs text-gray-500">{timeline}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 mb-4">{description}</p>
        </div>
        <div className="text-left md:text-right pt-4 md:pt-0 border-t border-gray-800 md:border-none w-full md:w-auto">
            <p className="text-sm text-gray-400 mb-1">Revenue Target</p>
            <p className="text-3xl font-bold text-white">{revenue}</p>
        </div>
    </motion.div>
);
