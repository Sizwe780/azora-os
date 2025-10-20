import React from 'react';

interface AvatarProps {
  username: string;
  avatarUrl?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ username, avatarUrl, className = 'w-8 h-8' }) => {
  const fallbackInitial = username ? username.charAt(0).toUpperCase() : '?';
  const placeholderUrl = `https://placehold.co/100x100/334155/f8fafc?text=${fallbackInitial}`;

  return (
    <img
      src={avatarUrl || placeholderUrl}
      alt={`${username}'s avatar`}
      className={`${className} rounded-full object-cover`}
      onError={(e) => { (e.target as HTMLImageElement).src = placeholderUrl; }}
    />
  );
};

export default Avatar;
