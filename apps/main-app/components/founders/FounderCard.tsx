import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Award, Calendar, Shield, Bot } from 'lucide-react';
import { Founder } from '../../features/founders/mockData';

const getStatusBadge = (status: Founder['status']) => {
  const styles = {
    active: "bg-green-500/10 text-green-400 border-green-500/30",
    inactive: "bg-gray-500/10 text-gray-400 border-gray-500/30",
    'on-leave': "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>{status.replace('-', ' ').toUpperCase()}</span>;
};

const FounderCard: React.FC<{ founder: Founder }> = ({ founder }) => {
  const isAI = founder.roles.includes('AI_DEPUTY_CEO');
  
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-lg"
    >
      <div className={`p-6 ${isAI ? 'bg-gradient-to-br from-cyan-900/50 to-purple-900/30' : 'bg-gradient-to-br from-gray-800/30 to-gray-900/20'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold border-2 ${isAI ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' : 'bg-gray-700/50 border-gray-600'}`}>
              {isAI ? <Bot /> : founder.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{founder.name}</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {founder.titles.map((title, idx) => (
                  <span key={idx} className="text-xs bg-gray-700/50 px-2 py-1 rounded text-gray-300">
                    {title}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {getStatusBadge(founder.status)}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-300">
          <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1 rounded-md border border-gray-700">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>Equity: <span className="font-bold text-white">{founder.equity}%</span></span>
          </div>
          {founder.votingRights && (
            <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1 rounded-md border border-gray-700">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white">Voting Rights</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-400 leading-relaxed italic">
          "{founder.bio}"
        </p>

        <div className="border-t border-white/10 pt-4 space-y-2">
          <div className="flex items-center space-x-3 text-gray-400">
            <Mail className="w-5 h-5 text-cyan-400" />
            <a href={`mailto:${founder.email}`} className="hover:underline text-cyan-300">
              {founder.email}
            </a>
          </div>
          {founder.phoneNumber && (
            <div className="flex items-center space-x-3 text-gray-400">
              <Phone className="w-5 h-5 text-cyan-400" />
              <span>{founder.phoneNumber}</span>
            </div>
          )}
          <div className="flex items-center space-x-3 text-gray-400">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Joined: {new Date(founder.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h3 className="font-semibold text-white mb-2">Key Responsibilities</h3>
          <div className="flex flex-wrap gap-2">
            {founder.permissions.slice(0, 6).map((perm, idx) => (
              <span key={idx} className={`text-xs px-2 py-1 rounded border ${isAI ? 'bg-cyan-900/50 text-cyan-300 border-cyan-800/50' : 'bg-purple-900/50 text-purple-300 border-purple-800/50'}`}>
                {perm.replace(/_/g, ' ').toLowerCase()}
              </span>
            ))}
            {founder.permissions.length > 6 && (
              <span className="text-xs px-2 py-1 bg-gray-800/50 text-gray-400 rounded border border-gray-700/50">
                +{founder.permissions.length - 6} more
              </span>
            )}
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-4 text-right">
          <p className="text-xs text-gray-500">
            Founder ID: <span className="font-mono font-semibold text-gray-400">{founder.founderId}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default FounderCard;
