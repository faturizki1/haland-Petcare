"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUserSchema, type CreateUserInput } from "@/lib/validations/user"
import { createUser } from "@/lib/actions/users"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateUserPage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: "", password: "", fullName: "", role: "staff", phone: "" },
  })

  async function onSubmit(values: CreateUserInput) {
    setLoading(true)
    const result = await createUser(values)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal membuat user",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: "User berhasil dibuat" })
    router.push("/owner/users")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-display font-bold">Tambah User Baru</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nama Lengkap</Label>
          <Input id="fullName" placeholder="Nama lengkap" {...form.register("fullName")} />
          {form.formState.errors.fullName && (
            <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Minimal 6 karakter" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={form.watch("role")}
            onValueChange={(val) => form.setValue("role", val as CreateUserInput["role"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="dokter">Dokter</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.role && (
            <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telepon (opsional)</Label>
          <Input id="phone" placeholder="08xxxx" {...form.register("phone")} />
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