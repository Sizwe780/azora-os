import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    color: string;
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
    <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="bg-gray-950/70 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-lg shadow-lg shadow-cyan-500/5"
    >
        <div className={`p-3 bg-${color}-500/10 rounded-full w-fit mb-4 border border-${color}-500/20`}>
            <Icon className={`w-7 h-7 text-${color}-400`} />
        </div>
        <p className="text-cyan-200/80 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
);

export default StatCard;
