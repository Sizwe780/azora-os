import React from 'react';

// This component is based on the vision from Batch 40: Push Notifications & Subscriptions
export const NotificationSettings = ({ subscription, onUpdate }: { subscription: any, onUpdate: (sub: any) => void }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
        <input 
          type="checkbox" 
          className="form-checkbox bg-transparent border-white/30 rounded"
          checked={subscription.channels.push} 
          onChange={e => onUpdate({ ...subscription, channels: { ...subscription.channels, push: e.target.checked } })} 
        />
        Mobile Push
      </label>
      <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
        <input 
          type="checkbox" 
          className="form-checkbox bg-transparent border-white/30 rounded"
          checked={subscription.channels.email} 
          onChange={e => onUpdate({ ...subscription, channels: { ...subscription.channels, email: e.target.checked } })} 
        />
        Email
      </label>
      <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
        <input 
          type="checkbox" 
          className="form-checkbox bg-transparent border-white/30 rounded"
          checked={subscription.channels.discord} 
          onChange={e => onUpdate({ ...subscription, channels: { ...subscription.channels, discord: e.target.checked } })} 
        />
        Discord
      </label>
    </div>
  );
};
