"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, type ProductInput } from "@/lib/validations/inventory"
import { createProduct, updateProduct } from "@/lib/actions/inventory"
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

type Product = Tables<"products">

interface InventoryProductsTabProps {
  initialData: Product[]
}

export function InventoryProductsTab({ initialData }: InventoryProductsTabProps) {
  const [products, setProducts] = useState(initialData)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", category_id: "", price: 0, stock: 0, min_stock: 5 },
  })

  function openCreate() {
    setEditing(null)
    form.reset({ name: "", category_id: "", price: 0, stock: 0, min_stock: 5 })
    setOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    form.reset({
      name: product.name,
      category_id: product.category_id ?? "",
      price: product.price,
      stock: product.stock,
      min_stock: product.min_stock,
    })
    setOpen(true)
  }

  async function onSubmit(values: ProductInput) {
    setLoading(true)
    const result = editing
      ? await updateProduct(editing.id, values)
      : await createProduct(values)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    toast({ title: editing ? "Produk diperbarui" : "Produk ditambahkan" })
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
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Harga</Label>
                <Input id="price" type="number" {...form.register("price", { valueAsNumber: true })} />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stok</Label>
                <Input id="stock" type="number" {...form.register("stock", { valueAsNumber: true })} />
                {form.formState.errors.stock && (
                  <p className="text-sm text-destructive">{form.formState.errors.stock.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock">Min. Stok</Label>
                <Input id="min_stock" type="number" {...form.register("min_stock", { valueAsNumber: true })} />
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

      {products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          description="Belum ada data produk yang tercatat"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Min. Stok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>Rp {product.price.toLocaleString()}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.min_stock}</TableCell>
                  <TableCell>
                    <StatusBadge status={product.is_active ? "aktif" : "tidak_aktif"} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
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
