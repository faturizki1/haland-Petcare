"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = "Terjadi kesalahan saat memuat data",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-destructive">
        <AlertTriangle className="h-16 w-16" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Oops!</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  )
}