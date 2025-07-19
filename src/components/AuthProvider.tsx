'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithDiscord: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        console.log('Session:', session)
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithDiscord = async () => {
    try {
      console.log('Signing in with Discord...')
      await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/game`
        }
      })
    } catch (error) {
      console.error('Error signing in with Discord:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('Signing in with Google...')
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/game`
        }
      })
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out...')
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function checkUserExists() {
      if (!user) return;
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      if (!cancelled && (error || !data)) {
        // User not found, sign out
        await signOut();
      }
    }

    const interval = setInterval(checkUserExists, 5000);
    checkUserExists();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithDiscord,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 