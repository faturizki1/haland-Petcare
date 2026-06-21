"use server"

import { createClient } from "@/lib/supabase/server"
import { createUserSchema, updateUserSchema } from "@/lib/validations/user"
import { revalidatePath } from "next/cache"

export async function getUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getUserById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createUser(formData: unknown) {
  const parsed = createUserSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()

  // Create auth user via admin API (requires service_role key)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName },
  })

  if (authError) return { error: authError.message }
  if (!authData.user) return { error: "Gagal membuat user" }

  // Update profile role (trigger already created profile with 'customer' role)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      role: parsed.data.role,
      phone: parsed.data.phone || null,
    })
    .eq("id", authData.user.id)

  if (profileError) return { error: profileError.message }

  revalidatePath("/owner/users")
  return { success: true }
}

export async function updateUser(id: string, formData: unknown) {
  const parsed = updateUserSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const updates: Record<string, unknown> = {}

  if (parsed.data.fullName) updates.full_name = parsed.data.fullName
  if (parsed.data.role) updates.role = parsed.data.role
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive

  const { error } = await supabase.from("profiles").update(updates).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/owner/users")
  return { success: true }
}

export async function toggleUserActive(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/owner/users")
  return { success: true }
}