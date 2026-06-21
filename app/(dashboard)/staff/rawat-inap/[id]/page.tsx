import { createClient } from "@/lib/supabase/server"
import { getInpatientById, getInpatientLogs } from "@/lib/actions/inpatients"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils/format"
import { InpatientLogForm } from "./inpatient-log-form"
import { DischargeButton } from "./discharge-button"
import { notFound } from "next/navigation"

export default async function StaffRawatInapDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let inpatient
  try {
    inpatient = await getInpatientById(params.id)
  } catch {
    notFound()
  }

  const logs = await getInpatientLogs(params.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Detail Rawat Inap</h1>
        {inpatient.status === "rawat" && <DischargeButton inpatientId={inpatient.id} />}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informasi Pasien</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Hewan</span><span className="font-medium">{inpatient.pets?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Spesies</span><span>{inpatient.pets?.species}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Dokter</span><span>{inpatient.profiles?.full_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Kandang</span><span>{inpatient.cage_number || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Masuk</span><span>{formatDateTime(inpatient.admitted_at)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={inpatient.status === "rawat" ? "info" : "success"}>{inpatient.status}</Badge></div>
            {inpatient.discharged_at && (
              <div className="flex justify-between"><span className="text-muted-foreground">Pulang</span><span>{formatDateTime(inpatient.discharged_at)}</span></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Catatan</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{inpatient.notes || "Tidak ada catatan"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monitoring Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {inpatient.status === "rawat" && (
            <InpatientLogForm inpatientId={inpatient.id} />
          )}

          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada log monitoring</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log: any) => (
                <div key={log.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant={
                        log.condition === "stabil" ? "success" :
                        log.condition === "perlu_perhatian" ? "warning" : "destructive"
                      }
                    >
                      {log.condition.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)} - {log.profiles?.full_name || "N/A"}
                    </span>
                  </div>
                  {log.notes && <p className="text-sm mt-1">{log.notes}</p>}
                  {!log.is_visible_customer && (
                    <Badge variant="outline" className="mt-1 text-xs">Tersembunyi dari customer</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}