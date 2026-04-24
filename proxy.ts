/**
 * Proxy (Next.js 16+)
 *
 * Handles two concerns:
 *  1. Clerk auth  — protects /account/dashboard and all sub-routes.
 *     Unauthenticated users are redirected to /account (Clerk sign-in).
 *  2. Admin auth  — protects /admin routes (except /admin-login) using a
 *     session cookie. No valid cookie → redirect to /admin-login.
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

/** Routes that require a signed-in Clerk user */
const isProtectedRoute = createRouteMatcher(['/account/dashboard(.*)'])

export default clerkMiddleware(async (auth, req: NextRequest) => {
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

  // ── 2. Clerk auth protection ─────────────────────────────────────────────
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

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
