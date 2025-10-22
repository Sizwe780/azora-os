"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import {
  Shield,
  Database,
  Key,
  Lock,
  Users,
  CreditCard,
  Eye,
  AlertTriangle,
  Plus,
  Upload,
  Download,
  Settings,
  CheckCircle,
  Clock,
  FileText,
  Coins
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useTrustScore, useLoans, useCollateralSwap, useMintServiceHealth } from "@/hooks/use-mint"

export default function VaultDashboard() {
  // Mock user ID - in real app this would come from auth context
  const userId = "user-123"

  // Mint service hooks
  const { trustScore, loading: trustLoading } = useTrustScore(userId)
  const { loans, loading: loansLoading, makePayment } = useLoans()
  const { quote, loading: quoteLoading, error: quoteError, getQuote, executeSwap } = useCollateralSwap()
  const { isHealthy } = useMintServiceHealth()

  // Local state for collateral swap form
  const [azrAmount, setAzrAmount] = useState<string>("")
  const [swapLoading, setSwapLoading] = useState(false)
  const [swapSuccess, setSwapSuccess] = useState(false)

  const vaultStats = {
    totalAssets: 24,
    encryptedFiles: 18,
    activeCredentials: 6,
    pendingAccess: 3,
    azrBalance: "1,250.50",
    trustScore: trustScore?.overall || 87
  }

  // Handle AZR amount input change
  const handleAzrAmountChange = (value: string) => {
    setAzrAmount(value)
    const amount = parseFloat(value)
    if (amount >= 100 && !isNaN(amount)) {
      getQuote(amount)
    }
  }

  // Handle collateral swap execution
  const handleCollateralSwap = async () => {
    const amount = parseFloat(azrAmount)
    if (!amount || amount < 100) {
      alert("Please enter a valid amount (minimum 100 AZR)")
      return
    }

    if (!trustScore || trustScore.overall < 70) {
      alert("Trust score must be at least 70% for credit eligibility")
      return
    }

    try {
      setSwapLoading(true)
      const request = {
        azrAmount: amount,
        zarAmount: quote?.zarAmount || 0,
        term: 3
      }

      const result = await executeSwap(request)
      setSwapSuccess(true)

      // Reset form after successful swap
      setTimeout(() => {
        setSwapSuccess(false)
        setAzrAmount("")
      }, 3000)

      alert(`Collateral swap successful! Loan ID: ${result.loanId}`)
    } catch (error) {
      alert(`Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSwapLoading(false)
    }
  }

  // Handle loan payment
  const handleLoanPayment = async (loanId: string, amount: number) => {
    try {
      await makePayment(loanId, amount)
      alert("Payment processed successfully!")
    } catch (error) {
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const recentAssets = [
    {
      id: "asset-001",
      name: "Q4 Financial Report.pdf",
      type: "Document",
      size: "2.4 MB",
      encrypted: true,
      lastAccessed: "2 hours ago",
      status: "secure"
    },
    {
      id: "asset-002",
      name: "API Keys Config.json",
      type: "Secret",
      size: "1.2 KB",
      encrypted: true,
      lastAccessed: "1 day ago",
      status: "secure"
    },
    {
      id: "asset-003",
      name: "SAQA Certificate.pdf",
      type: "Credential",
      size: "5.1 MB",
      encrypted: true,
      lastAccessed: "3 days ago",
      status: "secure"
    }
  ]

  const recentTransactions = [
    {
      id: "tx-001",
      type: "Mint",
      amount: "+50.00 AZR",
      description: "Course completion reward",
      timestamp: "2025-10-22 14:30",
      status: "completed"
    },
    {
      id: "tx-002",
      type: "Transfer",
      amount: "-25.00 AZR",
      description: "Asset access fee",
      timestamp: "2025-10-22 12:15",
      status: "completed"
    },
    {
      id: "tx-003",
      type: "Collateral",
      amount: "-100.00 AZR",
      description: "Loan collateral lock",
      timestamp: "2025-10-22 09:45",
      status: "pending"
    }
  ]

  const accessRequests = [
    {
      id: "req-001",
      requester: "Compliance Team",
      asset: "Audit Logs Q3",
      reason: "Regulatory review",
      trustScore: 92,
      status: "pending"
    },
    {
      id: "req-002",
      requester: "Dev Portal",
      asset: "API Credentials",
      reason: "Integration testing",
      trustScore: 88,
      status: "pending"
    },
    {
      id: "req-003",
      requester: "Academy Admin",
      asset: "Student Records",
      reason: "Progress verification",
      trustScore: 95,
      status: "approved"
    }
  ]

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Azora Vault</h1>
              <p className="text-green-100 mb-4">
                Secure asset custody and decentralized data management
              </p>
              <div className="flex items-center space-x-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  {vaultStats.totalAssets} Assets Secured
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  Trust Score: {vaultStats.trustScore}%
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vaultStats.totalAssets}</div>
                <p className="text-xs text-muted-foreground">
                  {vaultStats.encryptedFiles} encrypted files
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AZR Balance</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vaultStats.azrBalance}</div>
                <p className="text-xs text-muted-foreground">
                  Available for transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Credentials</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vaultStats.activeCredentials}</div>
                <p className="text-xs text-muted-foreground">
                  Verified and accessible
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vaultStats.trustScore}%</div>
                <Progress value={vaultStats.trustScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="assets" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="access">Access Control</TabsTrigger>
              <TabsTrigger value="mint">Mint & Earn</TabsTrigger>
            </TabsList>

            {/* Assets Tab */}
            <TabsContent value="assets" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Assets</h2>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Asset
                </Button>
              </div>

              <div className="grid gap-4">
                {recentAssets.map((asset) => (
                  <Card key={asset.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {asset.type === 'Document' ? (
                              <FileText className="w-5 h-5 text-blue-600" />
                            ) : asset.type === 'Secret' ? (
                              <Key className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Shield className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{asset.name}</h3>
                            <p className="text-sm text-gray-500">
                              {asset.type} • {asset.size} • Last accessed {asset.lastAccessed}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <Lock className="w-3 h-3 mr-1" />
                            Encrypted
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Transaction History</h2>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'Mint' ? 'bg-green-100' :
                            tx.type === 'Transfer' ? 'bg-blue-100' : 'bg-orange-100'
                          }`}>
                            {tx.type === 'Mint' ? (
                              <Coins className="w-5 h-5 text-green-600" />
                            ) : tx.type === 'Transfer' ? (
                              <CreditCard className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Lock className="w-5 h-5 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{tx.description}</p>
                            <p className="text-sm text-gray-500">{tx.timestamp}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            tx.amount.startsWith('+') ? 'text-green-600' :
                            tx.amount.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {tx.amount}
                          </p>
                          <Badge
                            variant="secondary"
                            className={
                              tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Access Control Tab */}
            <TabsContent value="access" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Access Requests</h2>
                <Badge variant="secondary">{vaultStats.pendingAccess} Pending</Badge>
              </div>

              <div className="grid gap-4">
                {accessRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{request.requester}</h3>
                            <p className="text-sm text-gray-500">
                              Requesting access to: {request.asset}
                            </p>
                            <p className="text-sm text-gray-500">Reason: {request.reason}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">{request.trustScore}% Trust</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                              Deny
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Mint & Earn Tab */}
            <TabsContent value="mint" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Mint & Earn AZR</h2>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Coins className="w-4 h-4 mr-2" />
                    Earn AZR
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Get Cash
                  </Button>
                </div>
              </div>

              {/* Trust Score Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Neural Trust Score
                  </CardTitle>
                  <CardDescription>
                    Your creditworthiness based on provable value creation and community participation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trustLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : trustScore ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">{trustScore.overall}%</div>
                        <div className="text-sm text-gray-500">Overall Score</div>
                        <Progress value={trustScore.overall} className="mt-2" />
                        {!trustScore.eligible && (
                          <div className="text-xs text-red-600 mt-1">Below minimum (70%)</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>System Use</span>
                          <span className="font-medium">{trustScore.factors.systemUse}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Code Compliance</span>
                          <span className="font-medium">{trustScore.factors.codeCompliance}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Social Ledger</span>
                          <span className="font-medium">{trustScore.factors.socialLedger}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Repayment History</span>
                          <span className="font-medium">{trustScore.factors.repaymentHistory}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Value Creation</span>
                          <span className="font-medium">{trustScore.factors.valueCreation}%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Updated: {new Date(trustScore.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Unable to load trust score</p>
                      {!isHealthy && (
                        <p className="text-sm text-red-600">Mint service unavailable</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Anti-Bank Protocol - Collateral Swap */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-blue-600" />
                    Anti-Bank Protocol: Get Cash with AZR Collateral
                  </CardTitle>
                  <CardDescription>
                    Lock your AZR tokens as collateral to access ZAR liquidity. 120% collateralization required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Collateral Swap Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">AZR Amount to Lock</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={azrAmount}
                            onChange={(e) => handleAzrAmountChange(e.target.value)}
                            placeholder="100"
                            min="100"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <span className="absolute right-3 top-3 text-gray-500">AZR</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 100 AZR • Maximum based on trust score</p>
                        {quoteError && (
                          <p className="text-xs text-red-600 mt-1">{quoteError}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Loan Amount (ZAR)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={quote ? (quote.zarAmount * 0.8).toFixed(2) : ""}
                            readOnly
                            placeholder="Calculating..."
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <span className="absolute right-3 top-3 text-gray-500">ZAR</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {quote ? `1 AZR = R${(quote.zarAmount / parseFloat(azrAmount || "1") * 0.8).toFixed(2)} • 120% collateral ratio` : "Enter AZR amount to calculate"}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Loan Term</label>
                        <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                          <option value="3">3 Months (Standard)</option>
                          <option value="6" disabled>6 Months (Premium Trust Required)</option>
                        </select>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Loan Terms</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• 120% AZR collateral required</li>
                          <li>• 20% metabolic tax (protocol fee)</li>
                          <li>• Monthly repayments</li>
                          <li>• 15% penalty for defaults</li>
                          <li>• Autonomous collection if overdue</li>
                        </ul>
                      </div>

                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        onClick={handleCollateralSwap}
                        disabled={swapLoading || !quote || !trustScore?.eligible}
                      >
                        {swapLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : swapSuccess ? (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Swap Successful!
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Lock className="w-4 h-4 mr-2" />
                            Lock Collateral & Get Cash
                          </div>
                        )}
                      </Button>

                      {!trustScore?.eligible && (
                        <p className="text-xs text-red-600 text-center">
                          Trust score must be ≥70% for credit eligibility
                        </p>
                      )}
                    </div>

                    {/* Loan Preview & Stats */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg mb-4">Loan Preview</h3>
                        {quote ? (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Collateral to Lock:</span>
                              <span className="font-medium">{quote.collateralRequired.toFixed(2)} AZR</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cash Received:</span>
                              <span className="font-medium text-green-600">R{(quote.zarAmount * 0.8).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Metabolic Tax (20%):</span>
                              <span className="font-medium">R{quote.metabolicTax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Net Amount:</span>
                              <span className="font-medium text-blue-600">R{((quote.zarAmount * 0.8) - quote.metabolicTax).toFixed(2)}</span>
                            </div>
                            <hr className="my-3" />
                            <div className="flex justify-between">
                              <span>Monthly Payment:</span>
                              <span className="font-medium">R{quote.monthlyPayment.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Term:</span>
                              <span className="font-medium">{quote.term} months</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-4">
                            <p>Enter AZR amount to see loan preview</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-900">Important Notes</h4>
                            <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                              <li>• Trust score must be ≥70% for eligibility</li>
                              <li>• Collateral is locked for loan duration</li>
                              <li>• Late payments trigger autonomous collection</li>
                              <li>• Default penalty: 15% additional fee</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Loans */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Loans</CardTitle>
                  <CardDescription>Manage your Anti-Bank protocol loans and repayments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loansLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : loans.length > 0 ? (
                      loans.map((loan) => (
                        <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Lock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Loan #{loan.id.slice(-8)}</h3>
                              <p className="text-sm text-gray-500">
                                R{loan.amount.toFixed(2)} • {loan.remainingPayments} of {loan.term} payments remaining
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Next payment due</div>
                            <div className="font-medium">{new Date(loan.nextPaymentDue).toLocaleDateString()}</div>
                            <div className="text-sm font-medium text-orange-600">R{loan.nextPaymentAmount.toFixed(2)}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoanPayment(loan.id, loan.nextPaymentAmount)}
                          >
                            Pay Now
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No active loans</p>
                        <p className="text-sm">Apply for credit using the Anti-Bank protocol above</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Earn AZR Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Balance</CardTitle>
                    <CardDescription>Your AZR tokens and collateral</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Available AZR</span>
                      <span className="font-bold text-lg">1,250.50</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Locked Collateral</span>
                      <span className="font-bold text-lg text-orange-600">120.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Trust Score</span>
                      <span className="font-bold text-lg text-green-600">87%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Earn More AZR</CardTitle>
                    <CardDescription>Complete activities to earn tokens</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Secure new asset</span>
                        <Badge className="bg-green-100 text-green-700">+10 AZR</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Grant access approval</span>
                        <Badge className="bg-green-100 text-green-700">+5 AZR</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Complete credential verification</span>
                        <Badge className="bg-green-100 text-green-700">+25 AZR</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </SidebarLayout>
  )
}