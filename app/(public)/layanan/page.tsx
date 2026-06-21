import { createClient } from "@/lib/supabase/server"
import { formatRupiah } from "@/lib/utils/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { Stethoscope, Clock } from "lucide-react"

export default async function LayananPage() {
  const supabase = await createClient()
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })

  if (error) {
    return (
      <div className="container py-16">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-destructive">
            <Stethoscope className="h-16 w-16" />
          </div>
          <h3 className="text-lg font-semibold">Oops!</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Terjadi kesalahan saat memuat data layanan
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
            Layanan Kami
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Berbagai layanan kesehatan lengkap untuk hewan kesayangan Anda,
            ditangani oleh dokter hewan profesional
          </p>
        </div>
      </section>

      {/* Grid Layanan */}
      <section className="container py-16">
        {!services || services.length === 0 ? (
          <EmptyState
            title="Belum ada layanan"
            description="Belum ada layanan yang tersedia saat ini"
            icon={<Stethoscope className="h-16 w-16" />}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {service.category || "Umum"}
                      </p>
                      <CardTitle className="mt-1 text-lg">{service.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {formatRupiah(service.price)}
                    </span>
                    {service.duration_minutes && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {service.duration_minutes} menit
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
