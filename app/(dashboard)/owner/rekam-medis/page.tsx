import { getMedicalRecords } from "@/lib/actions/medical-records"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, ClipboardList } from "lucide-react"
import { formatDate } from "@/lib/utils/format"

export default async function OwnerRekamMedisPage() {
  const records = await getMedicalRecords()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Rekam Medis</h1>
        <Link href="/owner/rekam-medis/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Rekam Medis
          </Button>
        </Link>
      </div>

      {records.length === 0 ? (
        <EmptyState
          title="Belum ada rekam medis"
          description="Belum ada data rekam medis yang tercatat"
          icon={<ClipboardList className="h-16 w-16" />}
          action={
            <Link href="/owner/rekam-medis/create">
              <Button>Tambah Rekam Medis</Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Hewan</TableHead>
                <TableHead>Dokter</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Status Visible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.created_at)}</TableCell>
                  <TableCell>
                    {record.pets?.name ?? "-"}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({record.pets?.species ?? "-"})
                    </span>
                  </TableCell>
                  <TableCell>{record.profiles?.full_name ?? "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{record.diagnosis}</TableCell>
                  <TableCell>
                    <StatusBadge status={record.is_visible_customer ? "aktif" : "tidak_aktif"} />
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
