"use client"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-acai-purple border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    </div>
  )
}