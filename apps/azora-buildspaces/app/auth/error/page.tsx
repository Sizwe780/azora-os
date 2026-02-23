"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw, ArrowLeft, ShieldAlert } from "lucide-react"

function AuthErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>("")
  const [errorCode, setErrorCode] = useState<string>("")

  useEffect(() => {
    const errorParam = searchParams?.get("error")
    if (errorParam) {
      setErrorCode(errorParam)
      const errorMessages: Record<string, string> = {
        Configuration: "There is a problem with the server configuration.",
        AccessDenied: "Access denied. You do not have permission to sign in.",
        Verification: "The verification token has expired or has already been used.",
        Default: "An error occurred during authentication.",
        CredentialsSignin: "Invalid credentials provided. Please check your email and password.",
        EmailSignin: "Could not send email. Please try again.",
        OAuthSignin: "Error signing in with the OAuth provider.",
        OAuthCallback: "Error in OAuth callback.",
        OAuthCreateAccount: "Could not create account with OAuth provider.",
        EmailCreateAccount: "Could not create account with email.",
        Callback: "Error in the OAuth callback.",
        OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
        SessionRequired: "Please sign in to access this page.",
      }
      setError(errorMessages[errorParam] || errorMessages.Default)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Back link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        {/* Error card */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-sm">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
            Authentication Error
          </h1>
          <p className="text-gray-500 text-center text-sm mb-6">
            Something went wrong during sign-in
          </p>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-500/[0.06] border border-red-500/10 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-red-300/90">{error}</p>
                  {errorCode && (
                    <p className="text-xs text-gray-600 mt-1 font-mono">Code: {errorCode}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full h-11 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white transition-all duration-200"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="w-full h-11 text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {/* Help link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Need help?{" "}
            <Link
              href="/contact"
              className="text-emerald-400/80 hover:text-emerald-400 transition-colors"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
