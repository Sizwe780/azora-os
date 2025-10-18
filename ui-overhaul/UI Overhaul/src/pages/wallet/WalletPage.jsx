import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const WalletPage = () => {
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch wallet balance
    const fetchBalance = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setBalance('100');
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, []);

  // Nudge law implementation - suggests saving
  const [showSavingsNudge, setShowSavingsNudge] = useState(true);
  const savingsExplanation = "Based on your transaction history, setting aside 5 AZR could help you reach your goals faster.";
  const transparencyNote = "This suggestion is based on general financial wellness principles.";
  
  return (
    <div className="wallet-page">
      <h1>My Wallet</h1>
      
      {isLoading ? (
        <p>Loading wallet info...</p>
      ) : (
        <>
          <div className="balance-card">
            <h2>Your Balance</h2>
            <div className="balance-amount">{balance} AZR</div>
            <p className="max-supply-note">Total supply: 1,000,000 AZR</p>
          </div>

          {/* Nudge law implementation - provides benefit orientation */}
          {showSavingsNudge && parseFloat(balance) > 10 && (
            <div className="nudge-container forUserBenefit">
              <h4>Savings Opportunity</h4>
              <p>{savingsExplanation}</p>
              <button className="primary-action">
                Set aside 5 AZR
              </button>
              <button className="secondary-action">
                No thanks
              </button>
              <div className="nudge-footer">
                <small className="transparencyNote">{transparencyNote}</small>
                <button className="text-button disableNudge" onClick={() => setShowSavingsNudge(false)}>
                  Don't show these suggestions again
                </button>
              </div>
            </div>
          )}
          
          <div className="action-buttons">
            <Link to="/wallet/send" className="btn-primary">Send</Link>
            <Link to="/wallet/receive" className="btn-secondary">Receive</Link>
            <Link to="/wallet/transactions" className="btn-tertiary">Transactions</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletPage;
