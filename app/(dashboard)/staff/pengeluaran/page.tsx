"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { expenseSchema, type ExpenseInput } from "@/lib/validations/expense"
import { getExpenses, createExpense, deleteExpense } from "@/lib/actions/expenses"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { formatRupiah, formatDateTime } from "@/lib/utils/format"
import { Plus, Trash2, Wallet } from "lucide-react"

export default function StaffPengeluaranPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { category: "", amount: 0, description: "" },
  })

  async function fetchData() {
    setLoading(true)
    try {
      const expenses = await getExpenses()
      setData(expenses)
    } catch (e: any) {
      toast({ title: "Gagal memuat data", variant: "destructive" })
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function onSubmit(values: ExpenseInput) {
    setSubmitting(true)
    const result = await createExpense(values)
    setSubmitting(false)
    if (result.error) {
      toast({ title: "Gagal", description: String(result.error), variant: "destructive" })
      return
    }
    toast({ title: "Pengeluaran berhasil dicatat" })
    setDialogOpen(false)
    form.reset()
    fetchData()
  }

  async function handleDelete(id: string) {
    setSelectedId(id)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!selectedId) return
    const result = await deleteExpense(selectedId)
    if (result.error) {
      toast({ title: "Gagal", description: String(result.error), variant: "destructive" })
      return
    }
    toast({ title: "Pengeluaran berhasil dihapus" })
    setConfirmOpen(false)
    fetchData()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Pengeluaran</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Tambah Pengeluaran</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Pengeluaran</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input placeholder="Listrik, Air, dll" {...form.register("category")} />
                {form.formState.errors.category && <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Jumlah (Rp)</Label>
                <Input type="number" {...form.register("amount", { valueAsNumber: true })} />
                {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea {...form.register("description")} />
              </div>
              <Button type="submit" disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <TableSkeleton rows={5} columns={4} /> : data.length === 0 ? (
        <EmptyState title="Belum ada pengeluaran" description="Catat pengeluaran pertama" icon={<Wallet className="h-16 w-16" />} />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="w-16">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-medium">{exp.category}</TableCell>
                  <TableCell>{formatRupiah(Number(exp.amount))}</TableCell>
                  <TableCell className="text-muted-foreground">{exp.description || "-"}</TableCell>
                  <TableCell>{formatDateTime(exp.created_at)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Hapus Pengeluaran" description="Yakin ingin menghapus pengeluaran ini?" confirmText="Ya, Hapus" onConfirm={confirmDelete} />
    </div>
  )
}