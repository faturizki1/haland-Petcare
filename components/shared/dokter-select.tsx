"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Tables } from "@/lib/types/database"

type Profile = Tables<"profiles">

interface DokterSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function DokterSelect({ value, onValueChange, placeholder = "Pilih dokter" }: DokterSelectProps) {
  const [dokters, setDokters] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "dokter")
      .eq("is_active", true)
      .then(({ data }) => {
        setDokters(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <Select value={value} onValueChange={onValueChange} disabled={loading}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Memuat..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {dokters.map((dokter) => (
          <SelectItem key={dokter.id} value={dokter.id}>
            {dokter.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}