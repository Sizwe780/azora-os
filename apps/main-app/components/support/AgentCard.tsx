import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, Clock, Award, Wifi, WifiOff, Hourglass } from 'lucide-react';
import { AIAgent } from '../../features/support/mockSupport';

interface AgentCardProps {
  agent: AIAgent;
}

const statusIcons = {
  online: <Wifi className="w-4 h-4 text-green-400" />,
  offline: <WifiOff className="w-4 h-4 text-red-400" />,
  busy: <Hourglass className="w-4 h-4 text-yellow-400" />,
};

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-3 transition-all hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="font-bold text-white">{agent.name}</h3>
            <p className="text-xs text-gray-400">{agent.specialization}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          {statusIcons[agent.status]}
          <span className="capitalize">{agent.status}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center pt-2">
        <div>
          <p className="text-xs text-gray-500">Tickets</p>
          <p className="font-semibold text-white flex items-center justify-center gap-1"><Zap size={14} className="text-yellow-400"/>{agent.ticketsHandled}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Avg Time</p>
          <p className="font-semibold text-white flex items-center justify-center gap-1"><Clock size={14} className="text-purple-400"/>{agent.avgResolutionTime}h</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Rating</p>
          <p className="font-semibold text-white flex items-center justify-center gap-1"><Award size={14} className="text-green-400"/>{agent.satisfactionScore}%</p>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
