import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowUpRight, Copy } from 'lucide-react';

const WalletWidget = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState('--');
  const [address, setAddress] = useState('0x0000...0000');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // In a real implementation, we would fetch this from our blockchain service
    const fetchBalance = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        setBalance('2,450.75');
        setAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
        setLoading(false);
      }
    };
    
    fetchBalance();
  }, []);
  
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (addr) => {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--border-primary)',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            background: 'var(--accent-secondary)',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CreditCard size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Azora Wallet</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AZR Tokens</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/wallet')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            padding: '8px',
            borderRadius: '8px',
            color: 'var(--accent-primary)'
          }}
          aria-label="Go to wallet"
        >
          <ArrowUpRight size={18} />
        </button>
      </div>

      <div style={{
        borderRadius: '8px',
        background: 'var(--bg-tertiary)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          Balance
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: '700',
          color: loading ? 'var(--text-secondary)' : 'var(--text-primary)',
        }}>
          {loading ? '––' : `${balance} AZR`}
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        borderRadius: '8px',
        background: 'var(--bg-tertiary)',
        fontSize: '12px',
        cursor: 'pointer'
      }}
      onClick={copyAddress}
      >
        <span>{shortenAddress(address)}</span>
        {copied ? (
          <span style={{ color: 'var(--accent-primary)', fontSize: '11px' }}>Copied!</span>
        ) : (
          <Copy size={14} style={{ color: 'var(--text-secondary)' }} />
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => navigate('/wallet/send')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          Send
        </button>
        <button
          onClick={() => navigate('/wallet/withdraw')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default WalletWidget;