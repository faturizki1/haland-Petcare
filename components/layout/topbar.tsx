"use client"

import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface TopbarProps {
  userName: string
  userRole: string
}

export function Topbar({ userName, userRole }: TopbarProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({ title: "Gagal logout", variant: "destructive" })
      return
    }
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{userName}</span>
              <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}