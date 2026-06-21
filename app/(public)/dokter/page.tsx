import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { Stethoscope, Phone, Mail } from "lucide-react"

export default async function DokterPage() {
  const supabase = await createClient()
  const { data: doctors, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "dokter")
    .eq("is_active", true)
    .order("full_name", { ascending: true })

  if (error) {
    return (
      <div className="container py-16">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-destructive">
            <Stethoscope className="h-16 w-16" />
          </div>
          <h3 className="text-lg font-semibold">Oops!</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Terjadi kesalahan saat memuat data dokter
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Tim Dokter Kami
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Ditangani oleh dokter hewan profesional dan berpengalaman
            yang siap memberikan pelayanan terbaik
          </p>
        </div>
      </section>

      {/* Grid Dokter */}
      <section className="container py-16">
        {!doctors || doctors.length === 0 ? (
          <EmptyState
            title="Belum ada dokter"
            description="Belum ada data dokter yang tersedia saat ini"
            icon={<Stethoscope className="h-16 w-16" />}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Stethoscope className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{doctor.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">Dokter Hewan</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {doctor.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
