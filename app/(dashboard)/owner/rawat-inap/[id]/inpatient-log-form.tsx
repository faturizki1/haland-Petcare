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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InpatientLogFormProps {
  inpatientId: string
}

export function InpatientLogForm({ inpatientId }: InpatientLogFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<InpatientLogInput>({
    resolver: zodResolver(inpatientLogSchema),
    defaultValues: {
      inpatient_id: inpatientId,
      condition: "stabil",
      notes: "",
      is_visible_customer: true,
    },
  })

  async function onSubmit(values: InpatientLogInput) {
    setLoading(true)
    const result = await addInpatientLog(values)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: "Log berhasil ditambahkan" })
    form.reset({ inpatient_id: inpatientId, condition: "stabil", notes: "", is_visible_customer: true })
    router.refresh()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="condition">Kondisi</Label>
        <Select
          value={form.watch("condition")}
          onValueChange={(val) => form.setValue("condition", val as "stabil" | "perlu_perhatian" | "kritis")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih kondisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stabil">Stabil</SelectItem>
            <SelectItem value="perlu_perhatian">Perlu Perhatian</SelectItem>
            <SelectItem value="kritis">Kritis</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.condition && (
          <p className="text-sm text-destructive">{form.formState.errors.condition.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea
          id="notes"
          placeholder="Catatan monitoring (opsional)"
          {...form.register("notes")}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="is_visible_customer"
          checked={form.watch("is_visible_customer")}
          onCheckedChange={(val) => form.setValue("is_visible_customer", val)}
        />
        <Label htmlFor="is_visible_customer">Tampilkan ke customer</Label>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : "Tambah Log"}
      </Button>
    </form>
  )
}
