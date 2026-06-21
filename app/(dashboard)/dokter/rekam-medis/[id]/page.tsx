import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Stethoscope, ArrowLeft } from "lucide-react"
import { formatDateTime } from "@/lib/utils/format"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function DokterRekamMedisDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: record, error } = await supabase
    .from("medical_records")
    .select("*, pets:pet_id(name, species, breed), profiles:doctor_id(full_name)")
    .eq("id", id)
    .single()

  if (error || !record) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/dokter/rekam-medis">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold">Detail Rekam Medis</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Informasi Pasien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Nama Hewan</p>
              <p className="font-medium">{record.pets?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Spesies</p>
              <p className="font-medium">{record.pets?.species || "N/A"}</p>
            </div>
            {record.pets?.breed && (
              <div>
                <p className="text-sm text-muted-foreground">Ras</p>
                <p className="font-medium">{record.pets.breed}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Dokter</p>
              <p className="font-medium">{record.profiles?.full_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal</p>
              <p className="font-medium">{formatDateTime(record.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visibilitas</p>
              <div className="mt-1">
                {record.is_visible_customer ? (
                  <StatusBadge status="aktif" />
                ) : (
                  <StatusBadge status="tidak_aktif" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnosis & Tindakan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Diagnosis</p>
              <p className="mt-1 whitespace-pre-wrap">{record.diagnosis}</p>
            </div>
            {record.treatment && (
              <div>
                <p className="text-sm text-muted-foreground">Treatment</p>
                <p className="mt-1 whitespace-pre-wrap">{record.treatment}</p>
              </div>
            )}
            {record.prescription && (
              <div>
                <p className="text-sm text-muted-foreground">Resep</p>
                <p className="mt-1 whitespace-pre-wrap">{record.prescription}</p>
              </div>
            )}
            {record.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Catatan</p>
                <p className="mt-1 whitespace-pre-wrap">{record.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
