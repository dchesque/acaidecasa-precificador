"use client"

import { useState } from "react"
import { AuthForm } from "@/components/auth/AuthForm"
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (data: { email: string }) => {
    setIsLoading(true)

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        if (error) {
          throw error
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthForm
      mode="forgot-password"
      onForgotPassword={handleForgotPassword}
      isLoading={isLoading}
    />
  )
}