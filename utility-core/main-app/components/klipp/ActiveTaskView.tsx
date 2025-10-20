import { motion } from 'framer-motion';
import { X, Check, ArrowLeft } from 'lucide-react';
import { Task } from './TaskCard';

interface ActiveTaskViewProps {
  activeTask: Task;
  onComplete: () => void;
  onCancel: () => void;
}

export const ActiveTaskView = ({ activeTask, onComplete, onCancel }: ActiveTaskViewProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-gray-950/70 border border-cyan-500/20 rounded-2xl p-8 max-w-3xl mx-auto my-12 backdrop-blur-xl shadow-2xl shadow-cyan-500/10"
    >
        <button onClick={onCancel} className="absolute top-4 left-4 text-cyan-200/70 hover:text-cyan-200 transition-colors">
            <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
            <h2 className="text-3xl font-bold text-cyan-200 mb-2">{activeTask.title}</h2>
            <p className="text-cyan-200/80 mb-6">{activeTask.description}</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-6 my-6 border border-cyan-500/10">
            <h3 className="text-lg font-semibold text-cyan-200 mb-4">Task Instructions</h3>
            <p className="text-cyan-200/70">
                This is where detailed instructions for completing the task would appear. 
                It might include steps, images, or interactive elements. For this demo, 
                we'll just have this placeholder text.
            </p>
        </div>

        <div className="flex justify-center gap-6 mt-8">
            <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
                className="px-10 py-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg font-bold flex items-center gap-3 text-green-300 shadow-lg shadow-green-500/10 transition-all"
            >
                <Check /> Mark as Complete
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="px-10 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg font-bold flex items-center gap-3 text-red-300 shadow-lg shadow-red-500/10 transition-all"
            >
                <X /> Cancel Task
            </motion.button>
        </div>
    </motion.div>
);
