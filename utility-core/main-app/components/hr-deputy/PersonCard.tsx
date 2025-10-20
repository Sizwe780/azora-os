import { motion } from 'framer-motion';
import { Person, Task } from '../../features/hr-deputy/mockData';
import { Eye, BarChart3 } from 'lucide-react';

const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-300';
    if (score >= 0.8) return 'text-blue-300';
    if (score >= 0.7) return 'text-yellow-300';
    return 'text-red-300';
};

const getScoreBg = (score: number) => {
    if (score >= 0.9) return 'bg-green-500/10 border-green-500/20';
    if (score >= 0.8) return 'bg-blue-500/10 border-blue-500/20';
    if (score >= 0.7) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
};

interface PersonCardProps {
    person: Person;
    tasks: Task[];
    onSelect: (id: string) => void;
    isSelected: boolean;
}

const PersonCard = ({ person, tasks, onSelect, isSelected }: PersonCardProps) => (
    <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="bg-gray-950/50 border border-cyan-500/20 rounded-xl p-5 backdrop-blur-lg shadow-lg shadow-cyan-500/5"
    >
        <div className="flex items-start justify-between mb-4">
            <div>
                <h4 className="text-xl font-bold text-white">{person.name}</h4>
                <p className="text-cyan-200/80">{person.role}</p>
                {person.equity && (
                    <p className="text-purple-400 text-sm mt-1 font-semibold">{person.equity}% Equity</p>
                )}
            </div>
            <div className={`px-4 py-2 rounded-lg border text-center ${getScoreBg(person.performance.score)}`}>
                <p className={`text-2xl font-bold ${getScoreColor(person.performance.score)}`}>
                    {(person.performance.score * 100).toFixed(0)}
                </p>
                <p className="text-gray-400 text-xs">Perf.</p>
            </div>
        </div>
        <div className="flex gap-3 mt-4">
            <motion.button
                onClick={() => onSelect(person.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold ${isSelected ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20'}`}
            >
                <Eye className="w-4 h-4" />
                Details
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold"
            >
                <BarChart3 className="w-4 h-4" />
                Review
            </motion.button>
        </div>
        {isSelected && (
            <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-4"
            >
                <h5 className="text-white font-semibold mb-3">Active Tasks</h5>
                {tasks && tasks.length > 0 ? (
                    <div className="space-y-2">
                        {tasks.map(task => (
                            <div key={task.id} className="bg-gray-800/70 border border-gray-600/50 rounded-md p-3">
                                <p className="text-white text-sm font-semibold">{task.task}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-yellow-400 capitalize">Priority: {task.priority}</p>
                                    <p className="text-xs text-blue-400">{task.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No active tasks assigned.</p>
                )}
            </motion.div>
        )}
    </motion.div>
);

export default PersonCard;
