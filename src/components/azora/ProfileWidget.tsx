// src/components/azora/atoms/ProfileWidget.tsx
import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { auth } from '../../firebase/config'; // ensure this file exports a typed Firebase Auth instance
import GlassPanel from '../azora/atoms/GlassPanel';

const ProfileWidget: React.FC = () => {
  // Firebase Auth currentUser can be null
  const user = auth.currentUser;

  return (
    <GlassPanel className="p-5">
      <div className="flex items-center mb-4">
        <UserIcon className="w-6 h-6 text-indigo-300 mr-2" />
        <h3 className="text-xl font-bold text-white">Driver Profile</h3>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-900 flex items-center justify-center">
          <UserIcon className="w-8 h-8 text-white/70" />
        </div>
        <div>
          <p className="font-bold text-white">
            {user?.isAnonymous ? 'Anonymous Driver' : user?.uid}
          </p>
          <p className="text-sm text-white/60">
            UID: {user ? `${user.uid.substring(0, 12)}...` : 'N/A'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 text-center">
        <div>
          <p className="text-xl font-bold text-white">12,840</p>
          <p className="text-xs text-white/60">Reputation</p>
        </div>
        <div>
          <p className="text-xl font-bold text-white">Tier 3</p>
          <p className="text-xs text-white/60">Rank</p>
        </div>
      </div>
    </GlassPanel>
  );
};

export default ProfileWidget;
