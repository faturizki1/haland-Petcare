"use server"

import { createClient } from "@/lib/supabase/server"
import { medicalRecordSchema } from "@/lib/validations/medical-record"
import { revalidatePath } from "next/cache"

export async function getMedicalRecords() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("medical_records")
    .select("*, pets:pet_id(name, species), profiles:doctor_id(full_name)")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getMedicalRecordsByPet(petId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("medical_records")
    .select("*, profiles:doctor_id(full_name)")
    .eq("pet_id", petId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createMedicalRecord(formData: unknown) {
  const parsed = medicalRecordSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const insertData: Record<string, unknown> = { ...parsed.data }
  if (!insertData.appointment_id) delete insertData.appointment_id

  const { error } = await supabase.from("medical_records").insert(insertData)
  if (error) return { error: error.message }

  revalidatePath("/dokter/rekam-medis")
  revalidatePath("/customer/rekam-medis")
  return { success: true }
}

export async function updateMedicalRecord(id: string, formData: unknown) {
  const parsed = medicalRecordSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from("medical_records").update(parsed.data).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/dokter/rekam-medis")
  revalidatePath("/customer/rekam-medis")
  return { success: true }
}