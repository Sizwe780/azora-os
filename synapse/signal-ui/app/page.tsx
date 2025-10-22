"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Activity, Zap, Globe, Users, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarLayout } from "@/components/sidebar-layout"

export default function SignalDashboard() {
  const marketSignals = [
    {
      symbol: "BTC/USD",
      price: "$43,250",
      change: "+2.4%",
      trend: "up",
      signal: "BUY",
      strength: 85
    },
    {
      symbol: "ETH/USD",
      price: "$2,650",
      change: "-1.2%",
      trend: "down",
      signal: "HOLD",
      strength: 62
    },
    {
      symbol: "SOL/USD",
      price: "$98.50",
      change: "+5.7%",
      trend: "up",
      signal: "STRONG BUY",
      strength: 92
    },
    {
      symbol: "ADA/USD",
      price: "$0.45",
      change: "+0.8%",
      trend: "up",
      signal: "BUY",
      strength: 71
    }
  ]

  const africanMarkets = [
    {
      name: "JSE All Share",
      index: "J203",
      value: "72,450",
      change: "+1.2%",
      trend: "up",
      status: "active"
    },
    {
      name: "NSE 20",
      index: "NS20",
      value: "45,230",
      change: "-0.5%",
      trend: "down",
      status: "active"
    },
    {
      name: "EGX 30",
      index: "EGX30",
      value: "18,950",
      change: "+0.9%",
      trend: "up",
      status: "active"
    },
    {
      name: "ZSE Industrial",
      index: "ZSEIND",
      value: "8,420",
      change: "+2.1%",
      trend: "up",
      status: "active"
    }
  ]

  const alerts = [
    {
      type: "signal",
      message: "Strong buy signal detected for SOL/USD",
      time: "2 min ago",
      priority: "high"
    },
    {
      type: "market",
      message: "JSE All Share breaking resistance at 72,000",
      time: "5 min ago",
      priority: "medium"
    },
    {
      type: "ai",
      message: "AI detected unusual volume in ADA/USD",
      time: "8 min ago",
      priority: "high"
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
              <h1 className="text-3xl font-bold mb-2">Signal Dashboard</h1>
              <p className="text-green-100 mb-4">
                Real-time African intelligence and market signals powered by AI
              </p>
              <div className="flex items-center space-x-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  24 Active Signals
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  92% Accuracy Today
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <Activity className="w-10 h-10" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Market Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Live Market Signals</span>
              </CardTitle>
              <CardDescription>
                AI-powered signals with African market intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {marketSignals.map((signal, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{signal.symbol}</span>
                      <Badge
                        variant={signal.signal === "STRONG BUY" ? "default" : "secondary"}
                        className={
                          signal.signal === "STRONG BUY"
                            ? "bg-green-100 text-green-700"
                            : signal.signal === "BUY"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {signal.signal}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{signal.price}</div>
                    <div className={`text-sm font-medium ${
                      signal.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {signal.change}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Signal Strength</span>
                        <span>{signal.strength}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${signal.strength}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* African Markets & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* African Markets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>African Markets</span>
                </CardTitle>
                <CardDescription>
                  Real-time data from major African exchanges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {africanMarkets.map((market, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{market.name}</div>
                      <div className="text-sm text-gray-500">{market.index}: {market.value}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        market.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {market.change}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          market.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Alerts & Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Alerts & Insights</span>
                </CardTitle>
                <CardDescription>
                  AI-powered market alerts and trading insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      alert.priority === 'high'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {alert.type === 'signal' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : alert.type === 'market' ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        alert.priority === 'high'
                          ? 'border-red-200 text-red-700'
                          : 'border-yellow-200 text-yellow-700'
                      }
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>AI Market Insights</span>
              </CardTitle>
              <CardDescription>
                African intelligence analysis and predictive insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bullish Momentum</h3>
                  <p className="text-sm text-gray-600">
                    AI detects strong upward momentum in African tech stocks over the next 30 days
                  </p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Emerging Markets</h3>
                  <p className="text-sm text-gray-600">
                    Nigerian fintech sector showing 340% growth potential based on current trends
                  </p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Community Signals</h3>
                  <p className="text-sm text-gray-600">
                    89% of pro traders in our community are positioning for Q4 African market rally
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </SidebarLayout>
  )
}