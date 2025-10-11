import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { Email } from '../../features/email/mockData';
import { formatDistanceToNow } from 'date-fns';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const EmailListItem: React.FC<{ email: Email; isSelected: boolean; onSelect: () => void }> = ({ email, isSelected, onSelect }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      className={`p-4 cursor-pointer rounded-lg transition-colors duration-200 border-l-2 relative ${
        isSelected ? 'bg-gray-700/40 border-cyan-500' : `hover:bg-gray-800/50 ${email.read ? 'border-transparent' : 'border-cyan-600'}`
      }`}
    >
      {!email.read && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-500"></div>
      )}
      <div className="flex items-center justify-between mb-1.5">
        <p className={`font-semibold truncate text-sm ${!email.read ? 'text-white' : 'text-gray-300'}`}>{email.from}</p>
        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatDistanceToNow(new Date(email.timestamp), { addSuffix: true })}</span>
      </div>
      <p className={`truncate font-medium text-sm mb-1.5 ${!email.read ? 'text-gray-200' : 'text-gray-400'}`}>{email.subject}</p>
      <p className="text-xs text-gray-500 truncate">{email.body}</p>
    </motion.div>
  );
};

const EmailList: React.FC<EmailListProps> = ({ emails, selectedEmailId, onSelectEmail, searchQuery, onSearchChange }) => {
  return (
    <motion.main 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="w-[30rem] flex-shrink-0 border-r border-white/10 overflow-y-auto bg-gray-950/30 flex flex-col"
    >
      <div className="p-6 sticky top-0 bg-gray-950/80 backdrop-blur-sm z-10 border-b border-white/10">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search mail..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-700/50 rounded-lg bg-gray-800/60 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-colors"
          />
        </div>
      </div>
      <div className="p-2 space-y-1 flex-grow">
        <AnimatePresence>
          {emails.map(email => (
            <EmailListItem
              key={email.id}
              email={email}
              isSelected={selectedEmailId === email.id}
              onSelect={() => onSelectEmail(email.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.main>
  );
};

export default EmailList;
