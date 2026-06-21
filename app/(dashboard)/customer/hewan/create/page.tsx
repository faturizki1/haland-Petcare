"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { petSchema, type PetInput } from "@/lib/validations/pet"
import { createPet } from "@/lib/actions/pets"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/shared/image-upload"
import { createClient } from "@/lib/supabase/client"

export default function CustomerCreateHewanPage() {
  const [loading, setLoading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState("")
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function getUserId() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setOwnerId(user.id)
    }
    getUserId()
  }, [])

  const form = useForm<PetInput>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      owner_id: "",
      name: "",
      species: "",
      breed: "",
      birth_date: "",
      gender: "",
      photo_url: "",
    },
  })

  async function onSubmit(values: PetInput) {
    if (!ownerId) {
      toast({ title: "Gagal", description: "Session tidak ditemukan", variant: "destructive" })
      return
    }

    setLoading(true)
    const result = await createPet({ ...values, owner_id: ownerId, photo_url: photoUrl })
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal menyimpan",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: "Hewan baru ditambahkan" })
    router.push("/customer/hewan")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Tambah Hewan Baru</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
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
            path={`pets/new`}
            onUploadComplete={(url) => setPhotoUrl(url)}
            existingUrl={photoUrl}
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={loading || !ownerId}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  )
}
