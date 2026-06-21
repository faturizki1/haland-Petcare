"use client"

import { useState, useEffect } from "react"
import { getBookings, confirmBooking, rejectBooking } from "@/lib/actions/booking"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { formatDateTime } from "@/lib/utils/format"
import { CalendarCheck, CheckCircle, XCircle } from "lucide-react"

export default function StaffBookingPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const { toast } = useToast()

  async function fetchData() {
    setLoading(true)
    try { const d = await getBookings(); setData(d) } catch { toast({ title: "Gagal memuat", variant: "destructive" }) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleConfirm(id: string) {
    setSelectedId(id)
    setConfirmOpen(true)
  }

  async function confirmAction() {
    if (!selectedId) return
    const result = await confirmBooking(selectedId)
    if (result.error) { toast({ title: "Gagal", variant: "destructive" }); return }
    toast({ title: "Booking dikonfirmasi" })
    setConfirmOpen(false)
    fetchData()
  }

  async function handleReject(id: string) {
    setSelectedId(id)
    setRejectReason("")
    setRejectOpen(true)
  }

  async function rejectAction() {
    if (!selectedId || !rejectReason) { toast({ title: "Alasan wajib diisi", variant: "destructive" }); return }
    const result = await rejectBooking(selectedId, rejectReason)
    if (result.error) { toast({ title: "Gagal", variant: "destructive" }); return }
    toast({ title: "Booking ditolak" })
    setRejectOpen(false)
    fetchData()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Manajemen Booking</h1>
      {loading ? <TableSkeleton rows={5} columns={5} /> : data.length === 0 ? (
        <EmptyState title="Belum ada booking" icon={<CalendarCheck className="h-16 w-16" />} />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pemilik</TableHead>
                <TableHead>Hewan</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.owner_name}</TableCell>
                  <TableCell>{b.pet_name} ({b.pet_species})</TableCell>
                  <TableCell>{b.owner_phone}</TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                  <TableCell>
                    {b.status === "menunggu" && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleConfirm(b.id)}><CheckCircle className="h-4 w-4 text-success" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleReject(b.id)}><XCircle className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Konfirmasi Booking" description="Yakin ingin mengkonfirmasi booking ini?" confirmText="Ya, Konfirmasi" onConfirm={confirmAction} />

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tolak Booking</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Label>Alasan Penolakan</Label>
            <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Wajib diisi" />
            <Button onClick={rejectAction} variant="destructive">Tolak Booking</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}