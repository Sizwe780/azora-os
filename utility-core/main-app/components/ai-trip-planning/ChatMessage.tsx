import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { Message } from '../../features/ai-trip-planning/mockCoPilot';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}
    >
      {!isUser && (
        <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-full self-end">
          <Bot className="w-6 h-6 text-purple-400" />
        </div>
      )}
      <div
        className={`max-w-xl p-4 rounded-2xl shadow-md ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-800/50 text-gray-200 rounded-bl-none border border-gray-700'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <div className="p-2 bg-gray-700/50 border border-gray-600 rounded-full self-end">
          <User className="w-6 h-6 text-gray-300" />
        </div>
      )}
    </motion.div>
  );
};

export const LoadingMessage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start gap-4"
  >
    <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-full self-end">
      <Bot className="w-6 h-6 text-purple-400" />
    </div>
    <div className="max-w-lg p-4 rounded-2xl bg-gray-800/50 border border-gray-700 flex items-center gap-2">
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:0.2s]" />
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:0.4s]" />
    </div>
  </motion.div>
);

export default ChatMessage;
