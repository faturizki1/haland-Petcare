"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { transactionSchema, type TransactionInput } from "@/lib/validations/pos"
import { getProducts, getServices } from "@/lib/actions/inventory"
import { createTransaction } from "@/lib/actions/pos"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CustomerSearch } from "@/components/shared/customer-search"
import { EmptyState } from "@/components/shared/empty-state"
import { formatRupiah } from "@/lib/utils/format"
import { Plus, Trash2, ShoppingCart, Printer } from "lucide-react"

interface CartItem {
  item_type: "product" | "service"
  item_id: string
  item_name: string
  price: number
  qty: number
  subtotal: number
}

export default function StaffPosPage() {
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerId, setCustomerId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("tunai")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invoiceNo, setInvoiceNo] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetch() {
      try {
        const [p, s] = await Promise.all([getProducts(), getServices()])
        setProducts(p.filter((x: any) => x.is_active))
        setServices(s.filter((x: any) => x.is_active))
      } catch { toast({ title: "Gagal memuat", variant: "destructive" }) }
      setLoading(false)
    }
    fetch()
  }, [])

  function addToCart(item: any, type: "product" | "service") {
    setCart((prev) => {
      const existing = prev.find((c) => c.item_id === item.id && c.item_type === type)
      if (existing) {
        return prev.map((c) =>
          c.item_id === item.id && c.item_type === type
            ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * c.price }
            : c
        )
      }
      return [...prev, { item_type: type, item_id: item.id, item_name: item.name, price: Number(item.price), qty: 1, subtotal: Number(item.price) }]
    })
  }

  function updateQty(id: string, type: string, qty: number) {
    if (qty < 1) return
    setCart((prev) => prev.map((c) => (c.item_id === id && c.item_type === type ? { ...c, qty, subtotal: qty * c.price } : c)))
  }

  function removeItem(id: string, type: string) {
    setCart((prev) => prev.filter((c) => !(c.item_id === id && c.item_type === type)))
  }

  const total = cart.reduce((sum, c) => sum + c.subtotal, 0)

  async function handleSubmit() {
    if (cart.length === 0) { toast({ title: "Cart kosong", variant: "destructive" }); return }
    setSubmitting(true)
    const result = await createTransaction({
      customer_id: customerId,
      payment_method: paymentMethod as "tunai" | "qris",
      items: cart,
    })
    setSubmitting(false)
    if (result.error) { toast({ title: "Gagal", description: String(result.error), variant: "destructive" }); return }
    toast({ title: "Transaksi berhasil" })
    setInvoiceNo(result.invoice_no || "")
    setCart([])
    setCustomerId("")
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Memuat...</p></div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">POS / Kasir</h1>

      {invoiceNo && (
        <Card className="border-success">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-bold text-success">Transaksi Berhasil!</p>
            <p className="text-2xl font-bold mt-2">{invoiceNo}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Cetak Struk
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Produk</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {products.map((p) => (
                  <Button key={p.id} variant="outline" className="h-auto flex-col py-3" onClick={() => addToCart(p, "product")}>
                    <span className="font-medium text-sm">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{formatRupiah(Number(p.price))}</span>
                    <span className="text-xs">Stok: {p.stock}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Layanan</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {services.map((s) => (
                  <Button key={s.id} variant="outline" className="h-auto flex-col py-3" onClick={() => addToCart(s, "service")}>
                    <span className="font-medium text-sm">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{formatRupiah(Number(s.price))}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Cart</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada item</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={`${item.item_type}-${item.item_id}`} className="flex items-center justify-between border-b pb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.item_name}</p>
                        <p className="text-xs text-muted-foreground">{formatRupiah(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateQty(item.item_id, item.item_type, parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-sm"
                        />
                        <p className="text-sm font-medium w-20 text-right">{formatRupiah(item.subtotal)}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.item_id, item.item_type)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label>Customer</Label>
            <CustomerSearch onSelect={(c) => setCustomerId(c.id)} placeholder="Cari customer (opsional)..." />
          </div>

          <div className="space-y-2">
            <Label>Metode Pembayaran</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tunai">Tunai</SelectItem>
                <SelectItem value="qris">QRIS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" size="lg" disabled={cart.length === 0 || submitting} onClick={handleSubmit}>
            {submitting ? "Memproses..." : `Bayar ${formatRupiah(total)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}