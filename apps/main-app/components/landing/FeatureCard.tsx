import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

type FeatureColor = 'cyan' | 'purple' | 'yellow' | 'green' | 'blue' | 'pink';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    color: FeatureColor;
}

const colorVariants: Record<FeatureColor, { border: string; shadow: string; iconBg: string; iconText: string; hoverBorder: string; }> = {
    cyan: {
        border: 'border-cyan-500/20',
        shadow: 'shadow-cyan-500/10',
        iconBg: 'bg-cyan-500/10',
        iconText: 'text-cyan-300',
        hoverBorder: 'hover:border-cyan-500/40',
    },
    purple: {
        border: 'border-purple-500/20',
        shadow: 'shadow-purple-500/10',
        iconBg: 'bg-purple-500/10',
        iconText: 'text-purple-300',
        hoverBorder: 'hover:border-purple-500/40',
    },
    yellow: {
        border: 'border-yellow-500/20',
        shadow: 'shadow-yellow-500/10',
        iconBg: 'bg-yellow-500/10',
        iconText: 'text-yellow-300',
        hoverBorder: 'hover:border-yellow-500/40',
    },
    green: {
        border: 'border-green-500/20',
        shadow: 'shadow-green-500/10',
        iconBg: 'bg-green-500/10',
        iconText: 'text-green-300',
        hoverBorder: 'hover:border-green-500/40',
    },
    blue: {
        border: 'border-blue-500/20',
        shadow: 'shadow-blue-500/10',
        iconBg: 'bg-blue-500/10',
        iconText: 'text-blue-300',
        hoverBorder: 'hover:border-blue-500/40',
    },
    pink: {
        border: 'border-pink-500/20',
        shadow: 'shadow-pink-500/10',
        iconBg: 'bg-pink-500/10',
        iconText: 'text-pink-300',
        hoverBorder: 'hover:border-pink-500/40',
    },
};


export const FeatureCard = ({ icon: Icon, title, description, color }: FeatureCardProps) => {
    const variants = colorVariants[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className={`bg-gray-950/70 rounded-2xl p-8 text-center transition-all duration-300 group backdrop-blur-lg ${variants.border} ${variants.shadow} ${variants.hoverBorder} hover:shadow-2xl`}
        >
            <div className={`inline-block p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 ${variants.iconBg} border ${variants.border}`}>
                <Icon className={`w-8 h-8 ${variants.iconText}`} />
            </div>
            <h3 className="text-xl font-bold text-cyan-100 mb-3">{title}</h3>
            <p className="text-cyan-200/70 text-sm">{description}</p>
        </motion.div>
    );
};
