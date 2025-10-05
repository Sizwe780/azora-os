import React from 'react';
import { Avatar } from '../atoms/Avatar';
export const ProfileCard = ({ name, role, avatarUrl, status }) => (
  <div className="flex gap-4 items-center">
    <Avatar src={avatarUrl} alt={name} />
    <div>
      <div className="font-bold text-white">{name}</div>
      <div className="text-xs text-white/70">{role}</div>
      <div className={`mt-1 text-xs ${status === 'online' ? 'text-green-400' : 'text-red-400'}`}>{status}</div>
    </div>
  </div>
);