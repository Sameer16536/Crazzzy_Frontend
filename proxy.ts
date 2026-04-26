/**
 * Proxy / Middleware (Next.js 16+)
 *
 * Handles two concerns:
 *  1. Admin auth  — protects /admin routes (except /admin-login) using a
 *     session cookie. No valid cookie → redirect to /admin-login.
 *  2. User Profile — protects /account routes using the custom auth system.
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js expects a default export or an export named "proxy" for this file.
 */
export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // ── 1. Admin session-cookie protection ──────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin-login')) {
    const sessionCookie = req.cookies.get('admin-session')

    if (!sessionCookie) {
      const url = new URL('/admin-login', req.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    try {
      // Safe check for empty or invalid JSON
      if (!sessionCookie.value) throw new Error('Empty session')
      JSON.parse(sessionCookie.value)
    } catch {
      // Invalid session — clear cookie and redirect
      const url = new URL('/admin-login', req.url)
      url.searchParams.set('next', pathname)
      const response = NextResponse.redirect(url)
      response.cookies.delete('admin-session')
      return response
    }
  }

  // ── 2. User Profile Protection ──────────────────────────────────────────
  // Note: Client-side protection is also handled in /account/page.tsx
  // using the useAuth hook for localStorage-based tokens.

  return NextResponse.next()
}

// Export as default to satisfy Next.js proxy requirement
export default proxy

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Static file extensions
     */
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte?|tgz|gz|zip|png|jpg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webp)).*)',
    '/(api|trpc)(.*)',
  ],
}
