"use server"

import { createClient } from "@/lib/supabase/server"
import { transactionSchema } from "@/lib/validations/pos"
import { generateInvoiceNo } from "@/lib/utils/invoice"
import { revalidatePath } from "next/cache"

export async function getTransactions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("transactions")
    .select("*, profiles:customer_id(full_name), cashier:cashier_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createTransaction(formData: unknown) {
  const parsed = transactionSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const total = parsed.data.items.reduce((sum, item) => sum + item.subtotal, 0)
  const invoiceNo = generateInvoiceNo()

  // Insert transaction
  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({
      invoice_no: invoiceNo,
      customer_id: parsed.data.customer_id || null,
      cashier_id: user.id,
      total,
      payment_method: parsed.data.payment_method,
    })
    .select()
    .single()

  if (txError) return { error: txError.message }

  // Insert transaction items
  const items = parsed.data.items.map((item) => ({
    transaction_id: transaction.id,
    item_type: item.item_type,
    item_id: item.item_id,
    item_name: item.item_name,
    price: item.price,
    qty: item.qty,
    subtotal: item.subtotal,
  }))

  const { error: itemsError } = await supabase.from("transaction_items").insert(items)
  if (itemsError) return { error: itemsError.message }

  // Update stock for product items
  for (const item of parsed.data.items) {
    if (item.item_type === "product") {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.item_id)
        .single()

      if (product) {
        const beforeQty = product.stock
        const afterQty = beforeQty - item.qty

        await supabase.from("stock_mutations").insert({
          product_id: item.item_id,
          type: "keluar",
          before_qty: beforeQty,
          change_qty: -item.qty,
          after_qty: afterQty,
          reference: invoiceNo,
          created_by: user.id,
        })

        await supabase
          .from("products")
          .update({ stock: afterQty })
          .eq("id", item.item_id)
      }
    }
  }

  revalidatePath("/owner/pos")
  revalidatePath("/staff/pos")
  return { success: true, invoice_no: invoiceNo }
}

export async function cancelTransaction(id: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get transaction items to restore stock
  const { data: items } = await supabase
    .from("transaction_items")
    .select("*")
    .eq("transaction_id", id)

  // Restore stock for products
  if (items) {
    for (const item of items) {
      if (item.item_type === "product") {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.item_id)
          .single()

        if (product) {
          const beforeQty = product.stock
          const afterQty = beforeQty + item.qty

          await supabase.from("stock_mutations").insert({
            product_id: item.item_id,
            type: "adjustment",
            before_qty: beforeQty,
            change_qty: item.qty,
            after_qty: afterQty,
            reference: `BATAL-${id.substring(0, 8)}`,
            notes: reason,
            created_by: user?.id,
          })

          await supabase
            .from("products")
            .update({ stock: afterQty })
            .eq("id", item.item_id)
        }
      }
    }
  }

  const { error } = await supabase
    .from("transactions")
    .update({ status: "batal" })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/owner/pos")
  revalidatePath("/staff/pos")
  return { success: true }
}