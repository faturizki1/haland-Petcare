import { z } from "zod"

export const inpatientSchema = z.object({
  pet_id: z.string().uuid("Pilih hewan"),
  doctor_id: z.string().uuid("Pilih dokter penanggung jawab"),
  cage_number: z.string().optional(),
  notes: z.string().optional(),
})

export const inpatientLogSchema = z.object({
  inpatient_id: z.string().uuid(),
  condition: z.enum(["stabil", "perlu_perhatian", "kritis"]),
  notes: z.string().optional(),
  is_visible_customer: z.boolean().default(true),
})

export type InpatientInput = z.infer<typeof inpatientSchema>
export type InpatientLogInput = z.infer<typeof inpatientLogSchema>