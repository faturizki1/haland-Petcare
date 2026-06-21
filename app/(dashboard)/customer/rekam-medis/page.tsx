import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDateTime } from "@/lib/utils/format"
import { Stethoscope, Calendar, User, Syringe, PawPrint } from "lucide-react"

export default async function CustomerRekamMedisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Rekam Medis</h1>
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
        <h1 className="text-2xl font-display font-bold">Rekam Medis</h1>
        <EmptyState
          title="Belum ada hewan"
          description="Daftarkan hewan Anda terlebih dahulu untuk melihat rekam medis."
          icon={<PawPrint className="h-16 w-16" />}
        />
      </div>
    )
  }

  let medicalRecords: any[] = []
  try {
    const { data, error } = await supabase
      .from("medical_records")
      .select("*, pets:pet_id(name, species), profiles:doctor_id(full_name)")
      .in("pet_id", petIdList)
      .eq("is_visible_customer", true)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    medicalRecords = data ?? []
  } catch {
    // handled below with empty state
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Rekam Medis</h1>

      <Card>
        <CardContent className="p-0">
          {medicalRecords.length === 0 ? (
            <EmptyState
              title="Belum ada rekam medis"
              description="Rekam medis hewan Anda akan muncul di sini setelah pemeriksaan oleh dokter."
              icon={<Stethoscope className="h-16 w-16" />}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Hewan</TableHead>
                  <TableHead>Dokter</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Treatment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicalRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDateTime(record.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Syringe className="h-4 w-4 text-muted-foreground" />
                        {record.pets?.name || "-"}
                        <span className="text-xs text-muted-foreground">
                          ({record.pets?.species || "-"})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {record.profiles?.full_name || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{record.diagnosis}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.treatment || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
