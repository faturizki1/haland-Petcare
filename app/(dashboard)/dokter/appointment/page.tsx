import { createClient } from "@/lib/supabase/server"
import { AppointmentTable } from "@/components/modules/klinik/appointment-table"

export default async function DokterAppointmentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, pets:pet_id(name, species), profiles:doctor_id(full_name)")
    .eq("doctor_id", user?.id)
    .order("scheduled_at", { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Appointment Saya</h1>
      <AppointmentTable initialData={appointments ?? []} role="dokter" />
    </div>
  )
}