import { z } from "zod"

export const appointmentSchema = z.object({
  pet_id: z.string().uuid("Pilih hewan"),
  doctor_id: z.string().uuid("Pilih dokter"),
  scheduled_at: z.string().min(1, "Pilih jadwal"),
  complaint: z.string().optional(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>