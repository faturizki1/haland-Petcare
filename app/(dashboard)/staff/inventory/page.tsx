"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { productSchema, serviceSchema, stockMutationSchema, type ProductInput, type ServiceInput, type StockMutationInput } from "@/lib/validations/inventory"
import { getProducts, getServices, getStockMutations, createProduct, createService, addStockMutation } from "@/lib/actions/inventory"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { formatRupiah, formatDateTime } from "@/lib/utils/format"
import { Plus, Package, ClipboardList, ArrowUpDown } from "lucide-react"

export default function StaffInventoryPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [mutations, setMutations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [productDialog, setProductDialog] = useState(false)
  const [serviceDialog, setServiceDialog] = useState(false)
  const [mutationDialog, setMutationDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const productForm = useForm<ProductInput>({ resolver: zodResolver(productSchema), defaultValues: { name: "", price: 0, stock: 0, min_stock: 5 } })
  const serviceForm = useForm<ServiceInput>({ resolver: zodResolver(serviceSchema), defaultValues: { name: "", price: 0, doctor_required: false } })
  const mutationForm = useForm<StockMutationInput>({ resolver: zodResolver(stockMutationSchema), defaultValues: { product_id: "", type: "masuk", change_qty: 1, notes: "" } })

  async function fetchData() {
    setLoading(true)
    try {
      const [p, s, m] = await Promise.all([getProducts(), getServices(), getStockMutations()])
      setProducts(p); setServices(s); setMutations(m)
    } catch { toast({ title: "Gagal memuat", variant: "destructive" }) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function onSubmitProduct(v: ProductInput) {
    setSubmitting(true)
    const r = await createProduct(v)
    setSubmitting(false)
    if (r.error) { toast({ title: "Gagal", variant: "destructive" }); return }
    toast({ title: "Produk ditambahkan" }); setProductDialog(false); productForm.reset(); fetchData()
  }

  async function onSubmitService(v: ServiceInput) {
    setSubmitting(true)
    const r = await createService(v)
    setSubmitting(false)
    if (r.error) { toast({ title: "Gagal", variant: "destructive" }); return }
    toast({ title: "Layanan ditambahkan" }); setServiceDialog(false); serviceForm.reset(); fetchData()
  }

  async function onSubmitMutation(v: StockMutationInput) {
    setSubmitting(true)
    const r = await addStockMutation(v)
    setSubmitting(false)
    if (r.error) { toast({ title: "Gagal", variant: "destructive" }); return }
    toast({ title: "Mutasi stok dicatat" }); setMutationDialog(false); mutationForm.reset(); fetchData()
  }

  if (loading) return <TableSkeleton rows={8} columns={4} />

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Inventory</h1>
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="services">Layanan</TabsTrigger>
          <TabsTrigger value="mutations">Mutasi Stok</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={productDialog} onOpenChange={setProductDialog}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Tambah Produk</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Tambah Produk</DialogTitle></DialogHeader>
                <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-4">
                  <div><Label>Nama</Label><Input {...productForm.register("name")} /></div>
                  <div><Label>Harga</Label><Input type="number" {...productForm.register("price", { valueAsNumber: true })} /></div>
                  <div><Label>Stok Awal</Label><Input type="number" {...productForm.register("stock", { valueAsNumber: true })} /></div>
                  <div><Label>Min. Stok</Label><Input type="number" {...productForm.register("min_stock", { valueAsNumber: true })} /></div>
                  <Button type="submit" disabled={submitting}>Simpan</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {products.length === 0 ? <EmptyState title="Belum ada produk" icon={<Package className="h-16 w-16" />} /> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Nama</TableHead><TableHead>Harga</TableHead><TableHead>Stok</TableHead><TableHead>Min. Stok</TableHead><TableHead>Status</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{formatRupiah(Number(p.price))}</TableCell>
                      <TableCell className={p.stock <= p.min_stock ? "text-destructive font-bold" : ""}>{p.stock}</TableCell>
                      <TableCell>{p.min_stock}</TableCell>
                      <TableCell>{p.is_active ? "Aktif" : "Nonaktif"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Tambah Layanan</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Tambah Layanan</DialogTitle></DialogHeader>
                <form onSubmit={serviceForm.handleSubmit(onSubmitService)} className="space-y-4">
                  <div><Label>Nama</Label><Input {...serviceForm.register("name")} /></div>
                  <div><Label>Kategori</Label><Input {...serviceForm.register("category")} /></div>
                  <div><Label>Harga</Label><Input type="number" {...serviceForm.register("price", { valueAsNumber: true })} /></div>
                  <div><Label>Durasi (menit)</Label><Input type="number" {...serviceForm.register("duration_minutes", { valueAsNumber: true })} /></div>
                  <Button type="submit" disabled={submitting}>Simpan</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {services.length === 0 ? <EmptyState title="Belum ada layanan" icon={<ClipboardList className="h-16 w-16" />} /> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Nama</TableHead><TableHead>Kategori</TableHead><TableHead>Harga</TableHead><TableHead>Durasi</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.category || "-"}</TableCell>
                      <TableCell>{formatRupiah(Number(s.price))}</TableCell>
                      <TableCell>{s.duration_minutes ? `${s.duration_minutes} menit` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mutations" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={mutationDialog} onOpenChange={setMutationDialog}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Tambah Mutasi</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Tambah Mutasi Stok</DialogTitle></DialogHeader>
                <form onSubmit={mutationForm.handleSubmit(onSubmitMutation)} className="space-y-4">
                  <div>
                    <Label>Produk</Label>
                    <Select value={mutationForm.watch("product_id")} onValueChange={(v) => mutationForm.setValue("product_id", v)}>
                      <SelectTrigger><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipe</Label>
                    <Select value={mutationForm.watch("type")} onValueChange={(v: any) => mutationForm.setValue("type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masuk">Masuk</SelectItem>
                        <SelectItem value="keluar">Keluar</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Jumlah</Label><Input type="number" {...mutationForm.register("change_qty", { valueAsNumber: true })} /></div>
                  <div><Label>Catatan</Label><Input {...mutationForm.register("notes")} /></div>
                  <Button type="submit" disabled={submitting}>Simpan</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {mutations.length === 0 ? <EmptyState title="Belum ada mutasi" icon={<ArrowUpDown className="h-16 w-16" />} /> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Tanggal</TableHead><TableHead>Produk</TableHead><TableHead>Tipe</TableHead><TableHead>Sebelum</TableHead><TableHead>Perubahan</TableHead><TableHead>Sesudah</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {mutations.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{formatDateTime(m.created_at)}</TableCell>
                      <TableCell>{m.products?.name}</TableCell>
                      <TableCell>{m.type}</TableCell>
                      <TableCell>{m.before_qty}</TableCell>
                      <TableCell className={m.change_qty < 0 ? "text-destructive" : "text-success"}>{m.change_qty}</TableCell>
                      <TableCell>{m.after_qty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}