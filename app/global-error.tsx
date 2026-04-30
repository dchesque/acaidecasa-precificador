"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[app/global-error]", error)
    }
  }, [error])

  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Erro fatal na aplicação</h1>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          Algo crítico falhou. Tente recarregar a página.
        </p>
        {error.digest && (
          <p style={{ fontSize: "0.75rem", color: "#999", marginBottom: "1rem" }}>
            ref: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          style={{
            background: "#7c3aed",
            color: "#fff",
            border: 0,
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  )
}
