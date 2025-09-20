"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth/AuthForm"
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (data: { email: string; password: string; rememberMe: boolean }) => {
    setIsLoading(true)

    try {
      if (isSupabaseConfigured() && supabase) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })

        if (error) {
          throw error
        }

        router.push("/")
      } else {
        console.log("Supabase não configurado - simulando login:", data)
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push("/")
      }
    } catch (error) {
      console.error("Erro no login:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    setIsLoading(true)

    try {
      if (isSupabaseConfigured() && supabase) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
            },
          },
        })

        if (error) {
          throw error
        }
      } else {
        console.log("Supabase não configurado - simulando cadastro:", data)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error("Erro no cadastro:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthForm
      mode="login"
      onLogin={handleLogin}
      onSignup={handleSignup}
      isLoading={isLoading}
    />
  )
}