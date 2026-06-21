"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { clinicSettingsSchema, type ClinicSettingsInput } from "@/lib/validations/settings"
import { updateClinicSettings } from "@/lib/actions/settings"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/shared/image-upload"
import type { Tables } from "@/lib/types/database"

type ClinicSettings = Tables<"clinic_settings">

interface SettingsFormProps {
  initialData: ClinicSettings | null
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || "")
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<ClinicSettingsInput>({
    resolver: zodResolver(clinicSettingsSchema),
    defaultValues: {
      clinic_name: initialData?.clinic_name || "VetCare",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      open_hours: initialData?.open_hours || "",
      logo_url: initialData?.logo_url || "",
    },
  })

  async function onSubmit(values: ClinicSettingsInput) {
    setLoading(true)
    const result = await updateClinicSettings({ ...values, logo_url: logoUrl })
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal menyimpan",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: "Pengaturan berhasil disimpan" })
    router.refresh()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="clinic_name">Nama Klinik</Label>
        <Input id="clinic_name" {...form.register("clinic_name")} />
        {form.formState.errors.clinic_name && (
          <p className="text-sm text-destructive">{form.formState.errors.clinic_name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Alamat</Label>
        <Textarea id="address" {...form.register("address")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telepon</Label>
        <Input id="phone" {...form.register("phone")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="open_hours">Jam Buka</Label>
        <Input id="open_hours" placeholder="Sen-Jum 08:00-20:00, Sab 08:00-16:00" {...form.register("open_hours")} />
      </div>
      <div className="space-y-2">
        <Label>Logo</Label>
        <ImageUpload
          bucket="uploads"
          path="clinic"
          onUploadComplete={(url) => setLogoUrl(url)}
          existingUrl={logoUrl}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  )
}