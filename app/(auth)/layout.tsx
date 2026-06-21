import { PawPrint } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 font-display text-2xl font-bold text-primary">
        <PawPrint className="h-8 w-8" />
        VetCare
      </Link>
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        {children}
      </div>
    </div>
  )
}