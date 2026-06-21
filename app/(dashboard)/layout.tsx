import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import type { UserRole } from "@/lib/constants"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/login")
  }

  const role = profile.role as UserRole

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b bg-card px-4 md:px-0">
          <MobileNav role={role} />
          <Topbar userName={profile.full_name} userRole={role} />
        </div>
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}