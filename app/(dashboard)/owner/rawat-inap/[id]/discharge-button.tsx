"use client"

import { useState } from "react"
import { dischargeInpatient } from "@/lib/actions/inpatients"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

interface DischargeButtonProps {
  inpatientId: string
}

export function DischargeButton({ inpatientId }: DischargeButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleDischarge() {
    setLoading(true)
    const result = await dischargeInpatient(inpatientId)
    setLoading(false)
    setOpen(false)

    if (result.error) {
      toast({
        title: "Gagal",
        description: result.error,
        variant: "destructive",
      })
      return
    }

    toast({ title: "Pasien berhasil dipulangkan" })
    router.refresh()
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} disabled={loading}>
        {loading ? "Memproses..." : "Pulangkan"}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Pulangkan Pasien"
        description="Apakah Anda yakin ingin memulangkan pasien ini? Tindakan ini akan mengubah status menjadi 'pulang'."
        confirmText="Ya, Pulangkan"
        onConfirm={handleDischarge}
      />
    </>
  )
}
