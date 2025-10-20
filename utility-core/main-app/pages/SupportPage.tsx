import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, BarChart2, Users, Clock } from 'lucide-react';

import { SupportData, Ticket, getMockSupportData } from '../features/support/mockSupport';
import MetricCard from '../components/support/MetricCard';
import AgentCard from '../components/support/AgentCard';
import TicketRow from '../components/support/TicketRow';
import TicketDetail from '../components/support/TicketDetail';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.07
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SupportPage() {
  const [data, setData] = useState<SupportData | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    setData(getMockSupportData());
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-full"><LifeBuoy className="w-16 h-16 text-cyan-400 animate-spin" /></div>;
  }

  return (
    <motion.div 
      className="p-6 bg-gray-950 text-white space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-4">
          <LifeBuoy className="w-10 h-10 text-cyan-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Support Center</h1>
            <p className="text-cyan-300">AI-Powered Client Assistance</p>
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={BarChart2} label="Total Tickets" value={data.totalTickets} color="cyan" />
        <MetricCard icon={Users} label="Resolved Today" value={data.resolvedToday} color="green" />
        <MetricCard icon={Clock} label="Avg Resolution" value={`${data.avgResolutionTime}h`} color="purple" />
        <MetricCard icon={LifeBuoy} label="Satisfaction" value={`${data.avgSatisfaction}%`} color="yellow" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Tickets */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-white">Active Tickets</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {data.tickets.map(ticket => (
                <TicketRow key={ticket.id} ticket={ticket} onSelect={() => setSelectedTicket(ticket)} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sidebar: AI Agents */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-2xl font-bold text-white">AI Agents</h2>
          <div className="space-y-3">
            {data.agents.map(agent => (
              <AgentCard key={agent.name} agent={agent} />
            ))}
          </div>
        </motion.div>
      </div>

      <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </motion.div>
  );
}

