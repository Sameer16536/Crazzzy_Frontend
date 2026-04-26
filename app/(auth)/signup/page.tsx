'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Loader2, Mail, User, Lock, ArrowRight } from 'lucide-react'

const signupSchema = z.z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignupValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (values: SignupValues) => {
    setLoading(true)
    try {
      await api.post('/auth/signup', values)
      toast.success('Registration successful! Please verify your email.')
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}&type=VERIFICATION`)
    } catch (error: any) {
      toast.error(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Join the Universe</h1>
        <p className="text-white/50 text-sm font-light">Create an account to start your collection.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold ml-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
            <input
              {...register('name')}
              placeholder="Jane Doe"
              className="w-full bg-zinc-900 border border-white/10 px-12 py-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
            />
          </div>
          {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold ml-1">{errors.name.message}</p>}
        </div>

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
          <label className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold ml-1">Password</label>
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
              Sign Up
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 text-center border-t border-white/5">
        <p className="text-white/40 text-xs font-light">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-bold">Log In</Link>
        </p>
      </div>
    </div>
  )
}
