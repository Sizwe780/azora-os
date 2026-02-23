"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn, getProviders } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CitadelLogo } from "@/components/ui/citadel-logo"
import { Eye, EyeOff, Mail, Lock, Shield, Sparkles } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/dashboard'
      })

      if (res && (res as any).ok) {
        router.push('/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: 'demo@azora.world',
        password: 'demo123456',
        callbackUrl: '/dashboard'
      })

      if (res && (res as any).ok) {
        router.push('/dashboard')
      } else {
        setError('Demo login failed')
      }
    } catch (err) {
      setError('Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    setLoading(true)
    setError(null)

    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (err) {
      setError(`${provider} login failed`)
    } finally {
      setLoading(false)
    }
  }

  // Optional: fetch providers to show which are available
  useEffect(() => {
    getProviders().then(() => { }).catch(() => { })
  }, [])

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-emerald-500/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 -right-32 h-80 w-80 rounded-full bg-cyan-500/[0.04] blur-[100px]" />
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CitadelLogo size="lg" />
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2 mb-4">
            <Shield className="h-4 w-4 mr-2" />
            Constitutional AI Access
          </Badge>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Welcome Back</h1>
          <p className="text-gray-400">
            Sign in to your Constitutional AI development environment
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/[0.02] border-white/[0.06] backdrop-blur-xl shadow-2xl shadow-black/20">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access your BuildSpaces account and continue building with Constitutional AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@azora.world"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0d1117] px-2 text-gray-400">Or</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/20 hover:bg-white/5"
                  onClick={() => handleOAuthLogin('github')}
                  disabled={loading}
                  aria-label="Sign in with GitHub"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  Sign in with GitHub
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/20 hover:bg-white/5"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={loading}
                  aria-label="Sign in with Google"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 border-white/20 hover:bg-white/5"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Try Demo Account
              </Button>
            </div>

            <div className="mt-6 text-center space-y-2">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                Forgot your password?
              </Link>
              <div className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Constitutional Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
