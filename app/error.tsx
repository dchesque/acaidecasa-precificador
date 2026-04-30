"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[app/error]", error)
    }
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
      <h1 className="text-2xl font-semibold">Algo deu errado</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Ocorreu um erro inesperado nesta tela. Você pode tentar novamente, e se o problema persistir
        recarregue a página ou volte ao Dashboard.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">ref: {error.digest}</p>
      )}
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Tentar novamente</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Voltar ao início
        </Button>
      </div>
    </div>
  )
}
