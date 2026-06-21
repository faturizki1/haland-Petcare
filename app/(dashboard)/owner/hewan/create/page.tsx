import { PetForm } from "@/components/modules/klinik/pet-form"

export default function CreateHewanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Tambah Hewan Baru</h1>
      <PetForm role="owner" />
    </div>
  )
}