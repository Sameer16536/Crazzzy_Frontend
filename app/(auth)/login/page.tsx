'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { useAuth } from '@/lib/auth/auth-context'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'

const loginSchema = z.z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const redirect = searchParams.get('redirect') || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginValues) => {
    setLoading(true)
    try {
      const data = await api.post<any>('/auth/login', values)
      login(data.accessToken, data.refreshToken)

      toast.success('Welcome back!')

      // Redirect based on role or previous page
      if (data.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push(redirect)
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Welcome Back</h1>
        <p className="text-white/50 text-sm font-light">Enter your credentials to access your universe.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
            <input
              {...register('email')}
              type="email"
              placeholder="jane@example.com"
              className="w-full bg-zinc-900 border border-white/10 px-12 py-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
            />
          </div>
          {errors.email && <p className="text-red-500 text-[10px] uppercase font-bold ml-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Password</label>
            <Link href="/forgot-password" size="sm" className="text-[10px] uppercase tracking-tighter text-white/30 hover:text-primary transition-colors">
              Forgot?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-white/10 px-12 py-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
            />
          </div>
          {errors.password && <p className="text-red-500 text-[10px] uppercase font-bold ml-1">{errors.password.message}</p>}
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-black font-black py-4 uppercase tracking-widest text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : (
            <>
              Sign In
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 text-center border-t border-white/5">
        <p className="text-white/40 text-xs font-light">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-bold">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
