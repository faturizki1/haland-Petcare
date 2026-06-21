"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatRupiah } from "@/lib/utils/format"

export function TopProductsChart() {
  const data: { name: string; total: number }[] = []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Produk Terlaris</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Belum ada data transaksi</p>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={12} width={150} />
                <Tooltip formatter={(value: number) => formatRupiah(value)} />
                <Bar dataKey="total" fill="#D97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}