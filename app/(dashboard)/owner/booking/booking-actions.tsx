"use client"

import { useState } from "react"
import { confirmBooking, rejectBooking } from "@/lib/actions/booking"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

interface BookingActionsProps {
  bookingId: string
  status: string
}

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleConfirm() {
    setLoading(true)
    const result = await confirmBooking(bookingId)
    setLoading(false)
    setConfirmOpen(false)

    if (result.error) {
      toast({ title: "Gagal", description: result.error, variant: "destructive" })
      return
    }

    toast({ title: "Booking dikonfirmasi" })
    router.refresh()
  }

  async function handleReject() {
    setLoading(true)
    const result = await rejectBooking(bookingId, "Ditolak oleh admin")
    setLoading(false)
    setRejectOpen(false)

    if (result.error) {
      toast({ title: "Gagal", description: result.error, variant: "destructive" })
      return
    }

    toast({ title: "Booking ditolak" })
    router.refresh()
  }

  if (status !== "menunggu") {
    return <span className="text-sm text-muted-foreground">-</span>
  }

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        className="text-green-600"
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
      >
        <Check className="h-4 w-4 mr-1" />
        Konfirmasi
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive"
        onClick={() => setRejectOpen(true)}
        disabled={loading}
      >
        <X className="h-4 w-4 mr-1" />
        Tolak
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Konfirmasi Booking"
        description="Apakah Anda yakin ingin mengkonfirmasi booking ini?"
        confirmText="Ya, Konfirmasi"
        variant="default"
        onConfirm={handleConfirm}
      />
      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Tolak Booking"
        description="Apakah Anda yakin ingin menolak booking ini?"
        confirmText="Ya, Tolak"
        onConfirm={handleReject}
      />
    </div>
  )
}
