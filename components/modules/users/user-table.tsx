"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { toggleUserActive } from "@/lib/actions/users"
import { useToast } from "@/hooks/use-toast"
import { Pencil, UserX, UserCheck, Users } from "lucide-react"
import type { Tables } from "@/lib/types/database"

type Profile = Tables<"profiles">

interface UserTableProps {
  initialData: Profile[]
}

export function UserTable({ initialData }: UserTableProps) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  async function handleToggleActive(user: Profile) {
    setSelectedUser(user)
    setConfirmOpen(true)
  }

  async function confirmToggle() {
    if (!selectedUser) return
    setLoading(true)
    const result = await toggleUserActive(selectedUser.id, !selectedUser.is_active)
    setLoading(false)
    setConfirmOpen(false)

    if (result.error) {
      toast({ title: "Gagal", description: String(result.error), variant: "destructive" })
      return
    }

    toast({ title: selectedUser.is_active ? "User dinonaktifkan" : "User diaktifkan" })
    setData((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, is_active: !u.is_active } : u))
    )
    router.refresh()
  }

  if (loading && data.length === 0) return <TableSkeleton rows={5} columns={5} />

  if (data.length === 0) {
    return (
      <EmptyState
        title="Belum ada user"
        description="Tambahkan user baru untuk mulai"
        icon={<Users className="h-16 w-16" />}
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
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{user.id.substring(0, 8)}...</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.is_active ? "aktif" : "tidak_aktif"} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/owner/users/${user.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.is_active ? (
                        <UserX className="h-4 w-4 text-destructive" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-success" />
                      )}
                    </Button>
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
        title={selectedUser?.is_active ? "Nonaktifkan User" : "Aktifkan User"}
        description={
          selectedUser?.is_active
            ? `Apakah anda yakin ingin menonaktifkan ${selectedUser?.full_name}? User tidak akan bisa login.`
            : `Apakah anda yakin ingin mengaktifkan kembali ${selectedUser?.full_name}?`
        }
        confirmText={selectedUser?.is_active ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
        onConfirm={confirmToggle}
      />
    </>
  )
}