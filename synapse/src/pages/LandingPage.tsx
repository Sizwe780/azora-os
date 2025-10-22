import React from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import EcosystemStats from '../components/EcosystemStats'
import ConstitutionalGovernor from '../components/ConstitutionalGovernor'
import SystemPulse from '../components/SystemPulse'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Progress } from '../components/ui/progress'
import {
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Zap,
  Shield,
  Globe,
  Brain,
  Coins,
  Building2,
  Code,
  BookOpen,
  TrendingUp,
  Sparkles,
  Crown,
  Activity
} from 'lucide-react'

export default function LandingPage() {
  return (
    <>
      <SEO />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

          <div className="container relative px-4 py-24 sm:py-32">
            <div className="mx-auto max-w-4xl text-center">
              {/* Status Badge */}
              <div className="mb-8 flex justify-center">
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Africa's First Sovereign Digital Nation
                </Badge>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Build the Future,
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Compliantly
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground sm:text-xl">
                Africa's First Full Software Infrastructure. Learn, earn, and build with AI-powered compliance,
                decentralized finance, and enterprise-grade cloud solutions.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  🚀 Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold">
                  📖 Explore Services
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Bank-Grade Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>10,000+ Users</span>
                </div>
              </div>
            </div>

            {/* Ecosystem Stats */}
            <div className="mt-20">
              <EcosystemStats />
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-24 sm:py-32 bg-muted/30">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why Choose Azora OS?
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                We're not just another platform. We're Africa's first comprehensive software infrastructure
                that combines learning, earning, compliance, and enterprise solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Brain,
                  title: 'AI-Powered Compliance',
                  description: 'Automated regulatory compliance with AI-driven insights and real-time monitoring.',
                  color: 'text-blue-500',
                  bgColor: 'bg-blue-500/10'
                },
                {
                  icon: Coins,
                  title: 'AZR Token Economy',
                  description: 'Earn real value through learning, contributions, and platform participation.',
                  color: 'text-green-500',
                  bgColor: 'bg-green-500/10'
                },
                {
                  icon: Building2,
                  title: 'Full Infrastructure',
                  description: 'Complete ecosystem from development tools to enterprise cloud solutions.',
                  color: 'text-purple-500',
                  bgColor: 'bg-purple-500/10'
                }
              ].map((feature, i) => (
                <Card key={i} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Service Ecosystem */}
        <section className="py-24 sm:py-32 bg-background">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Complete Ecosystem
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Everything you need to learn, build, and scale in one integrated platform.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Learn & Earn',
                  subdomain: 'learn.azora.world',
                  icon: BookOpen,
                  description: 'SAQA-aligned courses with AZR rewards',
                  color: 'from-blue-500 to-cyan-500',
                  status: 'Live',
                  users: '2,500+'
                },
                {
                  name: 'AZR Mint',
                  subdomain: 'mint.azora.world',
                  icon: Coins,
                  description: 'Token minting and collateral management',
                  color: 'from-green-500 to-emerald-500',
                  status: 'Live',
                  users: '1,200+'
                },
                {
                  name: 'Forge Marketplace',
                  subdomain: 'marketplace.azora.world',
                  icon: Building2,
                  description: 'P2P marketplace for digital goods',
                  color: 'from-purple-500 to-pink-500',
                  status: 'Beta',
                  users: '850+'
                },
                {
                  name: 'Compliance Engine',
                  subdomain: 'compliance.azora.world',
                  icon: Shield,
                  description: 'AI-powered regulatory compliance',
                  color: 'from-red-500 to-orange-500',
                  status: 'Live',
                  users: '500+'
                },
                {
                  name: 'Enterprise Portal',
                  subdomain: 'enterprise.azora.world',
                  icon: TrendingUp,
                  description: 'B2B solutions and cloud services',
                  color: 'from-indigo-500 to-blue-500',
                  status: 'Live',
                  users: '150+'
                },
                {
                  name: 'Developer Portal',
                  subdomain: 'dev.azora.world',
                  icon: Code,
                  description: 'API access and development tools',
                  color: 'from-gray-700 to-gray-900',
                  status: 'Live',
                  users: '300+'
                }
              ].map((service, i) => (
                <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={service.status === 'Live' ? 'default' : 'secondary'} className="text-xs">
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {service.users} users
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:text-primary transition-colors">
                        Visit →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Living Constitutional AI Section */}
        <section className="py-24 sm:py-32 bg-background">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Living Constitutional AI
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Experience Africa's first sovereign digital nation with AI-powered governance that evolves
                and adapts in real-time to ensure fairness, compliance, and community well-being.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Constitutional Governor */}
              <Card className="border-0 bg-card/50 backdrop-blur overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Constitutional Governor</CardTitle>
                      <CardDescription>AI-powered governance ensuring platform integrity</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ConstitutionalGovernor />
                </CardContent>
              </Card>

              {/* System Pulse */}
              <Card className="border-0 bg-card/50 backdrop-blur overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">System Pulse</CardTitle>
                      <CardDescription>Real-time system health and performance monitoring</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <SystemPulse />
                </CardContent>
              </Card>
            </div>

            {/* Constitutional Principles */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-8">
                Core Constitutional Principles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Shield,
                    title: 'User Sovereignty',
                    description: 'Complete control over your digital identity and data'
                  },
                  {
                    icon: Brain,
                    title: 'AI Governance',
                    description: 'Intelligent systems ensuring fairness and compliance'
                  },
                  {
                    icon: Users,
                    title: 'Community First',
                    description: 'Decisions made for the collective benefit of all users'
                  },
                  {
                    icon: Globe,
                    title: 'African Leadership',
                    description: 'Setting global standards from the African continent'
                  },
                  {
                    icon: TrendingUp,
                    title: 'Continuous Evolution',
                    description: 'Systems that learn and adapt to serve better'
                  },
                  {
                    icon: CheckCircle,
                    title: 'Regulatory Excellence',
                    description: 'Beyond compliance to proactive regulatory innovation'
                  }
                ].map((principle, i) => (
                  <Card key={i} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <principle.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{principle.title}</h4>
                      <p className="text-muted-foreground text-sm">{principle.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 sm:py-32 bg-muted/30">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Trusted by Organizations
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                From startups to enterprises, organizations trust Azora OS for compliance and innovation.
              </p>
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-16">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'CTO, TechCorp SA',
                  avatar: '/placeholder-user.jpg',
                  content: 'Azora OS transformed our compliance workflow. What used to take weeks now happens automatically.',
                  rating: 5
                },
                {
                  name: 'Michael Chen',
                  role: 'Founder, StartupXYZ',
                  avatar: '/placeholder-user.jpg',
                  content: 'The AZR token economy is revolutionary. Our team is more engaged than ever.',
                  rating: 5
                },
                {
                  name: 'Dr. Amanda Nkosi',
                  role: 'Professor, University of Johannesburg',
                  avatar: '/placeholder-user.jpg',
                  content: 'Finally, a platform that understands African education and entrepreneurship.',
                  rating: 5
                }
              ].map((testimonial, i) => (
                <Card key={i} className="border-0 bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Partner Logos Placeholder */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 items-center justify-items-center opacity-60">
              {['Partner 1', 'Partner 2', 'Partner 3', 'Partner 4'].map((partner, i) => (
                <div key={i} className="flex items-center justify-center p-8 bg-card/50 rounded-xl border border-border/50">
                  <span className="text-muted-foreground font-semibold">{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 sm:py-32 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to Build the Future?
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Join thousands of students, developers, and enterprises already building with Azora OS.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Building Today
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
