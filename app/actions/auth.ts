/**
 * Authentication Server Actions
 * Handles admin login and session management
 * Uses httpOnly cookies for secure session storage
 */

'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Admin Login Action
 * Calls the real backend API, validates role, and creates secure session cookie
 */
export async function adminLogin(formData: FormData) {
  const email = formData.get('email')?.toString() || ''
  const password = formData.get('password')?.toString() || ''

  try {
    let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    // Server actions run in Node.js, which requires absolute URLs for fetch().
    // If the configured URL is a relative proxy path (e.g. '/api-proxy'),
    // we bypass the proxy and hit the real backend directly to avoid crashes.
    if (API_URL.startsWith('/')) {
      API_URL = process.env.BACKEND_API_URL || 'https://crazzzybackend-production.up.railway.app/api';
    }

    let response;
    try {
      response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch (fetchError: any) {
      console.error('[Admin Login] Server fetch error:', fetchError.message);
      return { error: `Connection failed: ${fetchError.message}` }
    }

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Invalid email or password' }
    }

    // Check if user is actually an ADMIN
    if (data.user?.role !== 'ADMIN') {
      return { error: 'Access denied. Administrator privileges required.' }
    }

    // Create session cookie for the Middleware (proxy.ts)
    const cookieStore = await cookies()
    cookieStore.set('admin-session', JSON.stringify({ 
      id: data.user.id,
      email: data.user.email, 
      role: data.user.role,
      accessToken: data.accessToken,
      loggedInAt: new Date().toISOString() 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // Return the tokens so the client-side useAuth can also be updated
    return { 
      success: true, 
      accessToken: data.accessToken, 
      refreshToken: data.refreshToken 
    }
  } catch (err) {
    return { error: 'Failed to connect to authentication server' }
  }
}

/**
 * Admin Logout Action
 * Clears session cookie
 */
export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-session')
  redirect('/')
}

/**
 * Verify Admin Session
 * Returns null if not authenticated
 */
export async function verifyAdminSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin-session')

  if (!session?.value) {
    return null
  }

  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}
