import React from 'react';
import { motion } from 'framer-motion';
import { Job, JobStatus } from '../../features/jobs/jobsBoard';
import { Package, Calendar, Clock, MapPin, Truck, Bot, User, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

const priorityStyles = {
  Critical: 'border-red-500/50 bg-red-900/30 text-red-300',
  High: 'border-orange-500/50 bg-orange-900/30 text-orange-300',
  Medium: 'border-yellow-500/50 bg-yellow-900/30 text-yellow-300',
  Low: 'border-blue-500/50 bg-blue-900/30 text-blue-300',
};

const statusStyles: Record<JobStatus, string> = {
  in_progress: 'text-yellow-300',
  scheduled: 'text-blue-300',
  completed: 'text-green-300',
  canceled: 'text-red-400',
  pending: 'text-purple-300',
};

const statusIcons: Record<JobStatus, React.ElementType> = {
  in_progress: Zap,
  scheduled: Calendar,
  completed: CheckCircle,
  canceled: AlertTriangle,
  pending: Clock,
};

const InfoPill = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
    <div className="flex items-center gap-2 bg-gray-800/60 py-1 px-3 rounded-full text-xs">
        <Icon className="w-4 h-4" />
        <span>{text}</span>
    </div>
);

export const JobCard = ({ job }: { job: Job }) => {
  const StatusIcon = statusIcons[job.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-black/20 backdrop-blur-lg border border-gray-700/50 rounded-2xl overflow-hidden shadow-lg hover:border-blue-500/50 transition-all duration-300 ${priorityStyles[job.priority]}`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-xl text-white">{job.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{job.description}</p>
          </div>
          <span className={`text-xs font-bold uppercase px-3 py-1 border rounded-full ${priorityStyles[job.priority]}`}>
            {job.priority}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-900/50 p-3 rounded-lg">
            <p className="text-gray-500 font-semibold text-xs mb-2">ROUTE</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="font-mono text-gray-300">{job.pickup.location}</span>
              <span className="text-gray-500 mx-1">→</span>
              <span className="font-mono text-gray-300">{job.dropoff.location}</span>
            </div>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg">
            <p className="text-gray-500 font-semibold text-xs mb-2">CARGO</p>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{job.cargo.type} ({job.cargo.weight})</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-5 h-5 ${statusStyles[job.status]}`} />
            <span className={`font-semibold capitalize ${statusStyles[job.status]}`}>
              {job.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            {job.assignedDriver?.name === 'AZORA AI' 
              ? <InfoPill icon={Bot} text="AZORA AI" /> 
              : <InfoPill icon={User} text={job.assignedDriver?.name || 'Unassigned'} />
            }
            <InfoPill icon={Truck} text={job.assignedVehicle.id} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
