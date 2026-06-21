import { createClient } from "@/lib/supabase/server"
import { getMedicalRecords } from "@/lib/actions/medical-records"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Stethoscope, Plus, Eye } from "lucide-react"
import { formatDateTime } from "@/lib/utils/format"
import Link from "next/link"

export default async function DokterRekamMedisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let records: any[] = []
  let error: string | null = null

  try {
    records = await getMedicalRecords()
    // Filter only records belonging to this doctor
    records = records.filter((r) => r.doctor_id === user?.id)
  } catch (e) {
    error = e instanceof Error ? e.message : "Terjadi kesalahan"
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-display font-bold">Rekam Medis</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-destructive">
            <Stethoscope className="h-16 w-16" />
          </div>
          <h3 className="text-lg font-semibold">Oops!</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Rekam Medis</h1>
        <Link href="/dokter/rekam-medis/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Rekam Medis
          </Button>
        </Link>
      </div>

      {records.length === 0 ? (
        <EmptyState
          title="Belum ada rekam medis"
          description="Buat rekam medis pertama untuk pasien"
          icon={<Stethoscope className="h-16 w-16" />}
          action={
            <Link href="/dokter/rekam-medis/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Buat Rekam Medis
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hewan</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.pets?.name || "N/A"}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({record.pets?.species || "N/A"})
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{record.diagnosis}</TableCell>
                  <TableCell>{formatDateTime(record.created_at)}</TableCell>
                  <TableCell>
                    {record.is_visible_customer ? (
                      <StatusBadge status="aktif" />
                    ) : (
                      <StatusBadge status="tidak_aktif" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dokter/rekam-medis/${record.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
