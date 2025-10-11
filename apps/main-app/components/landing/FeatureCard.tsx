import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    color: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-8 text-center hover:border-cyan-500/50 transition-all duration-300 group backdrop-blur-sm"
    >
        <div className={`inline-block p-4 bg-${color}-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
            <Icon className={`w-8 h-8 text-${color}-400`} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
);
