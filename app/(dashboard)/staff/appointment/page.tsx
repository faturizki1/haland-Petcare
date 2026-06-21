import { createClient } from "@/lib/supabase/server"
import { AppointmentTable } from "@/components/modules/klinik/appointment-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function StaffAppointmentPage() {
  const supabase = await createClient()
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, pets:pet_id(name, species), profiles:doctor_id(full_name)")
    .order("scheduled_at", { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Appointment</h1>
        <Link href="/staff/appointment/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Appointment
          </Button>
        </Link>
      </div>
      <AppointmentTable initialData={appointments ?? []} role="staff" />
    </div>
  )
}