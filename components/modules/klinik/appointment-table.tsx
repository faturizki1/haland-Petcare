"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { updateAppointmentStatus } from "@/lib/actions/appointments"
import { useToast } from "@/hooks/use-toast"
import { Calendar, CheckCircle, XCircle, Play } from "lucide-react"
import { formatDateTime } from "@/lib/utils/format"
import type { Tables } from "@/lib/types/database"

type Appointment = Tables<"appointments">

interface AppointmentTableProps {
  initialData: any[]
  role: string
}

export function AppointmentTable({ initialData, role }: AppointmentTableProps) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleStatus(id: string, status: string) {
    setLoading(true)
    const result = await updateAppointmentStatus(id, status)
    setLoading(false)

    if (result.error) {
      toast({ title: "Gagal", description: String(result.error), variant: "destructive" })
      return
    }

    toast({ title: `Status diubah ke ${status}` })
    setData((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    router.refresh()
  }

  if (loading && data.length === 0) return <TableSkeleton rows={5} columns={5} />

  if (data.length === 0) {
    return (
      <EmptyState
        title="Belum ada appointment"
        description="Buat appointment baru untuk mulai"
        icon={<Calendar className="h-16 w-16" />}
      />
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hewan</TableHead>
            <TableHead>Dokter</TableHead>
            <TableHead>Jadwal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((appt) => (
            <TableRow key={appt.id}>
              <TableCell className="font-medium">
                {appt.pets?.name || "N/A"}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({appt.pets?.species || "N/A"})
                </span>
              </TableCell>
              <TableCell>{appt.profiles?.full_name || "N/A"}</TableCell>
              <TableCell>{formatDateTime(appt.scheduled_at)}</TableCell>
              <TableCell>
                <StatusBadge status={appt.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {appt.status === "menunggu" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatus(appt.id, "berlangsung")}
                        title="Mulai"
                      >
                        <Play className="h-4 w-4 text-info" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatus(appt.id, "batal")}
                        title="Batalkan"
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                  {appt.status === "berlangsung" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStatus(appt.id, "selesai")}
                      title="Selesai"
                    >
                      <CheckCircle className="h-4 w-4 text-success" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}