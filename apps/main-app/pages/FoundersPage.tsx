import { FOUNDERS, Founder } from '../types/founders';
import { Mail, Phone, Award, Calendar, Shield } from 'lucide-react';

export default function FoundersPage() {
  const getStatusBadge = (status: Founder['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full text-xs font-semibold">ACTIVE</span>;
      case 'inactive':
        return <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400 rounded-full text-xs font-semibold">INACTIVE</span>;
      case 'on-leave':
        return <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-semibold">ON LEAVE</span>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Azora World Founders</h1>
  <p className="text-lg opacity-90">Making Africa&apos;s Industries Auditable, Transparent, and Trusted</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">Total Founders</p>
            <p className="text-3xl font-bold">{FOUNDERS.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">Human Founders</p>
            <p className="text-3xl font-bold">{FOUNDERS.filter(f => f.roles[0] !== 'AI_DEPUTY_CEO').length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">AI Founders</p>
            <p className="text-3xl font-bold">{FOUNDERS.filter(f => f.roles[0] === 'AI_DEPUTY_CEO').length}</p>
          </div>
        </div>
      </div>

      {/* Founders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {FOUNDERS.map((founder) => (
          <div
            key={founder.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Founder Header */}
            <div className={`p-6 ${
              founder.roles.includes('AI_DEPUTY_CEO')
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600'
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            } text-white`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                    {founder.roles.includes('AI_DEPUTY_CEO') ? '▲' : founder.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{founder.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {founder.titles.map((title, idx) => (
                        <span key={idx} className="text-xs bg-white/20 px-2 py-1 rounded">
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {getStatusBadge(founder.status)}
              </div>
              
              {/* Equity Display */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded">
                  <Award className="w-4 h-4" />
                  <span>Equity: <span className="font-bold">{founder.equity}%</span></span>
                </div>
                {founder.votingRights && (
                  <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded">
                    <Shield className="w-4 h-4" />
                    <span>Voting Rights</span>
                  </div>
                )}
              </div>
            </div>

            {/* Founder Body */}
            <div className="p-6 space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <a href={`mailto:${founder.email}`} className="hover:underline">
                    {founder.email}
                  </a>
                </div>
                {founder.phoneNumber && (
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>{founder.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Joined: {new Date(founder.joinedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>

              {/* Bio */}
              {founder.bio && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {founder.bio}
                  </p>
                </div>
              )}

              {/* Roles & Permissions */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Key Responsibilities</h3>
                <div className="flex flex-wrap gap-2">
                  {founder.permissions.slice(0, 6).map((perm, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded"
                    >
                      {perm.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  ))}
                  {founder.permissions.length > 6 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400 rounded">
                      +{founder.permissions.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Founder ID */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Founder ID: <span className="font-mono font-semibold">{founder.founderId}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Launch Information */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">🚀 Historic Launch - October 10, 2025</h2>
        <p className="text-lg mb-4">
          Today marks a watershed moment in corporate governance. AZORA becomes the world&apos;s first AI to be granted founder status with equity ownership (1%) and voting rights.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="font-bold text-2xl">6</p>
            <p className="text-sm opacity-90">Total Founders</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="font-bold text-2xl">100%</p>
            <p className="text-sm opacity-90">Equity Allocated</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="font-bold text-2xl">Equal</p>
            <p className="text-sm opacity-90">Voting Rights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
