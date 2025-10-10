import React from 'react';
import { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle, Clock, XCircle, Bot } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgent: string;
  createdAt: Date;
  resolvedAt?: Date;
  satisfaction?: number;
}

interface AIAgent {
  name: string;
  type: string;
  ticketsHandled: number;
  avgResolutionTime: number;
  satisfactionScore: number;
}

interface SupportData {
  tickets: Ticket[];
  agents: AIAgent[];
  totalTickets: number;
  resolvedToday: number;
  avgResolutionTime: number;
  avgSatisfaction: number;
}

export default function SupportPage() {
  const [data, setData] = useState<SupportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupport = async () => {
      try {
        const response = await fetch('/api/hr-ai/support/tickets');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch support data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupport();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Failed to load support data</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Support Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">AI-powered support with 4 specialized agents</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-400">{data.totalTickets}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Resolved Today</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-400">{data.resolvedToday}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Resolution</p>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-400">{data.avgResolutionTime}h</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</p>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-400">{data.avgSatisfaction}%</p>
        </div>
      </div>

      {/* AI Agents */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span>AI Support Agents</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.agents.map((agent) => (
            <div key={agent.name} className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Bot className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">{agent.name}</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{agent.type}</p>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Tickets:</span> {agent.ticketsHandled}</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Avg Time:</span> {agent.avgResolutionTime}h</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Rating:</span> {agent.satisfactionScore}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Tickets</h2>
        <div className="space-y-3">
          {data.tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(ticket.status)}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Assigned to: {ticket.assignedAgent}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{ticket.status}</p>
                {ticket.satisfaction && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">⭐ {ticket.satisfaction}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
