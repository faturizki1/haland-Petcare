import { getUserById } from "@/lib/actions/users"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserEditForm } from "./user-edit-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function OwnerUserDetailPage({ params }: Props) {
  const { id } = await params
  const user = await getUserById(id)
  if (!user) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Detail User</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama</span>
              <span className="font-medium">{user.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge>{user.role}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telepon</span>
              <span className="font-medium">{user.phone ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={user.is_active ? "success" : "destructive"}>
                {user.is_active ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit User</CardTitle>
          </CardHeader>
          <CardContent>
            <UserEditForm user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
