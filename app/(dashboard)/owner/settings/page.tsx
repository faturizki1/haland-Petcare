import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/modules/klinik/settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from("clinic_settings")
    .select("*")
    .eq("id", 1)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Pengaturan Klinik</h1>
      <SettingsForm initialData={settings} />
    </div>
  )
}