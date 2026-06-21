import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PawPrint, Calendar, BedDouble, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function OwnerDashboardPage() {
  const supabase = await createClient()

  const { count: petsCount } = await supabase
    .from("pets")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const { count: appointmentsToday } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .gte("scheduled_at", new Date().toISOString().split("T")[0])
    .lt("scheduled_at", new Date(Date.now() + 86400000).toISOString().split("T")[0])

  const { count: inpatients } = await supabase
    .from("inpatients")
    .select("*", { count: "exact", head: true })
    .eq("status", "rawat")

  const { data: transactions } = await supabase
    .from("transactions")
    .select("total")
    .eq("status", "selesai")

  const todayRevenue = transactions?.reduce((sum, t) => sum + Number(t.total), 0) || 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Dashboard Owner</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/owner/hewan">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Hewan</CardTitle>
              <PawPrint className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{petsCount || 0}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/owner/appointment">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Appointment Hari Ini</CardTitle>
              <Calendar className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentsToday || 0}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/owner/rawat-inap">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rawat Inap Aktif</CardTitle>
              <BedDouble className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inpatients || 0}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/owner/laporan">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pemasukan Hari Ini</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {todayRevenue.toLocaleString("id-ID")}</div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}