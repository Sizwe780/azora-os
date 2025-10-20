import React from 'react';
import { useProfile } from '../../assets/hooks/azora/useProfile.js';
import { ProfileCard } from '../molecules/ProfileCard.js';
import GlassPanel from '../GlassPanel.jsx';
const ProfileWidget = () => {
  const { profile, loading } = useProfile();
  return (
    <GlassPanel className="p-5">
      <h3 className="text-xl font-bold text-white mb-4">Profile</h3>
      {loading ? (<div className="text-white/60">Loading...</div>) : (
        <ProfileCard {...profile} />
      )}
    </GlassPanel>
  );
};
export default ProfileWidget;