import React from 'react';
import { motion } from 'framer-motion';
import { User, Edit3 } from 'lucide-react';
import { UserProfile } from '../../features/settings/mockSettings';

interface ProfilePanelProps {
  profile: UserProfile;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ profile }) => {
  return (
    <motion.div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 backdrop-blur-lg">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center border-2 border-white/20 shadow-lg"
      >
        {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
        ) : (
            <User className="w-12 h-12 text-white" />
        )}
      </motion.div>
      <div className="flex-grow text-center sm:text-left">
        <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
        <p className="text-cyan-300 font-medium">{profile.role}</p>
        <p className="text-gray-400 mt-1">{profile.email}</p>
      </div>
      <motion.button 
        whileHover={{ scale: 1.05, backgroundColor: '#27272a' }}
        whileTap={{ scale: 0.95 }}
        className="mt-3 sm:mt-0 px-5 py-2.5 bg-gray-800/70 border border-gray-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
      >
        <Edit3 className="w-4 h-4" />
        Edit Profile
      </motion.button>
    </motion.div>
  );
};

export default ProfilePanel;
