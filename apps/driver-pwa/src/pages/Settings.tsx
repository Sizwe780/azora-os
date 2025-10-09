import React from 'react';
import { Card } from '../components/ui/Card';
import { NotificationSettings } from '../components/azora/NotificationSettings';

const SettingsPage = () => {
  // Placeholder data and functions for NotificationSettings
  const [subscription, setSubscription] = React.useState({
    channels: { push: true, email: false, discord: true },
  });

  const handleUpdate = (newSub: any) => {
    console.log("Updating subscription settings:", newSub);
    setSubscription(newSub);
  };

  return (
    <div className="space-y-6">
      <Card title="Settings">
        <p className="text-white/70">Manage your Azora OS preferences and notifications.</p>
      </Card>
      
      {/* This card now correctly uses the imported NotificationSettings component */}
      <Card title="Notification Settings">
        <NotificationSettings subscription={subscription} onUpdate={handleUpdate} />
      </Card>
    </div>
  );
};

export default SettingsPage;
