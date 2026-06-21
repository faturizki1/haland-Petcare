"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface PaymentPieChartProps {
  tunai: number
  qris: number
}

const COLORS = ["#2D6A4F", "#D97706"]

export function PaymentPieChart({ tunai, qris }: PaymentPieChartProps) {
  const data = [
    { name: "Tunai", value: tunai },
    { name: "QRIS", value: qris },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Metode Pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}