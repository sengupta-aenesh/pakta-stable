// lib/auth-server.ts
import { createClient } from '@/lib/supabase/server'

export type AuthUser = {
  id: string
  email: string
  created_at: string
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.log('Auth error in getCurrentUser:', error)
      return null
    }
    
    return {
      id: user.id,
      email: user.email!,
      created_at: user.created_at
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}