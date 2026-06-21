"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { signUp } from "@/lib/actions/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(values: RegisterInput) {
    setLoading(true)
    const result = await signUp(values)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal daftar",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data anda",
        variant: "destructive",
      })
      return
    }

    toast({ title: "Berhasil daftar", description: "Silakan cek email untuk konfirmasi" })
    router.push("/login")
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-center mb-6">Daftar</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nama Lengkap</Label>
          <Input
            id="fullName"
            placeholder="Nama lengkap"
            {...form.register("fullName")}
          />
          {form.formState.errors.fullName && (
            <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="nama@email.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimal 6 karakter"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Ulangi password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : "Daftar"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  )
}