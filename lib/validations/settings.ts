import { z } from "zod"

export const clinicSettingsSchema = z.object({
  clinic_name: z.string().min(1, "Nama klinik wajib diisi"),
  address: z.string().optional(),
  phone: z.string().optional(),
  open_hours: z.string().optional(),
  logo_url: z.string().optional(),
})

export type ClinicSettingsInput = z.infer<typeof clinicSettingsSchema>