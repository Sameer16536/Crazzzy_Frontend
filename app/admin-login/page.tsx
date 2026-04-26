/**
 * Admin Login Page
 * Custom credentials-based login for admin dashboard
 * Features:
 * - Email and password authentication
 * - Error handling
 * - Secure session with httpOnly cookies
 * - Responsive design
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin } from '@/app/actions/auth'
import { Lock, Mail, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login: setAuthTokens } = useAuth()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await adminLogin(formData)

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (result?.success && result.accessToken) {
        // Sync the client-side auth state
        setAuthTokens(result.accessToken, result.refreshToken || '')
        router.push('/admin')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-card rounded-lg border border-border/30 shadow-lg p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto">
              <LogIn size={24} className="text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to access the admin dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@crazzzy.com"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-semibold rounded-lg transition-colors duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>Secure admin area. Sessions expire after 7 days of inactivity.</p>
        </div>
      </div>
    </div>
  )
}
