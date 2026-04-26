'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Loader2, Mail, ArrowRight } from 'lucide-react'

const forgotSchema = z.z.object({
  email: z.string().email('Valid email required'),
})

type ForgotValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (values: ForgotValues) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', values)
      toast.success('Password reset code sent to your email.')
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}&type=PASSWORD_RESET`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Reset Password</h1>
        <p className="text-white/50 text-sm font-light">Enter your email and we'll send you a recovery code.</p>
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

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-black font-black py-4 uppercase tracking-widest text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : (
            <>
              Send Code
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
