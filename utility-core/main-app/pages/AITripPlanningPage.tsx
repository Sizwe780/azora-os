import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Mic, MapPin, TrendingUp, Fuel, Calendar, Wind, Sun, CloudRain, TrafficCone } from 'lucide-react';

import { CoPilotState, Message, getMockCoPilotState, getDemoResponse } from '../features/ai-trip-planning/mockCoPilot';
import ChatMessage, { LoadingMessage } from '../components/ai-trip-planning/ChatMessage';
import TripPlanCard from '../components/ai-trip-planning/TripPlanCard';
import ContextualInfoCard from '../components/ai-trip-planning/ContextualInfoCard';

const QUICK_ACTIONS = [
  'Plan a trip to Durban',
  'What\'s the traffic like?',
  'Find the cheapest fuel near me',
  'Show weather on N3 route',
];

export default function AITripPlanningPage() {
  const [state, setState] = useState<CoPilotState>(getMockCoPilotState());
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const handleSend = useCallback((content?: string) => {
    const messageText = content || inputMessage;
    if (!messageText.trim()) return;

    const userMessage: Message = { role: 'user', content: messageText, timestamp: new Date() };
    setState(prevState => ({ ...prevState, messages: [...prevState.messages, userMessage] }));
    setInputMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const { response, tripPlan, weather, traffic } = getDemoResponse(messageText);
      const assistantMessage: Message = { role: 'assistant', content: response, timestamp: new Date() };
      
      setState(prevState => ({
        ...prevState,
        messages: [...prevState.messages, assistantMessage],
        tripPlan: tripPlan || prevState.tripPlan,
        weather: weather || [],
        traffic: traffic || [],
      }));
      setIsLoading(false);
    }, 1200);
  }, [inputMessage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full p-6 bg-gray-950">
      {/* Chat Column */}
      <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-2xl flex flex-col h-[calc(100vh-120px)] shadow-2xl shadow-black/20">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {state.messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
          </AnimatePresence>
          {isLoading && <LoadingMessage />}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-gray-800">
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_ACTIONS.map(action => (
              <motion.button 
                key={action} 
                onClick={() => handleSend(action)} 
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {action}
              </motion.button>
            ))}
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your AI Co-Pilot..."
              className="flex-1 px-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            />
            <motion.button 
              onClick={() => handleSend()} 
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-8 overflow-y-auto h-[calc(100vh-120px)] pr-2">
        <AnimatePresence>
          {state.tripPlan ? (
            <TripPlanCard plan={state.tripPlan} />
          ) : (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-white">Trip Assistant</h3>
              <p className="text-gray-400 text-sm mb-4">Ask me to plan a trip to see the details here. I can optimize for:</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><TrafficCone className="w-4 h-4 text-green-400"/> Real-time Traffic</li>
                <li className="flex items-center gap-2"><Fuel className="w-4 h-4 text-purple-400"/> Fuel Prices</li>
                <li className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400"/> HOS Compliance</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
        <ContextualInfoCard weather={state.weather} traffic={state.traffic} />
      </div>
    </div>
  );
}
