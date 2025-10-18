import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader } from 'lucide-react';
import blockchainService from '../../services/blockchain/blockchain.service';
import MainLayout from '../../components/layout/MainLayout';

const SendPage = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);
  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        await blockchainService.connectWallet();
        const walletBalance = await blockchainService.getBalance();
        setBalance(walletBalance);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setError('Failed to connect wallet. Please try again.');
      }
    };
    
    fetchBalance();
  }, []);
  
  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    setError(null);
  };
  
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setError(null);
  };
  
  const validateForm = () => {
    if (!address) {
      setError('Please enter a recipient address');
      return false;
    }
    
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Please enter a valid Ethereum address');
      return false;
    }
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (balance && parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const receipt = await blockchainService.transfer(address, amount);
      setSuccess(true);
      setTxHash(receipt.transactionHash);
    } catch (error) {
      console.error('Transaction failed:', error);
      setError(error.message || 'Transaction failed. Please try again.');
    }
    
    setLoading(false);
  };
  
  const resetForm = () => {
    setAddress('');
    setAmount('');
    setError(null);
    setSuccess(false);
    setTxHash(null);
  };

  return (
    <MainLayout>
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => navigate('/wallet')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              padding: '8px',
              borderRadius: '50%'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Send AZR</h1>
        </div>
        
        {success ? (
          <div style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--color-success)',
            borderRadius: '16px',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send size={30} color="white" />
            </div>
            
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                Transaction Sent!
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                You have successfully sent {amount} AZR to {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
            
            {txHash && (
              <div style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                width: '100%',
                overflowX: 'auto',
                fontSize: '14px'
              }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Transaction Hash:
                </div>
                <div style={{ wordBreak: 'break-all' }}>
                  {txHash}
                </div>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              gap: '16px',
              width: '100%',
              marginTop: '16px'
            }}>
              <button
                onClick={() => navigate('/wallet')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Wallet
              </button>
              
              <button
                onClick={resetForm}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Send More
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-primary)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px'
                }}>
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={handleAddressChange}
                  placeholder="0x..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-tertiary)',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}
                  disabled={loading}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px'
                }}>
                  Amount (AZR)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-tertiary)',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}
                  disabled={loading}
                />
                
                {balance !== null && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>Available: {parseFloat(balance).toFixed(4)} AZR</span>
                    <button
                      type="button"
                      onClick={() => setAmount(balance)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      disabled={loading}
                    >
                      Max
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {error && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(255, 76, 76, 0.1)',
                border: '1px solid var(--color-error)',
                color: 'var(--color-error)',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              disabled={loading}
            >
              {loading ? <Loader size={16} className="spin" /> : <Send size={16} />}
              {loading ? 'Processing...' : 'Send AZR'}
            </button>
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default SendPage;