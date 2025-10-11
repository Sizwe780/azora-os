import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, CheckCircle, Clock, Zap } from 'lucide-react';

import { StatCard } from '../components/klipp/StatCard';
import { TaskCard, Task } from '../components/klipp/TaskCard';
import { ActiveTaskView } from '../components/klipp/ActiveTaskView';
import { mockTasks } from '../features/klipp/mockData';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function KlippPage() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleAcceptTask = (task: Task) => {
    setActiveTask(task);
  };

  const handleCompleteTask = () => {
    // Here you might add logic to give a reward, etc.
    setActiveTask(null);
  };
  
  const handleCancelTask = () => {
    setActiveTask(null);
  };

  return (
    <>
        <Helmet>
            <title>Klipp Micro-Tasks | Azora</title>
            <meta name="description" content="Complete simple tasks and get paid instantly with Klipp Micro-Tasks from Azora." />
        </Helmet>
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen text-white bg-grid-gray-700/10">
            <AnimatePresence mode="wait">
                {activeTask ? (
                    <ActiveTaskView 
                        key="active-task"
                        activeTask={activeTask} 
                        onComplete={handleCompleteTask}
                        onCancel={handleCancelTask}
                    />
                ) : (
                    <motion.div 
                        key="task-list"
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0 }}
                        variants={containerVariants}
                        className="space-y-8"
                    >
                        <motion.div variants={itemVariants}>
                            <div className="flex items-center gap-4">
                                <Zap className="w-8 h-8 text-cyan-400" />
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tighter">Klipp Micro-Tasks</h1>
                                    <p className="text-cyan-300">Complete simple tasks. Get paid instantly.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
                            variants={containerVariants}
                        >
                            <StatCard icon={DollarSign} title="Total Earnings" value="$1,240.50" color="green" />
                            <StatCard icon={CheckCircle} title="Tasks Completed" value="88" color="blue" />
                            <StatCard icon={Clock} title="Avg. Time/Task" value="12 min" color="purple" />
                            <StatCard icon={Zap} title="Available Tasks" value={mockTasks.length.toString()} color="cyan" />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <h2 className="text-2xl font-bold text-white mb-6">Available for you</h2>
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                variants={containerVariants}
                            >
                                {mockTasks.map(task => (
                                    <TaskCard key={task.id} task={task} onAccept={handleAcceptTask} />
                                ))}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </>
  );
}