import React from 'react';

interface ProfileCardProps {
  username: string;
  avatarUrl?: string;
  role?: string;
  status?: 'online' | 'offline';
}

const ProfileCard: React.FC<ProfileCardProps> = ({ username, avatarUrl, role, status }) => {
  const fallbackInitial = username ? username.charAt(0).toUpperCase() : '?';
  const placeholderUrl = `https://placehold.co/100x100/334155/f8fafc?text=${fallbackInitial}`;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/80 border border-white/10 shadow">
      <img
        src={avatarUrl || placeholderUrl}
        alt={`${username}'s avatar`}
        className="w-12 h-12 rounded-full object-cover"
        onError={e => ((e.target as HTMLImageElement).src = placeholderUrl)}
      />
      <div>
        <div className="font-bold text-white">{username}</div>
        {role && <div className="text-sm text-white/60">{role}</div>}
        {status && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'online' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
            {status}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;