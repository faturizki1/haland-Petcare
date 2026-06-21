"use server"

import { createClient } from "@/lib/supabase/server"
import { expenseSchema } from "@/lib/validations/expense"
import { revalidatePath } from "next/cache"

export async function getExpenses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("expenses")
    .select("*, profiles:created_by(full_name)")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createExpense(formData: unknown) {
  const parsed = expenseSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from("expenses").insert({
    category: parsed.data.category,
    amount: parsed.data.amount,
    description: parsed.data.description || null,
    created_by: user?.id,
  })

  if (error) return { error: error.message }

  revalidatePath("/owner/pengeluaran")
  revalidatePath("/staff/pengeluaran")
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("expenses").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/owner/pengeluaran")
  revalidatePath("/staff/pengeluaran")
  return { success: true }
}