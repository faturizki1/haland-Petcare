"use client"

import { MedicalRecordForm } from "@/components/modules/klinik/medical-record-form"

export default function CreateRekamMedisPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Tambah Rekam Medis</h1>
      <MedicalRecordForm role="owner" />
    </div>
  )
}
