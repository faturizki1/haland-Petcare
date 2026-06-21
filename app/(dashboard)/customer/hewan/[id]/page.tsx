import { createClient } from "@/lib/supabase/server"
import { getPetById } from "@/lib/actions/pets"
import { getMedicalRecordsByPet } from "@/lib/actions/medical-records"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDate, formatDateTime } from "@/lib/utils/format"
import { PawPrint, Stethoscope, Calendar, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function CustomerHewanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Detail Hewan</h1>
        <p className="text-muted-foreground">Silakan login terlebih dahulu.</p>
      </div>
    )
  }

  let pet
  try {
    pet = await getPetById(id)
  } catch {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/customer/hewan">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-display font-bold">Detail Hewan</h1>
        </div>
        <EmptyState
          title="Hewan tidak ditemukan"
          description="Data hewan tidak tersedia atau telah dihapus."
          icon={<PawPrint className="h-16 w-16" />}
          action={
            <Link href="/customer/hewan">
              <Button variant="outline">Kembali</Button>
            </Link>
          }
        />
      </div>
    )
  }

  if (pet.owner_id !== user.id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/customer/hewan">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-display font-bold">Detail Hewan</h1>
        </div>
        <EmptyState
          title="Akses Ditolak"
          description="Anda tidak memiliki akses untuk melihat data hewan ini."
          icon={<PawPrint className="h-16 w-16" />}
        />
      </div>
    )
  }

  let medicalRecords: any[] = []
  try {
    medicalRecords = await getMedicalRecordsByPet(id)
  } catch {
    // medical records fetch failed, show empty
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/customer/hewan">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold">Detail Hewan</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              {pet.photo_url ? (
                <Image
                  src={pet.photo_url}
                  alt={pet.name}
                  width={160}
                  height={160}
                  className="rounded-full object-cover w-40 h-40 mb-4"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-muted flex items-center justify-center mb-4">
                  <PawPrint className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <h2 className="text-xl font-bold">{pet.name}</h2>
              <p className="text-sm text-muted-foreground">{pet.species}{pet.breed ? ` - ${pet.breed}` : ""}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Hewan</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Nama</dt>
                <dd className="font-medium">{pet.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Spesies</dt>
                <dd className="font-medium">{pet.species}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Ras</dt>
                <dd className="font-medium">{pet.breed || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Jenis Kelamin</dt>
                <dd className="font-medium">{pet.gender || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Tanggal Lahir</dt>
                <dd className="font-medium">{pet.birth_date ? formatDate(pet.birth_date) : "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Terdaftar Sejak</dt>
                <dd className="font-medium">{formatDate(pet.created_at)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Riwayat Rekam Medis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medicalRecords.length === 0 ? (
            <EmptyState
              title="Belum ada rekam medis"
              description="Riwayat rekam medis hewan ini akan muncul di sini."
              icon={<Stethoscope className="h-12 w-12" />}
            />
          ) : (
            <div className="space-y-4">
              {medicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(record.created_at)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {record.profiles?.full_name || "Dokter"}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Diagnosis:</span>
                    <p className="text-sm mt-1">{record.diagnosis}</p>
                  </div>
                  {record.treatment && (
                    <div>
                      <span className="text-sm font-medium">Treatment:</span>
                      <p className="text-sm mt-1">{record.treatment}</p>
                    </div>
                  )}
                  {record.prescription && (
                    <div>
                      <span className="text-sm font-medium">Resep:</span>
                      <p className="text-sm mt-1">{record.prescription}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <span className="text-sm font-medium">Catatan:</span>
                      <p className="text-sm mt-1">{record.notes}</p>
                    </div>
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
