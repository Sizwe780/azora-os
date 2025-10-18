import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, CreditCard, Bank, Smartphone, Loader } from 'lucide-react';
import blockchainService from '../../services/blockchain/blockchain.service';

const WithdrawPage = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [withdrawDetails, setWithdrawDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [withdrawFee, setWithdrawFee] = useState(0);
  const [withdrawalId, setWithdrawalId] = useState(null);
  
  const withdrawMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: Bank, fields: ['accountName', 'accountNumber', 'bankName', 'swiftCode'], fee: 0.015 },
    { id: 'card', name: 'Card Withdrawal', icon: CreditCard, fields: ['cardNumber', 'expiryDate', 'cvv', 'cardHolderName'], fee: 0.025 },
    { id: 'mobile', name: 'Mobile Money', icon: Smartphone, fields: ['phoneNumber', 'provider'], fee: 0.01 }
  ];
  
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
  
  useEffect(() => {
    // Calculate withdrawal fee when amount or method changes
    if (amount && !isNaN(amount)) {
      const method = withdrawMethods.find(m => m.id === withdrawMethod);
      if (method) {
        const fee = parseFloat(amount) * method.fee;
        setWithdrawFee(fee);
      }
    } else {
      setWithdrawFee(0);
    }
  }, [amount, withdrawMethod]);
  
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setError(null);
  };
  
  const handleMethodChange = (methodId) => {
    setWithdrawMethod(methodId);
    setWithdrawDetails({});
    setError(null);
  };
  
  const handleDetailsChange = (field, value) => {
    setWithdrawDetails(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };
  
  const validateForm = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (balance && parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance');
      return false;
    }
    
    const method = withdrawMethods.find(m => m.id === withdrawMethod);
    if (!method) {
      setError('Please select a withdrawal method');
      return false;
    }
    
    for (const field of method.fields) {
      if (!withdrawDetails[field]) {
        setError(`Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
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
      // In a real implementation, this would call an API to process the withdrawal
      // For now, we'll simulate a successful withdrawal after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random withdrawal ID
      const id = 'WD' + Date.now().toString().substring(5) + Math.random().toString(36).substring(2, 6).toUpperCase();
      setWithdrawalId(id);
      setSuccess(true);
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setError(error.message || 'Withdrawal failed. Please try again.');
    }
    
    setLoading(false);
  };
  
  const resetForm = () => {
    setAmount('');
    setWithdrawDetails({});
    setError(null);
    setSuccess(false);
    setWithdrawalId(null);
  };
  
  const renderFieldLabel = (field) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };
  
  const getMethodIcon = (methodId) => {
    const method = withdrawMethods.find(m => m.id === methodId);
    if (!method) return null;
    
    const Icon = method.icon;
    return <Icon size={24} />;
  };

  return (
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
        <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Withdraw AZR</h1>
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
            <DollarSign size={30} color="white" />
          </div>
          
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Withdrawal Request Submitted!
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Your withdrawal of {amount} AZR has been submitted for processing.
            </p>
          </div>
          
          {withdrawalId && (
            <div style={{
              padding: '12px',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
              width: '100%',
              fontSize: '14px'
            }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Withdrawal Reference:
              </div>
              <div style={{ fontWeight: '600' }}>
                {withdrawalId}
              </div>
            </div>
          )}
          
          <div style={{
            padding: '16px',
            background: 'rgba(255, 192, 0, 0.1)',
            borderRadius: '8px',
            width: '100%',
            border: '1px solid var(--color-warning)',
            fontSize: '14px'
          }}>
            Withdrawals typically process within 24-48 hours. You'll receive a confirmation email once completed.
          </div>
          
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
              New Withdrawal
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
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '8px'
              }}>
                Withdrawal Method
              </label>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                {withdrawMethods.map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => handleMethodChange(method.id)}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '12px',
                      background: withdrawMethod === method.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: withdrawMethod === method.id ? 'white' : 'var(--text-primary)',
                      border: '1px solid',
                      borderColor: withdrawMethod === method.id ? 'var(--accent-primary)' : 'var(--border-primary)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.3s'
                    }}
                  >
                    {getMethodIcon(method.id)}
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{method.name}</span>
                    {withdrawMethod === method.id && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        border: '2px solid var(--accent-primary)'
                      }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {withdrawMethod === 'bank' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={withdrawDetails.accountName || ''}
                    onChange={(e) => handleDetailsChange('accountName', e.target.value)}
                    placeholder="John Doe"
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
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={withdrawDetails.accountNumber || ''}
                    onChange={(e) => handleDetailsChange('accountNumber', e.target.value)}
                    placeholder="123456789"
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
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={withdrawDetails.bankName || ''}
                    onChange={(e) => handleDetailsChange('bankName', e.target.value)}
                    placeholder="Bank of America"
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
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    SWIFT Code
                  </label>
                  <input
                    type="text"
                    value={withdrawDetails.swiftCode || ''}
                    onChange={(e) => handleDetailsChange('swiftCode', e.target.value)}
                    placeholder="BOFAUS3N"
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
              </div>
            )}
            
            {withdrawMethod === 'card' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={withdrawDetails.cardNumber || ''}
                    onChange={(e) => handleDetailsChange('cardNumber', e.target.value)}
                    placeholder="4111 1111 1111 1111"
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
                
                <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px'
                    }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={withdrawDetails.expiryDate || ''}
                      onChange={(e) => handleDetailsChange('expiryDate', e.target.value)}
                      placeholder="MM/YY"
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
                  
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px'
                    }}>
                      CVV
                    </label>
                    <input
                      type="text"
                      value={withdrawDetails.cvv || ''}
                      onChange={(e) => handleDetailsChange('cvv', e.target.value)}
                      placeholder="123"
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
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    value={withdrawDetails.cardHolderName || ''}
                    onChange={(e) => handleDetailsChange('cardHolderName', e.target.value)}
                    placeholder="John Doe"
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
              </div>
            )}
            
            {withdrawMethod === 'mobile' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={withdrawDetails.phoneNumber || ''}
                    onChange={(e) => handleDetailsChange('phoneNumber', e.target.value)}
                    placeholder="+1 234 567 890"
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
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px'
                  }}>
                    Provider
                  </label>
                  <select
                    value={withdrawDetails.provider || ''}
                    onChange={(e) => handleDetailsChange('provider', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-tertiary)',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center'
                    }}
                    disabled={loading}
                  >
                    <option value="">Select Provider</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="airtel">Airtel Money</option>
                  </select>
                </div>
              </div>
            )}
            
            {error && (
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                color: 'var(--color-danger)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '16px'
            }}>
              <button
                type="button"
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {loading && (
                  <Loader
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
                Withdraw AZR
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default WithdrawPage;