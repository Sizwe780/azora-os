import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, CheckCircle, Zap, BrainCircuit, Camera } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm text-${color}-300`}>{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
    </div>
  </div>
);

const mockTasks = [
  { id: 'TASK001', title: 'Verify Storefront Hours', description: 'Visit the specified location and take a clear photo of the store\'s posted hours.', category: 'Field Verification', icon: Camera, earnings: 15, time: 20 },
  { id: 'TASK002', title: 'Train AI Object Recognition', description: 'Identify and label common objects in a series of images to help train our AI models.', category: 'AI Training', icon: BrainCircuit, earnings: 8, time: 15 },
  { id: 'TASK003', title: 'Test New App Feature', description: 'Follow a script to test a new feature in our upcoming mobile app and provide feedback.', category: 'Usability Testing', icon: Zap, earnings: 25, time: 30 },
  { id: 'TASK004', title: 'Local Landmark Photo', description: 'Submit a high-quality, original photo of a well-known local landmark.', category: 'Field Verification', icon: Camera, earnings: 12, time: 15 },
];

const TaskCard = ({ task, onAccept }) => (
  <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300">
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-cyan-500/20 rounded-xl">
          <task.icon className="w-6 h-6 text-cyan-400" />
        </div>
        <span className="text-xs font-semibold bg-cyan-900/70 text-cyan-300 px-2 py-1 rounded-full">{task.category}</span>
      </div>
      <h3 className="text-xl font-bold text-white">{task.title}</h3>
      <p className="text-sm text-gray-400 mt-2 mb-4">{task.description}</p>
    </div>
    <div>
      <div className="flex items-center justify-between text-sm border-t border-gray-700/50 pt-4">
        <span className="flex items-center gap-2 text-green-400 font-bold"><DollarSign size={16} /> ${task.earnings.toFixed(2)}</span>
        <span className="flex items-center gap-2 text-gray-400"><Clock size={16} /> {task.time} min</span>
      </div>
      <button
        onClick={() => onAccept(task)}
        className="w-full mt-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
      >
        Accept Task
      </button>
    </div>
  </div>
);

export default function KlippPage() {
  const [activeTask, setActiveTask] = useState(null);

  if (activeTask) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
        <div className="flex items-center gap-4">
          <Zap className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Active Task: {activeTask.title}</h1>
            <p className="text-cyan-300">Follow the instructions below to earn your reward.</p>
          </div>
        </div>
        <div className="bg-gray-900/50 border border-cyan-500/30 rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cyan-500/20 rounded-full">
              <activeTask.icon className="w-12 h-12 text-cyan-300" />
            </div>
          </div>
          <p className="text-center text-lg text-gray-300 mb-6">{activeTask.description}</p>
          <div className="flex justify-around items-center text-center mb-8 p-4 bg-gray-900 rounded-xl">
            <div>
              <p className="text-sm text-gray-400">Reward</p>
              <p className="text-2xl font-bold text-green-400">${activeTask.earnings.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Est. Time</p>
              <p className="text-2xl font-bold text-white">{activeTask.time} min</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setActiveTask(null)}
              className="w-full max-w-xs py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <CheckCircle /> Mark as Complete
            </button>
            <button
              onClick={() => setActiveTask(null)}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Cancel Task
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <Zap className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Klipp Micro-Tasks</h1>
            <p className="text-cyan-300">Complete simple tasks. Get paid instantly.</p>
          </div>
        </div>
      </motion.div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} title="Total Earnings" value="$1,240.50" color="green" />
        <StatCard icon={CheckCircle} title="Tasks Completed" value="88" color="blue" />
        <StatCard icon={Clock} title="Avg. Time/Task" value="12 min" color="purple" />
        <StatCard icon={Zap} title="Available Tasks" value={mockTasks.length} color="cyan" />
      </div>

      {/* Task List */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Available for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTasks.map(task => (
            <motion.div key={task.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mockTasks.indexOf(task) * 0.1 }}>
              <TaskCard task={task} onAccept={setActiveTask} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}