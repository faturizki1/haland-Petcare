import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  category_id: z.string().uuid().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif").default(0),
  min_stock: z.coerce.number().int().min(0).default(5),
})

export const serviceSchema = z.object({
  name: z.string().min(1, "Nama layanan wajib diisi"),
  category: z.string().optional(),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  duration_minutes: z.coerce.number().int().optional(),
  doctor_required: z.boolean().default(false),
})

export const stockMutationSchema = z.object({
  product_id: z.string().uuid(),
  type: z.enum(["masuk", "keluar", "adjustment"]),
  change_qty: z.coerce.number().int().min(1, "Jumlah harus lebih dari 0"),
  notes: z.string().optional(),
})

export type ProductInput = z.infer<typeof productSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type StockMutationInput = z.infer<typeof stockMutationSchema>