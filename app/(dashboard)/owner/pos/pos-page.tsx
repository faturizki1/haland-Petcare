"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { transactionSchema, type TransactionInput } from "@/lib/validations/pos"
import { createTransaction } from "@/lib/actions/pos"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerSearch } from "@/components/shared/customer-search"
import { EmptyState } from "@/components/shared/empty-state"
import { PrintWrapper } from "@/components/shared/print-wrapper"
import { Minus, Plus, ShoppingCart, Trash2, Printer } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Tables } from "@/lib/types/database"

type Product = Tables<"products">
type Service = Tables<"services">

interface CartItem {
  item_type: "product" | "service"
  item_id: string
  item_name: string
  price: number
  qty: number
  subtotal: number
}

interface POSPageProps {
  products: Product[]
  services: Service[]
}

export function POSPage({ products, services }: POSPageProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerId, setCustomerId] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "qris">("tunai")
  const [loading, setLoading] = useState(false)
  const [invoiceNo, setInvoiceNo] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart])

  function addToCart(item: { item_type: "product" | "service"; item_id: string; item_name: string; price: number }) {
    setCart((prev) => {
      const existing = prev.find((i) => i.item_id === item.item_id)
      if (existing) {
        return prev.map((i) =>
          i.item_id === item.item_id
            ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.price }
            : i
        )
      }
      return [...prev, { ...item, qty: 1, subtotal: item.price }]
    })
  }

  function updateQty(itemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.item_id === itemId
            ? { ...item, qty: Math.max(1, item.qty + delta), subtotal: Math.max(1, item.qty + delta) * item.price }
            : item
        )
        .filter((item) => item.qty > 0)
    )
  }

  function removeItem(itemId: string) {
    setCart((prev) => prev.filter((i) => i.item_id !== itemId))
  }

  async function handleSubmit() {
    if (cart.length === 0) {
      toast({ title: "Keranjang kosong", variant: "destructive" })
      return
    }

    setLoading(true)
    const result = await createTransaction({
      customer_id: customerId || "",
      payment_method: paymentMethod,
      items: cart.map((item) => ({
        item_type: item.item_type,
        item_id: item.item_id,
        item_name: item.item_name,
        price: item.price,
        qty: item.qty,
        subtotal: item.subtotal,
      })),
    })
    setLoading(false)

    if (result.error) {
      toast({
        title: "Gagal",
        description: typeof result.error === "string" ? result.error : "Periksa kembali data",
        variant: "destructive",
      })
      return
    }

    setInvoiceNo(result.invoice_no ?? null)
    toast({ title: "Transaksi berhasil", description: `Invoice: ${result.invoice_no}` })
    setCart([])
    setCustomerId("")
    setCustomerName("")
    router.refresh()
  }

  function resetTransaction() {
    setInvoiceNo(null)
    setCart([])
    setCustomerId("")
    setCustomerName("")
  }

  if (invoiceNo) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <PrintWrapper>
          <Card>
            <CardContent className="py-8 space-y-4">
              <div className="text-4xl">✅</div>
              <h2 className="text-xl font-bold">Transaksi Berhasil</h2>
              <p className="text-lg font-mono">Invoice: {invoiceNo}</p>
              <p className="text-2xl font-bold">Rp {subtotal.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">
                Metode: {paymentMethod === "tunai" ? "Tunai" : "QRIS"}
              </p>
            </CardContent>
          </Card>
        </PrintWrapper>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          <Button onClick={resetTransaction}>Transaksi Baru</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Produk</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <EmptyState title="Tidak ada produk" description="Belum ada produk aktif" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center hover:bg-accent transition-colors"
                    onClick={() =>
                      addToCart({
                        item_type: "product",
                        item_id: product.id,
                        item_name: product.name,
                        price: product.price,
                      })
                    }
                  >
                    <span className="font-medium text-sm">{product.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Rp {product.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">Stok: {product.stock}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <EmptyState title="Tidak ada layanan" description="Belum ada layanan aktif" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center hover:bg-accent transition-colors"
                    onClick={() =>
                      addToCart({
                        item_type: "service",
                        item_id: service.id,
                        item_name: service.name,
                        price: service.price,
                      })
                    }
                  >
                    <span className="font-medium text-sm">{service.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Rp {service.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Keranjang ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada item dipilih
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.item_id} className="flex items-center justify-between gap-2 rounded-lg border p-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Rp {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQty(item.item_id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.qty}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQty(item.item_id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Rp {item.subtotal.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeItem(item.item_id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>Rp {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Customer</Label>
              <CustomerSearch
                onSelect={(customer) => {
                  setCustomerId(customer.id)
                  setCustomerName(customer.full_name)
                }}
                placeholder="Cari customer (opsional)"
              />
              {customerName && (
                <p className="text-xs text-muted-foreground">Dipilih: {customerName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Metode Pembayaran</Label>
              <Select
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as "tunai" | "qris")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tunai">Tunai</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={cart.length === 0 || loading}
              onClick={handleSubmit}
            >
              {loading ? "Memproses..." : `Bayar Rp ${subtotal.toLocaleString()}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
