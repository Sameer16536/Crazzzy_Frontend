'use client'

import { useEffect, useMemo, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Theme = 'dark' | 'light'

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&')}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
}

export function ThemeToggle({ variant = 'ghost' }: { variant?: 'ghost' | 'outline' }) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setMounted(true)
    const fromCookie = getCookie('theme')
    if (fromCookie === 'light' || fromCookie === 'dark') {
      setTheme(fromCookie)
      applyThemeClass(fromCookie)
      return
    }
    // Default to OS preference if cookie is not set.
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
    const next: Theme = prefersDark ? 'dark' : 'light'
    setTheme(next)
    applyThemeClass(next)
  }, [])

  const icon = useMemo(() => {
    if (!mounted) return <Sun className="text-amber-500" />
    return theme === 'dark' ? <Sun className="text-amber-500" /> : <Moon className="text-slate-400" />
  }, [mounted, theme])

  async function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyThemeClass(next)
    try {
      await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: next }),
      })
    } catch {
      // Ignore network errors; theme still applied client-side.
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      aria-label="Toggle theme"
      onClick={toggle}
    >
      {icon}
    </Button>
  )
}

