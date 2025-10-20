import React from 'react';
import Heading from '../components/atoms/Heading';
import ProfileWidget from '../components/atoms/GlassPanel';

export default function ProfilePage() {
  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Profile</Heading>
      <ProfileWidget children={undefined} />
    </div>
  );
}