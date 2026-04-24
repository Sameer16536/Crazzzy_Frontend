/**
 * Authentication Server Actions
 * Handles admin login and session management
 * Uses httpOnly cookies for secure session storage
 */

'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Default admin credentials
 * TODO: Replace with database authentication
 */
const ADMIN_CREDENTIALS = {
  email: 'admin@crazzzy.com',
  password: 'admin@123', // In production, use bcrypt hash
}

/**
 * Admin Login Action
 * Validates credentials and creates secure session cookie
 */
export async function adminLogin(formData: FormData) {
  const email = formData.get('email')?.toString() || ''
  const password = formData.get('password')?.toString() || ''

  // Validate credentials
  if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
    return { error: 'Invalid email or password' }
  }

  // Create session cookie
  const cookieStore = await cookies()
  cookieStore.set('admin-session', JSON.stringify({ email, loggedInAt: new Date().toISOString() }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  redirect('/admin')
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
