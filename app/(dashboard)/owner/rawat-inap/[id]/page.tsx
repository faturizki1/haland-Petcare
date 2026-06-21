import { getInpatientById, getInpatientLogs, dischargeInpatient, addInpatientLog } from "@/lib/actions/inpatients"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils/format"
import { InpatientLogForm } from "./inpatient-log-form"
import { DischargeButton } from "./discharge-button"

interface Props {
  params: Promise<{ id: string }>
}

export default async function OwnerRawatInapDetailPage({ params }: Props) {
  const { id } = await params
  const inpatient = await getInpatientById(id)
  if (!inpatient) notFound()

  const logs = await getInpatientLogs(id)

  const statusVariant: Record<string, "info" | "success" | "destructive"> = {
    rawat: "info",
    pulang: "success",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Detail Rawat Inap</h1>
        {inpatient.status === "rawat" && <DischargeButton inpatientId={id} />}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pasien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hewan</span>
              <span className="font-medium">{inpatient.pets?.name ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spesies</span>
              <span className="font-medium">{inpatient.pets?.species ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dokter</span>
              <span className="font-medium">{inpatient.profiles?.full_name ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kandang</span>
              <span className="font-medium">{inpatient.cage_number ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={statusVariant[inpatient.status] || "secondary"}>
                {inpatient.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Masuk</span>
              <span className="font-medium">{formatDate(inpatient.admitted_at)}</span>
            </div>
            {inpatient.discharged_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Keluar</span>
                <span className="font-medium">{formatDate(inpatient.discharged_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catatan Awal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{inpatient.notes || "Tidak ada catatan"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada log monitoring</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 rounded-lg border p-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          log.condition === "stabil"
                            ? "success"
                            : log.condition === "perlu_perhatian"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {log.condition}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    {log.notes && <p className="text-sm">{log.notes}</p>}
                    <p className="text-xs text-muted-foreground">
                      Oleh: {log.profiles?.full_name ?? "-"}
                      {log.is_visible_customer ? " • Tampil ke customer" : " • Sembunyikan"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {inpatient.status === "rawat" && (
            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold">Tambah Log</h3>
              <InpatientLogForm inpatientId={id} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
