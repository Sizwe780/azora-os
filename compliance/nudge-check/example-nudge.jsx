/**
 * Example of a compliant nudge implementation
 */

import React, { useState } from 'react';

export const CompliantSavingsNudge = ({ balance }) => {
  const [showNudge, setShowNudge] = useState(true);
  
  // User benefit implementation - explains why we're suggesting this
  const savingsExplanation = "Based on your transaction history, setting aside 5% of your balance could help you reach your goals faster.";
  
  // Transparency implementation - explains the suggestion
  const transparencyNote = "This suggestion is based on general financial wellness principles. We don't use your data for any other purpose.";
  
  // Opt-out implementation
  const handleOptOut = () => {
    setShowNudge(false);
    // In a real implementation, save this preference
    localStorage.setItem('disableNudge_savings', 'true');
  };
  
  if (!showNudge) return null;
  
  const suggestedAmount = (balance * 0.05).toFixed(2);
  
  return (
    <div className="nudge-container">
      <h4>Savings Opportunity</h4>
      <p>{savingsExplanation}</p>
      <button className="primary-action">
        Set aside {suggestedAmount} AZR
      </button>
      <button className="secondary-action">
        No thanks
      </button>
      <div className="nudge-footer">
        <small>{transparencyNote}</small>
        <button className="text-button" onClick={handleOptOut}>
          Don't show these suggestions again
        </button>
      </div>
    </div>
  );
};
