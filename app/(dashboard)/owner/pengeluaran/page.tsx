import { getExpenses } from "@/lib/actions/expenses"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Plus, Wallet } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils/format"
import { ExpenseForm } from "./expense-form"

export default async function OwnerPengeluaranPage() {
  const expenses = await getExpenses()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Pengeluaran</h1>
        <ExpenseForm />
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title="Belum ada pengeluaran"
          description="Belum ada data pengeluaran yang tercatat"
          icon={<Wallet className="h-16 w-16" />}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Dicatat oleh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.created_at)}</TableCell>
                  <TableCell className="font-medium">{expense.category}</TableCell>
                  <TableCell>{formatCurrency(expense.amount)}</TableCell>
                  <TableCell className="max-w-xs truncate">{expense.description ?? "-"}</TableCell>
                  <TableCell>{expense.profiles?.full_name ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
