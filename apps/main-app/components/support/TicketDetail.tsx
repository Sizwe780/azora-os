import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { X, Bot, User } from 'lucide-react';
import { Ticket } from '../../features/support/mockSupport';

interface TicketDetailProps {
  ticket: Ticket | null;
  onClose: () => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, onClose }) => {
  return (
    <AnimatePresence>
      {ticket && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-1/3 bg-gray-950 border-l border-gray-800 shadow-2xl z-50 flex flex-col"
        >
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">{ticket.subject}</h2>
              <p className="text-sm text-gray-400">#{ticket.id}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Status</p>
                <p className="text-white capitalize">{ticket.status}</p>
              </div>
              <div>
                <p className="text-gray-500">Priority</p>
                <p className="text-white capitalize">{ticket.priority}</p>
              </div>
              <div>
                <p className="text-gray-500">Assigned Agent</p>
                <p className="text-white">{ticket.assignedAgent}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="text-white">{format(ticket.createdAt, 'PPpp')}</p>
              </div>
            </div>

            {/* Conversation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-300 border-b border-cyan-500/20 pb-2">Conversation</h3>
              {ticket.messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.author === 'Client' ? 'justify-start' : 'justify-end'}`}>
                  {msg.author !== 'Client' && <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"><Bot size={18} /></div>}
                  <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.author === 'Client' ? 'bg-gray-800' : 'bg-purple-900/50'}`}>
                    <p className="text-sm text-white">{msg.text}</p>
                    <p className="text-xs text-gray-400 mt-1 text-right">{format(msg.timestamp, 'p')}</p>
                  </div>
                   {msg.author === 'Client' && <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><User size={18} /></div>}
                </div>
              ))}
              {ticket.messages.length === 0 && (
                <p className="text-center text-gray-500 py-4">No messages in this conversation yet.</p>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Type your reply..."
              rows={3}
            ></textarea>
            <button className="mt-2 w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold text-white transition-colors">
              Send Reply
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TicketDetail;
