import React from 'react';

const CrossNationProposalsWidget: React.ComponentType<{ userId: string }> = ({ userId }) => (
  <div>
    <h2>Cross-Nation Proposals</h2>
    {/* Add cross-nation proposals UI here */}
    <p>User: {userId}</p>
  </div>
);

export default CrossNationProposalsWidget;
