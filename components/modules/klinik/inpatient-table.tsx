"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { dischargeInpatient } from "@/lib/actions/inpatients"
import { useToast } from "@/hooks/use-toast"
import { BedDouble, LogOut, Eye } from "lucide-react"
import { formatDateTime } from "@/lib/utils/format"

interface InpatientTableProps {
  initialData: any[]
  role: string
}

export function InpatientTable({ initialData, role }: InpatientTableProps) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  async function handleDischarge(id: string) {
    setSelectedId(id)
    setConfirmOpen(true)
  }

  async function confirmDischarge() {
    if (!selectedId) return
    setLoading(true)
    const result = await dischargeInpatient(selectedId)
    setLoading(false)
    setConfirmOpen(false)

    if (result.error) {
      toast({ title: "Gagal", description: String(result.error), variant: "destructive" })
      return
    }

    toast({ title: "Pasien dipulangkan" })
    setData((prev) => prev.map((i) => (i.id === selectedId ? { ...i, status: "pulang", discharged_at: new Date().toISOString() } : i)))
    router.refresh()
  }

  if (loading && data.length === 0) return <TableSkeleton rows={5} columns={5} />

  if (data.length === 0) {
    return (
      <EmptyState
        title="Belum ada rawat inap"
        description="Belum ada pasien yang dirawat inap"
        icon={<BedDouble className="h-16 w-16" />}
      />
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hewan</TableHead>
              <TableHead>Dokter</TableHead>
              <TableHead>Kandang</TableHead>
              <TableHead>Masuk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((ip) => (
              <TableRow key={ip.id}>
                <TableCell className="font-medium">{ip.pets?.name || "N/A"}</TableCell>
                <TableCell>{ip.profiles?.full_name || "N/A"}</TableCell>
                <TableCell>{ip.cage_number || "-"}</TableCell>
                <TableCell>{formatDateTime(ip.admitted_at)}</TableCell>
                <TableCell>
                  <StatusBadge status={ip.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/${role}/rawat-inap/${ip.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {ip.status === "rawat" && (
                      <Button variant="ghost" size="icon" onClick={() => handleDischarge(ip.id)}>
                        <LogOut className="h-4 w-4 text-warning" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Pulangkan Pasien"
        description="Apakah anda yakin ingin memulangkan pasien ini?"
        confirmText="Ya, Pulangkan"
        onConfirm={confirmDischarge}
      />
    </>
  )
}