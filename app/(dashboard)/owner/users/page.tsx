import { createClient } from "@/lib/supabase/server"
import { UserTable } from "@/components/modules/users/user-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Manajemen User</h1>
        <Link href="/owner/users/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        </Link>
      </div>
      <UserTable initialData={users ?? []} />
    </div>
  )
}