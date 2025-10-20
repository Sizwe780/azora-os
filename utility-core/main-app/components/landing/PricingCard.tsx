import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface PricingCardProps {
    title: string;
    price: string;
    period: string;
    features: string[];
    bestValue?: boolean;
}

export const PricingCard = ({ title, price, period, features, bestValue = false }: PricingCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className={`bg-gray-950/70 border rounded-2xl p-8 relative backdrop-blur-lg flex flex-col ${bestValue ? 'border-cyan-500/80 shadow-2xl shadow-cyan-500/10' : 'border-cyan-500/20'}`}
    >
        {bestValue && (
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 text-gray-950 text-sm font-bold rounded-full shadow-lg shadow-cyan-500/20">
                BEST VALUE
            </div>
        )}
        <div className="flex-grow">
            <h3 className="text-2xl font-bold text-cyan-100 mb-2">{title}</h3>
            <p className="text-cyan-200/60 mb-6">{period}</p>
            <p className="text-5xl font-bold text-white mb-8">{price}</p>
            <ul className="space-y-3 mb-10 text-left">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${bestValue ? 'text-cyan-400' : 'text-green-400'}`} />
                        <span className="text-cyan-200/80">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${bestValue ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 border border-cyan-500/20'}`}
        >
            Get Started
        </motion.button>
    </motion.div>
);
