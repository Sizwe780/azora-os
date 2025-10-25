import React, { useState, useEffect } from 'react'
import ServicePanel from '../../components/ServicePanel'
import { useAuth } from '../../contexts/AuthContext'

const CryptoLedgerPanel = () => {
    const { user } = useAuth()
    const [blockchainData, setBlockchainData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const stats = [
        { label: 'Total Blocks', value: '1,247', change: '+3' },
        { label: 'Total Transactions', value: '15,892', change: '+24' },
        { label: 'Active Validators', value: '47', change: '+2' },
        { label: 'Network TPS', value: '1,203', change: '+5.2%' }
    ]

    const actions = [
        { label: 'Refresh Data', onClick: () => console.log('Refresh data') },
        { label: 'View Explorer', onClick: () => console.log('View explorer') }
    ]

    useEffect(() => {
        fetchBlockchainData()
    }, [])

    const fetchBlockchainData = async () => {
        try {
            setLoading(true)
            // Real API call to Azora Covenant for blockchain data
            const response = await fetch('http://localhost:4600/api/blockchain/status', {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch blockchain data')
            }

            const data = await response.json()
            setBlockchainData(data)
        } catch (err) {
            setError(err.message)
            // Fallback to mock data
            setBlockchainData({
                recentBlocks: [
                    { index: 1247, hash: 'a1b2c3d4e5f6...', timestamp: '2024-01-15T10:30:00Z', transactions: 12 },
                    { index: 1246, hash: 'f6e5d4c3b2a1...', timestamp: '2024-01-15T10:25:00Z', transactions: 8 },
                    { index: 1245, hash: '1a2b3c4d5e6f...', timestamp: '2024-01-15T10:20:00Z', transactions: 15 },
                    { index: 1244, hash: '6f5e4d3c2b1a...', timestamp: '2024-01-15T10:15:00Z', transactions: 6 }
                ],
                pendingTransactions: [
                    { id: 'tx-001', type: 'TRANSFER', amount: 500, from: 'user1', to: 'user2', timestamp: '2024-01-15T10:35:00Z' },
                    { id: 'tx-002', type: 'STAKE', amount: 1000, from: 'user3', to: 'validator1', timestamp: '2024-01-15T10:32:00Z' },
                    { id: 'tx-003', type: 'TRANSFER', amount: 250, from: 'user4', to: 'user5', timestamp: '2024-01-15T10:28:00Z' }
                ],
                networkStats: {
                    validators: 47,
                    totalSupply: 1000000000,
                    circulatingSupply: 750000000,
                    averageBlockTime: 5.2
                }
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <ServicePanel
            title="Crypto Ledger"
            description="Blockchain-based transaction ledger"
            stats={stats}
            actions={actions}
        >
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-8">Loading blockchain data...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">Error: {error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Blocks</h3>
                                <div className="space-y-3">
                                    {(blockchainData?.recentBlocks || [
                                        { index: 1247, hash: 'a1b2c3d4e5f6...', timestamp: '2024-01-15T10:30:00Z', transactions: 12 },
                                        { index: 1246, hash: 'f6e5d4c3b2a1...', timestamp: '2024-01-15T10:25:00Z', transactions: 8 },
                                        { index: 1245, hash: '1a2b3c4d5e6f...', timestamp: '2024-01-15T10:20:00Z', transactions: 15 },
                                        { index: 1244, hash: '6f5e4d3c2b1a...', timestamp: '2024-01-15T10:15:00Z', transactions: 6 }
                                    ]).map((block, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                                            <div>
                                                <p className="font-medium text-foreground">Block #{block.index}</p>
                                                <p className="text-sm text-muted-foreground font-mono">{block.hash.substring(0, 16)}...</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">{block.transactions} txns</p>
                                                <p className="text-xs text-muted-foreground">{new Date(block.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Pending Transactions</h3>
                                <div className="space-y-3">
                                    {(blockchainData?.pendingTransactions || [
                                        { id: 'tx-001', type: 'TRANSFER', amount: 500, from: 'user1', to: 'user2', timestamp: '2024-01-15T10:35:00Z' },
                                        { id: 'tx-002', type: 'STAKE', amount: 1000, from: 'user3', to: 'validator1', timestamp: '2024-01-15T10:32:00Z' },
                                        { id: 'tx-003', type: 'TRANSFER', amount: 250, from: 'user4', to: 'user5', timestamp: '2024-01-15T10:28:00Z' }
                                    ]).map((tx, index) => (
                                        <div key={index} className="p-3 bg-background border border-border rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground font-mono text-sm">{tx.id}</p>
                                                    <p className="text-sm text-muted-foreground">{tx.type} • {tx.amount} AZR</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'TRANSFER' ? 'bg-blue-500/10 text-blue-500' :
                                                        tx.type === 'STAKE' ? 'bg-green-500/10 text-green-500' :
                                                            'bg-purple-500/10 text-purple-500'
                                                    }`}>
                                                    {tx.type}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Network Statistics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {(blockchainData?.networkStats ? [
                                    { label: 'Active Validators', value: blockchainData.networkStats.validators, unit: '' },
                                    { label: 'Total Supply', value: (blockchainData.networkStats.totalSupply / 1000000).toFixed(0), unit: 'M AZR' },
                                    { label: 'Circulating Supply', value: (blockchainData.networkStats.circulatingSupply / 1000000).toFixed(0), unit: 'M AZR' },
                                    { label: 'Avg Block Time', value: blockchainData.networkStats.averageBlockTime.toFixed(1), unit: 's' }
                                ] : [
                                    { label: 'Active Validators', value: '47', unit: '' },
                                    { label: 'Total Supply', value: '1,000', unit: 'M AZR' },
                                    { label: 'Circulating Supply', value: '750', unit: 'M AZR' },
                                    { label: 'Avg Block Time', value: '5.2', unit: 's' }
                                ]).map((stat, index) => (
                                    <div key={index} className="p-4 bg-background border border-border rounded-lg text-center">
                                        <p className="text-2xl font-bold text-foreground">{stat.value}{stat.unit}</p>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </ServicePanel>
    )
}

export default CryptoLedgerPanel
