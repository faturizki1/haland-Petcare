"use server"

import { createClient } from "@/lib/supabase/server"
import { appointmentSchema } from "@/lib/validations/appointment"
import { revalidatePath } from "next/cache"

export async function getAppointments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*, pets:pet_id(name, species), profiles:doctor_id(full_name)")
    .order("scheduled_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAppointmentsByDoctor(doctorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*, pets:pet_id(name, species)")
    .eq("doctor_id", doctorId)
    .order("scheduled_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createAppointment(formData: unknown) {
  const parsed = appointmentSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from("appointments").insert({
    ...parsed.data,
    scheduled_at: new Date(parsed.data.scheduled_at).toISOString(),
  })

  if (error) return { error: error.message }

  revalidatePath("/owner/appointment")
  revalidatePath("/dokter/appointment")
  revalidatePath("/staff/appointment")
  return { success: true }
}

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/owner/appointment")
  revalidatePath("/dokter/appointment")
  revalidatePath("/staff/appointment")
  return { success: true }
}