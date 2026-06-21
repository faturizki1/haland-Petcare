"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { appointmentSchema, type AppointmentInput } from "@/lib/validations/appointment"
import { createAppointment } from "@/lib/actions/appointments"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PetSearch } from "@/components/shared/pet-search"
import { DokterSelect } from "@/components/shared/dokter-select"

export default function CreateAppointmentPage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { pet_id: "", doctor_id: "", scheduled_at: "", complaint: "" },
  })

  async function onSubmit(values: AppointmentInput) {
    setLoading(true)
    const result = await createAppointment(values)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: "Appointment berhasil dibuat" })
    router.push("/owner/appointment")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-display font-bold">Buat Appointment Baru</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Hewan</Label>
          <PetSearch
            onSelect={(pet) => form.setValue("pet_id", pet.id)}
            placeholder="Cari hewan..."
          />
          {form.formState.errors.pet_id && (
            <p className="text-sm text-destructive">{form.formState.errors.pet_id.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Dokter</Label>
          <DokterSelect
            value={form.watch("doctor_id")}
            onValueChange={(val) => form.setValue("doctor_id", val)}
          />
          {form.formState.errors.doctor_id && (
            <p className="text-sm text-destructive">{form.formState.errors.doctor_id.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduled_at">Jadwal</Label>
          <Input
            id="scheduled_at"
            type="datetime-local"
            {...form.register("scheduled_at")}
          />
          {form.formState.errors.scheduled_at && (
            <p className="text-sm text-destructive">{form.formState.errors.scheduled_at.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="complaint">Keluhan</Label>
          <Textarea
            id="complaint"
            placeholder="Deskripsi keluhan (opsional)"
            {...form.register("complaint")}
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  )
}