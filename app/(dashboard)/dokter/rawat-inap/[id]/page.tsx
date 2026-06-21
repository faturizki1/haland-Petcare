import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getInpatientById, getInpatientLogs } from "@/lib/actions/inpatients"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { BedDouble, ArrowLeft, Plus } from "lucide-react"
import { formatDateTime } from "@/lib/utils/format"
import Link from "next/link"
import { InpatientLogForm } from "./inpatient-log-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function DokterRawatInapDetailPage({ params }: Props) {
  const { id } = await params

  let inpatient: any
  let logs: any[] = []

  try {
    inpatient = await getInpatientById(id)
    logs = await getInpatientLogs(id)
  } catch {
    notFound()
  }

  if (!inpatient) notFound()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/dokter/rawat-inap">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold">Detail Rawat Inap</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5" />
              Informasi Pasien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Hewan</p>
              <p className="font-medium">{inpatient.pets?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Spesies</p>
              <p className="font-medium">{inpatient.pets?.species || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dokter</p>
              <p className="font-medium">{inpatient.profiles?.full_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kandang</p>
              <p className="font-medium">{inpatient.cage_number || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={inpatient.status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Masuk</p>
              <p className="font-medium">{formatDateTime(inpatient.admitted_at)}</p>
            </div>
            {inpatient.discharged_at && (
              <div>
                <p className="text-sm text-muted-foreground">Keluar</p>
                <p className="font-medium">{formatDateTime(inpatient.discharged_at)}</p>
              </div>
            )}
            {inpatient.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Catatan</p>
                <p className="mt-1 whitespace-pre-wrap">{inpatient.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitoring Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada log monitoring</p>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={log.condition} />
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="mt-2 text-sm whitespace-pre-wrap">{log.notes}</p>
                  )}
                  {log.profiles && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Oleh: {log.profiles.full_name}
                    </p>
                  )}
                </div>
              ))
            )}

            {inpatient.status === "rawat" && (
              <div className="mt-4">
                <InpatientLogForm inpatientId={id} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
