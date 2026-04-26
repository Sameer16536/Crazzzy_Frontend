'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Loader2, ArrowRight, RefreshCw } from 'lucide-react'
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const email = searchParams.get('email')
  const type = searchParams.get('type') || 'VERIFICATION'

  useEffect(() => {
    if (!email) {
      router.push('/signup')
    }
  }, [email, router])

  const onSubmit = async () => {
    if (otp.length !== 6) return
    
    setLoading(true)
    try {
      await api.post('/auth/verify-otp', {
        email,
        otp,
        type,
      })
      
      toast.success('Verification successful!')
      
      if (type === 'PASSWORD_RESET') {
        router.push(`/reset-password?email=${encodeURIComponent(email!)}&otp=${otp}`)
      } else {
        router.push('/login')
      }
    } catch (error: any) {
      toast.error(error.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await api.post('/auth/resend-otp', { email, type })
      toast.success('OTP resent successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Verification</h1>
        <p className="text-white/50 text-sm font-light">
          We've sent a 6-digit code to <span className="text-primary font-bold">{email}</span>
        </p>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <OTPInput
          maxLength={6}
          containerClassName="group flex items-center gap-2"
          onChange={setOtp}
          pattern={REGEXP_ONLY_DIGITS}
          render={({ slots }) => (
            <div className="flex gap-2">
              {slots.map((slot, idx) => (
                <div
                  key={idx}
                  className={`
                    relative w-12 h-14 text-2xl font-black flex items-center justify-center
                    border-2 transition-all duration-300
                    ${slot.isActive ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-zinc-900 text-white'}
                  `}
                >
                  {slot.char || (slot.isActive && <span className="animate-pulse">|</span>)}
                </div>
              ))}
            </div>
          )}
        />

        <div className="w-full space-y-4">
          <button
            disabled={loading || otp.length !== 6}
            onClick={onSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-black font-black py-4 uppercase tracking-widest text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                Verify Code
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <button
            disabled={resending}
            onClick={handleResend}
            className="w-full bg-transparent hover:bg-white/5 text-white/50 hover:text-white py-2 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            {resending ? <Loader2 className="animate-spin" size={14} /> : (
              <>
                <RefreshCw size={14} />
                Resend Code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
