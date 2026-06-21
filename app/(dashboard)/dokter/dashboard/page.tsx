import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, BedDouble, PawPrint, Stethoscope } from "lucide-react"
import Link from "next/link"

export default async function DokterDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count: appointmentsToday } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", user?.id)
    .gte("scheduled_at", new Date().toISOString().split("T")[0])
    .lt("scheduled_at", new Date(Date.now() + 86400000).toISOString().split("T")[0])

  const { count: inpatients } = await supabase
    .from("inpatients")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", user?.id)
    .eq("status", "rawat")

  const { count: recordsToday } = await supabase
    .from("medical_records")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", user?.id)
    .gte("created_at", new Date().toISOString().split("T")[0])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Dashboard Dokter</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dokter/appointment">
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
        <Link href="/dokter/rawat-inap">
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
        <Link href="/dokter/rekam-medis">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rekam Medis Hari Ini</CardTitle>
              <Stethoscope className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recordsToday || 0}</div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}