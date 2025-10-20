import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Paperclip, Mail, Download } from 'lucide-react';
import { Email } from '../../features/email/mockData';

interface EmailViewProps {
  email: Email | undefined;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
}

const Attachment: React.FC<{ attachment: Email['attachments'][0] }> = ({ attachment }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-800/60 rounded-lg border border-gray-700/50 hover:bg-gray-700/60 transition-colors group">
    <Paperclip className="w-5 h-5 text-gray-400" />
    <div className="flex-1">
      <p className="text-sm font-medium text-white">{attachment.filename}</p>
      <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
    </div>
    <a href={attachment.url} download className="text-cyan-400 hover:underline text-sm font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <Download size={14} />
      Download
    </a>
  </div>
);

const EmailView: React.FC<EmailViewProps> = ({ email, onToggleStar }) => {
  return (
    <section className="flex-1 flex flex-col bg-gray-900/30">
      <AnimatePresence mode="wait">
        {email ? (
          <motion.div
            key={email.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8 overflow-y-auto h-full"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white max-w-xl">{email.subject}</h2>
              <motion.button 
                onClick={(e) => onToggleStar(email.id, e)} 
                className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <Star className={`w-5 h-5 transition-all ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`} />
              </motion.button>
            </div>
            <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-white/10">
              <div className="w-12 h-12 rounded-full bg-cyan-600/50 flex items-center justify-center font-bold text-xl text-white border border-cyan-500/30">{email.from_avatar}</div>
              <div>
                <p className="font-semibold text-white">{email.from}</p>
                <p className="text-sm text-gray-400">to me</p>
              </div>
              <p className="text-sm text-gray-500 ml-auto font-mono">{new Date(email.timestamp).toLocaleString()}</p>
            </div>
            <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
              {email.body}
            </div>
            {email.attachments.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Attachments ({email.attachments.length})</h3>
                <div className="space-y-3">
                  {email.attachments.map(att => <Attachment key={att.id} attachment={att} />)}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center text-gray-600"
          >
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select an email to read</p>
              <p className="text-sm text-gray-700">Your inbox is waiting for you.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default EmailView;
