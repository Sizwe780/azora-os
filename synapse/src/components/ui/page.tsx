"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { SystemPulse } from "@/components/system-pulse"
import { ConstitutionalGovernor } from "@/components/constitutional-governor"
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
} from "lucide-react"

export default function PaymentPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

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
    },
    {
      id: 2,
      type: "Credit Card",
      details: "•••• 4242",
      balance: "Visa",
      icon: CreditCard,
      color: "from-blue-500 to-indigo-500",
      primary: false,
    },
    {
      id: 3,
      type: "Bank Account",
      details: "•••• 8901",
      balance: "Chase",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-500",
      primary: false,
    },
  ]

  const quickActions = [
    { label: "Send", icon: Send, color: "from-blue-500 to-indigo-500" },
    { label: "Receive", icon: Download, color: "from-emerald-500 to-teal-500" },
    { label: "Buy AZR", icon: Coins, color: "from-purple-500 to-pink-500" },
    { label: "Stake", icon: Shield, color: "from-orange-500 to-red-500" },
  ]

  const handleQuickAction = (action: string) => {
    setSelectedAction(action)
    switch (action) {
      case "Send":
        alert("Opening send AZR dialog...")
        break
      case "Receive":
        alert("Generating receive address...")
        break
      case "Buy AZR":
        alert("Opening purchase dialog...")
        break
      case "Stake":
        alert("Opening staking options...")
        break
    }
  }

  const handleAddPaymentMethod = () => {
    alert("Opening payment method setup...")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-60">
        <SystemPulse />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Payment Portal
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  Manage your Azora Coin wallet and transactions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedPeriod("24h")}>
                  24h
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedPeriod("7d")}>
                  7d
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedPeriod("30d")}>
                  30d
                </Button>
              </div>
            </div>

            {/* Wallet Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {walletStats.map((stat, index) => (
                <Card
                  key={index}
                  className="p-4 md:p-6 backdrop-blur-xl bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-xl md:text-2xl font-bold mb-1">{stat.value}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{stat.valueUSD}</p>
                    </div>
                    <div className={`p-2 md:p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />
                    <span className="text-xs md:text-sm font-medium text-emerald-500">{stat.change}</span>
                    <span className="text-xs md:text-sm text-muted-foreground">vs last period</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 md:h-24 flex flex-col items-center justify-center gap-2 hover:bg-card/70 transition-all duration-300 bg-transparent"
                  onClick={() => handleQuickAction(action.label)}
                >
                  <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-br ${action.color}`}>
                    <action.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className="text-sm md:text-base font-semibold">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Transaction History and Payment Methods */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
              <div className="xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <History className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                    Transaction History
                  </h2>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>

                <Card className="backdrop-blur-xl bg-card/50 border-border/50">
                  <div className="divide-y divide-border/50">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="p-3 md:p-4 hover:bg-card/70 transition-all duration-300">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${transaction.type === "received" ? "bg-emerald-500/10" : "bg-blue-500/10"}`}
                          >
                            <transaction.icon className={`w-4 h-4 md:w-5 md:h-5 ${transaction.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1 gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm md:text-base font-semibold truncate">{transaction.description}</p>
                                <p className="text-xs md:text-sm text-muted-foreground">{transaction.date}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className={`text-sm md:text-base font-bold ${transaction.color}`}>
                                  {transaction.amount}
                                </p>
                                <p className="text-xs md:text-sm text-muted-foreground">{transaction.amountUSD}</p>
                              </div>
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
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                  Payment Methods
                </h2>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <Card
                      key={method.id}
                      className="overflow-hidden backdrop-blur-xl bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300"
                    >
                      <div
                        className={`h-20 md:h-24 bg-gradient-to-br ${method.color} relative overflow-hidden p-3 md:p-4`}
                      >
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="relative z-10 flex items-start justify-between h-full">
                          <div className="text-white">
                            <p className="text-xs md:text-sm opacity-90">{method.type}</p>
                            <p className="font-semibold text-base md:text-lg mt-1">{method.details}</p>
                          </div>
                          <method.icon className="w-6 h-6 md:w-8 md:h-8 text-white opacity-90" />
                        </div>
                      </div>
                      <div className="p-3 md:p-4 flex items-center justify-between">
                        <span className="text-sm font-medium">{method.balance}</span>
                        {method.primary && (
                          <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">Primary</Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" className="w-full bg-transparent" onClick={handleAddPaymentMethod}>
                  <Zap className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>

                {/* Azora Coin Info */}
                <Card className="p-4 md:p-6 backdrop-blur-xl bg-card/50 border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 md:p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <Coins className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm md:text-base">Azora Coin (AZR)</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">Current Rate</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm md:text-base">
                      <span className="text-muted-foreground">1 AZR</span>
                      <span className="font-bold">$0.05</span>
                    </div>
                    <div className="flex items-center justify-between text-sm md:text-base">
                      <span className="text-muted-foreground">24h Change</span>
                      <span className="font-bold text-emerald-500">+2.4%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm md:text-base">
                      <span className="text-muted-foreground">Market Cap</span>
                      <span className="font-bold">$125M</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="hidden xl:block">
        <ConstitutionalGovernor />
      </div>
    </div>
  )
}
