import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'nodejs'

type Theme = 'dark' | 'light'

export async function POST(request: NextRequest) {
  let theme: Theme | null = null
  try {
    const body = (await request.json()) as { theme?: string }
    const t = body.theme
    if (t === 'dark' || t === 'light') theme = t
  } catch {
    theme = null
  }

  if (!theme) {
    return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true, theme })
  res.cookies.set('theme', theme, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  return res
}

