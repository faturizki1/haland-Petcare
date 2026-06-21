"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRupiah } from "@/lib/utils/format"
import { TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react"

interface SummaryCardsProps {
  revenue: number
  expenses: number
  profit: number
  transactions: number
}

export function SummaryCards({ revenue, expenses, profit, transactions }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pemasukan</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRupiah(revenue)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRupiah(expenses)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Laba</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRupiah(profit)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
          <Receipt className="h-4 w-4 text-info" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{transactions}</div>
        </CardContent>
      </Card>
    </div>
  )
}