"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { serviceSchema, type ServiceInput } from "@/lib/validations/inventory"
import { createService, updateService } from "@/lib/actions/inventory"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Tables } from "@/lib/types/database"

type Service = Tables<"services">

interface InventoryServicesTabProps {
  initialData: Service[]
}

export function InventoryServicesTab({ initialData }: InventoryServicesTabProps) {
  const [services, setServices] = useState(initialData)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", category: "", price: 0, duration_minutes: undefined, doctor_required: false },
  })

  function openCreate() {
    setEditing(null)
    form.reset({ name: "", category: "", price: 0, duration_minutes: undefined, doctor_required: false })
    setOpen(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    form.reset({
      name: service.name,
      category: service.category ?? "",
      price: service.price,
      duration_minutes: service.duration_minutes ?? undefined,
      doctor_required: service.doctor_required,
    })
    setOpen(true)
  }

  async function onSubmit(values: ServiceInput) {
    setLoading(true)
    const result = editing
      ? await updateService(editing.id, values)
      : await createService(values)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: editing ? "Layanan diperbarui" : "Layanan ditambahkan" })
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Layanan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Layanan" : "Tambah Layanan"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Layanan</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input id="category" placeholder="Opsional" {...form.register("category")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Harga</Label>
                <Input id="price" type="number" {...form.register("price", { valueAsNumber: true })} />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Durasi (menit)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  placeholder="Opsional"
                  {...form.register("duration_minutes", { valueAsNumber: true })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="doctor_required"
                  checked={form.watch("doctor_required")}
                  onCheckedChange={(val) => form.setValue("doctor_required", val)}
                />
                <Label htmlFor="doctor_required">Butuh Dokter</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="Belum ada layanan"
          description="Belum ada data layanan yang tercatat"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead>Butuh Dokter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.category ?? "-"}</TableCell>
                  <TableCell>Rp {service.price.toLocaleString()}</TableCell>
                  <TableCell>{service.duration_minutes ? `${service.duration_minutes} menit` : "-"}</TableCell>
                  <TableCell>{service.doctor_required ? "Ya" : "Tidak"}</TableCell>
                  <TableCell>
                    <StatusBadge status={service.is_active ? "aktif" : "tidak_aktif"} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
