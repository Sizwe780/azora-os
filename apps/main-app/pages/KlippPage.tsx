import React from 'react';
// src/pages/KlippPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/ui/GlassCard';
import { FaDollarSign, FaClock, FaCheckCircle } from 'react-icons/fa';

// --- Type Definitions ---
type KlippTask = {
  taskId: string;
  title: string;
  description: string;
  category: string;
  estimatedEarnings: number;
  currency: string;
  estimatedTimeMinutes: number;
  requiredSkills: string[];
};

// --- Task Card Component ---
const TaskCard = ({ task, onAccept }: { task: KlippTask; onAccept: (task: KlippTask) => void }) => (
  <GlassCard className="p-6 flex flex-col justify-between hover:border-green-400/50 transition-all duration-300">
    <div>
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-green-300">{task.title}</h3>
        <span className="text-xs font-semibold bg-green-800/70 px-2 py-1 rounded-full">{task.category}</span>
      </div>
      <p className="text-sm text-white/80 mt-2 mb-4">{task.description}</p>
    </div>
    <div>
      <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3">
        <span className="flex items-center gap-2"><FaDollarSign /> {task.estimatedEarnings} {task.currency}</span>
        <span className="flex items-center gap-2"><FaClock /> {task.estimatedTimeMinutes} min</span>
      </div>
      <button 
        onClick={() => onAccept(task)}
        className="w-full mt-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white transition-all"
      >
        Accept Task
      </button>
    </div>
  </GlassCard>
);

// --- Main Klipp Page ---
export default function KlippPage() {
  const [tasks, setTasks] = useState<KlippTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<KlippTask | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // This would be the endpoint for the new Klipp service
      const res = await axios.post('/api/klipp/tasks', {
        // Mock user context. In a real app, this would come from the user's profile.
        skills: ['smartphone_camera', 'walking', 'communication'],
      });
      setTasks(res.data);
    } catch (error) {
      setError('Could not fetch tasks. The network may be busy. Please try again later.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTask = (task: KlippTask) => {
    setActiveTask(task);
  };

  const handleCompleteTask = async () => {
    if (!activeTask) return;
    
    // Mock submission
    try {
      await axios.post('/api/klipp/submit', {
        taskId: activeTask.taskId,
        submission: { data: 'mock_submission_data_e.g_photo_url' }
      });
      setActiveTask(null); // Go back to the task list
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Failed to submit task:', error);
      setError('Failed to submit task.');
    }
  };

  // --- Render Logic ---
  if (activeTask) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-cyan-300 mb-4">Active Task</h1>
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-green-300 mb-2">{activeTask.title}</h2>
          <p className="mb-6 text-white/80">{activeTask.description}</p>
          <div className="text-center">
            <p className="text-lg mb-4">Complete the instructions to earn your reward.</p>
            <button 
              onClick={handleCompleteTask}
              className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-xl text-white transition-all flex items-center gap-3 mx-auto"
            >
              <FaCheckCircle /> Mark as Complete
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-300">Klipp Service</h1>
          <p className="text-white/70">Complete simple tasks. Get paid. Guaranteed.</p>
        </div>
        <button onClick={fetchTasks} disabled={isLoading} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold disabled:opacity-50">
          {isLoading ? 'Refreshing...' : 'Refresh Tasks'}
        </button>
      </div>

      {isLoading && <p className="text-center">Finding tasks for you...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}
      
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <TaskCard key={task.taskId} task={task} onAccept={handleAcceptTask} />
          ))}
        </div>
      )}
    </div>
  );
}
