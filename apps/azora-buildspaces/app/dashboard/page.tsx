'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AuthService, User } from "@/lib/services/auth-service"
import { AzoraVault } from "@/components/economy/azora-vault"
import { 
  Code2, 
  Brain, 
  Palette, 
  Database, 
  Settings, 
  Users, 
  Shield, 
  Zap,
  LogOut,
  User as UserIcon,
  Crown,
  Globe,
  CheckCircle,
  Clock
} from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authService] = useState(() => AuthService.getInstance())
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to load user:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    router.push('/')
  }

  const developmentRooms = [
    {
      id: 'code-chamber',
      name: 'Code Chamber',
      description: 'Advanced code editor with Constitutional AI assistance',
      icon: Code2,
      color: 'emerald',
      href: '/workspace?room=code-chamber',
      available: true
    },
    {
      id: 'ai-studio',
      name: 'AI Studio',
      description: 'Collaborate with Elara, Sankofa, and Themba',
      icon: Brain,
      color: 'blue',
      href: '/workspace?room=ai-studio',
      available: true
    },
    {
      id: 'design-studio',
      name: 'Design Studio',
      description: 'Visual design tools with AI-powered suggestions',
      icon: Palette,
      color: 'purple',
      href: '/workspace?room=design-studio',
      available: true
    },
    {
      id: 'data-forge',
      name: 'Data Forge',
      description: 'Database management and analysis tools',
      icon: Database,
      color: 'cyan',
      href: '/workspace?room=data-forge',
      available: user?.subscription?.plan !== 'constitutional'
    },
    {
      id: 'collaboration-pod',
      name: 'Collaboration Pod',
      description: 'Real-time team collaboration and code review',
      icon: Users,
      color: 'amber',
      href: '/workspace?room=collaboration-pod',
      available: user?.subscription?.plan === 'ubuntu_pro' || user?.subscription?.plan === 'citadel_enterprise'
    },
    {
      id: 'command-desk',
      name: 'Command Desk',
      description: 'Terminal and deployment management',
      icon: Zap,
      color: 'rose',
      href: '/workspace?room=command-desk',
      available: user?.subscription?.plan !== 'constitutional'
    },
    {
      id: 'spec-chamber',
      name: 'Spec Chamber',
      description: 'Project planning and specification tools',
      icon: Shield,
      color: 'indigo',
      href: '/workspace?room=spec-chamber',
      available: true
    }
  ]

  const getSubscriptionBadge = () => {
    if (!user?.subscription) return null

    const { plan, status } = user.subscription
    
    const badges = {
      constitutional: { label: 'Constitutional', color: 'bg-emerald-500/20 text-emerald-400' },
      ubuntu_pro: { label: 'Ubuntu Pro', color: 'bg-blue-500/20 text-blue-400' },
      citadel_enterprise: { label: 'Citadel Enterprise', color: 'bg-purple-500/20 text-purple-400' }
    }

    const statusBadges = {
      trial: { label: 'Trial', color: 'bg-yellow-500/20 text-yellow-400' },
      active: { label: 'Active', color: 'bg-green-500/20 text-green-400' },
      expired: { label: 'Expired', color: 'bg-red-500/20 text-red-400' },
      cancelled: { label: 'Cancelled', color: 'bg-gray-500/20 text-gray-400' }
    }

    return (
      <div className="flex gap-2">
        <Badge className={badges[plan].color}>
          <Crown className="h-3 w-3 mr-1" />
          {badges[plan].label}
        </Badge>
        <Badge className={statusBadges[status].color}>
          {statusBadges[status].label}
        </Badge>
      </div>
    )
  }

  const getTrialProgress = () => {
    if (!user?.subscription?.expiresAt || user.subscription.status !== 'trial') return null

    const now = new Date()
    const expiresAt = new Date(user.subscription.expiresAt)
    const totalDuration = 30 * 24 * 60 * 60 * 1000 // 30 days
    const elapsed = now.getTime() - user.createdAt.getTime()
    const progress = Math.min((elapsed / totalDuration) * 100, 100)

    return (
      <Card className="bg-yellow-500/10 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            <span className="font-medium">Trial Period</span>
          </div>
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-yellow-300">
            {Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))} days remaining
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold">
                BuildSpaces
              </Link>
              <Badge className="bg-emerald-500/20 text-emerald-400">
                Constitutional AI
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span className="text-sm">{user.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-white/20 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}
          </h1>
          <p className="text-gray-400">
            Ready to build with Constitutional AI? Choose your development room below.
          </p>
        </div>

        {/* User Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getSubscriptionBadge()}
              {user.subscription?.geographicPricing && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                  <Globe className="h-4 w-4" />
                  <span>{user.subscription.geographicPricing.country}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(user.subscription.geographicPricing.discount * 100)}% discount
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {getTrialProgress()}

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-400" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(user.verificationStatus || {}).map(([key, verified]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`h-4 w-4 ${verified ? 'text-green-400' : 'text-gray-400'}`} />
                    <span className="capitalize">{key.replace('_', ' ')}</span>
                  </div>
                ))}
                <Link href="/verification">
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Manage Verification
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Development Rooms */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Development Rooms</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developmentRooms.map((room) => (
              <Card 
                key={room.id}
                className={`${
                  room.available 
                    ? 'bg-white/5 border-white/10 hover:border-white/20 cursor-pointer' 
                    : 'bg-gray-500/5 border-gray-500/20 opacity-60'
                } transition-all`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <room.icon className={`h-6 w-6 text-${room.color}-400`} />
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                  </div>
                  <CardDescription>{room.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {room.available ? (
                    <Link href={room.href}>
                      <Button className="w-full" variant="outline">
                        Enter Room
                      </Button>
                    </Link>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-3">
                        {user.subscription?.plan === 'constitutional' 
                          ? 'Upgrade to access this room'
                          : 'Not included in your plan'
                        }
                      </p>
                      <Link href="/pricing">
                        <Button variant="outline" size="sm">
                          Upgrade Plan
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Economy & Wallet Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Azora Economy</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <AzoraVault userId={user.id} className="bg-white/5 border-white/10" />
            
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Earn AZR Tokens</CardTitle>
                <CardDescription>
                  Proof-of-Knowledge rewards for valuable contributions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span>Complete Tutorial</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400">+5 AZR</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span>Quality Code Commit</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400">+1 AZR</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span>Spec Ratification</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400">+2 AZR</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span>Create Content</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400">+4 AZR</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span>Help Peers</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400">+3 AZR</Badge>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400 italic">
                    All work is verified for quality. Embrace Ubuntu: 1% of earnings support the community.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full justify-start">
                  <Crown className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" className="w-full justify-start">
                  <Brain className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Constitutional AI Status</CardTitle>
              <CardDescription>
                Your AI agents and system health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Elara (XO Architect)</span>
                <Badge className="bg-green-500/20 text-green-400">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sankofa (ConstitutionalCore)</span>
                <Badge className="bg-green-500/20 text-green-400">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Themba (AIOrchestrator)</span>
                <Badge className="bg-green-500/20 text-green-400">Active</Badge>
              </div>
              <div className="pt-3 border-t border-white/10">
                <Link href="/workspace/ai-studio">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                    Open AI Studio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
