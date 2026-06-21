"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { medicalRecordSchema, type MedicalRecordInput } from "@/lib/validations/medical-record"
import { createMedicalRecord, updateMedicalRecord } from "@/lib/actions/medical-records"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { PetSearch } from "@/components/shared/pet-search"
import { DokterSelect } from "@/components/shared/dokter-select"
import type { Tables } from "@/lib/types/database"

type MedicalRecord = Tables<"medical_records">

interface MedicalRecordFormProps {
  initialData?: MedicalRecord
  role: string
}

export function MedicalRecordForm({ initialData, role }: MedicalRecordFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<MedicalRecordInput>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      pet_id: initialData?.pet_id || "",
      doctor_id: initialData?.doctor_id || "",
      appointment_id: initialData?.appointment_id || "",
      diagnosis: initialData?.diagnosis || "",
      treatment: initialData?.treatment || "",
      prescription: initialData?.prescription || "",
      notes: initialData?.notes || "",
      is_visible_customer: initialData?.is_visible_customer ?? true,
    },
  })

  async function onSubmit(values: MedicalRecordInput) {
    setLoading(true)
    const result = initialData
      ? await updateMedicalRecord(initialData.id, values)
      : await createMedicalRecord(values)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal menyimpan",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: initialData ? "Rekam medis diperbarui" : "Rekam medis ditambahkan" })
    router.push(`/${role}/rekam-medis`)
    router.refresh()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
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
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Textarea id="diagnosis" placeholder="Diagnosis" {...form.register("diagnosis")} />
        {form.formState.errors.diagnosis && (
          <p className="text-sm text-destructive">{form.formState.errors.diagnosis.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="treatment">Treatment</Label>
        <Textarea id="treatment" placeholder="Treatment (opsional)" {...form.register("treatment")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prescription">Resep</Label>
        <Textarea id="prescription" placeholder="Resep obat (opsional)" {...form.register("prescription")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea id="notes" placeholder="Catatan tambahan (opsional)" {...form.register("notes")} />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="is_visible_customer"
          checked={form.watch("is_visible_customer")}
          onCheckedChange={(val) => form.setValue("is_visible_customer", val)}
        />
        <Label htmlFor="is_visible_customer">Tampilkan ke customer</Label>
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
  )
}