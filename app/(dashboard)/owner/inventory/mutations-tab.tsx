"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { stockMutationSchema, type StockMutationInput } from "@/lib/validations/inventory"
import { addStockMutation } from "@/lib/actions/inventory"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDate } from "@/lib/utils/format"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Tables } from "@/lib/types/database"

type StockMutation = Tables<"stock_mutations"> & {
  products?: { name: string } | null
}

interface InventoryMutationsTabProps {
  initialData: StockMutation[]
}

export function InventoryMutationsTab({ initialData }: InventoryMutationsTabProps) {
  const [mutations, setMutations] = useState(initialData)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<StockMutationInput>({
    resolver: zodResolver(stockMutationSchema),
    defaultValues: { product_id: "", type: "masuk", change_qty: 1, notes: "" },
  })

  async function onSubmit(values: StockMutationInput) {
    setLoading(true)
    const result = await addStockMutation(values)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: "Mutasi stok berhasil" })
    setOpen(false)
    form.reset({ product_id: "", type: "masuk", change_qty: 1, notes: "" })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Mutasi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Mutasi Stok</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="product_id">ID Produk</Label>
                <Input id="product_id" placeholder="Masukkan UUID produk" {...form.register("product_id")} />
                {form.formState.errors.product_id && (
                  <p className="text-sm text-destructive">{form.formState.errors.product_id.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipe</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(val) => form.setValue("type", val as "masuk" | "keluar" | "adjustment")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Masuk</SelectItem>
                    <SelectItem value="keluar">Keluar</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="change_qty">Jumlah</Label>
                <Input
                  id="change_qty"
                  type="number"
                  min={1}
                  {...form.register("change_qty", { valueAsNumber: true })}
                />
                {form.formState.errors.change_qty && (
                  <p className="text-sm text-destructive">{form.formState.errors.change_qty.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea id="notes" placeholder="Opsional" {...form.register("notes")} />
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

      {mutations.length === 0 ? (
        <EmptyState
          title="Belum ada mutasi stok"
          description="Belum ada data mutasi stok yang tercatat"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Sebelum</TableHead>
                <TableHead>Perubahan</TableHead>
                <TableHead>Sesudah</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mutations.map((mutation) => (
                <TableRow key={mutation.id}>
                  <TableCell>{formatDate(mutation.created_at)}</TableCell>
                  <TableCell>{mutation.products?.name ?? "-"}</TableCell>
                  <TableCell>{mutation.type}</TableCell>
                  <TableCell>{mutation.before_qty}</TableCell>
                  <TableCell>{mutation.change_qty}</TableCell>
                  <TableCell>{mutation.after_qty}</TableCell>
                  <TableCell className="max-w-xs truncate">{mutation.notes ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
