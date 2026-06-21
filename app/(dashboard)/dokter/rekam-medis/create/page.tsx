"use client"

import { MedicalRecordForm } from "@/components/modules/klinik/medical-record-form"

export default function DokterRekamMedisCreatePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Buat Rekam Medis</h1>
      <MedicalRecordForm role="dokter" />
    </div>
  )
}
