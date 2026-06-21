"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils/cn"
import type { UserRole } from "@/lib/constants"

const menuByRole: Record<UserRole, { label: string; href: string }[]> = {
  owner: [
    { label: "Dashboard", href: "/owner/dashboard" },
    { label: "Manajemen User", href: "/owner/users" },
    { label: "Data Hewan", href: "/owner/hewan" },
    { label: "Appointment", href: "/owner/appointment" },
    { label: "Rekam Medis", href: "/owner/rekam-medis" },
    { label: "Rawat Inap", href: "/owner/rawat-inap" },
    { label: "Inventory", href: "/owner/inventory" },
    { label: "POS / Kasir", href: "/owner/pos" },
    { label: "Pengeluaran", href: "/owner/pengeluaran" },
    { label: "Laporan", href: "/owner/laporan" },
    { label: "Booking", href: "/owner/booking" },
    { label: "Pengaturan", href: "/owner/settings" },
  ],
  dokter: [
    { label: "Dashboard", href: "/dokter/dashboard" },
    { label: "Appointment", href: "/dokter/appointment" },
    { label: "Rekam Medis", href: "/dokter/rekam-medis" },
    { label: "Rawat Inap", href: "/dokter/rawat-inap" },
    { label: "Data Hewan", href: "/dokter/hewan" },
  ],
  staff: [
    { label: "Dashboard", href: "/staff/dashboard" },
    { label: "POS / Kasir", href: "/staff/pos" },
    { label: "Inventory", href: "/staff/inventory" },
    { label: "Appointment", href: "/staff/appointment" },
    { label: "Rawat Inap", href: "/staff/rawat-inap" },
    { label: "Pengeluaran", href: "/staff/pengeluaran" },
    { label: "Booking", href: "/staff/booking" },
  ],
  customer: [
    { label: "Dashboard", href: "/customer/dashboard" },
    { label: "Hewan Saya", href: "/customer/hewan" },
    { label: "Rekam Medis", href: "/customer/rekam-medis" },
    { label: "Monitoring", href: "/customer/monitoring" },
  ],
}

interface MobileNavProps {
  role: UserRole
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname()
  const menuItems = menuByRole[role] || []

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-display text-xl font-bold text-primary">VetCare</span>
        </div>
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}