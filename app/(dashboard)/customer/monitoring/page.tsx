import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDateTime } from "@/lib/utils/format"
import { BedDouble, Calendar, User, Activity, PawPrint } from "lucide-react"

export default async function CustomerMonitoringPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Monitoring Rawat Inap</h1>
        <p className="text-muted-foreground">Silakan login terlebih dahulu.</p>
      </div>
    )
  }

  const { data: petIds } = await supabase
    .from("pets")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_active", true)

  const petIdList = petIds?.map((p) => p.id) ?? []

  if (petIdList.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Monitoring Rawat Inap</h1>
        <EmptyState
          title="Belum ada hewan"
          description="Daftarkan hewan Anda terlebih dahulu untuk melihat monitoring rawat inap."
          icon={<PawPrint className="h-16 w-16" />}
        />
      </div>
    )
  }

  let inpatients: any[] = []
  try {
    const { data, error } = await supabase
      .from("inpatients")
      .select("*, pets:pet_id(name, species), profiles:doctor_id(full_name)")
      .in("pet_id", petIdList)
      .order("admitted_at", { ascending: false })

    if (error) throw new Error(error.message)
    inpatients = data ?? []
  } catch {
    // handled below
  }

  // Fetch logs for all inpatients upfront
  const inpatientIds = inpatients.map((ip) => ip.id)
  let logsByInpatient: Record<string, any[]> = {}

  if (inpatientIds.length > 0) {
    try {
      const { data: allLogs, error: logsError } = await supabase
        .from("inpatient_logs")
        .select("*, profiles:created_by(full_name)")
        .in("inpatient_id", inpatientIds)
        .eq("is_visible_customer", true)
        .order("created_at", { ascending: false })

      if (!logsError && allLogs) {
        logsByInpatient = allLogs.reduce((acc: Record<string, any[]>, log) => {
          if (!acc[log.inpatient_id]) acc[log.inpatient_id] = []
          acc[log.inpatient_id].push(log)
          return acc
        }, {})
      }
    } catch {
      // no logs
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Monitoring Rawat Inap</h1>

      {inpatients.length === 0 ? (
        <EmptyState
          title="Belum ada rawat inap"
          description="Riwayat rawat inap hewan Anda akan muncul di sini."
          icon={<BedDouble className="h-16 w-16" />}
        />
      ) : (
        <div className="space-y-6">
          {inpatients.map((inpatient) => {
            const logs = logsByInpatient[inpatient.id] || []

            return (
              <Card key={inpatient.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BedDouble className="h-5 w-5 text-primary" />
                      {inpatient.pets?.name || "Hewan"}
                      <span className="text-sm text-muted-foreground font-normal">
                        ({inpatient.pets?.species || "-"})
                      </span>
                    </CardTitle>
                    <StatusBadge status={inpatient.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Masuk: {formatDateTime(inpatient.admitted_at)}
                    </div>
                    {inpatient.discharged_at && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Keluar: {formatDateTime(inpatient.discharged_at)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      Dokter: {inpatient.profiles?.full_name || "-"}
                    </div>
                    {inpatient.cage_number && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        Kandang: {inpatient.cage_number}
                      </div>
                    )}
                  </div>

                  {inpatient.notes && (
                    <div className="text-sm">
                      <span className="font-medium">Catatan:</span>
                      <p className="text-muted-foreground mt-1">{inpatient.notes}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Log Perkembangan
                    </h4>
                    {logs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Belum ada log perkembangan.</p>
                    ) : (
                      <div className="space-y-3">
                        {logs.map((log: any) => (
                          <div key={log.id} className="relative pl-6 pb-3 border-l-2 border-muted last:border-transparent last:pb-0">
                            <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary" />
                            <div className="text-xs text-muted-foreground mb-1">
                              {formatDateTime(log.created_at)}
                              {log.profiles?.full_name && ` - ${log.profiles.full_name}`}
                            </div>
                            <div className="text-sm font-medium">{log.condition}</div>
                            {log.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
