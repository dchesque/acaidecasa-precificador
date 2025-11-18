"use client"

import { useAppContext } from "@/contexts/AppContext"
import { Calendar } from "lucide-react"
import { useState, useEffect } from "react"

export const Header = () => {
  const { userProfile } = useAppContext()
  const [dataAtual, setDataAtual] = useState("")

  // Get first name for welcome message
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0]
  }

  // Format current date
  useEffect(() => {
    const formatarData = () => {
      const hoje = new Date()
      const opcoes: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
      const dataFormatada = hoje.toLocaleDateString('pt-BR', opcoes)
      // Capitalize first letter
      setDataAtual(dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1))
    }

    formatarData()
    // Update date at midnight
    const agora = new Date()
    const amanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1)
    const tempoAteAmanha = amanha.getTime() - agora.getTime()

    const timeout = setTimeout(() => {
      formatarData()
      // Then update daily
      const intervalo = setInterval(formatarData, 24 * 60 * 60 * 1000)
      return () => clearInterval(intervalo)
    }, tempoAteAmanha)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-muted-foreground">Bem-vindo,</span>
          <span className="text-lg font-semibold text-foreground">
            {userProfile ? getFirstName(userProfile.nome) : "Usuário"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium">
            {dataAtual}
          </span>
        </div>
      </div>
    </header>
  );
};