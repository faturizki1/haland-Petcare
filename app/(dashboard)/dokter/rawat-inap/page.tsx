import { createClient } from "@/lib/supabase/server"
import { InpatientTable } from "@/components/modules/klinik/inpatient-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function DokterRawatInapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: inpatients } = await supabase
    .from("inpatients")
    .select("*, pets:pet_id(name, species), profiles:doctor_id(full_name)")
    .eq("doctor_id", user?.id)
    .order("admitted_at", { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Rawat Inap</h1>
        <Link href="/dokter/rawat-inap/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Rawat Inap Baru
          </Button>
        </Link>
      </div>
      <InpatientTable initialData={inpatients ?? []} role="dokter" />
    </div>
  )
}
