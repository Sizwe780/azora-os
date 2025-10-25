"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/ui/sidebar"
import { SystemPulse } from "@/components/ui/system-pulse"
import { ConstitutionalGovernor } from "@/components/ui/constitutional-governor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  CreditCard,
  Send,
  Download,
  History,
  DollarSign,
  Zap,
  Shield,
  Crown,
  Activity,
  Star,
  Users,
  Globe,
  Brain,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react"

export default function PaymentPortal() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [showBalance, setShowBalance] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Real-time data simulation
  const [systemHealth, setSystemHealth] = useState(96.4)
  const [activeUsers, setActiveUsers] = useState(2847)

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => Math.max(90, Math.min(100, prev + (Math.random() - 0.5) * 2)))
      setActiveUsers(prev => Math.max(2800, Math.min(3000, prev + Math.floor((Math.random() - 0.5) * 20))))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const walletStats = [
    {
      label: "Total Balance",
      value: "45,280 AZR",
      valueUSD: "$2,264.00",
      change: "+12.5%",
      trend: "up",
      icon: Wallet,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      label: "Available Balance",
      value: "42,150 AZR",
      valueUSD: "$2,107.50",
      change: "+8.2%",
      trend: "up",
      icon: Coins,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      label: "Locked in Staking",
      value: "3,130 AZR",
      valueUSD: "$156.50",
      change: "+15.3%",
      trend: "up",
      icon: Shield,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      label: "Monthly Earnings",
      value: "1,847 AZR",
      valueUSD: "$92.35",
      change: "+23.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      gradient: "from-teal-500 to-cyan-500"
    },
  ]

  const transactions = [
    {
      id: 1,
      type: "received",
      description: "Payment from Acme Corporation",
      amount: "+2,500 AZR",
      amountUSD: "+$125.00",
      date: "2 hours ago",
      status: "completed",
      icon: ArrowDownLeft,
      color: "text-emerald-500",
      category: "Business"
    },
    {
      id: 2,
      type: "sent",
      description: "Marketplace purchase: Constitutional AI Agent",
      amount: "-2,500 AZR",
      amountUSD: "-$125.00",
      date: "5 hours ago",
      status: "completed",
      icon: ArrowUpRight,
      color: "text-blue-500",
      category: "Purchase"
    },
    {
      id: 3,
      type: "received",
      description: "Staking rewards",
      amount: "+156 AZR",
      amountUSD: "+$7.80",
      date: "1 day ago",
      status: "completed",
      icon: ArrowDownLeft,
      color: "text-emerald-500",
      category: "Rewards"
    },
    {
      id: 4,
      type: "sent",
      description: "Enterprise subscription renewal",
      amount: "-1,200 AZR",
      amountUSD: "-$60.00",
      date: "2 days ago",
      status: "completed",
      icon: ArrowUpRight,
      color: "text-blue-500",
      category: "Subscription"
    },
    {
      id: 5,
      type: "received",
      description: "Referral bonus",
      amount: "+500 AZR",
      amountUSD: "+$25.00",
      date: "3 days ago",
      status: "completed",
      icon: ArrowDownLeft,
      color: "text-emerald-500",
      category: "Referral"
    },
    {
      id: 6,
      type: "sent",
      description: "API credits purchase",
      amount: "-800 AZR",
      amountUSD: "-$40.00",
      date: "4 days ago",
      status: "completed",
      icon: ArrowUpRight,
      color: "text-blue-500",
      category: "Purchase"
    },
    {
      id: 7,
      type: "received",
      description: "Payment from TechFlow Industries",
      amount: "+3,200 AZR",
      amountUSD: "+$160.00",
      date: "5 days ago",
      status: "completed",
      icon: ArrowDownLeft,
      color: "text-emerald-500",
      category: "Business"
    },
    {
      id: 8,
      type: "sent",
      description: "Cloud infrastructure payment",
      amount: "-1,500 AZR",
      amountUSD: "-$75.00",
      date: "6 days ago",
      status: "pending",
      icon: ArrowUpRight,
      color: "text-blue-500",
      category: "Infrastructure"
    },
  ]

  const paymentMethods = [
    {
      id: 1,
      type: "Azora Wallet",
      details: "Primary wallet",
      balance: "45,280 AZR",
      icon: Wallet,
      color: "from-purple-500 to-pink-500",
      primary: true,
      security: "Bank-grade encryption"
    },
    {
      id: 2,
      type: "Credit Card",
      details: "•••• 4242",
      balance: "Visa",
      icon: CreditCard,
      color: "from-blue-500 to-indigo-500",
      primary: false,
      security: "PCI DSS compliant"
    },
    {
      id: 3,
      type: "Bank Account",
      details: "•••• 8901",
      balance: "Chase",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-500",
      primary: false,
      security: "ACH verified"
    },
  ]

  const quickActions = [
    { label: "Send", icon: Send, color: "from-blue-500 to-indigo-500", description: "Transfer AZR tokens" },
    { label: "Receive", icon: Download, color: "from-emerald-500 to-teal-500", description: "Generate payment address" },
    { label: "Buy AZR", icon: Coins, color: "from-purple-500 to-pink-500", description: "Purchase more tokens" },
    { label: "Stake", icon: Shield, color: "from-orange-500 to-red-500", description: "Earn rewards by staking" },
  ]

  const ecosystemStats = [
    { label: "Active Users", value: activeUsers.toLocaleString(), icon: Users, color: "text-blue-500" },
    { label: "System Health", value: `${systemHealth.toFixed(1)}%`, icon: Activity, color: "text-green-500" },
    { label: "Total Volume", value: "$12.4M", icon: TrendingUp, color: "text-purple-500" },
    { label: "Network Uptime", value: "99.9%", icon: Zap, color: "text-teal-500" },
  ]

  const handleQuickAction = (action: string) => {
    setSelectedAction(action)
    // Implementation would go here
  }

  const handleAddPaymentMethod = () => {
    // Implementation would go here
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-60 relative">
        {/* System Pulse Header */}
        <div className="border-b border-border/50 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <SystemPulse />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center animate-pulse-glow">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                      Azora Payment Portal
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Sovereign digital economy • Living constitutional AI
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-card/50 rounded-lg border border-border/50">
                  <div className={`w-2 h-2 rounded-full ${systemHealth > 95 ? 'bg-green-500' : systemHealth > 90 ? 'bg-yellow-500' : 'bg-red-500'} animate-living-pulse`} />
                  <span className="text-sm font-medium">System: {systemHealth.toFixed(1)}%</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="gap-2"
                >
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {showBalance ? 'Hide' : 'Show'} Balance
                </Button>
              </div>
            </div>

            {/* Ecosystem Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ecosystemStats.map((stat, index) => (
                <Card key={index} className="glass border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                      <div className={`p-2 rounded-lg bg-card/50`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="methods" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Payment Methods
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Wallet Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {walletStats.map((stat, index) => (
                    <Card key={index} className="glass border-border/50 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold mb-1">
                              {showBalance ? stat.value : '••••••'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {showBalance ? stat.valueUSD : '••••••'}
                            </p>
                          </div>
                          <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-500">{stat.change}</span>
                          <span className="text-xs text-muted-foreground">vs last period</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Actions */}
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Fast access to common payment operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-3 hover:bg-card/70 transition-all duration-300 group"
                          onClick={() => handleQuickAction(action.label)}
                        >
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{action.label}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Transactions Preview */}
                <Card className="glass border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5 text-primary" />
                          Recent Transactions
                        </CardTitle>
                        <CardDescription>
                          Your latest payment activity
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("transactions")}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="flex items-center gap-4 p-4 rounded-lg bg-card/30 hover:bg-card/50 transition-all duration-300">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${transaction.type === "received" ? "bg-emerald-500/10" : "bg-blue-500/10"}`}>
                            <transaction.icon className={`w-5 h-5 ${transaction.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold truncate">{transaction.description}</p>
                              <div className="text-right flex-shrink-0">
                                <p className={`font-bold ${transaction.color}`}>
                                  {showBalance ? transaction.amount : '••••••'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {showBalance ? transaction.amountUSD : '••••••'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">{transaction.date}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {transaction.category}
                                </Badge>
                                <Badge
                                  className={
                                    transaction.status === "completed"
                                      ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                                      : "bg-orange-500/20 text-orange-500 border-orange-500/30"
                                  }
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-6">
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Transaction History
                    </CardTitle>
                    <CardDescription>
                      Complete history of your Azora Coin transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center gap-4 p-4 rounded-lg bg-card/30 hover:bg-card/50 transition-all duration-300">
                          <div className={`p-3 rounded-lg flex-shrink-0 ${transaction.type === "received" ? "bg-emerald-500/10" : "bg-blue-500/10"}`}>
                            <transaction.icon className={`w-6 h-6 ${transaction.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold">{transaction.description}</p>
                              <div className="text-right flex-shrink-0">
                                <p className={`text-lg font-bold ${transaction.color}`}>
                                  {showBalance ? transaction.amount : '••••••'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {showBalance ? transaction.amountUSD : '••••••'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">{transaction.date}</p>
                                <Badge variant="outline" className="text-xs">
                                  {transaction.category}
                                </Badge>
                              </div>
                              <Badge
                                className={
                                  transaction.status === "completed"
                                    ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                                    : "bg-orange-500/20 text-orange-500 border-orange-500/30"
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="methods" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paymentMethods.map((method) => (
                    <Card key={method.id} className="glass border-border/50 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                      <div className={`h-32 bg-gradient-to-br ${method.color} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-4 right-4">
                          {method.primary && (
                            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center justify-between text-white">
                            <div>
                              <p className="font-semibold text-lg">{method.type}</p>
                              <p className="text-sm opacity-90">{method.details}</p>
                            </div>
                            <method.icon className="w-8 h-8 opacity-90" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Balance</span>
                            <span className="font-semibold">
                              {showBalance ? method.balance : '••••••'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Security</span>
                            <div className="flex items-center gap-1">
                              <Shield className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-500">{method.security}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Card className="glass border-border/50 hover:shadow-lg transition-all duration-300 border-dashed">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[280px] text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mb-4 opacity-50">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">Add Payment Method</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect bank accounts, cards, or crypto wallets
                      </p>
                      <Button onClick={handleAddPaymentMethod} className="w-full">
                        Add Method
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Portfolio Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-card/30 rounded-lg">
                          <div>
                            <p className="font-semibold">AZR Holdings</p>
                            <p className="text-sm text-muted-foreground">Primary asset</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">45,280 AZR</p>
                            <p className="text-sm text-emerald-500">+12.5% this month</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Portfolio Health</span>
                            <span>96.4%</span>
                          </div>
                          <Progress value={96.4} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Transaction Volume
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-card/30 rounded-lg">
                            <p className="text-2xl font-bold text-emerald-500">+2,847</p>
                            <p className="text-sm text-muted-foreground">Received</p>
                          </div>
                          <div className="text-center p-4 bg-card/30 rounded-lg">
                            <p className="text-2xl font-bold text-blue-500">-1,423</p>
                            <p className="text-sm text-muted-foreground">Sent</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Monthly Goal</span>
                            <span>68%</span>
                          </div>
                          <Progress value={68} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Constitutional Governor Sidebar */}
      <div className="hidden xl:block w-96 border-l border-border/50 bg-card/50 backdrop-blur">
        <ConstitutionalGovernor />
      </div>
    </div>
  )
}
