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

export const PhaseCard = ({ phase, timeline, title, description, revenue, color, index }: PhaseCardProps) => (
    <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: index * 0.15, duration: 0.6 }}
        className={`p-8 bg-gray-950/70 border border-cyan-500/10 rounded-2xl flex flex-col md:flex-row items-start gap-8 overflow-hidden relative backdrop-blur-lg shadow-2xl shadow-cyan-500/5`}
    >
        <div className={`absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b ${color}`}></div>
        <div className="flex-1 pl-4">
            <div className="flex items-baseline gap-4 mb-4">
                <span className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r ${color}`}>{phase}</span>
                <span className="text-xs text-cyan-200/60">{timeline}</span>
            </div>
            <h3 className="text-2xl font-bold text-cyan-100 mb-3">{title}</h3>
            <p className="text-cyan-200/80">{description}</p>
        </div>
        <div className="text-left md:text-right pt-6 md:pt-0 border-t border-cyan-500/10 md:border-none w-full md:w-auto md:pl-8">
            <p className="text-sm text-cyan-200/60 mb-1">Revenue Target</p>
            <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{revenue}</p>
        </div>
    </motion.div>
);
