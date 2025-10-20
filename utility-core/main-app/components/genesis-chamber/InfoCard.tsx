import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  color?: 'cyan' | 'green' | 'yellow' | 'purple' | 'blue';
}

const colorVariants = {
    cyan: {
        border: 'border-cyan-500/20',
        shadow: 'shadow-cyan-500/10',
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-300',
    },
    green: {
        border: 'border-green-500/20',
        shadow: 'shadow-green-500/10',
        bg: 'bg-green-500/10',
        text: 'text-green-300',
    },
    yellow: {
        border: 'border-yellow-500/20',
        shadow: 'shadow-yellow-500/10',
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-300',
    },
    purple: {
        border: 'border-purple-500/20',
        shadow: 'shadow-purple-500/10',
        bg: 'bg-purple-500/10',
        text: 'text-purple-300',
    },
    blue: {
        border: 'border-blue-500/20',
        shadow: 'shadow-blue-500/10',
        bg: 'bg-blue-500/10',
        text: 'text-blue-300',
    },
};


const InfoCard = ({ icon: Icon, title, children, color = 'cyan' }: InfoCardProps) => {
    const variants = colorVariants[color];
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className={`bg-gray-950/70 rounded-2xl p-6 shadow-2xl backdrop-blur-lg ${variants.border} ${variants.shadow}`}
        >
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full border ${variants.bg} ${variants.border}`}>
                    <Icon className={`w-6 h-6 ${variants.text}`} />
                </div>
                <h3 className="font-bold text-lg text-cyan-100">{title}</h3>
            </div>
            <div className="text-cyan-200/80 space-y-2">{children}</div>
        </motion.div>
    );
};

export default InfoCard;
