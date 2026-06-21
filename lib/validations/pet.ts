import { z } from "zod"

export const petSchema = z.object({
  owner_id: z.string().uuid("Pilih pemilik hewan"),
  name: z.string().min(1, "Nama hewan wajib diisi"),
  species: z.string().min(1, "Spesies wajib diisi"),
  breed: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.string().optional(),
  photo_url: z.string().optional(),
})

export type PetInput = z.infer<typeof petSchema>