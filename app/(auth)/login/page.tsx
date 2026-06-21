"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { signIn } from "@/lib/actions/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginInput) {
    setLoading(true)
    const result = await signIn(values)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal masuk",
        description: typeof result.error === "string" ? result.error : "Periksa kembali email dan password",
        variant: "destructive",
      })
      return
    }

    toast({ title: "Berhasil masuk" })
    router.push("/")
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-center mb-6">Masuk</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="••••••"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Daftar
        </Link>
      </p>
    </div>
  )
}