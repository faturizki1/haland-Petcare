"use client"

import { useState } from "react"
import { dischargeInpatient } from "@/lib/actions/inpatients"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LogOut } from "lucide-react"

export function DischargeButton({ inpatientId }: { inpatientId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleDischarge() {
    setLoading(true)
    const result = await dischargeInpatient(inpatientId)
    setLoading(false)
    setOpen(false)
    if (result.error) { toast({ title: "Gagal", variant: "destructive" }); return }
    toast({ title: "Pasien dipulangkan" })
    router.refresh()
  }

  return (
    <>
      <Button variant="outline" className="text-warning" onClick={() => setOpen(true)}>
        <LogOut className="mr-2 h-4 w-4" /> Pulangkan
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Pulangkan Pasien"
        description="Apakah anda yakin ingin memulangkan pasien ini?"
        confirmText="Ya, Pulangkan"
        onConfirm={handleDischarge}
      />
    </>
  )
}