import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Archive, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Email } from '../../features/admin-portal/mockAdminData';

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white"><Archive className="w-5 h-5" /></button>
          <button className="text-gray-400 hover:text-white"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4">{email.subject}</h2>
      
      <div className="flex items-center gap-4 mb-6">
        <img src={email.from.avatar} alt={email.from.name} className="w-12 h-12 rounded-full" />
        <div>
          <p className="font-semibold text-white">{email.from.name}</p>
          <p className="text-sm text-gray-400">{email.from.email}</p>
        </div>
        <div className="flex-grow text-right text-sm text-gray-500">
          <div className="flex items-center justify-end gap-2">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(email.timestamp), 'PPpp')}</span>
          </div>
        </div>
      </div>

      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-900/30 p-6 rounded-lg">
        {email.body}
      </div>

      <div className="mt-6 flex gap-2">
        {email.labels.map(label => (
          <span key={label} className="px-3 py-1 bg-gray-700 text-gray-300 text-xs font-medium rounded-full">{label}</span>
        ))}
      </div>
    </motion.div>
  );
};

export default EmailDetail;
