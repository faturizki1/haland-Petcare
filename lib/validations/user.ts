import { z } from "zod"

export const createUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  role: z.enum(["owner", "dokter", "staff", "customer"]),
  phone: z.string().optional(),
})

export const updateUserSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").optional(),
  role: z.enum(["owner", "dokter", "staff", "customer"]).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>