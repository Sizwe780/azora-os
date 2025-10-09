import React from 'react';
import { Card } from '../components/ui/Card';
import { NotificationSettings } from '../components/azora/NotificationSettings';

const SettingsPage = () => {
  // Use React's state to manage the subscription settings so the UI updates
  const [subscription, setSubscription] = React.useState({
    channels: { push: true, email: false, discord: true },
  });

  // This function will be passed to the NotificationSettings component
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
