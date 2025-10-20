import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, CheckCircle, Clock, Zap } from 'lucide-react';

import { StatCard } from '../components/klipp/StatCard';
import { TaskCard, Task } from '../components/klipp/TaskCard';
import { ActiveTaskView } from '../components/klipp/ActiveTaskView';
import { mockTasks } from '../features/klipp/mockData';
import PageHeader from '../components/ui/PageHeader';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function KlippPage() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleAcceptTask = (task: Task) => {
    setActiveTask(task);
  };

  const handleCompleteTask = () => {
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
        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-gray-950 to-gray-800 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="relative">
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
                            <PageHeader 
                                icon={Zap}
                                title="Klipp Micro-Tasks"
                                subtitle="Complete simple tasks. Get paid instantly."
                            />

                            <motion.div 
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
                                variants={containerVariants}
                            >
                                <StatCard icon={DollarSign} title="Total Earnings" value="$1,240.50" color="green" />
                                <StatCard icon={CheckCircle} title="Tasks Completed" value="88" color="blue" />
                                <StatCard icon={Clock} title="Avg. Time/Task" value="12 min" color="purple" />
                                <StatCard icon={Zap} title="Available Tasks" value={mockTasks.length.toString()} color="cyan" />
                            </motion.div>

                            <motion.div>
                                <h2 className="text-2xl font-bold text-cyan-100 mb-6">Available for you</h2>
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
        </div>
    </>
  );
}