import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ServicePanel from '../../components/ServicePanel'

const KlippPanel = () => {
  const [paymentMetrics, setPaymentMetrics] = useState(null)
  const [activeTransactions, setActiveTransactions] = useState([])
  const [walletBalances, setWalletBalances] = useState([])
  const [pendingPayments, setPendingPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [newPayment, setNewPayment] = useState({
    recipient: '',
    amount: '',
    currency: 'AZR',
    description: ''
  })

  useEffect(() => {
    fetchPaymentMetrics()
  }, [])

  const fetchPaymentMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to connect to azora-mint payment endpoints
      const response = await axios.get('http://localhost:4300/api/payments/metrics')
      setPaymentMetrics(response.data)

      const transactionsResponse = await axios.get('http://localhost:4300/api/payments/transactions/active')
      setActiveTransactions(transactionsResponse.data.transactions || [])

      const walletsResponse = await axios.get('http://localhost:4300/api/payments/wallets/balances')
      setWalletBalances(walletsResponse.data.wallets || [])

      const pendingResponse = await axios.get('http://localhost:4300/api/payments/pending')
      setPendingPayments(pendingResponse.data.payments || [])
    } catch (err) {
      console.error('Error fetching payment metrics:', err)
      setError('Mint payment system unavailable. Using simulated data.')

      setPaymentMetrics({
        totalVolume: 1250000,
        activeTransactions: 47,
        successRate: 0.98,
        averageProcessingTime: 1.2,
        totalWallets: 8920,
        liquidityRatio: 0.94
      })

      setActiveTransactions([
        { id: 'tx-1', type: 'payment', amount: 2500, currency: 'AZR', status: 'processing', timestamp: '2024-01-20T10:30:00Z' },
        { id: 'tx-2', type: 'transfer', amount: 15000, currency: 'aZAR', status: 'confirmed', timestamp: '2024-01-20T10:25:00Z' },
        { id: 'tx-3', type: 'withdrawal', amount: 5000, currency: 'AZR', status: 'pending', timestamp: '2024-01-20T10:20:00Z' }
      ])

      setWalletBalances([
        { id: 'wallet-1', currency: 'AZR', balance: 50000, available: 45000, locked: 5000 },
        { id: 'wallet-2', currency: 'aZAR', balance: 250000, available: 240000, locked: 10000 },
        { id: 'wallet-3', currency: 'aUSD', balance: 75000, available: 72000, locked: 3000 }
      ])

      setPendingPayments([
        { id: 'pay-1', recipient: 'merchant-123', amount: 5000, currency: 'AZR', dueDate: '2024-01-21T12:00:00Z' },
        { id: 'pay-2', recipient: 'service-456', amount: 2500, currency: 'aZAR', dueDate: '2024-01-22T08:00:00Z' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async () => {
    if (!newPayment.recipient || !newPayment.amount) return

    try {
      setProcessing(true)
      setError(null)

      const response = await axios.post('http://localhost:4300/api/payments/process', {
        ...newPayment,
        amount: parseFloat(newPayment.amount),
        timestamp: new Date().toISOString()
      })

      if (response.data.success) {
        setNewPayment({ recipient: '', amount: '', currency: 'AZR', description: '' })
        await fetchPaymentMetrics()
      }
    } catch (err) {
      console.error('Error processing payment:', err)
      setError('Failed to process payment.')
    } finally {
      setProcessing(false)
    }
  }

  const approvePayment = async (paymentId) => {
    try {
      const response = await axios.post(`http://localhost:4300/api/payments/${paymentId}/approve`)

      if (response.data.success) {
        await fetchPaymentMetrics()
      }
    } catch (err) {
      console.error('Error approving payment:', err)
      setError('Failed to approve payment.')
    }
  }

  const stats = paymentMetrics ? [
    { label: 'Active Transactions', value: paymentMetrics.activeTransactions.toString(), change: '+5' },
    { label: 'Success Rate', value: `${(paymentMetrics.successRate * 100).toFixed(0)}%`, change: '+1%' },
    { label: 'Processing Time', value: `${paymentMetrics.averageProcessingTime.toFixed(1)}s`, change: '-0.2s' },
    { label: 'Total Wallets', value: paymentMetrics.totalWallets.toLocaleString(), change: '+120' }
  ] : []

  const actions = [
    { label: 'Refresh Status', onClick: fetchPaymentMetrics },
    { label: 'View Transaction History', onClick: () => console.log('View transaction history') },
    { label: 'Export Reports', onClick: () => console.log('Export reports') }
  ]

  if (loading) {
    return (
      <ServicePanel
        title="Klipp Payment System"
        description="Real-time payment processing and wallet management"
        stats={stats}
        actions={actions}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </ServicePanel>
    )
  }

  return (
    <ServicePanel
      title="Klipp Payment System"
      description="Real-time payment processing and wallet management"
      stats={stats}
      actions={actions}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* New Payment */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Process New Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recipient</label>
              <input
                type="text"
                value={newPayment.recipient}
                onChange={(e) => setNewPayment({...newPayment, recipient: e.target.value})}
                placeholder="Recipient address or ID"
                className="w-full p-2 border border-border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                placeholder="0.00"
                className="w-full p-2 border border-border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select
                value={newPayment.currency}
                onChange={(e) => setNewPayment({...newPayment, currency: e.target.value})}
                className="w-full p-2 border border-border rounded"
              >
                <option value="AZR">AZR</option>
                <option value="aZAR">aZAR</option>
                <option value="aUSD">aUSD</option>
                <option value="aGBP">aGBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={newPayment.description}
                onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                placeholder="Payment description"
                className="w-full p-2 border border-border rounded"
              />
            </div>
          </div>

          <button
            onClick={processPayment}
            disabled={processing || !newPayment.recipient || !newPayment.amount}
            className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {processing ? 'Processing Payment...' : 'Process Payment'}
          </button>
        </div>

        {/* Wallet Balances */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Wallet Balances</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {walletBalances.map(wallet => (
              <div key={wallet.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{wallet.currency}</h4>
                  <span className="text-sm text-muted-foreground">Wallet {wallet.id.split('-')[1]}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <p className="text-xl font-bold">{wallet.balance.toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="text-sm font-medium">{wallet.available.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Locked</p>
                      <p className="text-sm font-medium">{wallet.locked.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Transactions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Active Transactions</h3>
          <div className="space-y-3">
            {activeTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{transaction.type.toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.amount.toLocaleString()} {transaction.currency}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    transaction.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Payments */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Pending Approvals</h3>
          <div className="space-y-3">
            {pendingPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">Payment to {payment.recipient}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.amount.toLocaleString()} {payment.currency}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    Pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Due: {new Date(payment.dueDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => approvePayment(payment.id)}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ServicePanel>
  )
}

export default KlippPanel