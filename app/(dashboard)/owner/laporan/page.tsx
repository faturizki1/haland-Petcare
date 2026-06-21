import { createClient } from "@/lib/supabase/server"
import { SummaryCards } from "@/components/modules/laporan/summary-cards"
import { RevenueChart } from "@/components/modules/laporan/revenue-chart"
import { PaymentPieChart } from "@/components/modules/laporan/payment-pie-chart"
import { TopProductsChart } from "@/components/modules/laporan/top-products-chart"

export default async function LaporanPage() {
  const supabase = await createClient()

  // Get transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("status", "selesai")

  // Get expenses
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")

  const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.total), 0) || 0
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const totalProfit = totalRevenue - totalExpenses
  const totalTransactions = transactions?.length || 0

  // Payment method breakdown
  const tunai = transactions?.filter((t) => t.payment_method === "tunai").length || 0
  const qris = transactions?.filter((t) => t.payment_method === "qris").length || 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Laporan Keuangan</h1>
      <SummaryCards
        revenue={totalRevenue}
        expenses={totalExpenses}
        profit={totalProfit}
        transactions={totalTransactions}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart transactions={transactions ?? []} />
        <PaymentPieChart tunai={tunai} qris={qris} />
      </div>
      <TopProductsChart />
    </div>
  )
}