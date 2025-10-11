import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Inbox, Send, FileText, Star, Trash2, Icon } from 'lucide-react';
import { FOLDERS } from '../../features/admin-portal/mockAdminData';

const ICONS: { [key: string]: React.ElementType } = {
  Inbox,
  Send,
  FileText,
  Star,
  Trash2,
};

interface EmailSidebarProps {
  onCompose: () => void;
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

const EmailSidebar: React.FC<EmailSidebarProps> = ({ onCompose, selectedFolder, onSelectFolder }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50"
    >
      <button
        onClick={onCompose}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 mb-6 transition-all shadow-lg shadow-blue-500/20"
      >
        <Plus className="w-5 h-5" />
        <span className="font-semibold">Compose</span>
      </button>

      <div className="space-y-2">
        {FOLDERS.map((folder) => {
          const Icon = ICONS[folder.icon];
          return (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg capitalize transition-all flex items-center gap-3 text-sm ${
                selectedFolder === folder.id
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {Icon && <Icon className="w-5 h-5" />}
              <span>{folder.name}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default EmailSidebar;
