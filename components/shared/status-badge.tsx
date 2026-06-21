"use client"

import { Badge } from "@/components/ui/badge"

const statusColorMap: Record<string, "success" | "warning" | "destructive" | "info" | "default" | "secondary"> = {
  // Appointment
  menunggu: "warning",
  berlangsung: "info",
  selesai: "success",
  batal: "destructive",
  // Inpatient
  rawat: "info",
  pulang: "success",
  // Booking
  dikonfirmasi: "success",
  ditolak: "destructive",
  // Transaction
  selesai: "success",
  // Product active
  aktif: "success",
  tidak_aktif: "destructive",
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = statusColorMap[status] || "secondary"
  const label = status.replace(/_/g, " ")

  return <Badge variant={variant}>{label}</Badge>
}