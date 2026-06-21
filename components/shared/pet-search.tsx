"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import type { Tables } from "@/lib/types/database"

type Pet = Tables<"pets">

interface PetSearchProps {
  onSelect: (pet: Pet) => void
  ownerId?: string
  placeholder?: string
}

export function PetSearch({ onSelect, ownerId, placeholder = "Cari hewan..." }: PetSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([])
      return
    }
    setLoading(true)
    const supabase = createClient()
    let queryBuilder = supabase
      .from("pets")
      .select("*")
      .ilike("name", `%${q}%`)
      .eq("is_active", true)
      .limit(10)

    if (ownerId) {
      queryBuilder = queryBuilder.eq("owner_id", ownerId)
    }

    const { data } = await queryBuilder
    setResults(data ?? [])
    setLoading(false)
  }, [ownerId])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            className="pl-9"
          />
        </div>
      </div>
      {open && (query.length > 0 || results.length > 0) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {loading && (
            <div className="p-2 text-sm text-muted-foreground">Mencari...</div>
          )}
          {!loading && results.length === 0 && query.length > 0 && (
            <div className="p-2 text-sm text-muted-foreground">Hewan tidak ditemukan</div>
          )}
          {!loading &&
            results.map((pet) => (
              <button
                key={pet.id}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => {
                  onSelect(pet)
                  setOpen(false)
                  setQuery(pet.name)
                }}
              >
                <span className="font-medium">{pet.name}</span>
                <span className="text-muted-foreground">({pet.species})</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}