"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { inpatientLogSchema, type InpatientLogInput } from "@/lib/validations/inpatient"
import { addInpatientLog } from "@/lib/actions/inpatients"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function InpatientLogForm({ inpatientId }: { inpatientId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<InpatientLogInput>({
    resolver: zodResolver(inpatientLogSchema),
    defaultValues: { inpatient_id: inpatientId, condition: "stabil", notes: "", is_visible_customer: true },
  })

  async function onSubmit(values: InpatientLogInput) {
    setLoading(true)
    const result = await addInpatientLog(values)
    setLoading(false)
    if (result.error) { toast({ title: "Gagal", variant: "destructive" }); return }
    toast({ title: "Log ditambahkan" })
    form.reset({ inpatient_id: inpatientId, condition: "stabil", notes: "", is_visible_customer: true })
    router.refresh()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 border rounded-lg p-4 bg-muted/30">
      <h4 className="text-sm font-medium">Tambah Log Monitoring</h4>
      <div>
        <Label>Kondisi</Label>
        <Select value={form.watch("condition")} onValueChange={(v: any) => form.setValue("condition", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stabil">Stabil</SelectItem>
            <SelectItem value="perlu_perhatian">Perlu Perhatian</SelectItem>
            <SelectItem value="kritis">Kritis</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Catatan</Label>
        <Textarea {...form.register("notes")} placeholder="Catatan monitoring..." />
      </div>
      <div className="flex items-center gap-2">
        <Switch id="visible" checked={form.watch("is_visible_customer")} onCheckedChange={(v) => form.setValue("is_visible_customer", v)} />
        <Label htmlFor="visible">Tampilkan ke customer</Label>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan Log"}</Button>
    </form>
  )
}