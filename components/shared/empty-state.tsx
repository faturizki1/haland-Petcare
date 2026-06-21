"use client"

import { Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

export function EmptyState({
  title = "Belum ada data",
  description = "Belum ada data untuk ditampilkan",
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-muted-foreground">
        {icon || <Inbox className="h-16 w-16" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}