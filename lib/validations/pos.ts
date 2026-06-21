import { z } from "zod"

export const transactionSchema = z.object({
  customer_id: z.string().uuid().optional().or(z.literal("")),
  payment_method: z.enum(["tunai", "qris"]),
  items: z.array(z.object({
    item_type: z.enum(["product", "service"]),
    item_id: z.string().uuid(),
    item_name: z.string(),
    price: z.number(),
    qty: z.number().int().min(1),
    subtotal: z.number(),
  })).min(1, "Minimal 1 item"),
})

export type TransactionInput = z.infer<typeof transactionSchema>