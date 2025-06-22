// lib/auth-client.ts
'use client'

import { createClient } from '@/lib/supabase/client'
import { setSentryUser, clearSentryUser, captureAuthError, addSentryBreadcrumb } from './sentry-utils'

export type AuthUser = {
  id: string
  email: string
  created_at: string
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  
  try {
    addSentryBreadcrumb('User attempting sign in', 'auth', 'info', { email })
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      captureAuthError(new Error(error.message), 'sign_in', 'email')
      return { error: error.message }
    }
    
    if (data.user) {
      setSentryUser({
        id: data.user.id,
        email: data.user.email || undefined
      })
      addSentryBreadcrumb('User signed in successfully', 'auth', 'info', { userId: data.user.id })
    }
    
    return { data }
  } catch (error) {
    captureAuthError(error as Error, 'sign_in', 'email')
    return { error: 'An unexpected error occurred during sign in' }
  }
}

export async function signUp(email: string, password: string) {
  const supabase = createClient()
  
  try {
    addSentryBreadcrumb('User attempting sign up', 'auth', 'info', { email })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      }
    })
    
    if (error) {
      captureAuthError(new Error(error.message), 'sign_up', 'email')
      return { error: error.message }
    }
    
    if (data.user) {
      addSentryBreadcrumb('User signed up successfully', 'auth', 'info', { userId: data.user.id })
    }
    
    return { data }
  } catch (error) {
    captureAuthError(error as Error, 'sign_up', 'email')
    return { error: 'An unexpected error occurred during sign up' }
  }
}

export async function signOut() {
  const supabase = createClient()
  
  try {
    addSentryBreadcrumb('User attempting sign out', 'auth', 'info')
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      captureAuthError(new Error(error.message), 'sign_out')
      return { error: error.message }
    }
    
    clearSentryUser()
    addSentryBreadcrumb('User signed out successfully', 'auth', 'info')
    
    return { success: true }
  } catch (error) {
    captureAuthError(error as Error, 'sign_out')
    return { error: 'An unexpected error occurred during sign out' }
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      if (error) {
        console.log('Auth error in getCurrentUser:', error)
      }
      return null
    }
    
    // Set user context in Sentry if not already set
    setSentryUser({
      id: user.id,
      email: user.email || undefined
    })
    
    return {
      id: user.id,
      email: user.email!,
      created_at: user.created_at
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    captureAuthError(error as Error, 'get_current_user')
    return null
  }
}