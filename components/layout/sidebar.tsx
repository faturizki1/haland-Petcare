"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Calendar,
  Stethoscope,
  BedDouble,
  ShoppingCart,
  Package,
  Wallet,
  BarChart3,
  CalendarCheck,
  Settings,
  ChevronLeft,
  Syringe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { UserRole } from "@/lib/constants"

interface SidebarProps {
  role: UserRole
}

const menuByRole: Record<UserRole, { label: string; href: string; icon: React.ReactNode }[]> = {
  owner: [
    { label: "Dashboard", href: "/owner/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Manajemen User", href: "/owner/users", icon: <Users className="h-4 w-4" /> },
    { label: "Data Hewan", href: "/owner/hewan", icon: <PawPrint className="h-4 w-4" /> },
    { label: "Appointment", href: "/owner/appointment", icon: <Calendar className="h-4 w-4" /> },
    { label: "Rekam Medis", href: "/owner/rekam-medis", icon: <Stethoscope className="h-4 w-4" /> },
    { label: "Rawat Inap", href: "/owner/rawat-inap", icon: <BedDouble className="h-4 w-4" /> },
    { label: "Inventory", href: "/owner/inventory", icon: <Package className="h-4 w-4" /> },
    { label: "POS / Kasir", href: "/owner/pos", icon: <ShoppingCart className="h-4 w-4" /> },
    { label: "Pengeluaran", href: "/owner/pengeluaran", icon: <Wallet className="h-4 w-4" /> },
    { label: "Laporan", href: "/owner/laporan", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Booking", href: "/owner/booking", icon: <CalendarCheck className="h-4 w-4" /> },
    { label: "Pengaturan", href: "/owner/settings", icon: <Settings className="h-4 w-4" /> },
  ],
  dokter: [
    { label: "Dashboard", href: "/dokter/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Appointment", href: "/dokter/appointment", icon: <Calendar className="h-4 w-4" /> },
    { label: "Rekam Medis", href: "/dokter/rekam-medis", icon: <Stethoscope className="h-4 w-4" /> },
    { label: "Rawat Inap", href: "/dokter/rawat-inap", icon: <BedDouble className="h-4 w-4" /> },
    { label: "Data Hewan", href: "/dokter/hewan", icon: <PawPrint className="h-4 w-4" /> },
  ],
  staff: [
    { label: "Dashboard", href: "/staff/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "POS / Kasir", href: "/staff/pos", icon: <ShoppingCart className="h-4 w-4" /> },
    { label: "Inventory", href: "/staff/inventory", icon: <Package className="h-4 w-4" /> },
    { label: "Appointment", href: "/staff/appointment", icon: <Calendar className="h-4 w-4" /> },
    { label: "Rawat Inap", href: "/staff/rawat-inap", icon: <BedDouble className="h-4 w-4" /> },
    { label: "Pengeluaran", href: "/staff/pengeluaran", icon: <Wallet className="h-4 w-4" /> },
    { label: "Booking", href: "/staff/booking", icon: <CalendarCheck className="h-4 w-4" /> },
  ],
  customer: [
    { label: "Dashboard", href: "/customer/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Hewan Saya", href: "/customer/hewan", icon: <PawPrint className="h-4 w-4" /> },
    { label: "Rekam Medis", href: "/customer/rekam-medis", icon: <Stethoscope className="h-4 w-4" /> },
    { label: "Monitoring", href: "/customer/monitoring", icon: <Syringe className="h-4 w-4" /> },
  ],
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const menuItems = menuByRole[role] || []

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className={cn("font-display text-xl font-bold text-primary", collapsed && "hidden")}>
          VetCare
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
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
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}