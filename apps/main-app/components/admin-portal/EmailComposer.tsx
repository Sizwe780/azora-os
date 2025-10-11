import React from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, X } from 'lucide-react';

interface EmailComposerProps {
  onClose: () => void;
  onSend: (email: { to: string; subject: string; body: string }) => void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({ onClose, onSend }) => {
  const [to, setTo] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');

  const handleSend = () => {
    onSend({ to, subject, body });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-800 rounded-t-xl">
        <h2 className="text-xl font-bold text-white">Compose New Email</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-grow p-4 space-y-4">
        <input
          type="email"
          placeholder="To:"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Subject:"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Body:"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      <div className="flex items-center justify-between p-4 border-t border-gray-700/50">
        <button className="text-gray-400 hover:text-white">
          <Paperclip className="w-6 h-6" />
        </button>
        <button
          onClick={handleSend}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 font-semibold"
        >
          <Send className="w-5 h-5" />
          Send
        </button>
      </div>
    </motion.div>
  );
};

export default EmailComposer;
