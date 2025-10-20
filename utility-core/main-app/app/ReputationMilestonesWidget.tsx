import React from 'react';

const ReputationMilestonesWidget: React.ComponentType<{ userId: string }> = ({ userId }) => (
  <div>
    <h2>Reputation Milestones</h2>
    {/* Add reputation milestones UI here */}
    <p>User: {userId}</p>
  </div>
);

export default ReputationMilestonesWidget;
