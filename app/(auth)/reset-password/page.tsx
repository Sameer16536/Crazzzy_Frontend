'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Loader2, Lock, ArrowRight } from 'lucide-react'

const resetSchema = z.z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetValues = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const email = searchParams.get('email')
  const otp = searchParams.get('otp')

  useEffect(() => {
    if (!email || !otp) {
      router.push('/login')
    }
  }, [email, otp, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (values: ResetValues) => {
    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword: values.newPassword,
      })
      toast.success('Password reset successful! Please login.')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">New Password</h1>
        <p className="text-white/50 text-sm font-light">Create a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold ml-1">New Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
            <input
              {...register('newPassword')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-white/10 px-12 py-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
            />
          </div>
          {errors.newPassword && <p className="text-red-500 text-[10px] uppercase font-bold ml-1">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold ml-1">Confirm Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-white/10 px-12 py-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
            />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-[10px] uppercase font-bold ml-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-black font-black py-4 uppercase tracking-widest text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : (
            <>
              Update Password
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
