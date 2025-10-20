import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Star, Paperclip } from 'lucide-react';
import { Email } from '../../features/admin-portal/mockAdminData';

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  onToggleStar: (emailId: string) => void;
}

const EmailListItem: React.FC<{ email: Email; onSelectEmail: (email: Email) => void; onToggleStar: (emailId: string) => void; }> = ({ email, onSelectEmail, onToggleStar }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.015, x: 5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      onClick={() => onSelectEmail(email)}
      className={`p-4 bg-gray-800/40 hover:bg-gray-800/80 rounded-lg cursor-pointer transition-all duration-200 border-l-4 ${
        email.read ? 'border-transparent' : 'border-blue-500'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1 truncate">
          <img src={email.from.avatar} alt={email.from.name} className="w-10 h-10 rounded-full" />
          <div className="flex-1 truncate">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold truncate ${email.read ? 'text-gray-400' : 'text-white'}`}>
                {email.from.name}
              </h3>
              <span className="text-xs text-gray-500 whitespace-nowrap pl-2">
                {formatDistanceToNow(new Date(email.timestamp), { addSuffix: true })}
              </span>
            </div>
            <p className={`font-medium truncate ${email.read ? 'text-gray-300' : 'text-white'}`}>{email.subject}</p>
            <p className="text-sm text-gray-400 truncate">{email.body}</p>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between h-full ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(email.id);
            }}
          >
            <Star className={`w-5 h-5 transition-colors ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`} />
          </button>
          {/* Placeholder for attachment icon */}
        </div>
      </div>
    </motion.div>
  );
};

const EmailList: React.FC<EmailListProps> = ({ emails, onSelectEmail, onToggleStar }) => {
  if (emails.length === 0) {
    return (
      <div className="text-gray-500 text-center py-16">
        <p>This folder is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <EmailListItem key={email.id} email={email} onSelectEmail={onSelectEmail} onToggleStar={onToggleStar} />
      ))}
    </div>
  );
};

export default EmailList;
