'use client'

/**
 * Azora Vault - User Wallet Interface
 * 
 * Displays user's AZR token balance and transaction history
 * Implements Constitutional principle of Truth Economics (full transparency)
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Wallet, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  amount: number
  description: string
  status: string
  createdAt: string
  metadata?: any
}

interface WalletData {
  balance: number
  transactions: Transaction[]
  status: 'sovereign' | 'pooled'
  truthScore?: number
}

interface AzoraVaultProps {
  userId?: string
  className?: string
}

export function AzoraVault({ userId, className }: AzoraVaultProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchWalletData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/economy/wallet?userId=${userId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch wallet data')
        }

        const data = await response.json()
        setWalletData(data)
        setError(null)
      } catch (err) {
        console.error('[VAULT] Error fetching wallet:', err)
        setError(err instanceof Error ? err.message : 'Failed to load wallet')
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [userId])

  if (!userId) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Azora Vault
          </CardTitle>
          <CardDescription>Sign in to view your wallet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Azora Vault
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Azora Vault
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const balance = walletData?.balance ?? 0
  const transactions = walletData?.transactions ?? []
  const status = walletData?.status ?? 'sovereign'
  const truthScore = walletData?.truthScore ?? 100

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Azora Vault
          </div>
          <Badge variant={status === 'sovereign' ? 'default' : 'secondary'}>
            {status === 'sovereign' ? 'Sovereign' : 'Pooled'}
          </Badge>
        </CardTitle>
        <CardDescription>Your Proof-of-Knowledge rewards</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="bg-muted/50 rounded-lg p-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold">{balance.toLocaleString()}</span>
            <span className="text-xl text-muted-foreground">AZR</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Truth Score: {truthScore}%</span>
            </div>
          </div>
        </div>

        {/* Constitutional Note */}
        <div className="text-xs text-muted-foreground italic border-l-2 border-primary/50 pl-3">
          <p>
            <strong>Ubuntu Philosophy:</strong> 1% of all earnings support the Citadel Fund (Community Tax)
          </p>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Start earning by completing tutorials or contributing code</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Earning Opportunities */}
        <div className="bg-primary/5 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2">Earn More AZR</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Complete tutorials: +5 AZR</li>
            <li>• Commit quality code: +1 AZR</li>
            <li>• Ratify specs: +2 AZR</li>
            <li>• Create content: +4 AZR</li>
            <li>• Help peers: +3 AZR</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isPositive = transaction.amount > 0
  const StatusIcon = transaction.status === 'COMPLETED' ? CheckCircle : AlertCircle
  const statusColor = transaction.status === 'COMPLETED' ? 'text-green-500' : 'text-yellow-500'

  return (
    <div className="flex items-start justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <StatusIcon className={cn('w-3 h-3', statusColor)} />
          <p className="text-sm font-medium truncate">{transaction.description}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(transaction.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex flex-col items-end ml-4">
        <span
          className={cn(
            'text-sm font-semibold',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}
        >
          {isPositive ? '+' : ''}{transaction.amount} AZR
        </span>
        {transaction.metadata?.taxAmount && (
          <span className="text-xs text-muted-foreground">
            (-{transaction.metadata.taxAmount} tax)
          </span>
        )}
      </div>
    </div>
  )
}
