import React from 'react';

const ReputationBridgeWidget: React.ComponentType<{ userId: string }> = ({ userId }) => (
  <div>
    <h2>Reputation Bridge</h2>
    {/* Add reputation bridge UI here */}
    <p>User: {userId}</p>
  </div>
);

export default ReputationBridgeWidget;
