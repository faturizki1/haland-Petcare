"use server"

import { createClient } from "@/lib/supabase/server"
import { inpatientSchema, inpatientLogSchema } from "@/lib/validations/inpatient"
import { revalidatePath } from "next/cache"

export async function getInpatients() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inpatients")
    .select("*, pets:pet_id(name, species), profiles:doctor_id(full_name)")
    .order("admitted_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getInpatientById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inpatients")
    .select("*, pets:pet_id(name, species, owner_id), profiles:doctor_id(full_name)")
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getInpatientLogs(inpatientId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inpatient_logs")
    .select("*, profiles:created_by(full_name)")
    .eq("inpatient_id", inpatientId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createInpatient(formData: unknown) {
  const parsed = inpatientSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from("inpatients").insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath("/owner/rawat-inap")
  revalidatePath("/dokter/rawat-inap")
  revalidatePath("/staff/rawat-inap")
  return { success: true }
}

export async function dischargeInpatient(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("inpatients")
    .update({ status: "pulang", discharged_at: new Date().toISOString() })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/owner/rawat-inap")
  revalidatePath("/dokter/rawat-inap")
  revalidatePath("/staff/rawat-inap")
  return { success: true }
}

export async function addInpatientLog(formData: unknown) {
  const parsed = inpatientLogSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from("inpatient_logs").insert({
    ...parsed.data,
    created_by: user?.id,
  })

  if (error) return { error: error.message }

  revalidatePath("/owner/rawat-inap")
  revalidatePath("/dokter/rawat-inap")
  revalidatePath("/staff/rawat-inap")
  return { success: true }
}