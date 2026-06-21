"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatRupiah } from "@/lib/utils/format"

interface RevenueChartProps {
  transactions: any[]
}

export function RevenueChart({ transactions }: RevenueChartProps) {
  // Group by date
  const grouped: Record<string, number> = {}
  transactions.forEach((t) => {
    const date = new Date(t.created_at).toLocaleDateString("id-ID")
    grouped[date] = (grouped[date] || 0) + Number(t.total)
  })

  const data = Object.entries(grouped).slice(-7).map(([date, total]) => ({
    date,
    total,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Pemasukan per Hari</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value: number) => formatRupiah(value)} />
              <Bar dataKey="total" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}