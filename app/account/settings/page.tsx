'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Navbar } from '@/components/navbar'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Loader2, Lock, ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const changePasswordSchema = z.z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [user, authLoading, router])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (values: ChangePasswordValues) => {
    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Password updated successfully')
      reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) return null

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      
      <div className="pt-32 max-w-2xl mx-auto px-4 pb-24">
        <Link 
          href="/account" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors mb-12 w-fit"
        >
          <ArrowLeft size={12} />
          Return to Dashboard
        </Link>

        <div className="space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-primary" />
              <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Security</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">Account Settings</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest leading-loose">
              Update your security credentials and manage your account preferences.
            </p>
          </div>

          <div className="bg-muted/30 border border-border p-8 sm:p-12 space-y-10">
            <div className="flex items-center gap-4">
               <ShieldCheck className="text-primary" size={24} />
               <h2 className="text-lg font-black uppercase tracking-widest text-foreground">Change Password</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black ml-1">Current Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    {...register('currentPassword')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-background border border-border px-12 py-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                {errors.currentPassword && <p className="text-red-500 text-[10px] uppercase font-bold ml-1">{errors.currentPassword.message}</p>}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    {...register('newPassword')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-background border border-border px-12 py-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                {errors.newPassword && <p className="text-red-500 text-[10px] uppercase font-bold ml-1">{errors.newPassword.message}</p>}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black ml-1">Confirm New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-background border border-border px-12 py-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-[10px] uppercase font-bold ml-1">{errors.confirmPassword.message}</p>}
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-5 uppercase tracking-[0.2em] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Update Security Credentials'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
