import { z } from "zod"

export const bookingSchema = z.object({
  slot_id: z.string().uuid(),
  owner_name: z.string().min(1, "Nama wajib diisi"),
  owner_phone: z.string().min(1, "Nomor telepon wajib diisi"),
  pet_name: z.string().min(1, "Nama hewan wajib diisi"),
  pet_species: z.string().min(1, "Spesies wajib diisi"),
  complaint: z.string().optional(),
})

export const bookingSlotSchema = z.object({
  doctor_id: z.string().uuid().optional().or(z.literal("")),
  date: z.string().min(1, "Tanggal wajib diisi"),
  time: z.string().min(1, "Jam wajib diisi"),
})

export type BookingInput = z.infer<typeof bookingSchema>
export type BookingSlotInput = z.infer<typeof bookingSlotSchema>