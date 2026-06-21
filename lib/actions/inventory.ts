"use server"

import { createClient } from "@/lib/supabase/server"
import { productSchema, serviceSchema, stockMutationSchema } from "@/lib/validations/inventory"
import { revalidatePath } from "next/cache"

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, product_categories:category_id(name)")
    .order("name")

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getServices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("name")

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getStockMutations(productId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("stock_mutations")
    .select("*, products:product_id(name)")
    .order("created_at", { ascending: false })
    .limit(50)

  if (productId) query = query.eq("product_id", productId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createProduct(formData: unknown) {
  const parsed = productSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from("products").insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath("/owner/inventory")
  revalidatePath("/staff/inventory")
  return { success: true }
}

export async function updateProduct(id: string, formData: unknown) {
  const parsed = productSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from("products").update(parsed.data).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/owner/inventory")
  revalidatePath("/staff/inventory")
  return { success: true }
}

export async function createService(formData: unknown) {
  const parsed = serviceSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from("services").insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath("/owner/inventory")
  revalidatePath("/staff/inventory")
  return { success: true }
}

export async function updateService(id: string, formData: unknown) {
  const parsed = serviceSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from("services").update(parsed.data).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/owner/inventory")
  revalidatePath("/staff/inventory")
  return { success: true }
}

export async function addStockMutation(formData: unknown) {
  const parsed = stockMutationSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get current stock
  const { data: product } = await supabase
    .from("products")
    .select("stock")
    .eq("id", parsed.data.product_id)
    .single()

  if (!product) return { error: "Produk tidak ditemukan" }

  const beforeQty = product.stock
  const changeQty = parsed.data.type === "keluar" ? -parsed.data.change_qty : parsed.data.change_qty
  const afterQty = Math.max(0, beforeQty + changeQty)

  // Insert mutation and update stock in one operation
  const { error: mutationError } = await supabase.from("stock_mutations").insert({
    product_id: parsed.data.product_id,
    type: parsed.data.type,
    before_qty: beforeQty,
    change_qty: parsed.data.type === "keluar" ? -parsed.data.change_qty : parsed.data.change_qty,
    after_qty: afterQty,
    notes: parsed.data.notes || null,
    created_by: user?.id,
  })

  if (mutationError) return { error: mutationError.message }

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock: afterQty })
    .eq("id", parsed.data.product_id)

  if (updateError) return { error: updateError.message }

  revalidatePath("/owner/inventory")
  revalidatePath("/staff/inventory")
  return { success: true }
}