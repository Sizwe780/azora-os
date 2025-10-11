import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, CheckCircle, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { Ticket } from '../../features/support/mockSupport';

interface TicketRowProps {
  ticket: Ticket;
  onSelect: () => void;
}

const statusInfo = {
  open: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-900/50' },
  'in-progress': { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-900/50' },
  resolved: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/50' },
  closed: { icon: CheckCircle, color: 'text-gray-500', bg: 'bg-gray-800' },
};

const priorityInfo = {
  critical: { label: 'Critical', color: 'text-red-400' },
  high: { label: 'High', color: 'text-orange-400' },
  medium: { label: 'Medium', color: 'text-yellow-400' },
  low: { label: 'Low', color: 'text-gray-400' },
};

const TicketRow: React.FC<TicketRowProps> = ({ ticket, onSelect }) => {
  const StatusIcon = statusInfo[ticket.status].icon;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={onSelect}
      className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg cursor-pointer border border-transparent hover:border-purple-500/50 transition-colors"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <StatusIcon className={`w-6 h-6 ${statusInfo[ticket.status].color}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{ticket.subject}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
            <span>#{ticket.id}</span>
            <span className={`font-semibold ${priorityInfo[ticket.priority].color}`}>
              <AlertTriangle size={12} className="inline mr-1" />
              {priorityInfo[ticket.priority].label}
            </span>
            <span>Agent: {ticket.assignedAgent}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 ml-4">
        <span className="text-sm text-gray-500 w-28 text-right">
          {formatDistanceToNow(ticket.lastUpdate, { addSuffix: true })}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </div>
    </motion.div>
  );
};

export default TicketRow;
