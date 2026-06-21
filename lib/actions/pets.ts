"use server"

import { createClient } from "@/lib/supabase/server"
import { petSchema } from "@/lib/validations/pet"
import { revalidatePath } from "next/cache"

export async function getPets() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pets")
    .select("*, profiles:owner_id(full_name, phone)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPetById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pets")
    .select("*, profiles:owner_id(full_name, phone)")
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createPet(formData: unknown) {
  const parsed = petSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from("pets").insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath("/owner/hewan")
  revalidatePath("/dokter/hewan")
  revalidatePath("/customer/hewan")
  return { success: true }
}

export async function updatePet(id: string, formData: unknown) {
  const parsed = petSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from("pets").update(parsed.data).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/owner/hewan")
  revalidatePath("/dokter/hewan")
  revalidatePath("/customer/hewan")
  return { success: true }
}

export async function deletePet(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("pets")
    .update({ is_active: false })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/owner/hewan")
  revalidatePath("/dokter/hewan")
  revalidatePath("/customer/hewan")
  return { success: true }
}