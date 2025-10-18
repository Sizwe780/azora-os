import React, { useState } from 'react';

/**
 * TransactionsPage Component
 * - Implements Nudge Law: Transparency, Opt-Out, and User Benefit.
 */
const TransactionsPage = () => {
  const [transactions] = useState([
    { id: 1, type: 'sent', amount: 1.2, to: '0x...abcd' },
    { id: 2, type: 'received', amount: 50, from: '0x...efgh' },
    { id: 3, type: 'sent', amount: 0.8, to: '0x...1234' },
  ]);
  const [showNudge, setShowNudge] = useState(true);

  // Nudge Law Principle: User Benefit
  const forUserBenefit = "This helps you save on transaction costs and improve wallet hygiene.";
  // Nudge Law Principle: Transparency
  const transparencyNote = "This suggestion is shown to help you reduce future gas fees. You can opt out at any time.";
  const nudgeMessage = "You have multiple small outgoing transactions. Consider consolidating them to save on fees.";

  return (
    <div>
      <h1>Wallet Transactions</h1>
      {/* Nudge Law Principle: Opt-Out */}
      {showNudge && transactions.filter(t => t.type === 'sent').length > 1 && (
        <div className="nudge-container" style={{border: '1px solid #333', padding: '10px', margin: '10px 0'}}>
          <p className="nudge"><b>Suggestion:</b> {nudgeMessage}</p>
          <p><small className="forUserBenefit"><i>Why? {forUserBenefit}</i></small></p>
          <p><small className="transparencyNote"><i>{transparencyNote}</i></small></p>
          <button className="optOut" onClick={() => setShowNudge(false)}>Dismiss</button>
        </div>
      )}
      <ul>
        {transactions.map(tx => <li key={tx.id}>{tx.type} {tx.amount} AZR</li>)}
      </ul>
    </div>
  );
};

export default TransactionsPage;
