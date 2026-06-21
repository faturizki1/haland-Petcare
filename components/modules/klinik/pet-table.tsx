"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { deletePet } from "@/lib/actions/pets"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2, PawPrint, Plus } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import Link from "next/link"
import type { Tables } from "@/lib/types/database"

type Pet = Tables<"pets">

interface PetTableProps {
  initialData: Pet[]
  role: "owner" | "dokter" | "staff" | "customer"
}

export function PetTable({ initialData, role }: PetTableProps) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  async function handleDelete(pet: Pet) {
    setSelectedPet(pet)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!selectedPet) return
    setLoading(true)
    const result = await deletePet(selectedPet.id)
    setLoading(false)
    setConfirmOpen(false)

    if (result.error) {
      toast({ title: "Gagal", description: String(result.error), variant: "destructive" })
      return
    }

    toast({ title: "Hewan berhasil dihapus" })
    setData((prev) => prev.filter((p) => p.id !== selectedPet.id))
    router.refresh()
  }

  if (loading && data.length === 0) return <TableSkeleton rows={5} columns={6} />

  if (data.length === 0) {
    return (
      <EmptyState
        title="Belum ada hewan"
        description="Tambahkan data hewan pertama"
        icon={<PawPrint className="h-16 w-16" />}
        action={
          <Link href={`/${role}/hewan/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Hewan
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Spesies</TableHead>
              <TableHead>Ras</TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>Tanggal Lahir</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((pet) => (
              <TableRow key={pet.id}>
                <TableCell className="font-medium">{pet.name}</TableCell>
                <TableCell>{pet.species}</TableCell>
                <TableCell className="text-muted-foreground">{pet.breed || "-"}</TableCell>
                <TableCell>{pet.gender || "-"}</TableCell>
                <TableCell>{pet.birth_date ? formatDate(pet.birth_date) : "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/${role}/hewan/${pet.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {role !== "customer" && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(pet)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Hewan"
        description={`Apakah anda yakin ingin menghapus ${selectedPet?.name}? Data akan dinonaktifkan.`}
        confirmText="Ya, Hapus"
        onConfirm={confirmDelete}
      />
    </>
  )
}