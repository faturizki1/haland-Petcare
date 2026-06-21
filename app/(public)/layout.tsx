import Link from "next/link"
import { PawPrint } from "lucide-react"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
            <PawPrint className="h-6 w-6" />
            VetCare
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Beranda
            </Link>
            <Link href="/layanan" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Layanan
            </Link>
            <Link href="/dokter" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Dokter
            </Link>
            <Link href="/booking" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Booking
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t bg-secondary py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VetCare. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  )
}