"use server"

import { createClient } from "@/lib/supabase/server"
import { clinicSettingsSchema } from "@/lib/validations/settings"
import { revalidatePath } from "next/cache"

export async function getClinicSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("clinic_settings")
    .select("*")
    .eq("id", 1)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateClinicSettings(formData: unknown) {
  const parsed = clinicSettingsSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase
    .from("clinic_settings")
    .update(parsed.data)
    .eq("id", 1)

  if (error) return { error: error.message }

  revalidatePath("/owner/settings")
  return { success: true }
}