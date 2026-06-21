import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PawPrint, Calendar, BedDouble } from "lucide-react"
import Link from "next/link"

export default async function CustomerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Silakan login terlebih dahulu.</p>
      </div>
    )
  }

  const { count: petsCount } = await supabase
    .from("pets")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .eq("is_active", true)

  const { data: petIds } = await supabase
    .from("pets")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_active", true)

  const petIdList = petIds?.map((p) => p.id) ?? []

  const { count: appointmentsCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .in("pet_id", petIdList.length > 0 ? petIdList : [""])
    .neq("status", "batal")

  const { count: inpatientsCount } = await supabase
    .from("inpatients")
    .select("*", { count: "exact", head: true })
    .in("pet_id", petIdList.length > 0 ? petIdList : [""])
    .eq("status", "rawat")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/customer/hewan">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hewan Saya</CardTitle>
              <PawPrint className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{petsCount ?? 0}</div>
              <p className="text-xs text-muted-foreground">Total hewan terdaftar</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/customer/rekam-medis">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Appointment</CardTitle>
              <Calendar className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentsCount ?? 0}</div>
              <p className="text-xs text-muted-foreground">Total appointment aktif</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/customer/monitoring">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rawat Inap Aktif</CardTitle>
              <BedDouble className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inpatientsCount ?? 0}</div>
              <p className="text-xs text-muted-foreground">Hewan dalam perawatan</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
