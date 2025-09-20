"use client"

import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })
  const router = useRouter()

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setAuth({ user: null, session: null, loading: false })
      return
    }

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setAuth({
        user: session?.user ?? null,
        session,
        loading: false
      })
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuth({
          user: session?.user ?? null,
          session,
          loading: false
        })

        if (event === 'SIGNED_IN') {
          router.push('/')
        } else if (event === 'SIGNED_OUT') {
          router.push('/auth/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não está configurado')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, options?: { data?: Record<string, any> }) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não está configurado')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não está configurado')
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não está configurado')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
  }

  return {
    user: auth.user,
    session: auth.session,
    loading: auth.loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!auth.user,
    isConfigured: isSupabaseConfigured()
  }
}