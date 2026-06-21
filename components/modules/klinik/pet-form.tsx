"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { petSchema, type PetInput } from "@/lib/validations/pet"
import { createPet, updatePet } from "@/lib/actions/pets"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomerSearch } from "@/components/shared/customer-search"
import { ImageUpload } from "@/components/shared/image-upload"
import type { Tables } from "@/lib/types/database"

type Pet = Tables<"pets">

interface PetFormProps {
  initialData?: Pet
  role: string
}

export function PetForm({ initialData, role }: PetFormProps) {
  const [loading, setLoading] = useState(false)
  const [ownerId, setOwnerId] = useState(initialData?.owner_id || "")
  const [photoUrl, setPhotoUrl] = useState(initialData?.photo_url || "")
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<PetInput>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      owner_id: initialData?.owner_id || "",
      name: initialData?.name || "",
      species: initialData?.species || "",
      breed: initialData?.breed || "",
      birth_date: initialData?.birth_date || "",
      gender: initialData?.gender || "",
      photo_url: initialData?.photo_url || "",
    },
  })

  async function onSubmit(values: PetInput) {
    setLoading(true)
    const result = initialData
      ? await updatePet(initialData.id, { ...values, photo_url: photoUrl })
      : await createPet({ ...values, photo_url: photoUrl })
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal menyimpan",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: initialData ? "Data hewan diperbarui" : "Hewan baru ditambahkan" })
    router.push(`/${role}/hewan`)
    router.refresh()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label>Pemilik</Label>
        <CustomerSearch
          onSelect={(customer) => {
            setOwnerId(customer.id)
            form.setValue("owner_id", customer.id)
          }}
        />
        {form.formState.errors.owner_id && (
          <p className="text-sm text-destructive">{form.formState.errors.owner_id.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nama Hewan</Label>
        <Input id="name" placeholder="Nama hewan" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="species">Spesies</Label>
          <Select
            value={form.watch("species")}
            onValueChange={(val) => form.setValue("species", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih spesies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Anjing">Anjing</SelectItem>
              <SelectItem value="Kucing">Kucing</SelectItem>
              <SelectItem value="Kelinci">Kelinci</SelectItem>
              <SelectItem value="Hamster">Hamster</SelectItem>
              <SelectItem value="Burung">Burung</SelectItem>
              <SelectItem value="Reptil">Reptil</SelectItem>
              <SelectItem value="Lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.species && (
            <p className="text-sm text-destructive">{form.formState.errors.species.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="breed">Ras</Label>
          <Input id="breed" placeholder="Ras (opsional)" {...form.register("breed")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Jenis Kelamin</Label>
          <Select
            value={form.watch("gender")}
            onValueChange={(val) => form.setValue("gender", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Jantan">Jantan</SelectItem>
              <SelectItem value="Betina">Betina</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="birth_date">Tanggal Lahir</Label>
          <Input id="birth_date" type="date" {...form.register("birth_date")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Foto</Label>
        <ImageUpload
          bucket="uploads"
          path={`pets/${initialData?.id || "new"}`}
          onUploadComplete={(url) => setPhotoUrl(url)}
          existingUrl={photoUrl}
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
  )
}