import { motion } from 'framer-motion';
import { ElementType } from 'react';

interface StatCardProps {
    icon: ElementType;
    label: string;
    value: string | number;
    color: string;
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
    <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
    >
        <div className={`p-2 bg-${color}-500/10 rounded-full w-fit mb-3`}>
            <Icon className={`w-7 h-7 text-${color}-400`} />
        </div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
);

export default StatCard;
