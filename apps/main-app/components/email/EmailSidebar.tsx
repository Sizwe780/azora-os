import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail } from 'lucide-react';
import { folders, FolderName } from '../../features/email/mockData';

interface EmailSidebarProps {
  activeFolder: FolderName;
  onFolderChange: (folder: FolderName) => void;
  onCompose: () => void;
  unreadCount: number;
}

const EmailSidebar: React.FC<EmailSidebarProps> = ({ activeFolder, onFolderChange, onCompose, unreadCount }) => {
  return (
    <motion.aside 
      initial={{ x: -256, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-64 flex-shrink-0 bg-gray-950/50 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center text-gray-100"><Mail className="mr-3 text-cyan-400"/> Inbox</h1>
        <motion.button
          onClick={onCompose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-cyan-600/50 hover:bg-cyan-500 transition-colors text-white"
        >
          <Plus className="w-5 h-5"/>
        </motion.button>
      </div>
      <nav className="space-y-2 flex-grow">
        {folders.map(folder => (
          <button
            key={folder.name}
            onClick={() => onFolderChange(folder.name as FolderName)}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-left text-sm font-medium relative ${
              activeFolder === folder.name
                ? 'text-white'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }`}
          >
            {activeFolder === folder.name && (
              <motion.div
                layoutId="active-folder-highlight"
                className="absolute inset-0 bg-cyan-500/20 rounded-lg border border-cyan-500/30"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <folder.icon className={`w-5 h-5 z-10 ${activeFolder === folder.name ? 'text-cyan-400' : 'text-gray-500'}`} />
            <span className="capitalize z-10">{folder.name}</span>
            {folder.name === 'inbox' && unreadCount > 0 && (
              <span className="ml-auto text-xs bg-cyan-600/50 px-2 py-0.5 rounded-full font-semibold z-10">{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-auto">
        <div className="p-4 bg-gray-800/30 rounded-lg text-center">
            <p className="text-xs text-gray-500">Azora Mail v1.0</p>
        </div>
      </div>
    </motion.aside>
  );
};

export default EmailSidebar;
