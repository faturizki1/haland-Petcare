import Link from "next/link"
import { PawPrint, Stethoscope, Syringe, Heart, Shield, Clock, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <PawPrint className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Klinik Hewan{" "}
              <span className="text-primary">VetCare</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Solusi kesehatan terpercaya untuk hewan kesayangan Anda. 
              Ditangani oleh dokter hewan profesional dengan fasilitas modern.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/booking">
                <Button size="lg" className="w-full sm:w-auto">
                  Booking Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/layanan">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Lihat Layanan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Unggulan */}
      <section className="py-20">
        <div className="container">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold">Layanan Unggulan</h2>
            <p className="mt-2 text-muted-foreground">Berbagai layanan lengkap untuk hewan kesayangan Anda</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Stethoscope className="h-8 w-8" />,
                title: "Konsultasi & Pemeriksaan",
                desc: "Pemeriksaan kesehatan lengkap oleh dokter hewan berpengalaman",
              },
              {
                icon: <Syringe className="h-8 w-8" />,
                title: "Vaksinasi",
                desc: "Program vaksinasi lengkap untuk mencegah penyakit",
              },
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Rawat Inap",
                desc: "Fasilitas rawat inap yang nyaman dengan monitoring 24 jam",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Laboratorium",
                desc: "Pemeriksaan laboratorium untuk diagnosis akurat",
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: "Booking Online",
                desc: "Buat janji temu dengan mudah secara online",
              },
              {
                icon: <PawPrint className="h-8 w-8" />,
                title: "Grooming",
                desc: "Perawatan kebersihan dan penampilan hewan kesayangan",
              },
            ].map((service, i) => (
              <div key={i} className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  {service.icon}
                </div>
                <h3 className="font-display text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mengapa Kami */}
      <section className="bg-secondary py-20">
        <div className="container">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold">Mengapa Memilih VetCare?</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { stat: "500+", label: "Hewan Ditangani" },
              { stat: "10+", label: "Dokter Berpengalaman" },
              { stat: "98%", label: "Kepuasan Pelanggan" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-4xl font-bold text-primary">{item.stat}</div>
                <p className="mt-2 text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-12 text-center text-primary-foreground">
            <h2 className="font-display text-3xl font-bold">Siap Merawat Hewan Kesayangan Anda?</h2>
            <p className="mt-4 text-primary-foreground/80">
              Jadwalkan kunjungan sekarang dan dapatkan pelayanan terbaik untuk hewan kesayangan Anda.
            </p>
            <Link href="/booking">
              <Button size="lg" variant="secondary" className="mt-8">
                Booking Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}