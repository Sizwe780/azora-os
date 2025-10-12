import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  color: 'green' | 'blue' | 'purple' | 'cyan';
}

const colorVariants = {
    green: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-300',
        shadow: 'shadow-green-500/10',
    },
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-300',
        shadow: 'shadow-blue-500/10',
    },
    purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-300',
        shadow: 'shadow-purple-500/10',
    },
    cyan: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        text: 'text-cyan-300',
        shadow: 'shadow-cyan-500/10',
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const StatCard = ({ icon: Icon, title, value, color }: StatCardProps) => {
    const variants = colorVariants[color];
    return (
        <motion.div 
            variants={itemVariants}
            className={`bg-gray-950/70 border rounded-2xl p-6 flex items-center gap-6 backdrop-blur-lg shadow-2xl ${variants.border} ${variants.shadow}`}
        >
            <div className={`p-4 rounded-full border ${variants.bg} ${variants.border}`}>
                <Icon className={`w-8 h-8 ${variants.text}`} />
            </div>
            <div>
                <p className="text-sm text-cyan-200/80">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
        </motion.div>
    );
};