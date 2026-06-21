import { createClient } from "@/lib/supabase/server"
import { PetTable } from "@/components/modules/klinik/pet-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function CustomerHewanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-display font-bold">Hewan Saya</h1>
        <p className="text-muted-foreground">Silakan login terlebih dahulu.</p>
      </div>
    )
  }

  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Hewan Saya</h1>
        <Link href="/customer/hewan/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Hewan
          </Button>
        </Link>
      </div>
      <PetTable initialData={pets ?? []} role="customer" />
    </div>
  )
}
