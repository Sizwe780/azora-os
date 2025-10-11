import React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { ElementRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Mic, MapPin, Calendar, Package, TrendingUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface TripPlan {
  destination: string;
  route: string;
  breaks: string[];
  fuelStops: string[];
  estimatedTime: string;
  optimizations: {
    timeSaved: string;
    distanceSaved: string;
    fuelSaved: string;
  };
}

const QUICK_ACTIONS = [
  'Start trip to Durban',
  'Check my schedule today',
  'Optimize delivery route',
  'Find nearest fuel station',
  'Rest stop recommendations',
  'Weather along route'
];

export default function AITripPlanningPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI Co-Pilot. I can help you plan trips, optimize routes, check compliance, and answer any questions. Just tell me what you need!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [listening, setListening] = useState(false);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<ElementRef<'div'> | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content?: string) => {
    const messageText = content || inputMessage.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    // Send to AI
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:4089/api/ai/chat', {
        message: messageText,
        userId: 'user123',
        context: { previousMessages: messages.slice(-5) }
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Check if it's a trip planning request
      if (messageText.toLowerCase().includes('trip') || messageText.toLowerCase().includes('route')) {
        generateTripPlan(messageText);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      // Demo AI response
      const demoResponse = generateDemoResponse(messageText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: demoResponse,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, aiMessage]);

      if (messageText.toLowerCase().includes('trip') || messageText.toLowerCase().includes('route')) {
        generateTripPlan(messageText);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateDemoResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('trip to durban') || lowerMessage.includes('start trip')) {
      return "Great! I've planned your trip to Durban. The fastest route is via N3 highway, approximately 580km and 6 hours. I've included rest stops and fuel stations. Check the trip plan on the right!";
    } else if (lowerMessage.includes('schedule') || lowerMessage.includes('today')) {
      return "You have 2 deliveries scheduled today:\n1. Durban - 08:00 AM\n2. Pietermaritzburg - 02:00 PM\n\nBoth are within your hours of service limits. You're all good to go!";
    } else if (lowerMessage.includes('optimize')) {
      return "I can optimize your route to save time and fuel! Analyzing current traffic and road conditions... I've found a route that saves you 45 minutes and reduces fuel consumption by 12%. Would you like to use it?";
    } else if (lowerMessage.includes('fuel')) {
      return "The nearest fuel station is Shell Grasmere, 8km away. Based on your current fuel level, you can comfortably reach there. Price: R21.50/L for diesel.";
    } else if (lowerMessage.includes('rest stop')) {
      return "I recommend taking your rest break at Harrismith (N3 highway). There's a good restaurant, clean facilities, and secure parking. It's 280km from your current location - perfect timing for your mandatory break.";
    } else if (lowerMessage.includes('weather')) {
      return "Weather along your route today:\n• Johannesburg: Clear, 24°C\n• Harrismith: Partly cloudy, 18°C\n• Durban: Scattered showers, 26°C\n\nDrive safely in the rain approaching Durban!";
    } else {
      return "I'm here to help with trip planning, route optimization, compliance checking, and any logistics questions. Try asking me to 'Start trip to [destination]' or 'Optimize my route'!";
    }
  };

  const generateTripPlan = async (message: string) => {
    try {
      const response = await axios.post('http://localhost:4089/api/trips/plan', {
        query: message,
        userId: 'user123'
      });
      setTripPlan(response.data.plan);
    } catch (error) {
      console.error('Error generating trip plan:', error);
      // Demo trip plan
      setTripPlan({
        destination: 'Durban, KwaZulu-Natal',
        route: 'N3 Highway via Harrismith',
        breaks: [
          '10:30 AM - Harrismith (30min)',
          '02:00 PM - Mooi River (20min)'
        ],
        fuelStops: [
          'Shell Grasmere - Now (Full tank)',
          'Engen Harrismith - 10:30 AM (Top up)'
        ],
        estimatedTime: '6 hours 15 minutes',
        optimizations: {
          timeSaved: '45 minutes',
          distanceSaved: '23 km',
          fuelSaved: 'R185'
        }
      });
    }
  };

  const startVoiceRecognition = () => {
    setListening(true);
    toast.success('🎤 Listening...');
    
    // Simulate voice recognition (in production, use Web Speech API)
    if (typeof globalThis.setTimeout !== 'function') {
      console.error('setTimeout is not available in this environment');
      setListening(false);
      return;
    }

    globalThis.setTimeout(() => {
      setListening(false);
      setInputMessage('Start trip to Durban');
      toast.success('Voice recognized!');
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">AI Trip Planning</h1>
        <p className="text-blue-200">Your Smart Co-Pilot - Just Ask!</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {/* Chat Column */}
        <div className="col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl h-[calc(100vh-200px)] flex flex-col"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white border border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <MessageCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 rounded-2xl px-6 py-4 border border-white/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(action)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm rounded-full transition-all border border-white/10"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10">
              <div className="flex gap-4">
                <button
                  onClick={startVoiceRecognition}
                  className={`px-4 py-3 rounded-lg transition-all ${
                    listening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Mic className="w-6 h-6" />
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message or use voice..."
                  className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || loading}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trip Plan Column */}
        <div className="space-y-6">
          {tripPlan ? (
            <>
              {/* Trip Plan Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Trip Plan
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Destination</p>
                    <p className="text-white font-semibold">{tripPlan.destination}</p>
                  </div>

                  <div>
                    <p className="text-white/70 text-sm mb-1">Route</p>
                    <p className="text-white font-semibold">{tripPlan.route}</p>
                  </div>

                  <div>
                    <p className="text-white/70 text-sm mb-1">Estimated Time</p>
                    <p className="text-white font-semibold">{tripPlan.estimatedTime}</p>
                  </div>

                  <div>
                    <p className="text-white/70 text-sm mb-2">Rest Breaks</p>
                    <div className="space-y-2">
                      {tripPlan.breaks.map((breakItem, index) => (
                        <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          {breakItem}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-white/70 text-sm mb-2">Fuel Stops</p>
                    <div className="space-y-2">
                      {tripPlan.fuelStops.map((stop, index) => (
                        <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
                          <Package className="w-4 h-4 text-orange-400" />
                          {stop}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toast.success('Trip started! Safe travels!')}
                  className="w-full mt-6 px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all font-semibold"
                >
                  Start Trip
                </button>
              </motion.div>

              {/* Optimizations Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Optimizations
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Time Saved</span>
                    <span className="text-green-400 font-semibold">{tripPlan.optimizations.timeSaved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Distance Saved</span>
                    <span className="text-blue-400 font-semibold">{tripPlan.optimizations.distanceSaved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Fuel Saved</span>
                    <span className="text-purple-400 font-semibold">{tripPlan.optimizations.fuelSaved}</span>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Easy Trip Start</h3>
              <p className="text-white/70 mb-6">
                Try saying: &quot;Start trip to Durban&quot; or click a quick action to see AI trip planning in action!
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white font-semibold mb-2">✓ Automatic Compliance</p>
                  <p className="text-white/70 text-sm">AI checks HOS limits, permits, and vehicle fitness</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white font-semibold mb-2">✓ Smart Breaks</p>
                  <p className="text-white/70 text-sm">Optimizes rest stops for safety and efficiency</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white font-semibold mb-2">✓ Weather Aware</p>
                  <p className="text-white/70 text-sm">Alerts you about conditions along your route</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
