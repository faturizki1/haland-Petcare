import { z } from "zod"

export const expenseSchema = z.object({
  category: z.string().min(1, "Kategori wajib diisi"),
  amount: z.coerce.number().min(1, "Jumlah minimal 1"),
  description: z.string().optional(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>