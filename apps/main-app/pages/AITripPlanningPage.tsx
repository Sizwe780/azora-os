import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Mic, MapPin, Calendar, Fuel, TrendingUp, Wind, Sun, CloudRain } from 'lucide-react';

const QUICK_ACTIONS = [
  'Plan a trip to Durban',
  'What\'s my schedule today?',
  'Find the cheapest fuel near me',
  'Show weather on N3 route',
];

const mockTripPlan = {
  destination: 'Durban, KZN',
  route: 'N3 Highway',
  estimatedTime: '6h 15m',
  breaks: ['Harrismith (30min)', 'Mooi River (15min)'],
  fuelStops: ['Shell Grasmere', 'Engen Harrismith'],
  optimizations: {
    timeSaved: '45 min',
    distanceSaved: '23 km',
    fuelSaved: 'R185',
  },
};

const mockWeather = [
    { location: 'Johannesburg', icon: Sun, temp: '24°C' },
    { location: 'Harrismith', icon: Wind, temp: '18°C' },
    { location: 'Durban', icon: CloudRain, temp: '26°C' },
];

export default function AITripPlanningPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "I'm your AI Co-Pilot. How can I help you plan your journey today?" },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content) => {
    const messageText = content || inputMessage;
    if (!messageText.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setInputMessage('');
    setLoading(true);

    setTimeout(() => {
      const response = getDemoResponse(messageText);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      if (messageText.toLowerCase().includes('durban')) {
        setTripPlan(mockTripPlan);
      }
      setLoading(false);
    }, 1200);
  };

  const getDemoResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('durban')) {
      return "Of course. I've planned your trip to Durban via the N3. I've optimized for traffic and included mandatory rest stops. You can see the full plan on the right.";
    }
    if (lowerMessage.includes('schedule')) {
      return "You have two deliveries today: one to Sandton at 11:00 AM and another to Pretoria at 3:00 PM. Both are on schedule.";
    }
    if (lowerMessage.includes('fuel')) {
        return "The cheapest fuel nearby is at Sasol on Rivonia Rd for R22.80/L diesel. It's 5km away and on your current route.";
    }
    if (lowerMessage.includes('weather')) {
        return "I'm checking the weather along the N3 for you. It looks clear for most of the way, with a chance of rain as you approach Durban. I've added weather details to the sidebar.";
    }
    return "I can help with that. Could you provide a bit more detail?";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Chat Column */}
      <div className="lg:col-span-2 bg-gray-900/50 border border-gray-700/50 rounded-2xl flex flex-col h-[calc(100vh-140px)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && <div className="p-2 bg-blue-500/20 rounded-full"><Bot className="w-6 h-6 text-blue-400" /></div>}
                <div className={`max-w-lg p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800'}`}>
                  <p>{msg.content}</p>
                </div>
                {msg.role === 'user' && <div className="p-2 bg-gray-700 rounded-full"><User className="w-6 h-6 text-gray-300" /></div>}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/20 rounded-full"><Bot className="w-6 h-6 text-blue-400" /></div>
              <div className="max-w-lg p-4 rounded-2xl bg-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-700/50">
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_ACTIONS.map(action => (
              <button key={action} onClick={() => handleSend(action)} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-full transition-colors">
                {action}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg"><Mic className="w-6 h-6 text-gray-300" /></button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your AI Co-Pilot..."
              className="flex-1 px-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={() => handleSend()} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"><Send className="w-6 h-6" /></button>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {tripPlan ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin className="text-purple-400" /> Trip to {tripPlan.destination}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Route:</span><span className="font-semibold">{tripPlan.route}</span></div>
                <div className="flex justify-between"><span>Est. Time:</span><span className="font-semibold">{tripPlan.estimatedTime}</span></div>
                <div className="flex justify-between items-center"><span><Calendar className="inline w-4 h-4 mr-2 text-gray-400"/>Breaks:</span><span className="font-semibold">{tripPlan.breaks.join(', ')}</span></div>
                <div className="flex justify-between items-center"><span><Fuel className="inline w-4 h-4 mr-2 text-gray-400"/>Fuel Stops:</span><span className="font-semibold">{tripPlan.fuelStops.join(', ')}</span></div>
              </div>
            </div>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 mt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="text-green-400" /> Optimizations</h3>
              <div className="flex justify-around text-center">
                <div><p className="text-lg font-bold text-green-400">{tripPlan.optimizations.timeSaved}</p><p className="text-xs text-gray-400">Time Saved</p></div>
                <div><p className="text-lg font-bold text-blue-400">{tripPlan.optimizations.distanceSaved}</p><p className="text-xs text-gray-400">Distance</p></div>
                <div><p className="text-lg font-bold text-purple-400">{tripPlan.optimizations.fuelSaved}</p><p className="text-xs text-gray-400">Fuel Cost</p></div>
              </div>
            </div>
          </motion.div>
        ) : (
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">Trip Assistant</h3>
                <p className="text-gray-400 text-sm mb-4">Ask me to plan a trip to see the details here. I can optimize for:</p>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400"/> Real-time Traffic</li>
                    <li className="flex items-center gap-2"><Fuel className="w-4 h-4 text-purple-400"/> Fuel Prices</li>
                    <li className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400"/> HOS Compliance</li>
                </ul>
            </div>
        )}
        {inputMessage.toLowerCase().includes('weather') && (
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 mt-6">
                <h3 className="text-xl font-bold mb-4">Weather on Route</h3>
                <div className="flex justify-around text-center">
                    {mockWeather.map(w => (
                        <div key={w.location}>
                            <w.icon className="w-8 h-8 mx-auto text-yellow-400"/>
                            <p className="font-bold mt-2">{w.temp}</p>
                            <p className="text-xs text-gray-400">{w.location}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}