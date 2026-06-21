"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserSchema, type UpdateUserInput } from "@/lib/validations/user"
import { updateUser } from "@/lib/actions/users"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Tables } from "@/lib/types/database"

type Profile = Tables<"profiles">

interface UserEditFormProps {
  user: Profile
}

export function UserEditForm({ user }: UserEditFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user.full_name,
      role: user.role,
      phone: user.phone ?? "",
      isActive: user.is_active,
    },
  })

  async function onSubmit(values: UpdateUserInput) {
    setLoading(true)
    const result = await updateUser(user.id, values)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: "User berhasil diperbarui" })
    router.refresh()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nama Lengkap</Label>
        <Input id="fullName" {...form.register("fullName")} />
        {form.formState.errors.fullName && (
          <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={form.watch("role")}
          onValueChange={(val) => form.setValue("role", val as "owner" | "dokter" | "staff" | "customer")}
        >
          <SelectTrigger>
            <SelectValue />
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
        <Label htmlFor="phone">Telepon</Label>
        <Input id="phone" placeholder="Opsional" {...form.register("phone")} />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="isActive"
          checked={form.watch("isActive")}
          onCheckedChange={(val) => form.setValue("isActive", val)}
        />
        <Label htmlFor="isActive">Aktif</Label>
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
