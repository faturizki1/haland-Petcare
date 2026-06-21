import { createClient } from "@/lib/supabase/server"
import { PetTable } from "@/components/modules/klinik/pet-table"

export default async function DokterHewanPage() {
  const supabase = await createClient()
  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Data Hewan</h1>
      <PetTable initialData={pets ?? []} role="dokter" />
    </div>
  )
}
