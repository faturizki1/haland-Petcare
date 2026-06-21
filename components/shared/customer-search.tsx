"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Tables } from "@/lib/types/database"

type Profile = Tables<"profiles">

interface CustomerSearchProps {
  onSelect: (customer: Profile) => void
  placeholder?: string
}

export function CustomerSearch({ onSelect, placeholder = "Cari customer..." }: CustomerSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([])
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`)
      .eq("role", "customer")
      .limit(10)

    setResults(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  return (
    <div className="relative">
      <div className="relative">
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
      {open && (query.length > 0 || results.length > 0) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {loading && <div className="p-2 text-sm text-muted-foreground">Mencari...</div>}
          {!loading && results.length === 0 && query.length > 0 && (
            <div className="p-2 text-sm text-muted-foreground">Customer tidak ditemukan</div>
          )}
          {!loading &&
            results.map((customer) => (
              <button
                key={customer.id}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => {
                  onSelect(customer)
                  setOpen(false)
                  setQuery(customer.full_name)
                }}
              >
                <span className="font-medium">{customer.full_name}</span>
                {customer.phone && (
                  <span className="text-muted-foreground">({customer.phone})</span>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}