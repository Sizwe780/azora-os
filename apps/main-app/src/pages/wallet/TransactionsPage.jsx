import React, { useState, useEffect } from 'react';
import NudgeProvider, { NudgeContext } from '../../providers/NudgeProvider';
import NudgeBanner from '../../components/nudge/NudgeBanner';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'sent', 'received'
  const [showNudge, setShowNudge] = useState(true); // optOut available

  useEffect(() => {
    const fetchTransactions = async () => {
      // placeholder: integrate real blockchain service
      setTimeout(() => {
        setTransactions([
          { id: '1', type: 'sent', amount: '3.5', from: '0x1234...5678', to: '0xabcd...efgh', timestamp: Date.now() - 3600*1000 },
          { id: '2', type: 'received', amount: '15', from: '0xabcd...efgh', to: '0x1234...5678', timestamp: Date.now() - 86400*1000 }
        ]);
        setAccount('0x1234...5678');
        setIsLoading(false);
      }, 300);
    };
    fetchTransactions();
  }, []);

  const formatAddress = (addr) => (addr ? addr : '');

  const filteredTransactions = transactions.filter(tx => filter === 'all' ? true : tx.type === filter);

  const nudgeMessage = "You might want to consolidate small transactions to save on fees";
  const transparencyNote = "This suggestion is shown to help reduce gas/transaction fees. You can opt out.";
  const forUserBenefit = "Helps you save on transaction costs and improve wallet hygiene.";

  const smallTxCount = (transactions || []).filter(tx => tx.type === 'sent' && Number(tx.amount) < 2).length;

  return (
    <NudgeProvider context={{ page: 'transactions', balance: 0, has2FA: false, smallTxCount }}>
      <div className="transactions-page">
        <h1>Transactions</h1>

        {/* nudge implementation with transparency and optOut */}
        {showNudge && transactions.length > 3 && (
          <div className="nudge-container">
            <p className="nudge">{nudgeMessage}</p>
            <small className="transparencyNote">{transparencyNote}</small>
            <p className="forUserBenefit">{forUserBenefit}</p>
            <button onClick={() => setShowNudge(false)} className="optOut">Don't show again</button>
          </div>
        )}

        <NudgeContext.Consumer>
          {({ nudges, onAccept, onDismiss }) => nudges.map(n => (
            <NudgeBanner key={n.id} nudge={n} onAccept={onAccept} onDismiss={onDismiss} />
          ))}
        </NudgeContext.Consumer>

        {isLoading ? <p>Loading...</p> : (
          <>
            <div className="filter-controls">
              <button onClick={() => setFilter('all')}>All</button>
              <button onClick={() => setFilter('sent')}>Sent</button>
              <button onClick={() => setFilter('received')}>Received</button>
            </div>

            <div className="transaction-list">
              {filteredTransactions.map(tx => (
                <div key={tx.id} className="transaction-item">
                  <div>{tx.type}</div>
                  <div>{tx.amount} AZR</div>
                  <div>From: {formatAddress(tx.from)}</div>
                  <div>To: {formatAddress(tx.to)}</div>
                  <div>{new Date(tx.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </NudgeProvider>
  );
};

export default TransactionsPage;
