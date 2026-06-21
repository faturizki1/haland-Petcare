"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { inpatientSchema, type InpatientInput } from "@/lib/validations/inpatient"
import { createInpatient } from "@/lib/actions/inpatients"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PetSearch } from "@/components/shared/pet-search"
import { DokterSelect } from "@/components/shared/dokter-select"
import { Loader2 } from "lucide-react"

export default function DokterRawatInapCreatePage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<InpatientInput>({
    resolver: zodResolver(inpatientSchema),
    defaultValues: {
      pet_id: "",
      doctor_id: "",
      cage_number: "",
      notes: "",
    },
  })

  async function onSubmit(values: InpatientInput) {
    setLoading(true)
    const result = await createInpatient(values)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal menyimpan",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: "Rawat inap berhasil ditambahkan" })
    router.push("/dokter/rawat-inap")
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Rawat Inap Baru</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Data Rawat Inap</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Label>Dokter Penanggung Jawab</Label>
              <DokterSelect
                value={form.watch("doctor_id")}
                onValueChange={(val) => form.setValue("doctor_id", val)}
              />
              {form.formState.errors.doctor_id && (
                <p className="text-sm text-destructive">{form.formState.errors.doctor_id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cage_number">Nomor Kandang (opsional)</Label>
              <Input id="cage_number" placeholder="Misal: A-01" {...form.register("cage_number")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Textarea id="notes" placeholder="Catatan awal rawat inap" {...form.register("notes")} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
