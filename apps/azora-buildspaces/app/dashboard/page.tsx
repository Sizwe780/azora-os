'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AuthService, User } from "@/lib/services/auth-service"
import { AzoraVault } from "@/components/economy/azora-vault"
import { 
  Code2, 
  Brain, 
  Palette, 
  Settings, 
  Users, 
  Shield, 
  Zap,
  LogOut,
  User as UserIcon,
  Crown,
  Globe,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Activity,
  Layers,
  BookOpen,
  ChevronRight,
  Target,
  Search,
  Presentation,
  Focus,
  Wrench,
  Trophy
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
      description: 'Full-featured IDE with AI-assisted coding, IntelliSense, and real-time collaboration',
      icon: Code2,
      color: 'emerald',
      href: '/workspace?room=code-chamber',
      available: true
    },
    {
      id: 'ai-studio',
      name: 'AI Studio',
      description: 'Build, orchestrate, and deploy AI agent pipelines with natural language',
      icon: Brain,
      color: 'blue',
      href: '/workspace?room=ai-studio',
      available: true
    },
    {
      id: 'design-studio',
      name: 'Design Studio',
      description: 'Professional design tools with AI-powered layout, color, and component generation',
      icon: Palette,
      color: 'purple',
      href: '/workspace?room=design-studio',
      available: true
    },
    {
      id: 'command-desk',
      name: 'Command Desk',
      description: 'Terminal, CI/CD pipelines, and streaming deployment management',
      icon: Zap,
      color: 'rose',
      href: '/workspace?room=command-desk',
      available: true
    },
    {
      id: 'spec-chamber',
      name: 'Spec Chamber',
      description: 'AI-powered project specs, PRDs, and requirement documents',
      icon: Shield,
      color: 'indigo',
      href: '/workspace?room=spec-chamber',
      available: true
    },
    {
      id: 'collaboration-pod',
      name: 'Collaboration Pod',
      description: 'Real-time team collaboration, code review, and pair programming',
      icon: Users,
      color: 'amber',
      href: '/workspace?room=collaboration-pod',
      available: true
    },
    {
      id: 'task-board',
      name: 'Task Board',
      description: 'Sprint planning, velocity tracking, and daily standups with AI insights',
      icon: Target,
      color: 'cyan',
      href: '/workspace?room=task-board',
      available: true
    },
    {
      id: 'knowledge-ocean',
      name: 'Knowledge Ocean',
      description: 'Semantic search, knowledge graphs, and AI-indexed documentation',
      icon: Search,
      color: 'teal',
      href: '/workspace?room=knowledge-ocean',
      available: true
    },
    {
      id: 'innovation-theater',
      name: 'Innovation Theater',
      description: 'Pitch, demo, and present with AI pace coaching and audience analytics',
      icon: Presentation,
      color: 'orange',
      href: '/workspace?room=innovation-theater',
      available: true
    },
    {
      id: 'deep-focus',
      name: 'Deep Focus',
      description: 'Flow-state workspace with focus analytics, ambient sounds, and distraction blocking',
      icon: Focus,
      color: 'sky',
      href: '/workspace?room=deep-focus',
      available: true
    },
    {
      id: 'maker-lab',
      name: 'Maker Lab',
      description: 'Rapid prototyping, component playground, and experimental workbench',
      icon: Wrench,
      color: 'pink',
      href: '/workspace?room=maker-lab',
      available: true
    },
    {
      id: 'collectible-showcase',
      name: 'Collectible Showcase',
      description: 'NFT gallery, achievement badges, and digital collectible management',
      icon: Trophy,
      color: 'yellow',
      href: '/workspace?room=collectible-showcase',
      available: true
    }
  ]

  const roomColorMap = {
    emerald: {
      bg: 'hover:bg-emerald-500/[0.04]',
      border: 'hover:border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'group-hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-500/10'
    },
    blue: {
      bg: 'hover:bg-blue-500/[0.04]',
      border: 'hover:border-blue-500/20',
      text: 'text-blue-400',
      glow: 'group-hover:shadow-blue-500/10',
      iconBg: 'bg-blue-500/10'
    },
    purple: {
      bg: 'hover:bg-purple-500/[0.04]',
      border: 'hover:border-purple-500/20',
      text: 'text-purple-400',
      glow: 'group-hover:shadow-purple-500/10',
      iconBg: 'bg-purple-500/10'
    },
    cyan: {
      bg: 'hover:bg-cyan-500/[0.04]',
      border: 'hover:border-cyan-500/20',
      text: 'text-cyan-400',
      glow: 'group-hover:shadow-cyan-500/10',
      iconBg: 'bg-cyan-500/10'
    },
    amber: {
      bg: 'hover:bg-amber-500/[0.04]',
      border: 'hover:border-amber-500/20',
      text: 'text-amber-400',
      glow: 'group-hover:shadow-amber-500/10',
      iconBg: 'bg-amber-500/10'
    },
    rose: {
      bg: 'hover:bg-rose-500/[0.04]',
      border: 'hover:border-rose-500/20',
      text: 'text-rose-400',
      glow: 'group-hover:shadow-rose-500/10',
      iconBg: 'bg-rose-500/10'
    },
    indigo: {
      bg: 'hover:bg-indigo-500/[0.04]',
      border: 'hover:border-indigo-500/20',
      text: 'text-indigo-400',
      glow: 'group-hover:shadow-indigo-500/10',
      iconBg: 'bg-indigo-500/10'
    },
    teal: {
      bg: 'hover:bg-teal-500/[0.04]',
      border: 'hover:border-teal-500/20',
      text: 'text-teal-400',
      glow: 'group-hover:shadow-teal-500/10',
      iconBg: 'bg-teal-500/10'
    },
    orange: {
      bg: 'hover:bg-orange-500/[0.04]',
      border: 'hover:border-orange-500/20',
      text: 'text-orange-400',
      glow: 'group-hover:shadow-orange-500/10',
      iconBg: 'bg-orange-500/10'
    },
    sky: {
      bg: 'hover:bg-sky-500/[0.04]',
      border: 'hover:border-sky-500/20',
      text: 'text-sky-400',
      glow: 'group-hover:shadow-sky-500/10',
      iconBg: 'bg-sky-500/10'
    },
    pink: {
      bg: 'hover:bg-pink-500/[0.04]',
      border: 'hover:border-pink-500/20',
      text: 'text-pink-400',
      glow: 'group-hover:shadow-pink-500/10',
      iconBg: 'bg-pink-500/10'
    },
    yellow: {
      bg: 'hover:bg-yellow-500/[0.04]',
      border: 'hover:border-yellow-500/20',
      text: 'text-yellow-400',
      glow: 'group-hover:shadow-yellow-500/10',
      iconBg: 'bg-yellow-500/10'
    },
  }

  const getSubscriptionBadge = () => {
    if (!user?.subscription) return null

    const { plan, status } = user.subscription
    
    const badges: Record<string, { label: string; color: string }> = {
      constitutional: { label: 'Constitutional', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      ubuntu_pro: { label: 'Ubuntu Pro', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      citadel_enterprise: { label: 'Citadel Enterprise', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
    }

    const statusBadges: Record<string, { label: string; color: string }> = {
      trial: { label: 'Trial', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      active: { label: 'Active', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      expired: { label: 'Expired', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
      cancelled: { label: 'Cancelled', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
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
    const totalDuration = 30 * 24 * 60 * 60 * 1000
    const elapsed = now.getTime() - user.createdAt.getTime()
    const progress = Math.min((elapsed / totalDuration) * 100, 100)

    return (
      <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 transition-all duration-300 hover:border-yellow-500/20 hover:bg-yellow-500/[0.02]">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10">
            <Clock className="h-5 w-5 text-yellow-400" />
          </div>
          <span className="font-semibold text-white">Trial Period</span>
        </div>
        <Progress value={progress} className="mb-3 h-1.5" />
        <p className="text-sm text-yellow-300/80">
          {Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))} days remaining
        </p>
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-yellow-500/[0.06] blur-2xl" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/10 border-t-emerald-400"></div>
            <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-xl animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-500 animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20 transition-shadow group-hover:shadow-emerald-500/40">
                  <Layers className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  BuildSpaces
                </span>
              </Link>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[11px] px-2.5 py-0.5">
                <Shield className="h-3 w-3 mr-1" />
                Constitutional AI
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/[0.06]">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <div className="h-5 w-px bg-white/[0.08]" />
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-gray-300">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white hover:bg-white/[0.06] text-xs gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] p-8">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{user.name}</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Ready to build with Constitutional AI? Choose your development room below.
            </p>
          </div>
          <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-cyan-500/[0.04] blur-3xl" />
        </div>

        {/* User Status Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 transition-all duration-300 hover:border-emerald-500/20 hover:bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white">Subscription</h3>
            </div>
            {getSubscriptionBadge()}
            {user.subscription?.geographicPricing && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <Globe className="h-4 w-4 text-gray-500" />
                <span>{user.subscription.geographicPricing.country}</span>
                <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400">
                  {Math.round(user.subscription.geographicPricing.discount * 100)}% discount
                </Badge>
              </div>
            )}
            <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-emerald-500/[0.05] blur-2xl" />
          </div>

          {getTrialProgress()}

          <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 transition-all duration-300 hover:border-blue-500/20 hover:bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                <CheckCircle className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Verification Status</h3>
            </div>
            <div className="space-y-2.5">
              {Object.entries(user.verificationStatus || {}).map(([key, verified]) => (
                <div key={key} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle className={`h-3.5 w-3.5 ${verified ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className={`capitalize ${verified ? 'text-gray-300' : 'text-gray-500'}`}>{key.replace('_', ' ')}</span>
                </div>
              ))}
              <Link href="/verification">
                <Button variant="ghost" size="sm" className="w-full mt-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/[0.06] text-xs gap-1.5">
                  Manage Verification
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-blue-500/[0.05] blur-2xl" />
          </div>
        </div>

        {/* Development Rooms */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Development Rooms</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {developmentRooms.map((room) => {
              const colors = roomColorMap[room.color as keyof typeof roomColorMap] || roomColorMap.emerald
              return room.available ? (
                <Link key={room.id} href={room.href} className="block">
                  <div
                    className={`group relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 transition-all duration-300 h-full
                      ${colors.bg} ${colors.border} cursor-pointer shadow-lg shadow-transparent ${colors.glow}
                      hover:translate-y-[-2px] hover:shadow-xl`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.iconBg} transition-colors`}>
                        <room.icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors">{room.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">{room.description}</p>
                    <div className={`flex items-center justify-between ${colors.text} text-xs font-medium`}>
                      <span>Enter Room</span>
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-current opacity-[0.03] blur-2xl" />
                  </div>
                </Link>
              ) : (
                <div
                  key={room.id}
                  className="group relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 opacity-50 cursor-not-allowed h-full"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.iconBg} transition-colors`}>
                      <room.icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <h3 className="font-semibold text-white">{room.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">{room.description}</p>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-3">
                      {user?.subscription?.plan === 'constitutional' 
                        ? 'Upgrade to access this room'
                        : 'Not included in your plan'
                      }
                    </p>
                    <Link href="/pricing">
                      <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
                        Upgrade Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Economy & Wallet Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Azora Economy</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <AzoraVault userId={user.id} className="rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300" />
            
            <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] p-6 transition-all duration-300 hover:border-green-500/20">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
                  <Sparkles className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-white">Earn AZR Tokens</h3>
              </div>
              <p className="text-sm text-gray-400 mb-5">
                Proof-of-Knowledge rewards for valuable contributions
              </p>
              <div className="space-y-2">
                {[
                  { action: 'Complete Tutorial', reward: '+5 AZR' },
                  { action: 'Quality Code Commit', reward: '+1 AZR' },
                  { action: 'Spec Ratification', reward: '+2 AZR' },
                  { action: 'Create Content', reward: '+4 AZR' },
                  { action: 'Help Peers', reward: '+3 AZR' },
                ].map((item) => (
                  <div key={item.action} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                    <span className="text-sm text-gray-300">{item.action}</span>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[11px]">{item.reward}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-gray-500 italic">
                  All work is verified for quality. Embrace Ubuntu: 1% of earnings support the community.
                </p>
              </div>
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-green-500/[0.05] blur-2xl" />
            </div>
          </div>
        </div>

        {/* Quick Actions & AI Status */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] p-6 transition-all duration-300 hover:border-white/[0.12]">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                <Zap className="h-5 w-5 text-gray-300" />
              </div>
              <h3 className="font-semibold text-white">Quick Actions</h3>
            </div>
            <p className="text-sm text-gray-400 mb-5">
              Common tasks and shortcuts
            </p>
            <div className="space-y-2">
              <Link href="/settings">
                <Button variant="ghost" className="w-full justify-between text-gray-300 hover:text-white hover:bg-white/[0.04] h-10">
                  <span className="flex items-center gap-2.5 text-sm">
                    <Settings className="h-4 w-4 text-gray-500" />
                    Account Settings
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="w-full justify-between text-gray-300 hover:text-white hover:bg-white/[0.04] h-10">
                  <span className="flex items-center gap-2.5 text-sm">
                    <Crown className="h-4 w-4 text-gray-500" />
                    Manage Subscription
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" className="w-full justify-between text-gray-300 hover:text-white hover:bg-white/[0.04] h-10">
                  <span className="flex items-center gap-2.5 text-sm">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    Documentation
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] p-6 transition-all duration-300 hover:border-emerald-500/20">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white">Constitutional AI Status</h3>
            </div>
            <p className="text-sm text-gray-400 mb-5">
              Your AI agents and system health
            </p>
            <div className="space-y-3">
              {[
                { name: 'Elara', role: 'XO Architect' },
                { name: 'Sankofa', role: 'ConstitutionalCore' },
                { name: 'Themba', role: 'AIOrchestrator' },
              ].map((agent) => (
                <div key={agent.name} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_theme(colors.green.400)]" />
                    <span className="text-sm text-gray-300">{agent.name}</span>
                    <span className="text-[11px] text-gray-600">({agent.role})</span>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">Active</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <Link href="/workspace?room=ai-studio">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all text-sm">
                  <Brain className="h-4 w-4 mr-2" />
                  Open AI Studio
                </Button>
              </Link>
            </div>
            <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/[0.05] blur-2xl" />
          </div>
        </div>
      </main>
    </div>
  )
}
