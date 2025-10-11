import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface PricingCardProps {
    title: string;
    price: string;
    period: string;
    features: string[];
    bestValue?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ title, price, period, features, bestValue = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className={`bg-gray-900/50 border rounded-2xl p-8 relative backdrop-blur-sm ${bestValue ? 'border-cyan-500/80' : 'border-gray-700/50'}`}
    >
        {bestValue && (
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 text-black text-sm font-bold rounded-full">
                BEST VALUE
            </div>
        )}
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{period}</p>
        <p className="text-5xl font-bold text-white mb-8">{price}</p>
        <ul className="space-y-3 mb-10 text-left">
            {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${bestValue ? 'text-cyan-400' : 'text-green-500'}`} />
                    <span className="text-gray-300">{feature}</span>
                </li>
            ))}
        </ul>
        <button className={`w-full py-3 rounded-lg font-semibold transition-transform hover:scale-105 ${bestValue ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>
            Get Started
        </button>
    </motion.div>
);
