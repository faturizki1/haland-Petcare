import { z } from "zod"

export const medicalRecordSchema = z.object({
  pet_id: z.string().uuid("Pilih hewan"),
  doctor_id: z.string().uuid("Pilih dokter"),
  appointment_id: z.string().uuid().optional().or(z.literal("")),
  diagnosis: z.string().min(1, "Diagnosis wajib diisi"),
  treatment: z.string().optional(),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  is_visible_customer: z.boolean().default(true),
})

export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>